import{useState as us,useEffect as ue,useCallback as uc,useRef as ur}from'react';
import Galochki from'./Galochki';
import{Rn}from'./Posts';
import{useText}from'./lang';
const ml=256*1024*1024,mp=20*1024*1024;
const st=`
.vi{width:min(760px,calc(100% - 32px));margin:0 auto;padding:104px 0 150px;font-family:system-ui,sans-serif;color:#302b25;position:relative;z-index:2}
.vi *{box-sizing:border-box}
.vi .vh{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.vi .vt{margin:0;font-size:clamp(27px,5vw,38px);font-weight:750;letter-spacing:-1.3px}
.vi .vc{border:1px solid rgba(46,140,70,.2);border-radius:22px;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);padding:22px;margin-bottom:24px}
.vi .vf,.vi .vl{display:flex;flex-direction:column;gap:10px}
.vi .vl{gap:6px;font-size:13px;color:#4e6348;font-weight:650}
.vi .vx{width:100%;min-width:0;height:40px;padding:0 12px;border:1px solid #e2e4d8;border-radius:11px;background:rgba(250,250,245,.9);color:#302b25;font:400 14px system-ui,sans-serif;outline:none}
.vi textarea.vx{min-height:110px;height:auto;padding:12px;resize:vertical;line-height:1.65}
.vi .vx:focus{border-color:#63a86c}
.vi .vb{min-height:40px;padding:0 18px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background:url('/pictures/button.png') center/cover no-repeat;color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}
.vi .vb:hover:not(:disabled){filter:brightness(1.07)}
.vi button:disabled{opacity:.5;cursor:not-allowed}
.vi button:focus-visible,.vi a:focus-visible{outline:2px solid #479657;outline-offset:3px}
.vi .vu{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.vi .vn{font-size:12px;color:#8a857a;font-weight:400;line-height:1.6;overflow-wrap:anywhere}
.vi .vg{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.vi .vp{display:block;width:100%;max-height:220px;object-fit:contain;border-radius:12px;background:#20211e}
.vi .ve{padding:14px 16px;border:1px solid #e8b7a8;border-radius:13px;background:#fff5f1;color:#99442e;font-size:13px;line-height:1.6;margin:12px 0;overflow-wrap:anywhere}
.vi .vo{font-size:13px;color:#39834b;margin-bottom:14px}
.vi .vs{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 16px}
.vi .vs input{flex:1;min-width:180px}
.vi .vs select{width:auto;max-width:100%}
.vi .va{padding:21px;border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.9);margin-bottom:12px;overflow-wrap:anywhere;scroll-margin-top:90px;backdrop-filter:blur(8px)}
.vi .vw{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.vi .au{display:flex;align-items:center;gap:10px;min-width:0}
.vi .aw{position:relative;display:block;width:42px;height:42px;flex:0 0 42px;isolation:isolate}
.vi .ai{position:absolute;inset:0;display:block;width:42px;height:42px;border-radius:50%;object-fit:cover;border:1px solid #d0d4c0;background:#e2e4d8}
.vi .af{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;border:0;border-radius:0;pointer-events:none;z-index:2}
.vi .an{display:flex;align-items:center;gap:4px;min-width:0}
.vi .an a{color:#302b25;font-size:15px;font-weight:700;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vi .tt{font-size:12px;color:#8a857a}
.vi .ti{margin:0 0 12px;font-size:19px;line-height:1.45;font-weight:750}
.vi .dt{white-space:pre-wrap;font-size:14px;line-height:1.8;color:#39352f;margin:12px 0;overflow-wrap:anywhere}
.vi .vm{position:relative;width:100%;aspect-ratio:16/9;background:#20211e;border-radius:12px;overflow:hidden}
.vi .vk{position:relative;display:block;width:100%;height:100%;padding:0;border:0;background:transparent;cursor:pointer;color:#fff}
.vi .vk img{display:block;width:100%;height:100%;object-fit:contain}
.vi .vk span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:48px/1 system-ui;text-shadow:0 2px 12px #000}
.vi .vy{display:block;width:100%;height:100%;object-fit:contain;background:#20211e}
.vi .zz{padding:30px 18px;text-align:center;color:#817b70;font-size:14px;line-height:1.7;border:1px dashed rgba(70,130,75,.3);border-radius:18px;background:rgba(255,255,255,.9)}
.vi .vm .zz{display:flex;align-items:center;justify-content:center;gap:10px;position:absolute;inset:0;background:rgba(32,33,30,.8);color:#fff;border:0;border-radius:0}
.vi .bt{min-height:32px;padding:0 10px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;color:#302b25;font:600 12px system-ui;cursor:pointer}
.vi .ft{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid #eeeee7;color:#8a857a;font-size:13px}
.vi .ab{display:inline-flex;align-items:center;gap:5px;cursor:pointer;user-select:none;background:none;border:0;padding:4px 6px;border-radius:6px;color:inherit;font:inherit;position:relative;text-decoration:none}
.vi .ab:hover{color:#39834b;background:rgba(57,131,75,.07)}
.vi .ab[aria-pressed="true"]{color:#e11d48;font-weight:600}
.vi .ab[data-tone="d"][aria-pressed="true"]{color:#6366f1}
.vi .ab[data-tone="r"][aria-pressed="true"]{color:#16a34a}
.vi .rb{position:relative}
.vi .rp{position:absolute;bottom:100%;left:0;margin-bottom:6px;padding:8px 10px;background:#fff;border:1px solid #d0d4c0;border-radius:8px;color:#302b25;font-size:12px;white-space:nowrap;z-index:20;min-width:110px;max-height:160px;overflow:auto}
.vi .rp a{color:inherit;text-decoration:none}
.vi .ct{margin:16px 0 12px;font-size:16px;font-weight:700}
.vi .ci{padding:13px 0;border-top:1px solid #eeeee7;scroll-margin-top:90px}
.vi .ci .ai{width:34px;height:34px}
.vi .ci .aw{width:34px;height:34px;flex-basis:34px}
.vi .ci .vw{margin-bottom:8px}
.vi .ci .dt{font-size:13px;margin:8px 0}
.vi .cf{display:flex;flex-direction:column;gap:8px;margin:14px 0 0}
.vi progress{width:100%;height:12px;accent-color:#39834b}
.vi .ep{display:flex;justify-content:center;margin:18px 0}
@media(max-width:600px){.vi{width:calc(100% - 16px);padding:74px 0 35px}.vi .vc,.vi .va{padding:14px;border-radius:16px}.vi .vg{grid-template-columns:1fr}.vi .vx{height:44px;font-size:16px}.vi .vb{min-height:44px}.vi .vs{flex-direction:column}.vi .vs input,.vi .vs select{width:100%}.vi .ft{gap:6px;justify-content:space-between}.vi .ab{padding:6px 3px;font-size:12px}.vi .ti{font-size:17px}.vi .vm{border-radius:10px}.vi .vu>.vb{flex:1}.vi .rp{max-width:220px;white-space:normal}.vi .vw{gap:8px}}
`;
const ne=c=>Object.assign(new Error(c),{code:c});
const ie=n=>Number.isSafeInteger(Number(n))&&Number(n)>0;
const vv=v=>!!v&&ie(v.id)&&ie(v.avtor_id)&&typeof v.nazva==='string'&&typeof v.opis==='string'&&['processing','ready','failed'].includes(v.status)&&typeof v.failik==='string'&&typeof v.preview==='string'&&Number.isSafeInteger(Number(v.rev))&&Number(v.rev)>=0;
const cv=v=>!!v&&ie(v.id)&&ie(v.vid)&&ie(v.avtor_id)&&typeof v.text==='string'&&Number.isSafeInteger(Number(v.rev))&&Number(v.rev)>=0;
const nf=n=>Math.max(0,Number(n)||0);
function eu(e,t){
const c=e?.code||'';
if(c==='SERVICE')return t('відеосервіс ще не підключено');
if(c==='AUTH')return t('увійти / зареєструватись');
if(c==='SIZE')return t('відеофайл')+': 256 mb';
if(c==='PREVIEW_SIZE')return t('прев’ю')+': 20 mb';
if(c==='PREVIEW')return t('не вдалося підготувати прев’ю');
if(c==='MEDIA')return t('не вдалося відтворити відео');
if(c==='FILES')return t('обери відео та прев’ю');
if(c==='VALID')return t('невірні дані запиту');
if(c==='NOT_FOUND')return t('нічого не знайдено.');
if(c==='BAD_RESPONSE')return t('невірна відповідь сервера');
return t('помилка');
}
function pu(v,kind=''){
if(typeof v!=='string'||!v)return '';
try{const b=window.location.origin,u=new URL(v,b);if(u.origin!==b||u.username||u.password||u.hash)return '';if(kind&&!u.pathname.startsWith('/api/video-'+kind+'/'))return '';if(!kind&&!/^\/(?:pictures|uploads|frames)\//.test(u.pathname))return '';return u.pathname+u.search}catch{return''}
}
async function rq(url,opt={}){
const r=await fetch(url,{credentials:'include',cache:'no-store',...opt,headers:{Accept:'application/json',...opt.headers}}),j=r.status===204?null:await r.json().catch(()=>null);
if(!r.ok)throw ne(r.status===401?'AUTH':[404,405,501].includes(r.status)&&!j?.code?'SERVICE':r.status===413?'SIZE':typeof j?.code==='string'?j.code:'HTTP');
if(j===null&&r.status!==204)throw ne('BAD_RESPONSE');return j;
}
const jo=v=>({headers:{'Content-Type':'application/json'},body:JSON.stringify(v)});
function pg(j,valid){if(!j||!Array.isArray(j.items)||!j.items.every(valid)||!(j.next===null||typeof j.next==='string'&&j.next.length<=2048))throw ne('BAD_RESPONSE');return j}
function av(a,b){const m=new Map(a.map(v=>[Number(v.id),v]));for(const v of b){const p=m.get(Number(v.id));if(!p||nf(v.rev)>=nf(p.rev))m.set(Number(v.id),v)}return[...m.values()]}
function dt(v,l){const x=new Date(v);if(Number.isNaN(x.getTime()))return'';try{const c=l==='ua'?'uk-UA':l==='cnr'?'sr-Latn-ME':l;if(Intl.DateTimeFormat.supportedLocalesOf([c]).length)return new Intl.DateTimeFormat(c,{dateStyle:'medium',timeStyle:'short'}).format(x)}catch{}return x.toISOString().slice(0,16).replace('T',' ')}
function uu(){if(crypto.randomUUID)return crypto.randomUUID();const a=crypto.getRandomValues(new Uint8Array(16));a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;const s=[...a].map(v=>v.toString(16).padStart(2,'0')).join('');return s.slice(0,8)+'-'+s.slice(8,12)+'-'+s.slice(12,16)+'-'+s.slice(16,20)+'-'+s.slice(20)}
async function cp(v){
try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(v);return true}}catch{}
const a=document.activeElement,e=document.createElement('textarea');e.value=v;e.readOnly=true;e.style.cssText='position:fixed;opacity:0;width:1px;height:1px';document.body.appendChild(e);
try{e.select();return document.execCommand('copy')===true}catch{return false}finally{e.remove();try{a?.focus({preventScroll:true})}catch{}}
}
function useURL(f){const[u,su]=us('');ue(()=>{if(!f){su('');return}const v=URL.createObjectURL(f);su(v);return()=>URL.revokeObjectURL(v)},[f]);return u}
async function thumb(f){
if(!f||f.size<=0)throw ne('PREVIEW');if(f.size>mp)throw ne('PREVIEW_SIZE');
const u=URL.createObjectURL(f),i=new Image();let tm;
try{
await new Promise((resolve,reject)=>{tm=setTimeout(()=>reject(ne('PREVIEW')),15000);i.onload=resolve;i.onerror=()=>reject(ne('PREVIEW'));i.src=u});
if(!i.naturalWidth||!i.naturalHeight)throw ne('PREVIEW');
const k=Math.min(1,1920/i.naturalWidth,1080/i.naturalHeight),c=document.createElement('canvas');c.width=Math.max(1,Math.floor(i.naturalWidth*k));c.height=Math.max(1,Math.floor(i.naturalHeight*k));const x=c.getContext('2d');if(!x)throw ne('PREVIEW');x.drawImage(i,0,0,c.width,c.height);
const b=await new Promise(r=>c.toBlob(r,'image/webp',.9));if(!b)throw ne('PREVIEW');return new File([b],b.type==='image/webp'?'preview.webp':'preview.png',{type:b.type||'image/png'});
}finally{clearTimeout(tm);i.onload=null;i.onerror=null;i.src='';URL.revokeObjectURL(u)}
}
async function vq(op,token,body,key,signal){
const u='/api/videos?'+new URLSearchParams({op,...(token?{token}:{})});
for(let n=0;n<4;n++){
if(signal.aborted)throw ne('ABORT');const c=new AbortController(),ab=()=>c.abort(),tm=setTimeout(ab,op==='finish'?180000:45000);signal.addEventListener('abort',ab,{once:true});let error;
try{const r=await fetch(u,{method:'POST',credentials:'include',headers:{Accept:'application/json','Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(body),signal:c.signal});let j=null;try{j=await r.json()}catch{}if(r.ok){if(!j||typeof j!=='object')throw ne('BAD_RESPONSE');return j}error=Object.assign(ne(r.status===401?'AUTH':r.status===413?(j?.code||'SIZE'):j?.code||'HTTP'),{status:r.status})}catch(e){if(signal.aborted)throw ne('ABORT');error=typeof e?.code==='string'?e:ne('NETWORK')}finally{clearTimeout(tm);signal.removeEventListener('abort',ab)}
if(n===3||!(error.code==='NETWORK'||error.status===408||error.status===429||(error.status===409&&error.code==='HTTP')||error.status>=500))throw error;
await new Promise((resolve,reject)=>{const stop=()=>{clearTimeout(t);signal.removeEventListener('abort',stop);reject(ne('ABORT'))},t=setTimeout(()=>{signal.removeEventListener('abort',stop);resolve()},300*2**n);signal.addEventListener('abort',stop,{once:true});if(signal.aborted)stop()});
}
}
async function upload(file,preview,meta,key,onProgress,ref){
const c=new AbortController();ref.current=c;const cs=128*1024;let token='',published=false,done=0,jobs=[];
try{
if(file.size<1||file.size>ml)throw ne('SIZE');if(preview.size<1||preview.size>mp)throw ne('PREVIEW_SIZE');
const j=await vq('start','',{...meta,name:file.name,size:file.size,preview_name:preview.name||'preview.webp',preview_size:preview.size},key,c.signal);
if(vv(j.video)){published=true;onProgress(100);return j.video}
if(!/^[0-9a-f]{64}$/.test(j.token||'')||j.chunkSize!==cs||j.parts!==Math.ceil(file.size/cs)||j.previewParts!==Math.ceil(preview.size/cs))throw ne('BAD_RESPONSE');token=j.token;
const total=file.size+preview.size,count=j.parts+j.previewParts;let next=0;
const worker=async()=>{while(true){if(c.signal.aborted)throw ne('ABORT');const task=next++;if(task>=count)return;const image=task>=j.parts,index=image?task-j.parts:task,blob=image?preview:file,kind=image?'preview':'video',b=new Uint8Array(await blob.slice(index*cs,Math.min(blob.size,(index+1)*cs)).arrayBuffer());if(c.signal.aborted)throw ne('ABORT');const h=await crypto.subtle.digest('SHA-256',b),hash=Array.from(new Uint8Array(h),v=>v.toString(16).padStart(2,'0')).join('');let raw='';for(let i=0;i<b.length;i+=8192)raw+=String.fromCharCode(...b.subarray(i,i+8192));const a=await vq('part',token,{file:kind,index,data:btoa(raw),sha256:hash},key,c.signal);if(a.index!==index||a.file!==kind)throw ne('BAD_RESPONSE');done+=b.length;onProgress(Math.min(99,Math.floor(done/total*100)))}};
jobs=[worker(),worker()];await Promise.all(jobs);const v=await vq('finish',token,{},key,c.signal);if(!vv(v))throw ne('BAD_RESPONSE');published=true;onProgress(100);return v;
}catch(e){c.abort();await Promise.allSettled(jobs);throw typeof e?.code==='string'?e:ne(e?.name==='AbortError'?'ABORT':'NETWORK')}finally{
if(token&&!published){const a=new AbortController(),tm=setTimeout(()=>a.abort(),5000);try{await fetch('/api/videos?'+new URLSearchParams({op:'cancel',token}),{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:'{}',keepalive:true,signal:a.signal})}catch{}finally{clearTimeout(tm)}}
}
}
function Author({p,t,l}){
const f=typeof p.frame==='string'&&p.frame&&!/[\/\\]/.test(p.frame)?'/frames/'+encodeURIComponent(p.frame):'';
return <div className="au"><a href={'#user/'+encodeURIComponent(p.username||'')} className="aw"><img className="ai" style={f?{inset:'9%',width:'82%',height:'82%',border:0}:undefined} src={pu(p.photo)||'/pictures/default_avatar.png'} alt=""/>{f&&<img className="af" src={f} alt=""/>}</a><div><div className="an"><a href={'#user/'+encodeURIComponent(p.username||'')} translate="no">{p.username||t('невідомий')}</a><Galochki galka={p.galka}/></div><time className="tt" dateTime={p.created_at}>{dt(p.created_at,l)}</time></div></div>;
}
function Heart({down,on}){return <svg viewBox="0 0 24 24" width="16" height="16" fill={on?'currentColor':'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={down?'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09L10 9l4 3-2 5 1.5-4-3.5-2.5 2-4.41C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z':'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'}/></svg>}
function Player({p,onView,t}){
const r=ur(null),v=ur({time:0,wall:0,total:0,sent:false,busy:false,tries:0,next:0,token:'',opening:false,opens:0,received:0}),lv=ur(true),ac=ur(null),[error,se]=us(false);
ue(()=>{lv.current=true;const n=v.current;
const timer=setInterval(async()=>{
const e=r.current,now=performance.now();if(!e)return;
const wall=(now-n.wall)/1000,delta=e.currentTime-n.time;n.wall=now;n.time=e.currentTime;
const playing=!e.paused&&!e.seeking&&!e.ended&&e.readyState>=2&&!document.hidden;
if(playing&&wall>0&&wall<=.65&&delta>0&&delta<=Math.max(1,wall*e.playbackRate*2+.1))n.total+=Math.min(wall,delta/Math.max(.0625,e.playbackRate));
if(!n.token){
if(!playing||n.opening||n.opens>=3||Date.now()<n.next)return;
n.opening=true;n.opens++;ac.current=new AbortController();
try{const j=await rq('/api/videos/watch',{method:'POST',...jo({id:p.id}),signal:ac.current.signal});if(!/^[0-9a-f]{64}$/.test(j?.token||''))throw ne('BAD_RESPONSE');if(lv.current){n.token=j.token;n.received=Date.now()}}catch{n.next=Date.now()+5000}finally{n.opening=false}
return;
}
if(n.total<1||Date.now()-n.received<1000||n.sent||n.busy||n.tries>=3||Date.now()<n.next)return;
n.busy=true;n.tries++;ac.current=new AbortController();
try{const j=await rq('/api/videos/act',{method:'POST',...jo({id:p.id,act:'view',token:n.token,watched_ms:Math.floor(n.total*1000)}),signal:ac.current.signal});if(!vv(j))throw ne('BAD_RESPONSE');if(lv.current){n.sent=true;onView(j)}}catch(e){if(e?.code==='WATCH_EXPIRED'){n.token='';n.total=0;n.tries=0}n.next=Date.now()+5000}finally{n.busy=false}
},200);
return()=>{lv.current=false;clearInterval(timer);ac.current?.abort();r.current?.pause()};
},[p.id,onView]);
const reset=()=>{const e=r.current;if(e){v.current.time=e.currentTime;v.current.wall=performance.now()}};
const flush=()=>{const e=r.current,n=v.current;if(e){const wall=(performance.now()-n.wall)/1000,delta=e.currentTime-n.time;if(!e.seeking&&!document.hidden&&e.readyState>=2&&wall>0&&wall<=.65&&delta>0&&delta<=Math.max(1,wall*e.playbackRate*2+.1))n.total+=Math.min(wall,delta/Math.max(.0625,e.playbackRate));reset()}};
const src=pu(p.failik,'files');
return <><div className="vm">{src?<video ref={r} className="vy" src={src} poster={pu(p.preview,'previews')} controls autoPlay playsInline preload="none" onPlaying={reset} onSeeking={reset} onSeeked={reset} onPause={flush} onEnded={flush} onRateChange={reset} onError={()=>se(true)}/>:<div className="zz">{t('не вдалося відтворити відео')}</div>}</div>{error&&<div className="ve" role="alert">{t('не вдалося відтворити відео')} <button type="button" className="bt" onClick={()=>{se(false);r.current?.load()}}>{t('оновити')}</button></div>}</>;
}
function Comments({id,me,t,l,onUpdate}){
const[ls,sl]=us([]),[ld,sd]=us(true),[next,sn]=us(null),[error,se]=us(''),[text,st]=us(''),[reply,sr]=us(null),[edit,si]=us(null),[busy,sb]=us(false);
const lv=ur(false),ac=ur(null),work=ur(null),lock=ur(false),key=ur(null),field=ur(null),gone=ur(new Set()),mut=ur(0);
const load=uc(async(cursor=null)=>{ac.current?.abort();const c=new AbortController(),mark=mut.current;ac.current=c;sd(true);se('');
try{const q=new URLSearchParams({vid:String(id),limit:'40'});if(cursor)q.set('cursor',cursor);const j=pg(await rq('/api/videos/comments?'+q,{signal:c.signal}),cv);if(lv.current&&!c.signal.aborted){sl(x=>{const a=cursor?av(x,j.items):mut.current===mark?j.items:av(j.items,x);return a.filter(v=>!gone.current.has(Number(v.id)))});sn(j.next)}}catch(e){if(lv.current&&!c.signal.aborted)se(eu(e,t))}finally{if(lv.current&&ac.current===c)sd(false)}
},[id,t]);
ue(()=>{lv.current=true;load();return()=>{lv.current=false;ac.current?.abort();work.current?.abort()}},[load]);
const send=async e=>{e.preventDefault();if(!me||lock.current||!text.trim()||text.length>5000)return;lock.current=true;sb(true);se('');const c=new AbortController();work.current=c;
const body=edit?{id:edit.id,text}:{vid:id,text,parent_id:reply?.id||null},sig=JSON.stringify(body);if(!key.current||key.current.sig!==sig)key.current={sig,id:uu()};
try{const j=await rq('/api/videos/comments',{method:edit?'PUT':'POST',...jo(body),headers:{'Content-Type':'application/json','Idempotency-Key':key.current.id},signal:c.signal});if(!cv(j?.comment)||!vv(j?.video))throw ne('BAD_RESPONSE');if(lv.current){mut.current++;sl(x=>av(x,[j.comment]));onUpdate(j.video);st('');sr(null);si(null);key.current=null}}catch(e){if(lv.current&&e.name!=='AbortError')se(eu(e,t))}finally{lock.current=false;if(lv.current)sb(false)}
};
const remove=async p=>{if(lock.current||!me||Number(p.avtor_id)!==Number(me.id)||!window.confirm(t('видалити коментар?')))return;lock.current=true;sb(true);se('');const c=new AbortController();work.current=c;
try{const j=await rq('/api/videos/comments?id='+encodeURIComponent(p.id),{method:'DELETE',signal:c.signal});if(!Array.isArray(j?.deleted)||!j.deleted.every(ie)||!vv(j.video))throw ne('BAD_RESPONSE');if(lv.current){mut.current++;for(const id of j.deleted)gone.current.add(Number(id));sl(x=>x.filter(v=>!gone.current.has(Number(v.id))));if(gone.current.has(Number(edit?.id))||gone.current.has(Number(reply?.id))){st('');sr(null);si(null)}onUpdate(j.video)}}catch(e){if(lv.current&&e.name!=='AbortError')se(eu(e,t))}finally{lock.current=false;if(lv.current)sb(false)}
};
return <section><h3 className="ct">{t('коментарі')}</h3>{error&&<div className="ve" role="alert">{error} <button className="bt" type="button" onClick={()=>load()} disabled={busy||ld}>{t('оновити')}</button></div>}{ls.map(p=><article className="ci" id={'video-comment-'+p.id} key={p.id}><div className="vw"><Author p={p} t={t} l={l}/>{me&&Number(me.id)===Number(p.avtor_id)&&<div className="vu"><button className="bt" type="button" disabled={busy} onClick={()=>{si(p);sr(null);st(p.text);field.current?.focus()}}>{t('ред')}</button><button className="bt" type="button" disabled={busy} onClick={()=>remove(p)}>{t('видалити')}</button></div>}</div>{p.parent_id&&<button className="ab" type="button" onClick={()=>document.getElementById('video-comment-'+p.parent_id)?.scrollIntoView({behavior:'smooth',block:'center'})}>{t('відповідь:')} <span translate="no">@{p.parent_username||t('невідомий')}</span></button>}<div className="dt" translate="no"><Rn t={p.text}/></div>{me&&<button className="ab" type="button" disabled={busy} onClick={()=>{sr(p);si(null);st('');field.current?.focus()}}>{t('відповісти')}</button>}</article>)}{ld?<div className="vn" role="status">{t('завантаження…')}</div>:!ls.length&&!error?<div className="vn">{t('коментарів поки немає. будь першим!')}</div>:null}{next&&!ld&&<button className="bt" type="button" onClick={()=>load(next)}>{t('більше...')}</button>}{me?<form className="cf" onSubmit={send}>{(reply||edit)&&<div className="vu"><span className="vn">{edit?t('редагування коментаря'):t('відповідь:')} <span translate="no">{reply?.username}</span></span><button type="button" className="bt" disabled={busy} onClick={()=>{sr(null);si(null);st('')}}>{t('скасувати')}</button></div>}<label className="vl">{t('написати коментар')}<textarea ref={field} className="vx" value={text} onChange={e=>st(e.target.value.slice(0,5000))} disabled={busy} maxLength={5000}/></label><div className="vu"><span className="vn" translate="no">{text.length} / 5000</span><button className="vb" type="submit" disabled={busy||!text.trim()}>{busy?t('публікуємо…'):edit?t('зберегти'):t('опублікувати')}</button></div></form>:<a className="ab" href="#login">{t('увійди щоб коментувати')}</a>}</section>;
}
function Card({p,me,active,onOpen,onUpdate,onRemove,t,l}){
const[comments,sc]=us(false),[popup,sp]=us(false),[busy,sb]=us(false),[error,se]=us(''),[ok,so]=us('');
const lv=ur(true),ac=ur(null),lock=ur(false);
ue(()=>{lv.current=true;return()=>{lv.current=false;ac.current?.abort()}},[]);
const act=async name=>{if(lock.current)return;if(name!=='share'&&!me){se(t('увійти / зареєструватись'));return}lock.current=true;sb(true);se('');ac.current=new AbortController();
try{const j=await rq('/api/videos/act',{method:'POST',...jo({id:p.id,act:name}),signal:ac.current.signal});if(!vv(j))throw ne('BAD_RESPONSE');if(lv.current)onUpdate(j)}catch(e){if(lv.current&&e.name!=='AbortError')se(eu(e,t))}finally{lock.current=false;if(lv.current)sb(false)}
};
const share=async()=>{if(lock.current)return;const u=new URL(window.location.pathname,window.location.origin);u.searchParams.set('video',String(p.id));u.hash='videos';if(!await cp(u.href)){if(lv.current)se(t('не вдалося скопіювати'));return}if(lv.current){so(t('посилання скопійовано'));await act('share')}};
const remove=async()=>{if(lock.current||!me||Number(me.id)!==Number(p.avtor_id)||!window.confirm(t('ви точно хочете видалити це відео?')))return;lock.current=true;sb(true);se('');ac.current=new AbortController();
try{await rq('/api/videos?id='+encodeURIComponent(p.id),{method:'DELETE',signal:ac.current.signal});if(lv.current)onRemove(p.id)}catch(e){if(lv.current&&e.name!=='AbortError')se(eu(e,t))}finally{lock.current=false;if(lv.current)sb(false)}
};
return <article className="va" id={'video-'+p.id}><div className="vw"><Author p={p} t={t} l={l}/>{me&&Number(me.id)===Number(p.avtor_id)&&<button type="button" className="bt" disabled={busy} onClick={remove}>{t('видалити')}</button>}</div><h2 className="ti" translate="no">{p.nazva}</h2>{p.status==='ready'?active?<><Player key={p.id} p={p} onView={onUpdate} t={t}/><button type="button" className="ab" onClick={()=>onOpen(null)}>{t('закрити')}</button></>:<div className="vm"><button className="vk" type="button" onClick={()=>onOpen(p.id)} aria-label={t('відео')+': '+p.nazva}>{pu(p.preview,'previews')&&<img src={pu(p.preview,'previews')} alt="" loading="lazy"/>}<span aria-hidden="true">▶</span></button></div>:<div className="vm">{pu(p.preview,'previews')&&<img className="vp" src={pu(p.preview,'previews')} alt="" loading="lazy"/>}<div className="zz" role="status">{p.status==='processing'?t('готується відео…'):t('помилка обробки відео')}</div></div>}{p.opis&&<div className="dt" translate="no"><Rn t={p.opis}/></div>}<div className="ft"><button type="button" className="ab" aria-label={t('лайк')} aria-pressed={Number(p.my_r)===1} disabled={busy} onClick={()=>act('like')}><Heart on={Number(p.my_r)===1}/>{nf(p.laiki)}</button><button type="button" className="ab" data-tone="d" aria-label={t('дизлайк')} aria-pressed={Number(p.my_r)===-1} disabled={busy} onClick={()=>act('dislike')}><Heart down on={Number(p.my_r)===-1}/>{nf(p.dislaiki)}</button><div className="rb" onMouseEnter={()=>sp(true)} onMouseLeave={()=>sp(false)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))sp(false)}}><button type="button" className="ab" data-tone="r" aria-pressed={!!p.my_rp} disabled={busy} onFocus={()=>sp(true)} onClick={()=>act('repost')}>{t('репост')} {nf(p.reposts)}</button>{popup&&<div className="rp">{Array.isArray(p.rp_users)&&p.rp_users.length?p.rp_users.map(u=><div className="an" key={u.id||u.username}><a href={'#user/'+encodeURIComponent(u.username||'')} translate="no">@{u.username}</a><Galochki galka={u.galka}/></div>):t('немає репостів')}</div>}</div><button type="button" className="ab" disabled={busy} onClick={share}>{t('поділитися')} {nf(p.shared)}</button><span className="vn">{t('пер.')} {nf(p.viewz)}</span></div>{error&&<div className="ve" role="alert">{error}</div>}{ok&&<div className="vo" role="status">{ok}</div>}{comments&&<Comments id={p.id} me={me} t={t} l={l} onUpdate={onUpdate}/>}</article>;
}
export default function Videos({q='',uid=null,hideHeader=false}={}){
const{t,l}=useText();
const[ls,sl]=us([]),[me,sm]=us(null),[ld,sd]=us(true),[next,sn]=us(null),[error,se]=us(''),[ok,so]=us(''),[search,ss]=us(''),[sort,ssort]=us('new'),[active,sa]=us(null),[name,sname]=us(''),[desc,sdesc]=us(''),[file,sfile]=us(null),[preview,sp]=us(null),[preparing,spr]=us(false),[saving,sv]=us(false),[progress,sprogress]=us(0),[formError,sfe]=us('');
const lv=ur(false),ac=ur(null),xhr=ur(null),busy=ur(false),gen=ur(0),fi=ur(null),pi=ur(null),key=ur(null),dead=ur(new Set()),last=ur(null),query=(q+' '+search).trim().slice(0,300),url=useURL(preview);
const[deep,sdeep]=us(()=>{try{const v=new URL(window.location.href).searchParams.get('video');return ie(v)?Number(v):null}catch{return null}});
ue(()=>{lv.current=true;const c=new AbortController();rq('/api/me',{signal:c.signal}).then(j=>{if(lv.current)sm(ie(j?.id)?j:null)}).catch(()=>{});return()=>{lv.current=false;c.abort();ac.current?.abort();xhr.current?.abort();gen.current++}},[]);
const update=uc(v=>{if(!lv.current)return;sl(x=>x.map(p=>Number(p.id)===Number(v.id)&&nf(v.rev)>=nf(p.rev)?v:p).filter(p=>!dead.current.has(Number(p.id))))},[]);
const load=uc(async(cursor=null)=>{
ac.current?.abort();const c=new AbortController();ac.current=c;last.current=cursor;sd(true);se('');
try{const a=new URLSearchParams({limit:'20',sort});if(query)a.set('q',query);if(uid!==null)a.set('uid',String(uid));if(deep)a.set('id',String(deep));if(cursor)a.set('cursor',cursor);
const j=pg(await rq('/api/videos?'+a,{signal:c.signal}),vv);if(lv.current&&!c.signal.aborted){sl(old=>{const all=cursor?av(old,j.items):j.items.map(v=>{const p=old.find(x=>Number(x.id)===Number(v.id));return p&&nf(p.rev)>nf(v.rev)?p:v});return all.filter(v=>!dead.current.has(Number(v.id)))});sn(j.next)}}catch(e){if(lv.current&&!c.signal.aborted)se(eu(e,t))}finally{if(lv.current&&ac.current===c)sd(false)}
},[query,sort,uid,deep,t]);
ue(()=>{sd(true);sl([]);sn(null);sa(null);const tm=setTimeout(()=>load(),250);return()=>{clearTimeout(tm);ac.current?.abort()}},[load]);
const pending=ls.filter(v=>v.status==='processing').map(v=>v.id).join(',');
ue(()=>{if(!pending)return;const c=new AbortController();const tm=setInterval(()=>{for(const id of pending.split(','))rq('/api/videos?id='+encodeURIComponent(id),{signal:c.signal}).then(j=>{const v=pg(j,vv).items[0];if(v&&!c.signal.aborted)update(v)}).catch(()=>{})},8000);return()=>{clearInterval(tm);c.abort()}},[pending,update]);
const choose=async e=>{const f=e.target.files?.[0];e.target.value='';const n=++gen.current;sp(null);sfe('');if(!f){spr(false);return}spr(true);
try{const v=await thumb(f);if(lv.current&&gen.current===n)sp(v)}catch(e){if(lv.current&&gen.current===n)sfe(eu(e,t))}finally{if(lv.current&&gen.current===n)spr(false)}
};
const send=async e=>{e.preventDefault();if(!me||busy.current||preparing)return;sfe('');so('');if(!name.trim()||name.trim().length>160||desc.length>5000){sfe(eu(ne('VALID'),t));return}if(!file||!preview){sfe(eu(ne('FILES'),t));return}if(file.size<=0||file.size>ml){sfe(eu(ne('SIZE'),t));return}
busy.current=true;sv(true);sprogress(0);const meta=JSON.stringify({nazva:name.trim(),opis:desc});if(!key.current||key.current.file!==file||key.current.preview!==preview||key.current.meta!==meta)key.current={file,preview,meta,id:uu()};
try{const j=await upload(file,preview,{nazva:name.trim(),opis:desc},key.current.id,v=>{if(lv.current)sprogress(v)},xhr);if(lv.current){sl(v=>[j,...v.filter(p=>Number(p.id)!==Number(j.id))]);sname('');sdesc('');sfile(null);sp(null);key.current=null;so(t('опубліковано'));if(fi.current)fi.current.value='';if(pi.current)pi.current.value=''}}catch(e){if(lv.current&&e.code!=='ABORT')sfe(eu(e,t))}finally{busy.current=false;xhr.current=null;if(lv.current)sv(false)}
};
const remove=uc(id=>{dead.current.add(Number(id));sl(x=>x.filter(v=>Number(v.id)!==Number(id)));sa(x=>Number(x)===Number(id)?null:x)},[]);
const reset=()=>{sdeep(null);const u=new URL(window.location.href);u.searchParams.delete('video');window.history.replaceState(null,'',u.pathname+u.search+u.hash)};
return <main className="vi" id="videos" translate="no"><style>{st}</style>{!hideHeader&&<header className="vh"><h1 className="vt">{t('відео')}</h1></header>}{me&&(uid===null||Number(uid)===Number(me.id))?<section className="vc"><h2 className="ct">{t('додати відео')}</h2><form className="vf" onSubmit={send}><label className="vl">{t('Назва')}<input className="vx" value={name} maxLength={160} required disabled={saving} onChange={e=>sname(e.target.value)}/></label><label className="vl">{t('опис')}<textarea className="vx" value={desc} maxLength={5000} disabled={saving} onChange={e=>sdesc(e.target.value)}/></label><span className="vn" translate="no">{desc.length} / 5000</span><div className="vg"><div className="vf"><input ref={fi} type="file" hidden onChange={e=>{const f=e.target.files?.[0]||null;e.target.value='';sfe('');if(f&&(f.size<=0||f.size>ml)){sfile(null);sfe(eu(ne(f.size<=0?'VALID':'SIZE'),t));return}sfile(f)}}/><button className="vb" type="button" disabled={saving} onClick={()=>fi.current?.click()}>{t('відеофайл')}</button><span className="vn" translate="no">{file?' · '+file.name+' · '+(file.size/1048576).toFixed(1)+' MiB':''}</span></div><div className="vf"><input ref={pi} type="file" accept="image/*" hidden onChange={choose}/><button className="vb" type="button" disabled={saving||preparing} onClick={()=>pi.current?.click()}>{preparing?t('обробка прев’ю…'):t('прев’ю')}</button><span className="vn" translate="no"></span></div></div>{url&&<img className="vp" src={url} alt={t('прев’ю')}/>} {formError&&<div className="ve" role="alert">{formError}</div>}{saving&&<div className="vf" role="status"><span className="vn">{t('завантаження…')} <span translate="no">{progress}%</span></span><progress max={100} value={progress} aria-label={t('завантаження…')}/></div>}<div className="vu"><button className="vb" type="submit" disabled={saving||preparing||!file||!preview||!name.trim()}>{saving?t('завантаження…'):t('опублікувати')}</button>{saving&&<button className="bt" type="button" onClick={()=>xhr.current?.abort()}>{t('скасувати')}</button>}</div></form></section>:!me?<section className="vc"><a href="#login" className="vb">{t('увійти / зареєструватись')}</a></section>:null}{ok&&<div className="vo" role="status">{ok}</div>}<div className="vs"><input className="vx" value={search} maxLength={200} onChange={e=>ss(e.target.value)} placeholder={t('пошукайте щось, може знайдете...')} aria-label={t('пошукайте щось, може знайдете...')}/><select className="vx" value={sort} aria-label={t('додаткове сортування')} onChange={e=>ssort(e.target.value)}><option value="new">{t('від нових до старих')}</option><option value="old">{t('від старих до нових')}</option><option value="likes">{t('найбільше лайків')}</option><option value="dislikes">{t('найбільше дизлайків')}</option><option value="reposts">{t('найбільше репостів')}</option></select>{deep&&<button className="bt" type="button" onClick={reset}>{t('закрити')}</button>}<button className="bt" type="button" disabled={ld} onClick={()=>load()}>{t('оновити')}</button></div>{error&&<div className="ve" role="alert">{error} <button className="bt" type="button" disabled={ld} onClick={()=>load(last.current)}>{t('спробувати ще')}</button></div>}{ls.map(p=><Card key={p.id} p={p} me={me} active={Number(active)===Number(p.id)} onOpen={sa} onUpdate={update} onRemove={remove} t={t} l={l}/>)}{ld?<div className="zz" role="status">{t('завантаження…')}</div>:!ls.length&&!error?<div className="zz">{t(query?'нічого не знайдено.':'відео поки немає')}</div>:null}{next&&!ld&&<div className="ep"><button className="vb" type="button" onClick={()=>load(next)}>{t('більше...')}</button></div>}</main>;
}
