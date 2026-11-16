import{memo,useState as us,useEffect as ue,useLayoutEffect as ul,useRef as ur}from'react';

const nv={position:'fixed',top:8,left:'50%',transform:'translateX(-50%)',width:820,maxWidth:'calc(100% - 24px)',height:64,display:'flex',alignItems:'center',gap:20,padding:'0 24px',boxSizing:'border-box',backgroundImage:'url(/pictures/header.png)',backgroundSize:'100% 100%',backgroundRepeat:'no-repeat',fontFamily:'system-ui,sans-serif',color:'#f5e9d8',overflow:'visible',borderRadius:35,zIndex:1000};
const lg={height:55,width:'auto',maxWidth:'36%',objectFit:'contain',display:'block',userSelect:'none',pointerEvents:'auto',flexShrink:0};
const sb={marginLeft:'auto',display:'flex',alignItems:'center',gap:10,flex:'0 1 420px',minWidth:0,height:38,padding:'0 14px',boxSizing:'border-box',borderRadius:12,background:'linear-gradient(145deg,rgba(52,46,40,.62),rgba(24,22,20,.68))',border:'1px solid rgba(255,220,180,.14)'};
const ip={flex:1,minWidth:0,width:'100%',background:'transparent',border:0,outline:0,color:'#f5e9d8',fontSize:13,fontFamily:'inherit',letterSpacing:'.2px',padding:0};
const sc=[{i:'s',n:'Стрічка',h:'/'},{i:'k',n:'Користувачі',h:'/users'},{i:'v',n:'Відео',h:'/videos'},{i:'m',n:'Музика',h:'/music'},{i:'g',n:'Флешігри',h:'/flash/'},{i:'c',n:'Спільноти',h:'/communities'},{i:'s',n:'Сайти',h:'/saity'},{i:'h',n:'Хостинг',h:'/hosting'},{i:'r',n:'Правила',h:'/rules'},{i:'u',n:'Профіль',h:'/me/'}];

async function drFetch(path,options={}){
const ac=new AbortController(),outer=options.signal,abort=()=>ac.abort();
if(outer?.aborted)ac.abort();else outer?.addEventListener('abort',abort,{once:true});
const timer=setTimeout(abort,15000);
try{const r=await fetch(path,{...options,credentials:'include',cache:'no-store',signal:ac.signal,headers:{Accept:'application/json',...options.headers}});const j=await r.json().catch(()=>null);if(!r.ok||!j||typeof j!=='object'){const e=Error(typeof j?.error==='string'?j.error:'не вдалося виконати запит');e.status=r.status;throw e}return j}catch(e){if(typeof e.status==='number')throw e;const x=Error('немає зв’язку із сервером, спробуй ще');x.status=0;throw x}finally{clearTimeout(timer);outer?.removeEventListener('abort',abort)}
}

