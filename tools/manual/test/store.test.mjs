import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Store,validateScreen,pngBuffer} from '../server/store.mjs';
import {distanceToStroke,bounds} from '../public/drawing.js';
const preview='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9HsAAAAASUVORK5CYII=';
const screen=()=>({id:'screen-1',name:'Screen 1',strokes:[{color:'#000000',width:4,points:[[10,20,.5],[100,200,.7]]}],notes:'Move the navigation below the title.',viewport:{x:0,y:0,scale:1}});
test('saved sketches survive restart with readable previews and immutable history',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'manual-store-'));const store=new Store(root);await store.init();
 const first=await store.save(screen(),preview,0);assert.equal(first.revision,1);
 const next={...first,name:'Checkout screen',notes:'Keep the first idea as history.'};await store.save(next,preview,1);
 const reopened=new Store(root);await reopened.init();assert.equal((await reopened.get('screen-1')).name,'Checkout screen');assert.equal((await reopened.list()).length,1);
 assert.equal(JSON.parse(await fs.readFile(path.join(root,'screens/screen-1/history/1.json'))).name,'Screen 1');
 assert.match(await fs.readFile(path.join(root,'INDEX.md'),'utf8'),/Checkout screen/);assert.equal((await fs.readFile(path.join(root,'screens/screen-1/preview.png'))).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
});
test('simultaneous writes cannot overwrite the other device',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'manual-conflict-'));const store=new Store(root);await store.init();
 const results=await Promise.allSettled([store.save(screen(),preview,0),store.save({...screen(),name:'Other device'},preview,0)]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
 assert.equal((await store.get('screen-1')).revision,1);
});
test('unsafe paths, remote image references, and corrupt previews are rejected',async()=>{
 assert.throws(()=>validateScreen({...screen(),id:'../../oops'}));
 assert.throws(()=>validateScreen({...screen(),background:{src:'https://example.com/img.png',width:100,height:100}}));
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'manual-invalid-'));const store=new Store(root);await store.init();
 await assert.rejects(store.save(screen(),'bad',0));assert.equal((await store.list()).length,0);
});
test('annotation export includes the full screenshot and marks beyond its edge',()=>{
 const s={...screen(),background:{width:1200,height:800},strokes:[{color:'#000000',width:4,points:[[-100,-50,.5],[1400,1000,.5]]}]};
 const b=bounds(s);assert.ok(b.x < -100 && b.y < -50 && b.x+b.w > 1400 && b.y+b.h > 1000);
 assert.equal(distanceToStroke({points:[[0,0],[100,0]]},50,8),8);
});
test('invalid viewport, executable URLs, and oversized or truncated images are rejected',()=>{
 assert.throws(()=>validateScreen({...screen(),viewport:{x:0,y:0,scale:0}}));
 assert.throws(()=>validateScreen({...screen(),viewport:{x:null,y:0,scale:1}}));
 assert.throws(()=>validateScreen({...screen(),sourceUrl:'javascript:alert(1)'}));
 assert.throws(()=>validateScreen({...screen(),sourceUrl:'https://name:secret@example.com'}));
 assert.equal(validateScreen({...screen(),sourceUrl:'http://localhost:3000'}).sourceUrl,'http://localhost:3000/');
 const truncated=Buffer.from(preview.slice(22),'base64').subarray(0,24);
 assert.throws(()=>pngBuffer('data:image/png;base64,'+truncated.toString('base64')));
 const oversized=Buffer.from(preview.slice(22),'base64');oversized.writeUInt32BE(20000,16);
 assert.throws(()=>pngBuffer('data:image/png;base64,'+oversized.toString('base64')));
});
