import{useSyncExternalStore as ux,useEffect as ue,useLayoutEffect as ul,useRef as ur}from'react';
import{createRoot as cr}from'react-dom/client';
const ky='mriya_music_v1',sy=Symbol.for('mriya.music.player.v1');
const nm=(v,a,b,d=a)=>Number.isFinite(Number(v))?Math.min(b,Math.max(a,Number(v))):d;
const fm=v=>{const n=Math.max(0,Math.floor(Number(v)||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
const ok=v=>{try{if(typeof v!=='string'||!v.trim())return'';const u=new URL(v,window.location.origin);return['http:','https:'].includes(u.protocol)&&u.origin===window.location.origin&&!u.username&&!u.password?u.href:''}catch{return''}};
const row=v=>{if(!v||!Number.isSafeInteger(Number(v.id))||Number(v.id)<=0||!ok(v.failik))return null;return{id:Number(v.id),nazva:String(v.nazva||'').slice(0,160),author:String(v.author||'').slice(0,160),albom:String(v.albom||'').slice(0,160),genre:String(v.genre||'').slice(0,40),godvipuska:v.godvipuska??null,uploader:Number(v.uploader)||0,failik:ok(v.failik)}};
const css=`
.mp-box{position:fixed;width:min(304px,calc(100vw - 16px));max-height:calc(100dvh - 16px);overflow:auto;z-index:1200;box-sizing:border-box;padding:15px;border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.97);backdrop-filter:blur(14px);color:#302b25;font:13px/1.5 system-ui,sans-serif;}
.mp-top{display:flex;gap:8px;align-items:center;margin-bottom:12px}
.mp-drag{flex:1;min-width:0;border:0;background:none;color:#4e6348;padding:4px 0;text-align:left;font:700 13px system-ui,sans-serif;cursor:move;touch-action:none}
.mp-btn{min-height:34px;min-width:34px;padding:0 12px;border:1px solid rgba(57,136,75,.4);border-radius:10px;background:url('/pictures/button.png') center/cover no-repeat;color:#fff;font:600 12px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.mp-btn:hover:not(:disabled){filter:brightness(1.07)}
.mp-btn:disabled{opacity:.45;cursor:not-allowed}
.mp-close{padding:0;width:34px;font-weight:800}
.mp-title{font-size:15px;font-weight:750;overflow-wrap:anywhere;margin:0 0 3px;line-height:1.4}
.mp-meta{font-size:12px;color:#777064;overflow-wrap:anywhere;margin:0 0 12px}
.mp-controls{display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 0}
.mp-play{flex:1}
.mp-time{display:flex;justify-content:space-between;color:#8a857a;font-size:11px;font-variant-numeric:tabular-nums}
.mp-range{display:block;width:100%;margin:6px 0;accent-color:#479657;cursor:pointer}
.mp-range:disabled{opacity:.45;cursor:not-allowed}
.mp-line{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px;color:#4e6348;font-size:12px}
.mp-eq{margin-top:12px;padding-top:10px;border-top:1px solid #eeeee7}
.mp-eq .mp-line{margin-top:8px}
.mp-note{font-size:12px;line-height:1.5;color:#777064;margin:10px 0 0}
.mp-error{color:#99442e}
.mp-box button:focus-visible,.mp-box input:focus-visible{outline:2px solid #479657;outline-offset:3px}
@media(max-width:600px){.mp-btn{min-height:38px}.mp-box{padding:13px}.mp-range{min-height:22px}}
`;
function make(){
let saved={};try{saved=JSON.parse(window.localStorage.getItem(ky)||'{}')||{}}catch{}
const q=Array.isArray(saved.q)?saved.q.slice(0,500).map(row).filter(Boolean):[],id=Number(saved.id),ix=q.findIndex(v=>v.id===id);
let s={q,i:ix>=0?ix:0,t:nm(saved.t,0,864000,0),d:0,v:nm(saved.v,0,1,.8),r:nm(saved.r,.5,2,1),eq:Array.from({length:3},(_,i)=>nm(saved.eq?.[i],-12,12,0)),pos:saved.pos&&Number.isFinite(saved.pos.x)&&Number.isFinite(saved.pos.y)?saved.pos:null,open:!!saved.open&&q.length>0,playing:false,needs:false,error:'',eqok:true};
const au=new window.Audio();au.preload='metadata';au.volume=s.v;au.playbackRate=s.r;au.preservesPitch=true;
let ctx=null,src=null,filters=[],seq=0,wanted=false,pending=null,last=0,graph=false;
const listeners=new Set();
const save=(force=false)=>{const now=Date.now();if(!force&&now-last<800)return;last=now;const v={q:s.q,id:s.q[s.i]?.id??0,t:pending===null&&au.readyState>=1&&Number.isFinite(au.currentTime)?au.currentTime:s.t,v:s.v,r:s.r,eq:s.eq,pos:s.pos,open:s.open,playing:s.playing||wanted};try{window.localStorage.setItem(ky,JSON.stringify(v))}catch{try{const c=s.q[s.i];window.localStorage.setItem(ky,JSON.stringify({...v,q:c?[c]:[]}))}catch{}}};
const set=(v,persist=true)=>{s={...s,...v};for(const f of listeners)f();if(persist)save()};
const eq=()=>{filters.forEach((f,i)=>{if(ctx)f.gain.setTargetAtTime(s.eq[i],ctx.currentTime,.02)})};
const setup=()=>{
if(graph)return;graph=true;
const AC=window.AudioContext||window.webkitAudioContext;
if(!AC){set({eqok:false});return}
try{ctx=new AC();filters=[ctx.createBiquadFilter(),ctx.createBiquadFilter(),ctx.createBiquadFilter()];filters[0].type='lowshelf';filters[0].frequency.value=200;filters[1].type='peaking';filters[1].frequency.value=1000;filters[1].Q.value=.8;filters[2].type='highshelf';filters[2].frequency.value=4000;src=ctx.createMediaElementSource(au);src.connect(filters[0]);filters[0].connect(filters[1]);filters[1].connect(filters[2]);filters[2].connect(ctx.destination);eq()}catch{try{if(src){src.disconnect();src.connect(ctx.destination)}}catch{}set({eqok:false})}
};
const seek=v=>{const n=nm(v,0,Number.isFinite(au.duration)?au.duration:864000,0);pending=n;try{if(au.readyState>=1){au.currentTime=n;pending=null}}catch{}set({t:n});save(true)};
const play=(user=false)=>{
if(!s.q[s.i])return;
if(user||saved.playing)setup();
wanted=true;set({error:'',needs:false});
const token=seq;
const run=()=>{if(token!==seq||!wanted)return;let p;try{p=au.play()}catch(e){p=Promise.reject(e)}Promise.resolve(p).then(()=>{if(token!==seq||!wanted)return;set({playing:!au.paused,needs:false});save(true)}).catch(e=>{if(token!==seq||!wanted||e?.name==='AbortError')return;wanted=false;set({playing:false,needs:e?.name==='NotAllowedError',error:e?.name==='NotAllowedError'?'':'не вдалося відтворити аудіо'});save(true)})};
if(ctx&&ctx.state==='suspended')Promise.resolve(ctx.resume()).then(run).catch(()=>{wanted=false;set({playing:false,needs:true});save(true)});else run();
};
const load=(i,t=0,go=false,user=false)=>{
seq++;wanted=false;au.pause();
const v=s.q[i];if(!v)return;
set({i,t,d:0,playing:false,error:'',needs:false});pending=t;au.src=v.failik;au.volume=s.v;au.playbackRate=s.r;au.load();
if(go)play(user);save(true);
};
const api={audio:au,get:()=>s,sub:f=>{listeners.add(f);return()=>listeners.delete(f)},root:null,
open:(list,id)=>{
const seen=new Set(),all=list.map(row).filter(v=>v&&!seen.has(v.id)&&seen.add(v.id));let at=all.findIndex(v=>v.id===Number(id));if(at<0)return false;
const start=Math.max(0,at-100),queue=all.slice(start,start+500);at-=start;
const same=s.q[s.i]?.id===queue[at].id&&s.q[s.i]?.failik===queue[at].failik;
set({q:queue,i:at,open:true,error:''});if(same&&au.src===queue[at].failik)play(true);else load(at,0,true,true);save(true);return true;
},toggle:()=>{if(s.playing||wanted){wanted=false;seq++;au.pause();set({playing:false,needs:false});save(true)}else play(true)},
next:()=>{if(s.i+1<s.q.length)load(s.i+1,0,true,true)},
prev:()=>{if(s.t>3)seek(0);else if(s.i>0)load(s.i-1,0,true,true);else seek(0)},
seek,volume:v=>{const n=nm(v,0,1,.8);au.volume=n;set({v:n});save(true)},rate:v=>{const n=nm(v,.5,2,1);au.playbackRate=n;set({r:n});save(true)},
equal:(i,v)=>{if(!Number.isInteger(i)||i<0||i>2)return;setup();const a=[...s.eq];a[i]=nm(v,-12,12,0);set({eq:a});eq();save(true)},
reset:()=>{set({eq:[0,0,0]});eq();save(true)},
position:(x,y,force=false)=>{set({pos:{x,y}});if(force)save(true)},
close:()=>{wanted=false;seq++;au.pause();set({playing:false,open:false,needs:false});save(true)},
drop:id=>{
const at=s.q.findIndex(v=>v.id===Number(id));if(at<0)return;
const current=s.q[s.i],go=s.playing||wanted,q=s.q.filter(v=>v.id!==Number(id));
if(current?.id!==Number(id)){set({q,i:q.findIndex(v=>v.id===current.id)});save(true);return}
seq++;wanted=false;au.pause();set({q,i:Math.min(at,q.length-1),t:0,d:0,playing:false});
if(q.length)load(Math.min(at,q.length-1),0,go,false);else{au.removeAttribute('src');au.load();set({i:0,open:false,error:''})}save(true);
}};
au.addEventListener('loadedmetadata',()=>{const d=Number.isFinite(au.duration)?Math.max(0,au.duration):0;set({d});if(pending!==null){const t=pending;pending=null;seek(Math.min(t,d||t))}});
au.addEventListener('durationchange',()=>set({d:Number.isFinite(au.duration)?Math.max(0,au.duration):0},false));
au.addEventListener('timeupdate',()=>set({t:Number.isFinite(au.currentTime)?au.currentTime:0}));
au.addEventListener('playing',()=>{if(!wanted){au.pause();return}set({playing:true,needs:false,error:''});save(true)});
au.addEventListener('pause',()=>{if(au.paused)wanted=false;set({playing:false});save(true)});
au.addEventListener('ended',()=>{if(s.i+1<s.q.length)load(s.i+1,0,true,false);else{wanted=false;set({playing:false,t:s.d});save(true)}});
au.addEventListener('error',()=>{wanted=false;set({playing:false,needs:false,error:'не вдалося відтворити аудіо'});save(true)});
window.addEventListener('pagehide',()=>save(true));
document.addEventListener('visibilitychange',()=>{if(document.hidden)save(true)});
if(s.open&&s.q[s.i]){const resume=!!saved.playing;load(s.i,s.t,resume,false)}
return api;
}
const engine=()=>{if(typeof window==='undefined')return null;if(!window[sy])window[sy]=make();return window[sy]};
const mount=()=>{const e=engine();if(!e||!document.body||e.root)return;let el=document.getElementById('mriya-global-music-player');if(!el){el=document.createElement('div');el.id='mriya-global-music-player';document.body.appendChild(el)}e.root=cr(el);e.root.render(<Player/>)};
export const playMusic=(q,id)=>{const e=engine();mount();return e?.open(Array.isArray(q)?q:[],id)||false};
export const removeMusic=id=>engine()?.drop(id);
export const getMusicPlayer=()=>engine();
export default function Player(){
const e=engine();if(!e)return null;const s=ux(e.sub,e.get,e.get),box=ur(null),drag=ur(null);
const clamp=(x,y)=>{const r=box.current?.getBoundingClientRect(),w=r?.width||304,h=r?.height||430;return{x:nm(x,8,Math.max(8,window.innerWidth-w-8),8),y:nm(y,8,Math.max(8,window.innerHeight-h-8),8)}};
ul(()=>{if(!s.open||!box.current)return;const r=box.current.getBoundingClientRect(),p=clamp(s.pos?.x??window.innerWidth-r.width-18,s.pos?.y??window.innerHeight-r.height-90);if(!s.pos||p.x!==s.pos.x||p.y!==s.pos.y)e.position(p.x,p.y,true)},[s.open]);
ue(()=>{const f=()=>{const v=e.get();if(!v.open)return;const p=clamp(v.pos?.x??8,v.pos?.y??8);if(!v.pos||p.x!==v.pos.x||p.y!==v.pos.y)e.position(p.x,p.y,true)};const ob=window.ResizeObserver&&box.current?new window.ResizeObserver(f):null;if(ob)ob.observe(box.current);window.addEventListener('resize',f);return()=>{ob?.disconnect();window.removeEventListener('resize',f)}},[s.open]);
if(!s.open||!s.q[s.i])return null;
const v=s.q[s.i],pos=s.pos?{left:s.pos.x,top:s.pos.y}:{right:18,bottom:90};
const move=ev=>{if(!drag.current||drag.current.id!==ev.pointerId)return;const p=clamp(drag.current.x+ev.clientX-drag.current.cx,drag.current.y+ev.clientY-drag.current.cy);e.position(p.x,p.y)};
const end=ev=>{if(drag.current?.id!==ev.pointerId)return;drag.current=null;const p=e.get().pos;if(p)e.position(p.x,p.y,true);try{ev.currentTarget.releasePointerCapture(ev.pointerId)}catch{}};
return <aside ref={box} className="mp-box" style={pos} aria-label="плеєр"><style>{css}</style><div className="mp-top"><button type="button" className="mp-drag" aria-label="перемістити плеєр" title="перемістити плеєр" onPointerDown={ev=>{if(ev.button!==0)return;const r=box.current.getBoundingClientRect();drag.current={id:ev.pointerId,cx:ev.clientX,cy:ev.clientY,x:r.left,y:r.top};try{ev.currentTarget.setPointerCapture(ev.pointerId)}catch{}ev.preventDefault()}} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onKeyDown={ev=>{const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[ev.key];if(!d)return;ev.preventDefault();const r=box.current.getBoundingClientRect(),p=clamp(r.left+d[0],r.top+d[1]);e.position(p.x,p.y,true)}}>плеєр</button><button type="button" className="mp-btn mp-close" onClick={e.close} aria-label="закрити" title="закрити">X</button></div><p className="mp-title" translate="no">{v.nazva}</p><p className="mp-meta" translate="no">{[v.author,v.albom,v.godvipuska].filter(Boolean).join(' · ')}</p><input className="mp-range" type="range" min="0" max={s.d||1} step="0.1" value={Math.min(s.t,s.d||0)} disabled={!s.d} onChange={ev=>e.seek(ev.target.value)} aria-label="час відтворення"/><div className="mp-time" translate="no"><span>{fm(s.t)}</span><span>{fm(s.d)}</span></div><div className="mp-controls"><button type="button" className="mp-btn" onClick={e.prev} disabled={s.i===0&&s.t<=0} aria-label="попередній трек" title="попередній трек">◀</button><button type="button" className="mp-btn mp-play" onClick={e.toggle}>{s.playing?'пауза':'слухати'}</button><button type="button" className="mp-btn" onClick={e.next} disabled={s.i+1>=s.q.length} aria-label="наступний трек" title="наступний трек">▶</button></div><div className="mp-time" translate="no"><span>{s.i+1} / {s.q.length}</span></div><label className="mp-line" htmlFor="mp-volume"><span>гучність</span><span translate="no">{Math.round(s.v*100)}%</span></label><input id="mp-volume" className="mp-range" type="range" min="0" max="1" step="0.01" value={s.v} onChange={ev=>e.volume(ev.target.value)} aria-label="гучність"/><label className="mp-line" htmlFor="mp-rate"><span>швидкість</span><span translate="no">{s.r.toFixed(2)}×</span></label><input id="mp-rate" className="mp-range" type="range" min="0.5" max="2" step="0.05" value={s.r} onChange={ev=>e.rate(ev.target.value)} aria-label="швидкість"/><div className="mp-eq"><div className="mp-line"><strong>еквалайзер</strong><button type="button" className="mp-btn" onClick={e.reset}>очистити</button></div>{['низькі частоти','середні частоти','високі частоти'].map((n,i)=><div key={n}><label className="mp-line" htmlFor={'mp-eq-'+i}><span>{n}</span><span translate="no">{s.eq[i]>0?'+':''}{s.eq[i]} dB</span></label><input id={'mp-eq-'+i} className="mp-range" type="range" min="-12" max="12" step="1" value={s.eq[i]} disabled={!s.eqok} onChange={ev=>e.equal(i,ev.target.value)} aria-label={n}/></div>)}</div>{!s.eqok&&<p className="mp-note">еквалайзер недоступний у цьому браузері</p>}{s.needs&&<p className="mp-note" role="status">натисни «слухати», щоб продовжити</p>}{s.error&&<p className="mp-note mp-error" role="alert">{s.error}</p>}</aside>;
}
if(typeof window!=='undefined'&&typeof document!=='undefined'){if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount,{once:true})}