function headerBadgeValue(value){
if(!value||typeof value.pic!=='string'||!value.pic.trim()||/[\\/\u0000-\u001f\u007f]/.test(value.pic)||value.pic==='.'||value.pic==='..'||typeof value.label!=='string')return null;
return{pic:value.pic,label:value.label};
}
function HeaderBadgeImage({badge,size=20,lazy=false}){
const[failed,sf]=us(false),pic=badge?.pic||'';
ue(()=>sf(false),[pic]);
if(!pic||failed)return <svg className="hgi" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" strokeDasharray="3 2"/><path d="M12 8v8m-4-4h8"/></svg>;
return <img className="hgi" src={'/galki/'+encodeURIComponent(pic)} alt="" width={size} height={size} loading={lazy?'lazy':'eager'} decoding="async" draggable={false} onError={()=>sf(true)}/>;
}
function HeaderBadges({uid,galka,open,onToggle,onClose}){
const[store,ss]=us({uid,items:[],selected:null,ready:false}),[loading,sl]=us(false),[busy,sb]=us(false),[error,se]=us(''),[left,sleft]=us(0);
const ref=ur(null),control=ur(null),closer=ur(onClose);closer.current=onClose;
const equal=(a,b)=>!!a&&!!b&&a.pic===b.pic&&a.label===b.label;
ue(()=>{
const c={uid,live:true,seq:0,busy:false,ac:null,post:null,load:null};control.current=c;
ss({uid,items:[],selected:null,ready:false});sl(false);sb(false);se('');
const load=async()=>{
if(!c.live||c.busy||!uid||document.hidden||navigator.onLine===false)return;
c.ac?.abort();const ac=new AbortController(),seq=++c.seq;c.ac=ac;sl(true);se('');
try{const j=await drFetch('/api/galki',{signal:ac.signal});if(!c.live||ac.signal.aborted||seq!==c.seq)return;if(j.ok!==true||!Array.isArray(j.items)||j.items.some(x=>!headerBadgeValue(x))||j.selected!==null&&!headerBadgeValue(j.selected))throw Error('невірна відповідь сервера');const seen=new Set(),items=[];for(const raw of j.items){const item=headerBadgeValue(raw),key=JSON.stringify([item.pic,item.label]);if(!seen.has(key)){seen.add(key);items.push(item)}}ss({uid,items,selected:headerBadgeValue(j.selected),ready:true})}catch(e){if(c.live&&!ac.signal.aborted&&seq===c.seq)se(e.message||'не вдалося завантажити галочки')}finally{if(c.live&&seq===c.seq)sl(false)}
};
c.load=load;const show=()=>{if(!document.hidden)load()};load();window.addEventListener('focus',load);window.addEventListener('online',load);window.addEventListener('mriya-profile-updated',load);document.addEventListener('visibilitychange',show);
return()=>{c.live=false;c.seq++;c.ac?.abort();c.post?.abort();window.removeEventListener('focus',load);window.removeEventListener('online',load);window.removeEventListener('mriya-profile-updated',load);document.removeEventListener('visibilitychange',show)};
},[uid]);
ue(()=>{if(open)control.current?.load()},[open,uid]);
ul(()=>{
if(!open)return;
const place=()=>{const r=ref.current?.getBoundingClientRect();if(!r)return;const width=document.documentElement.clientWidth||window.innerWidth,size=Math.min(220,Math.max(0,width-16));sleft(Math.max(8,Math.min(r.right-size,width-size-8))-r.left)};
place();window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place);return()=>{window.removeEventListener('resize',place);window.visualViewport?.removeEventListener('resize',place)};
},[open]);
ue(()=>{
if(!open)return;
const outside=e=>{if(!ref.current?.contains(e.target))closer.current()},key=e=>{if(e.key==='Escape'){closer.current();ref.current?.querySelector('.hgt')?.focus()}};
document.addEventListener('pointerdown',outside);window.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('keydown',key)};
},[open]);
const own=store.uid===uid,selected=own&&store.ready?store.selected:headerBadgeValue(galka),items=own?store.items:[];
const choose=async item=>{
const c=control.current;if(!c?.live||c.uid!==uid||c.busy||equal(selected,item))return;
c.busy=true;c.seq++;c.ac?.abort();c.post=new AbortController();sl(false);sb(true);se('');let changed=false;
try{const j=await drFetch('/api/galki',{method:'POST',signal:c.post.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({pic:item.pic,label:item.label})});if(!c.live||control.current!==c)return;const value=headerBadgeValue(j.selected);if(j.ok!==true||!equal(value,item))throw Error('невірна відповідь сервера');ss(old=>({...old,uid,selected:value,ready:true}));changed=true;window.dispatchEvent(new CustomEvent('mriya-profile-updated',{detail:{uid,galka:value}}));window.dispatchEvent(new CustomEvent('mriya-galka-updated',{detail:{uid,galka:value}}))}catch(e){if(c.live&&control.current===c)se(e.message||'не вдалося змінити галочку')}finally{c.busy=false;if(c.live&&control.current===c){sb(false);if(changed)c.load()}}
};
return <div className="hm hg" ref={ref}><button className="hgt" type="button" aria-label={selected?.label?'Галочка: '+selected.label:'Обрати галочку'} aria-expanded={open} aria-controls="header-badges-panel" title={selected?.label||'Обрати галочку'} onClick={onToggle}><HeaderBadgeImage badge={selected}/></button><div className={'hn hgp'+(open?' oo':'')} id="header-badges-panel" role="region" aria-label="" aria-hidden={!open} inert={open?undefined:''} style={{left,right:'auto',width:220,maxWidth:'calc(100vw - 16px)'}}><div className="hntitle"></div>{loading&&!store.ready&&<div className="hnempty" role="status">завантаження...</div>}{own&&store.ready&&!items.length&&<div className="hnempty">Поки що пусто</div>}<div className="hgg" role="group" aria-label="Галочки з інвентарю">{items.map(item=><button className={'hgb'+(equal(selected,item)?' hgs':'')} type="button" key={JSON.stringify([item.pic,item.label])} disabled={busy} aria-pressed={equal(selected,item)} onClick={()=>choose(item)}><HeaderBadgeImage badge={item} size={32} lazy/><span translate="no" dir="auto">{item.label||'Без підпису'}</span></button>)}</div>{busy&&<div className="hnempty hgw" role="status">зберігаємо...</div>}{error&&<div className="hnerror" role="alert">{error}</div>}<button className="hnmore" type="button" disabled={busy||loading} onClick={()=>control.current?.load()}>оновити</button></div></div>;
}

