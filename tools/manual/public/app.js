import {line,bounds,distanceToStroke} from './drawing.js';
const $=s=>document.querySelector(s),canvas=$('#canvas'),ctx=canvas.getContext('2d');
const id=()=>`s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const blank=(name)=>({id:id(),name,revision:0,strokes:[],notes:'',background:null,sourceUrl:'',viewport:{x:0,y:0,scale:1},dirty:true});
let screens=[],active='',tool='pen',drawing=null,gesture=null,pointers=new Map(),undo=new Map(),redo=new Map(),images=new Map(),size={w:0,h:0},saving=false,refreshing=false,toastTimer,db;
let pencilOnly=localStorage.getItem('manual:pencilOnly')==='true';
const current=()=>screens.find(s=>s.id===active);
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function status(text){$('#status').textContent=text;}
function openModal(title,html){finishDrawing();$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=html;$('#modal').showModal();}
$('#close').onclick=()=>$('#modal').close();
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){$('#modal').close();}});
function escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function api(url,body){const r=await fetch(url,body===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const b=await r.json();if(!r.ok){const e=new Error(b.error||'Could not connect to your Mac.');e.status=r.status;throw e;}return b;}
async function openDb(){db=await new Promise((resolve,reject)=>{const r=indexedDB.open('manual-drafts',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function readDraft(){return new Promise(resolve=>{const r=db.transaction('state').objectStore('state').get('workspace');r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);});}
let persistTimer;
function persist(){clearTimeout(persistTimer);persistTimer=setTimeout(()=>{if(!db)return;const tx=db.transaction('state','readwrite');tx.objectStore('state').put({screens,active},'workspace');tx.onerror=()=>toast('Device storage is full. Save to your Mac now.');},120);}
function tabs(){const nav=$('#tabs');nav.replaceChildren();for(const s of screens){const button=document.createElement('button');button.textContent=s.name;button.className=s.id===active?'active':'';button.setAttribute('aria-current',s.id===active?'page':'false');if(s.dirty){const dot=document.createElement('span');dot.className='unsaved';button.append(dot);}button.onclick=()=>select(s.id);button.ondblclick=()=>rename(s.id);nav.append(button);}if(!saving) status(current()?.dirty?'Unsaved changes':'Saved on Mac');}
function select(screenId){finishDrawing();active=screenId;tabs();loadBackground();render();persist();}
function remember(){const s=current();if(!s)return;const stack=undo.get(s.id)||[];stack.push(structuredClone(s.strokes));if(stack.length>60)stack.shift();undo.set(s.id,stack);redo.set(s.id,[]);}
function changed(){const s=current();if(!s)return;s.dirty=true;s.editVersion=(s.editVersion||0)+1;tabs();render();persist();}
function history(from,to){finishDrawing();const s=current();if(!s)return;const stack=from.get(s.id)||[];if(!stack.length)return;const target=to.get(s.id)||[];target.push(structuredClone(s.strokes));to.set(s.id,target);s.strokes=stack.pop();changed();}
async function loadBackground(){const src=current()?.background?.src;if(!src||images.has(src))return;const image=new Image();image.onload=()=>{images.set(src,image);render();};image.onerror=()=>toast('Background unavailable. Reconnect to your Mac.');image.src=src;}
function paint(context,s){const bg=s.background;if(bg&&images.has(bg.src))context.drawImage(images.get(bg.src),0,0,bg.width,bg.height);for(const stroke of s.strokes)line(context,stroke);}
let frame;
function render(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const s=current();if(!s)return;const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,size.w,size.h);const v=s.viewport;ctx.translate(v.x,v.y);ctx.scale(v.scale,v.scale);paint(ctx,s);if(drawing)line(ctx,drawing);$('#hint').hidden=!!(s.strokes.length||s.background||drawing);$('#undo').disabled=!(undo.get(s.id)?.length);$('#redo').disabled=!(redo.get(s.id)?.length);});}
function resize(){size={w:innerWidth,h:innerHeight};const dpr=Math.min(devicePixelRatio||1,2);canvas.width=size.w*dpr;canvas.height=size.h*dpr;render();}addEventListener('resize',resize);
function fit(){const s=current();if(!s)return;const b=bounds(s),w=size.w-64,h=size.h-230,scale=Math.max(.05,Math.min(2,w/b.w,h/b.h));s.viewport={scale,x:(size.w-b.w*scale)/2-b.x*scale,y:145+(h-b.h*scale)/2-b.y*scale};render();persist();}
function point(e){const v=current().viewport;return [(e.clientX-v.x)/v.scale,(e.clientY-v.y)/v.scale,e.pointerType==='pen'?Math.max(.1,e.pressure):.5];}
function eraseAt(e){const s=current(),p=point(e),n=s.strokes.length;s.strokes=s.strokes.filter(line=>distanceToStroke(line,p[0],p[1])>12/s.viewport.scale+line.width/2);if(s.strokes.length!==n)changed();}
function finishDrawing(){if(drawing&&current()){delete drawing.pointerId;current().strokes.push(drawing);drawing=null;changed();}}
canvas.addEventListener('pointerdown',e=>{
  if(!current()||e.button>0)return;
  if(e.pointerType==='touch'&&[...pointers.values()].some(p=>p.type==='pen'))return;
  if(e.pointerType==='pen'&&!pencilOnly){pencilOnly=true;localStorage.setItem('manual:pencilOnly','true');}
  if(e.pointerType==='pen'){finishDrawing();gesture=null;pointers.clear();}
  e.preventDefault();canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
  const touches=[...pointers.values()].filter(p=>p.type==='touch');
  if(touches.length===2){if(drawing){drawing=null;undo.get(current().id)?.pop();render();}const [a,b]=touches;gesture={kind:'pinch',distance:Math.hypot(a.x-b.x,a.y-b.y),cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,view:{...current().viewport}};return;}
  if(e.pointerType==='touch'&&(pencilOnly||[...pointers.values()].some(p=>p.type==='pen'))){if(!drawing)gesture={kind:'pan',pointerId:e.pointerId,x:e.clientX,y:e.clientY,view:{...current().viewport}};return;}
  if(tool==='hand'){gesture={kind:'pan',pointerId:e.pointerId,x:e.clientX,y:e.clientY,view:{...current().viewport}};return;}
  remember();if(tool==='eraser'){gesture={kind:'erase',pointerId:e.pointerId};eraseAt(e);return;}
  drawing={color:$('#color').value,width:Number($('#width').value),points:[point(e)],pointerId:e.pointerId};render();
});
canvas.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
  if(gesture?.kind==='pinch'){
    const touches=[...pointers.values()].filter(p=>p.type==='touch');if(touches.length<2)return;const [a,b]=touches,g=gesture;const scale=Math.max(.05,Math.min(8,g.view.scale*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,g.distance)));
    current().viewport={scale,x:(a.x+b.x)/2-(g.cx-g.view.x)/g.view.scale*scale,y:(a.y+b.y)/2-(g.cy-g.view.y)/g.view.scale*scale};render();return;
  }
  if(gesture?.kind==='pan'&&gesture.pointerId===e.pointerId){current().viewport={...gesture.view,x:gesture.view.x+e.clientX-gesture.x,y:gesture.view.y+e.clientY-gesture.y};render();return;}
  if(gesture?.kind==='erase'&&gesture.pointerId===e.pointerId){eraseAt(e);return;}
  if(drawing?.pointerId!==e.pointerId)return;
  const samples=e.getCoalescedEvents?.();
  for(const sample of samples?.length?samples:[e]){const p=point(sample),last=drawing.points.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>.2/current().viewport.scale)drawing.points.push(p);}render();
});
function up(e){
  if(drawing?.pointerId===e.pointerId){
    if(e.type==='pointerup'){const p=point(e),last=drawing.points.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>.2/current().viewport.scale)drawing.points.push(p);}
    finishDrawing();
  }
  pointers.delete(e.pointerId);
  if(!pointers.size){gesture=null;persist();}
  else if(gesture?.kind==='pinch'||gesture?.pointerId===e.pointerId){
    const [remainingId,p]=pointers.entries().next().value;
    gesture={kind:'pan',pointerId:remainingId,x:p.x,y:p.y,view:{...current().viewport}};
  }
}
canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
canvas.addEventListener('wheel',e=>{e.preventDefault();const s=current();if(!s)return;const v=s.viewport;if(e.ctrlKey||e.metaKey){const p=point(e),scale=Math.max(.05,Math.min(8,v.scale*Math.exp(-e.deltaY*.01)));s.viewport={scale,x:e.clientX-p[0]*scale,y:e.clientY-p[1]*scale};}else{s.viewport={...v,x:v.x-e.deltaX,y:v.y-e.deltaY};}render();persist();},{passive:false});
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{finishDrawing();tool=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(btn=>{btn.classList.toggle('active',btn===b);btn.setAttribute('aria-pressed',String(btn===b));});canvas.style.cursor=tool==='hand'?'grab':'crosshair';});
$('#undo').onclick=()=>history(undo,redo);$('#redo').onclick=()=>history(redo,undo);$('#fit').onclick=fit;
function rename(screenId){const s=screens.find(s=>s.id===screenId);if(!s)return;openModal('Name this screen',`<form id="rename-form"><input aria-label="Screen name" maxlength="100" value="${escape(s.name)}" required><div class="actions"><button class="primary">Done</button></div></form>`);$('#rename-form input').select();$('#rename-form').onsubmit=e=>{e.preventDefault();const name=$('#rename-form input').value.trim();if(!name)return;s.name=name;s.dirty=true;s.editVersion=(s.editVersion||0)+1;tabs();persist();$('#modal').close();};}
$('#rename').onclick=()=>rename(active);$('#add').onclick=()=>{finishDrawing();const s=blank(`Screen ${screens.length+1}`);screens.push(s);select(s.id);};
async function preview(s){if(s.background&&!images.has(s.background.src)){const img=new Image();img.src=s.background.src;await img.decode();images.set(s.background.src,img);}const b=bounds(s),scale=Math.min(2,3000/Math.max(b.w,b.h)),out=document.createElement('canvas');out.width=Math.ceil(b.w*scale);out.height=Math.ceil(b.h*scale);const c=out.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,out.width,out.height);c.scale(scale,scale);c.translate(-b.x,-b.y);paint(c,s);return out.toDataURL('image/png');}
async function save(){if(saving||!current())return;finishDrawing();const s=current(),snapshot=structuredClone(s),version=s.editVersion||0;saving=true;$('#save').disabled=true;$('#save').textContent='Saving…';status('Saving to Mac…');try{const doc=await api('/api/screens',{screen:snapshot,preview:await preview(snapshot),expectedRevision:snapshot.revision||0});s.revision=doc.revision;s.savedAt=doc.savedAt;s.createdAt=doc.createdAt;if((s.editVersion||0)===version)s.dirty=false;persist();tabs();status(s.dirty?'Unsaved changes':'Saved on Mac');toast(`Saved ${s.name} on your Mac`);}catch(e){status('Not saved on Mac');toast(e.message);if(e.status===409){openModal('Keep both versions',`<p>Another device saved changes to this screen. Your drawing is still here.</p><div class="actions"><button id="save-copy" class="primary">Save my drawing as a copy</button></div>`);$('#save-copy').onclick=()=>{const copy={...structuredClone(s),id:id(),name:s.name.slice(0,93)+' — copy',revision:0,dirty:true};screens.push(copy);select(copy.id);$('#modal').close();save();};}}finally{saving=false;$('#save').disabled=false;$('#save').textContent='Save';}}
$('#save').onclick=save;
async function connect(){try{const info=await api('/api/connection');openModal('Open on your iPad',`<p>Keep your Mac awake and connect both devices to the same Wi-Fi. Scan this code with your iPad camera.</p>${info.qr?`<img class="qr" alt="Pairing QR code" src="${info.qr}">`:'<p>No Wi-Fi address found.</p>'}<p class="small">Your sketches stay on your Mac. Press Save before asking me to review a screen.</p><div class="actions"><button id="copy-pair">Copy iPad link</button></div><p class="small quiet">Saved screens: ${escape(info.folder)}</p>`);$('#copy-pair').onclick=async()=>{try{await navigator.clipboard.writeText(info.preferredUrl||info.urls[0]);toast('iPad link copied');}catch{openModal('iPad link',`<p class="address">${escape(info.preferredUrl||info.urls[0]||'Connect to Wi-Fi first.')}</p>`);}};}catch(e){toast(e.message);}}
$('#connect').onclick=connect;
function pull(){openModal('Pull a page',`<form id="pull-form"><label for="url">Web app address</label><input id="url" type="url" placeholder="http://localhost:3000 or https://…" required><div class="row"><div><label for="capture-width">Width</label><input id="capture-width" type="number" value="1440" min="320" max="2560"></div><div><label for="capture-height">Height</label><input id="capture-height" type="number" value="1000" min="320" max="1800"></div></div><p class="small">Opens a fresh browser on your Mac and captures the visible page. For a page that needs your login, import a screenshot instead.</p><p id="pull-error" class="error" role="status"></p><div class="actions"><button id="capture-submit" class="primary">Capture on a new screen</button><button id="import-image" type="button">Import screenshot</button></div></form>`);$('#import-image').onclick=()=>$('#image-file').click();$('#pull-form').onsubmit=async e=>{e.preventDefault();const btn=$('#capture-submit');btn.disabled=true;btn.textContent='Capturing…';$('#pull-error').textContent='';try{const image=await api('/api/capture',{url:$('#url').value,width:Number($('#capture-width').value),height:Number($('#capture-height').value)});await newBackground(image,image.url);$('#modal').close();}catch(e){const message=$('#pull-error');if(message)message.textContent=e.message;else toast(e.message);}finally{btn.disabled=false;btn.textContent='Capture on a new screen';}};}
$('#pull').onclick=pull;
async function newBackground(image,url=''){
  const img=new Image();img.src=image.src;await img.decode();images.set(image.src,img);
  finishDrawing();const s=blank(`Screen ${screens.length+1}`);s.background={src:image.src,width:image.width,height:image.height};s.sourceUrl=url;screens.push(s);select(s.id);fit();toast('Draw your changes over the page, then Save');
}
$('#image-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>20e6)throw new Error('Choose an image smaller than 20 MB.');const uri=URL.createObjectURL(file),img=new Image();img.src=uri;await img.decode();const scale=Math.min(1,4000/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(uri);const result=await api('/api/image',{image:c.toDataURL('image/png')});await newBackground(result);$('#modal').close();}catch(e){toast(e.message);}e.target.value='';};
$('#more').onclick=()=>{const s=current();if(!s)return;openModal('Screen options',`<label class="check"><input id="pencil-only" type="checkbox" ${pencilOnly?'checked':''}>Apple Pencil draws; one finger moves</label><label for="notes">Notes for this screen</label><textarea id="notes" placeholder="What should change? What matters here?">${escape(s.notes||'')}</textarea>${s.sourceUrl?`<p class="small">Reference: <a href="${escape(s.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open web app <svg class="icon inline-icon" aria-hidden="true"><use href="/icons.svg#arrow-up-right"/></svg></a></p>`:''}<div class="actions"><button id="options-done" class="primary">Done</button><button id="download">Download PNG</button><button id="duplicate">Duplicate screen</button></div>`);$('#pencil-only').onchange=e=>{pencilOnly=e.target.checked;localStorage.setItem('manual:pencilOnly',String(pencilOnly));};$('#notes').oninput=e=>{s.notes=e.target.value.slice(0,10000);changed();};$('#options-done').onclick=()=>$('#modal').close();$('#download').onclick=async()=>{try{const a=document.createElement('a');a.download=s.name+'.png';a.href=await preview(s);a.click();}catch(e){toast('Could not export: '+e.message);}};$('#duplicate').onclick=()=>{const copy={...structuredClone(s),id:id(),revision:0,name:s.name.slice(0,93)+' — copy',dirty:true};screens.push(copy);select(copy.id);$('#modal').close();};};
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$('#modal').open)return;if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save();}else if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();history(e.shiftKey?redo:undo,e.shiftKey?undo:redo);}else if(!e.metaKey&&!e.ctrlKey&&['p','e','h'].includes(e.key.toLowerCase())){$(`[data-tool="${{p:'pen',e:'eraser',h:'hand'}[e.key.toLowerCase()]}"]`).click();}});
addEventListener('pagehide',()=>{clearTimeout(persistTimer);if(db){const tx=db.transaction('state','readwrite');tx.objectStore('state').put({screens,active},'workspace');}});
addEventListener('beforeunload',e=>{if(screens.some(s=>s.dirty)){e.preventDefault();e.returnValue='';}});
async function refresh(){if(refreshing||saving||drawing||gesture||document.hidden)return;refreshing=true;try{const remote=await api('/api/screens');if(saving||drawing||gesture)return;for(const s of remote.screens){const index=screens.findIndex(l=>l.id===s.id);if(index<0)screens.push({...s,dirty:false});else if(!screens[index].dirty&&screens[index].revision!==s.revision){screens[index]={...s,viewport:screens[index].viewport,dirty:false};undo.delete(s.id);redo.delete(s.id);}}tabs();loadBackground();render();persist();}catch{}finally{refreshing=false;}}
async function start(){resize();try{await openDb();const draft=await readDraft();if(draft?.screens?.length){screens=draft.screens;active=draft.active;}const hash=new URLSearchParams(location.hash.slice(1));if(hash.get('key')){await api('/api/session',{key:hash.get('key')});historyReplace();}const remote=await api('/api/screens');for(const s of remote.screens){const i=screens.findIndex(l=>l.id===s.id);if(i<0)screens.push({...s,dirty:false});else if(!screens[i].dirty)screens[i]={...s,dirty:false};}if(!screens.length)screens=[blank('Screen 1')];if(!screens.some(s=>s.id===active))active=screens[0].id;select(active);setInterval(refresh,2500);}catch(e){if(screens.length){active=screens[0].id;select(active);status('Offline draft');setInterval(refresh,3000);}else{openModal('Connect to your Mac',`<p>${escape(e.message)}</p><p>Open Manual on your Mac, select Connect iPad, and scan the QR code.</p><button id="retry" class="primary">Try again</button>`);$('#retry').onclick=()=>location.reload();}}}
function historyReplace(){window.history.replaceState(null,'',location.pathname);}
start();
