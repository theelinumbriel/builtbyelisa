import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {randomBytes, timingSafeEqual} from 'node:crypto';
import {parseArgs} from 'node:util';
import QRCode from 'qrcode';
import {Store,pngBuffer} from './store.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {values:options}=parseArgs({options:{port:{type:'string'},'data-dir':{type:'string'},host:{type:'string'}}});
const data=path.resolve(options['data-dir'] || process.env.MANUAL_DATA_DIR || path.join(root,'data'));
let port=Number(options.port ?? process.env.PORT ?? 4317);
if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Use a valid port number.');
const store=new Store(data);
await store.init();
const keyPath=path.join(data,'.pairing-key');
let key;try{key=(await fs.readFile(keyPath,'utf8')).trim();}catch{key=randomBytes(24).toString('base64url');await fs.writeFile(keyPath,key,{mode:0o600});}
const equal=(a,b)=>{const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y);};
const local=req=>['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
const authorized=req=>local(req)||equal((req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('manual='))?.slice(7),key);
const json=(res,v,status=200)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(v));};
async function body(req){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>24e6){const e=new Error('This screen is too large to save.');e.status=413;throw e;}chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString());}
const ips=()=>Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).map(i=>i.address);
let capturing=false;
async function capture(input) {
  const url=new URL(input.url);
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('Use a normal http or https page URL.');
  const width=Math.max(320,Math.min(2560,Number(input.width)||1440)),height=Math.max(320,Math.min(1800,Number(input.height)||1000));
  const {chromium}=await import('playwright-core');
  const executablePath=process.env.MANUAL_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser=await chromium.launch({executablePath,headless:true});
  try{
    const context=await browser.newContext({viewport:{width:Math.round(width),height:Math.round(height)},deviceScaleFactor:1,acceptDownloads:false});
    const page=await context.newPage();
    await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:20000});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(500);
    const id=randomBytes(12).toString('hex');
    const img=await page.screenshot({type:'png',fullPage:false,animations:'disabled',timeout:10000});
    await fs.writeFile(path.join(data,'assets',`${id}.png`),img);
    return {src:`/assets/${id}.png`,width,height,url:page.url(),capturedAt:new Date().toISOString()};
  }finally{await browser.close();}
}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy','same-origin');
  const host=req.headers.host||`localhost:${port}`;
  const hostname=host.replace(/:\d+$/,'');
  const allowedHosts=new Set(['localhost','127.0.0.1',os.hostname(),`${os.hostname().replace(/\.local$/,'')}.local`,...ips()]);
  if(!allowedHosts.has(hostname)){json(res,{error:'Open Manual using the address shown on your Mac.'},403);return;}
  try{
    const url=new URL(req.url,`http://${host}`),p=url.pathname;
    if(req.method!=='GET' && req.headers.origin && req.headers.origin!==url.origin){json(res,{error:'Origin rejected.'},403);return;}
    if(p==='/api/session'&&req.method==='POST'){
      const b=await body(req);if(!equal(b.key,key)){json(res,{error:'Scan the pairing QR code on your Mac.'},401);return;}
      res.setHeader('Set-Cookie',`manual=${key}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000`);json(res,{ok:true});return;
    }
    if((p.startsWith('/api/')||p.startsWith('/assets/')||p.startsWith('/saved/'))&&!authorized(req)){json(res,{error:'Pair this iPad using the QR code on your Mac.'},401);return;}
    if(p==='/api/health'&&req.method==='GET'){json(res,{app:'manual',version:'1.0.0'});return;}
    if(p==='/api/screens'&&req.method==='GET'){json(res,{screens:await store.list()});return;}
    if(p==='/api/screens'&&req.method==='POST'){const b=await body(req);json(res,await store.save(b.screen,b.preview,b.expectedRevision));return;}
    if(p==='/api/connection'&&req.method==='GET'){
      const urls=ips().map(ip=>`http://${ip}:${port}/#key=${key}`);
      const preferred=urls.find(u=>/^http:\/\/(192\.168\.|10\.)/.test(u))||urls[0];
      json(res,{urls,preferredUrl:preferred,qr:preferred?await QRCode.toDataURL(preferred,{width:240,margin:1}):null,folder:data});return;
    }
    if(p==='/api/capture'&&req.method==='POST'){
      if(capturing){json(res,{error:'A page is already being captured. Try again shortly.'},429);return;}
      capturing=true;try{json(res,await capture(await body(req)));}catch(e){json(res,{error:`Could not capture this page. ${String(e.message).slice(0,220)} You can also import a screenshot.`},422);}finally{capturing=false;}return;
    }
    if(p==='/api/image'&&req.method==='POST'){
      const b=await body(req),img=pngBuffer(b.image),id=randomBytes(12).toString('hex');
      const width=img.readUInt32BE(16),height=img.readUInt32BE(20);if(width>12000||height>12000)throw new Error('Use an image smaller than 12000 pixels.');
      await fs.writeFile(path.join(data,'assets',`${id}.png`),img);json(res,{src:`/assets/${id}.png`,width,height});return;
    }
    if(req.method!=='GET'){json(res,{error:'Not found.'},404);return;}
    let file;
    if(/^\/assets\/[a-zA-Z0-9_-]+\.png$/.test(p))file=path.join(data,p.slice(1));
    else if(/^\/saved\/[a-zA-Z0-9_-]+\/preview\.png$/.test(p))file=path.join(data,'screens',p.split('/')[2],'preview.png');
    else if(['/','/index.html','/app.js','/style.css','/drawing.js','/icons.svg'].includes(p))file=path.join(root,'public',p==='/'?'index.html':p.slice(1));
    else{json(res,{error:'Not found.'},404);return;}
    const content=await fs.readFile(file);const mime={'.svg':'image/svg+xml','.png':'image/png','.js':'text/javascript','.html':'text/html','.css':'text/css'}[path.extname(file)];
    res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'});res.end(content);
  }catch(e){json(res,{error:e.code==='ENOENT'?'Not found.':e.message},e.status||(e.code==='ENOENT'?404:400));}
});
server.listen(port,options.host || '0.0.0.0',()=>{
  port=server.address().port;
  console.log(`Manual: http://localhost:${port}\nSaved screens: ${data}/INDEX.md\nOpen Connect iPad for your private pairing QR code.`);
});