function Header({q,setQ}){
const[op,so]=us(false);
const[no,sn]=us(false);
const[bo,sbo]=us(false);
const[me,sm]=us(null);
const[fr,sfr]=us('');
const mr=ur(null);const ar=ur(null);const pr=ur(null);
const fn=typeof me?.frame==='string'&&/^[^\/\\\u0000-\u001f]+\.png$/i.test(me.frame)?me.frame:'';
const hf=!!fn&&fr===fn;
const[di,sdi]=us([]),[dc,sdc]=us(0),[dn,sdn]=us(null),[dl,sdl]=us(false),[dy,sdy]=us(false),[de,sde]=us(''),[dbusy,sdbusy]=us([]);
const duid=Number(me?.id)||0,duser=ur(duid),dpage=ur(1),dload=ur(()=>{}),drev=ur(0),dread=ur(null),dlocks=ur(new Set()),dlive=ur(true);
ue(()=>sbo(false),[duid]);
duser.current=duid;
ue(()=>{dlive.current=true;return()=>{dlive.current=false}},[]);
ue(()=>{
let live=true,ac=null,active=false,seq=0;
dpage.current=1;drev.current=0;dread.current=null;dlocks.current=new Set();sdi([]);sdc(0);sdn(null);sdy(!duid);sde('');sdbusy([]);sdl(false);
const load=async(force=false)=>{
if(!live||!duid||document.hidden||navigator.onLine===false||active&&!force)return;
ac?.abort();ac=new AbortController();const c=ac,version=++seq,revision=drev.current;active=true;sdl(true);let again=false;
try{let cursor=null,items=[],count=0;const seen=new Set();for(let page=0;page<dpage.current;page++){const j=await drFetch('/api/druzi/notifications'+(cursor?'?cursor='+encodeURIComponent(cursor):''),{signal:c.signal});if(!Array.isArray(j.items)||!Number.isInteger(j.unread)||j.unread<0||j.next!==null&&typeof j.next!=='string')throw Error('невірна відповідь сервера');if(page===0)count=j.unread;for(const item of j.items){const k=item.kind+':'+item.id;if(!seen.has(k)){seen.add(k);items.push(item)}}cursor=j.next;if(!cursor)break}if(!live||c.signal.aborted||version!==seq)return;if(revision!==drev.current){again=true;return}sdi(items);sdc(count);sdn(cursor);sde('');sdy(true)}catch(e){if(live&&!c.signal.aborted&&version===seq){if(e.status===401){sdi([]);sdc(0);sdn(null)}sde(e.message||'не вдалося завантажити сповіщення');sdy(true)}}finally{if(live&&version===seq){active=false;sdl(false);if(again)load(true)}}
};
dload.current=load;
const refresh=()=>load(true),show=()=>{if(!document.hidden)load()};
load();const timer=setInterval(()=>load(),10000);window.addEventListener('focus',refresh);window.addEventListener('online',refresh);window.addEventListener('mriya-druzi-updated',refresh);document.addEventListener('visibilitychange',show);
return()=>{live=false;++seq;ac?.abort();clearInterval(timer);window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);window.removeEventListener('mriya-druzi-updated',refresh);document.removeEventListener('visibilitychange',show);dload.current=()=>{}};
},[duid]);
ue(()=>{if(no&&duid)dload.current(true)},[no,duid]);ue(()=>{if(!duid){pr.current=dc;return}if(pr.current===null){pr.current=dc;return}if(dc>pr.current){try{const a=ar.current||(ar.current=new Audio("/spo.mp3"));a.currentTime=0;a.play().catch(()=>{})}catch(e){}}pr.current=dc},[dc,duid]);
ue(()=>{
if(!no||!duid||dread.current)return;
const items=di.filter(x=>!x.read).slice(0,100).map(x=>({id:x.id,kind:x.kind}));if(!items.length)return;
const token={uid:duid};dread.current=token;
drFetch('/api/druzi/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})}).then(j=>{if(!dlive.current||duser.current!==duid)return;drev.current++;const keys=new Set(items.map(x=>x.kind+':'+x.id));sdi(old=>old.map(x=>keys.has(x.kind+':'+x.id)?{...x,read:true}:x));sdc(Number.isInteger(j.unread)?j.unread:0)}).catch(e=>{if(dlive.current&&duser.current===duid)sde(e.message||'не вдалося зберегти прочитане')}).finally(()=>{if(dread.current===token)dread.current=null});
},[no,di,duid]);
const da=async(item,act)=>{
const owner=duid,locks=dlocks.current,k=item.kind+':'+item.id;if(!owner||locks.has(k))return;locks.add(k);sdbusy([...locks]);sde('');
try{await drFetch('/api/druzi',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:item.uid,act,id:item.id})});if(!dlive.current||duser.current!==owner)return;drev.current++;sdi(old=>old.filter(x=>x.kind+':'+x.id!==k));window.dispatchEvent(new CustomEvent('mriya-druzi-updated',{detail:{uid:item.uid}}))}catch(e){if(dlive.current&&duser.current===owner){sde(e.message||'не вдалося змінити запит');dload.current(true)}}finally{locks.delete(k);if(dlive.current&&duser.current===owner)sdbusy([...locks])}
};

ue(()=>{let live=true,ac=null;const load=()=>{if(document.hidden)return;ac?.abort();const c=new AbortController();ac=c;fetch('/api/me',{credentials:'include',cache:'no-store',signal:c.signal,headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():null).then(j=>{if(live&&!c.signal.aborted)sm(j&&Number(j.id)>0?j:null)}).catch(()=>{if(live&&!c.signal.aborted)sm(null)})};const show=()=>{if(!document.hidden)load()};load();window.addEventListener('focus',load);window.addEventListener('hashchange',load);window.addEventListener('popstate',load);window.addEventListener('mriya-profile-updated',load);document.addEventListener('visibilitychange',show);return()=>{live=false;ac?.abort();window.removeEventListener('focus',load);window.removeEventListener('hashchange',load);window.removeEventListener('popstate',load);window.removeEventListener('mriya-profile-updated',load);document.removeEventListener('visibilitychange',show)}},[]);
ue(()=>{if(!no)return;const cl=e=>{if(!mr.current?.contains(e.target))sn(false)};const kd=e=>{if(e.key==='Escape'){sn(false);mr.current?.querySelector('button')?.focus()}};document.addEventListener('pointerdown',cl);window.addEventListener('keydown',kd);return()=>{document.removeEventListener('pointerdown',cl);window.removeEventListener('keydown',kd)}},[no]);
ue(()=>{const cl=e=>{if(e.key==='Escape'){so(false);sn(false);sbo(false)}};window.addEventListener('keydown',cl);return()=>window.removeEventListener('keydown',cl)},[]);
return <><style>{`
.hh .hc{margin-left:auto;display:flex;align-items:center;gap:10px;flex:0 0 auto}
.hh .ha{position:relative;display:block;width:46px;height:46px;flex:0 0 46px;isolation:isolate;overflow:visible;text-decoration:none}
.hh .ha>.hi{position:absolute;z-index:1;display:block;inset:0;width:100%;height:100%;margin:0;box-sizing:border-box;border:2px solid rgba(255,255,255,.85);border-radius:50%;object-fit:cover}
.hh .ha.ho>.hi{inset:9%;width:82%;height:82%;border:0}
.hh .ha>.hf{position:absolute;z-index:2;display:block;inset:9%;width:82%;height:82%;margin:0;padding:0;border:0;border-radius:0;clip-path:none;object-fit:contain;pointer-events:none;user-select:none}
.hh .ha:focus-visible,.hh .hb:focus-visible{outline:2px solid #fff;outline-offset:3px}
.hh .hm{position:relative;display:flex;align-items:center;flex:0 0 auto}
.hh .hb{width:42px;height:38px;display:flex;align-items:center;justify-content:center;flex:0 0 42px;padding:0;border:1px solid rgba(255,220,180,.14);border-radius:12px;background:linear-gradient(145deg,rgba(52,46,40,.62),rgba(24,22,20,.68));color:#fff;cursor:pointer}
.hh .hb>svg{display:block;width:22px;height:22px;flex:none;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
.hh .hn{position:absolute;top:calc(100% + 10px);right:0;z-index:1003;width:220px;max-width:calc(100vw - 100px);box-sizing:border-box;padding:18px 14px;border:1px solid #e4e4e4;border-radius:10px;background:#fff;color:#777;font:13px system-ui,sans-serif;text-align:center;box-shadow:none;opacity:0;visibility:hidden;transform:translateY(-14px) scale(.97);transform-origin:top center;pointer-events:none;transition:opacity .3s ease,transform .4s cubic-bezier(.16,1,.3,1),visibility .3s}
.hh .hn.oo{opacity:1;visibility:visible;transform:translateY(0) scale(1);pointer-events:auto}
.hh .hb{position:relative}
.hh .hbadge{position:absolute;top:-6px;right:-7px;min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border:1px solid #fff;border-radius:99px;background:#dc2626;color:#fff;font:700 11px/1 system-ui,sans-serif;pointer-events:none}
.hh .hn{max-height:min(65vh,430px);overflow:auto;overscroll-behavior:contain;text-align:left}
.hh .hntitle{font-weight:700;color:#302b25;margin-bottom:10px;text-align:center}
.hh .hnempty{text-align:center}
.hh .hnlogin{display:block;text-align:center;color:#39834b;text-decoration:none}
.hh .hnitem{padding:10px 0;border-top:1px solid #ededed;color:#514b42;font-size:12px;line-height:1.45;overflow-wrap:anywhere}
.hh .hnitem.hnew{background:#f4faf2}
.hh .hnname{display:block;color:#39834b;font-weight:700;text-decoration:none;font-size:13px}
.hh .hntime{display:block;font-size:10px;color:#8a857a;margin-top:3px}
.hh .hnactions{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.hh .hnactions button{flex:1;min-width:0;padding:6px 7px;min-height:30px;border:1px solid rgba(57,136,75,.4);border-radius:8px;color:#fff;background-image:url('/pictures/button.png');background-position:center;background-size:cover;font:600 11px system-ui,sans-serif;cursor:pointer}
.hh .hnactions button:first-child{color:#fff;border-color:rgba(57,136,75,.4)}
.hh .hnactions button:disabled,.hh .hnmore:disabled{opacity:.5;cursor:wait}
.hh .hnmore{display:block;width:100%;margin-top:9px;padding:6px 7px;min-height:30px;box-sizing:border-box;border:1px solid rgba(57,136,75,.4);border-radius:8px;background-image:url('/pictures/button.png');background-position:center;background-size:cover;color:#fff;font:600 12px system-ui,sans-serif;cursor:pointer}
.hh .hnerror{color:#a42b2b;font-size:12px;margin-top:8px}
.hh .hg{margin-right:-4px}
.hh .hgt{width:28px;height:38px;display:flex;align-items:center;justify-content:center;flex:0 0 28px;margin:0;padding:0;border:0;border-radius:6px;background:transparent;color:#fff;cursor:pointer;touch-action:manipulation}
.hh .hgt:focus-visible{outline:2px solid #fff;outline-offset:3px}
.hh .hgi{display:block;object-fit:contain;flex:none;border:0;border-radius:0;pointer-events:none;user-select:none}
.hh .hgp{border:0;-webkit-overflow-scrolling:touch;touch-action:pan-y}
.hh .hgg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.hh .hgb{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:7px;min-width:0;min-height:82px;margin:0;padding:10px 6px;border:1px solid #e4e4e4;border-radius:8px;background:#fafaf7;color:#514b42;font:12px/1.4 system-ui,sans-serif;text-align:center;cursor:pointer;touch-action:manipulation}
.hh .hgb>span{display:block;max-width:100%;overflow-wrap:anywhere;white-space:normal}
.hh .hgb:hover,.hh .hgb:focus-visible{border-color:#e4e4e4}
.hh .hgb:focus-visible{outline:none;outline-offset:1px}
.hh .hgb.hgs{border-color:#e4e4e4;background:#edf6e9;box-shadow:none}
.hh .hgb:disabled{opacity:.55;cursor:wait}
.hh .hgw{margin-top:9px}


.hh .ss:focus-within{border-color:rgba(255,220,180,.4)}
.ii::placeholder{color:rgba(245,233,216,.62)}
.bb{display:flex}
.mm{display:flex}
.mi{text-decoration:none}
.mi:hover,.mi:focus-visible{background:rgba(90,75,60,.55)}
@media(max-width:600px){
.hh{top:0!important;left:0!important;transform:none!important;width:100%!important;max-width:none!important;height:64px!important;padding:0 14px!important;gap:10px!important;border-radius:0 0 18px 18px!important;box-sizing:border-box;overflow:visible}
.hh .ll{height:43px!important;max-width:29%!important}
.hh .ss{height:40px;flex:1 1 auto;min-width:0;padding:0 11px;gap:7px;border-radius:12px}
.ii{font-size:14px}
.hh .bb{width:42px!important;height:40px!important;flex:0 0 42px!important}
.hh .hc{gap:8px}
.hh .ha{width:42px;height:42px;flex-basis:42px}
.hh .hb{height:40px}
}
@media(max-width:380px){.hh{height:58px!important;padding:0 9px!important;gap:7px!important}.hh .ll{height:36px!important;max-width:27%!important}.hh .ss{height:36px;padding:0 8px}.ii{font-size:13px}.hh .bb{width:38px!important;height:36px!important;flex-basis:38px!important}.hh .hc{gap:6px}.hh .ha{width:38px;height:38px;flex-basis:38px}.hh .hb{width:38px;height:36px;flex-basis:38px}.hh .hb>svg{width:21px;height:21px}}
@media(prefers-reduced-motion:reduce){.bb span,.mm,.mi,.hh .hn{transition:none}.mm.oo .mi{transition-delay:0s}}
`}</style><header className="hh" style={nv}><a href="https://mriya.ink" aria-label="Mriya - На головну" style={{display:'contents'}}><img className="ll" src="/pictures/logo white 2.png" alt="Mriya" draggable={false} style={lg}/></a><div className="hc">{duid>0&&<HeaderBadges key={duid} uid={duid} galka={me?.galka} open={bo} onToggle={()=>{so(false);sn(false);sbo(x=>!x)}} onClose={()=>sbo(false)}/>}<a className={`ha${hf?' ho':''}`} href={me?.id?'/me/':'/login'} aria-label={me?.id?'Мій профіль':'Увійти'}><img className="hi" src={me?.photo||'/pictures/default_avatar.png'} alt="" draggable={false} onError={e=>{if(e.currentTarget.getAttribute('src')!=='/pictures/default_avatar.png')e.currentTarget.src='/pictures/default_avatar.png'}}/>{fn&&<img key={fn} className="hf" src={'/frames/'+encodeURIComponent(fn)} alt="" width="512" height="512" draggable={false} style={{visibility:hf?'visible':'hidden'}} onLoad={()=>sfr(fn)} onError={()=>sfr('')}/>}</a><div className="hm" ref={mr}><button className="hb" type="button" aria-label={(no?'Закрити сповіщення':'Відкрити сповіщення')+(dc?' - непрочитані: '+dc:'')} aria-expanded={no} aria-controls="header-mail-panel" onClick={()=>{so(false);sbo(false);sn(x=>!x)}}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>{dc>0&&<span className="hbadge" aria-hidden="true">{dc>99?'99+':dc}</span>}</button><div className={`hn${no?' oo':''}`} id="header-mail-panel" role="region" aria-label="Сповіщення" aria-hidden={!no} inert={no?undefined:''}>
<div className="hntitle">Сповіщення</div>
{!duid?<a className="hnlogin" href="/login">Увійди, щоб переглянути сповіщення</a>:<>
{!dy&&<div className="hnempty" role="status">завантаження...</div>}
{dy&&!di.length&&!de&&<div className="hnempty">Поки що пусто</div>}
{di.map(item=><article className={'hnitem'+(!item.read?' hnew':'')} key={item.kind+':'+item.id}>
<a className="hnname" href={'/id/'+encodeURIComponent(item.uid)} translate="no">{item.username}</a>
<div>{item.kind==='request'?'Запит у друзі':'Ваш запит у друзі прийнято'}</div>
<time className="hntime" dateTime={item.at} translate="no">{new Date(item.at).toLocaleDateString('uk-UA')}</time>
{item.kind==='request'&&<div className="hnactions"><button type="button" disabled={dbusy.includes(item.kind+':'+item.id)} onClick={()=>da(item,'accept')}>Прийняти</button><button type="button" disabled={dbusy.includes(item.kind+':'+item.id)} onClick={()=>da(item,'decline')}>Відхилити</button></div>}
</article>)}
{de&&<div className="hnerror" role="alert">{de}<button type="button" className="hnmore" disabled={dl} onClick={()=>dload.current(true)}>Спробувати ще</button></div>}
{dn&&<button type="button" className="hnmore" disabled={dl} onClick={()=>{dpage.current++;dload.current(true)}}>{dl?'завантаження...':'Показати ще'}</button>}
</>}
</div></div><button className="bb" type="button" aria-label={op?'Закрити меню':'Відкрити меню'} aria-expanded={op} onClick={()=>{sn(false);sbo(false);so(x=>!x)}} style={{width:42,height:38,flex:'0 0 42px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:5,padding:0,border:'1px solid rgba(255,220,180,.14)',borderRadius:12,background:'linear-gradient(145deg,rgba(52,46,40,.62),rgba(24,22,20,.68))',color:'#f5e9d8',cursor:'pointer'}}><span style={{display:'block',width:19,height:2,borderRadius:2,background:'#f5e9d8',transition:'transform .3s cubic-bezier(.16,1,.3,1)',transform:op?'translateY(7px) rotate(45deg)':undefined}}/><span style={{display:'block',width:19,height:2,borderRadius:2,background:'#f5e9d8',transition:'opacity .2s ease',opacity:op?0:1}}/><span style={{display:'block',width:19,height:2,borderRadius:2,background:'#f5e9d8',transition:'transform .3s cubic-bezier(.16,1,.3,1)',transform:op?'translateY(-7px) rotate(-45deg)':undefined}}/></button></div><nav className={`mm${op?' oo':''}`} aria-hidden={!op} inert={!op} aria-label="Розділи сайту" style={{position:'absolute',top:'calc(100% + 10px)',left:8,right:8,display:'flex',flexDirection:'column',gap:4,padding:8,boxSizing:'border-box',borderRadius:12,background:'linear-gradient(145deg,rgba(52,46,40,.62),rgba(24,22,20,.68))',border:'1px solid rgba(255,220,180,.14)',opacity:op?1:0,visibility:op?'visible':'hidden',transform:op?'translateY(0) scale(1)':'translateY(-14px) scale(.97)',transformOrigin:'top center',pointerEvents:op?'auto':'none',transition:'opacity .3s ease,transform .4s cubic-bezier(.16,1,.3,1),visibility .3s'}}>{sc.map((s,i)=><a className="mi" href={s.h} key={s.i} onClick={()=>so(false)} style={{display:'flex',alignItems:'center',minHeight:40,padding:'0 14px',boxSizing:'border-box',border:'1px solid rgba(255,220,180,.10)',borderRadius:8,color:'#f5e9d8',font:'500 14px system-ui,sans-serif',letterSpacing:'.2px',textAlign:'left',cursor:'pointer',opacity:op?1:0,transform:op?'translateY(0)':'translateY(-8px)',transition:'background .2s ease,transform .3s cubic-bezier(.16,1,.3,1),opacity .25s ease',transitionDelay:op?`${.03*(i+1)}s`:'0s'}}>{s.n}</a>)}</nav></header></>
}

export default memo(Header);

