import{useState as us,useEffect as ue,useRef as ur}from'react';
import{Rn}from'./Posts';
import emojis from'./emoji-list';
import stickeri from'./stickeri-list';
const stickerSet=new Set(stickeri);
import Photka from'./Photka';
import Galochki from'./Galochki';
const fn=['Inter','Roboto','Open Sans','Montserrat','Poppins','Lato','Nunito','Playfair Display','Merriweather','Lora','Bebas Neue','Oswald','Pacifico','Dancing Script','Caveat','Great Vibes','Cinzel','UnifrakturMaguntia','Press Start 2P','Shadows Into Light','Permanent Marker','Comfortaa','Righteous','Fira Code','JetBrains Mono'];
const fu='https://fonts.googleapis.com/css2?'+fn.map(f=>'family='+f.replace(/ /g,'+')).join('&')+'&display=swap';
const st=`
.cm{width:min(760px,calc(100% - 32px));margin:0 auto;padding:104px 0 150px;font-family:system-ui,sans-serif;color:#302b25;position:relative;z-index:2}
.cm *{box-sizing:border-box}
.cm .pc{padding:22px;border:1px solid rgba(46,140,70,.2);border-radius:22px;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);margin-bottom:18px}
.cm .pi{padding:21px;border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.9);margin-bottom:12px;overflow-wrap:anywhere;scroll-margin-top:90px;backdrop-filter:blur(8px)}
.cm .phd,.cm .phl,.cm .phr,.cm .pmt,.cm .pr,.cm .mtb{display:flex;align-items:center;gap:12px}
.cm .phd,.cm .pr{justify-content:space-between;flex-wrap:wrap;margin-bottom:14px}
.cm .phl{min-width:0;flex:1}
.cm .phr{gap:6px;flex-wrap:wrap}
.cm .pif{display:flex;flex-direction:column;gap:2px;min-width:0}
.cm .pnm{font-size:15px;font-weight:700;color:#302b25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none;min-width:0}
.cm .cna{display:flex;align-items:center;gap:4px;min-width:0}
.cm .ptm{font-size:12px;color:#8a857a;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.cm .cav{display:block;position:relative;width:42px;height:42px;flex:0 0 42px;isolation:isolate}
.cm .cav>img:first-child{display:block;position:relative;z-index:1;width:100%;height:100%;object-fit:cover;border-radius:50%;border:1px solid #d0d4c0;background:#e2e4d8}
.cm .cav>img.cfr{position:absolute!important;inset:0!important;z-index:2!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;clip-path:none!important;object-fit:contain!important;pointer-events:none}
.cm .pf{display:flex;flex-direction:column;gap:12px}
.cm .pl{display:block;font-size:13px;font-weight:650;color:#4e6348;margin:0}
.cm .mtb{gap:8px;flex-wrap:wrap}
.cm .tb{display:flex;gap:8px;padding:10px;background:rgba(240,240,230,.6);border:1px solid #e2e4d8;border-radius:12px;align-items:center;overflow-x:auto;-webkit-overflow-scrolling:touch}
.cm .tbg{display:flex;gap:4px;align-items:center;padding-right:8px;border-right:1px solid #d0d4c0;flex-shrink:0}
.cm .tbg:last-child{border-right:0;padding-right:0}
.cm .tbb{min-width:32px;height:32px;padding:0 8px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;color:#302b25;font:600 13px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.cm .tbb:hover{background:#eef0e0;border-color:#63a86c}
.cm button:disabled{opacity:.5;cursor:not-allowed}
.cm .tbc{width:34px;height:32px;padding:2px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;cursor:pointer;flex-shrink:0}
.cm .tbi{height:32px;padding:0 10px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;font:inherit;font-size:12px;width:60px;outline:none;flex-shrink:0}
.cm .tbs{height:32px;padding:0 8px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;font:inherit;font-size:12px;outline:none;max-width:160px;cursor:pointer;flex-shrink:0}
.cm .px{width:100%;min-height:125px;resize:vertical;padding:15px;border:1px solid #e2e4d8;border-radius:14px;background:rgba(250,250,245,.9);color:#302b25;font:14px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace;outline:none;white-space:pre-wrap}
.cm .px:focus{border-color:#63a86c}
.cm .pmt{gap:8px;flex-wrap:wrap}
.cm .pmi2{height:34px;padding:0 12px;border:1px solid #d0d4c0;border-radius:10px;background:#fff;font:inherit;font-size:13px;outline:none;flex:1;min-width:0}
.cm .pn{font-size:12px;color:#8b867b}
.cm .pb{min-height:43px;padding:0 21px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background:url('/pictures/button.png') center/cover no-repeat;color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
.cm .pb:hover:not(:disabled){filter:brightness(1.07)}
.cm .pb2{white-space:pre-wrap;margin:0;font-size:14px;line-height:1.8;color:#39352f;overflow-wrap:break-word;tab-size:4;font-variant-ligatures:none}
.cm .pge{margin-top:10px;font-size:12px;color:#4e6348;font-weight:600}
.cm .pm{display:flex;gap:6px;margin-top:12px;overflow-x:auto;padding-bottom:4px}
.cm .pmi{height:160px;max-width:100%;border-radius:12px;object-fit:cover;flex-shrink:0;cursor:pointer}
.cm .pg{display:block;margin-top:12px;max-width:100%;max-height:480px;border-radius:12px;object-fit:contain}
.cm .pv{display:flex;gap:8px;flex-wrap:wrap}
.cm .pvi{position:relative;width:80px;height:80px;border-radius:10px;overflow:hidden;border:1px solid #d0d4c0}
.cm .pvi img{width:100%;height:100%;object-fit:cover}
.cm .pvr{position:absolute;top:3px;right:3px;width:20px;height:20px;border:0;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;cursor:pointer;font:700 12px system-ui;display:flex;align-items:center;justify-content:center;padding:0}
.cm .pe{padding:14px 16px;border:1px solid #e8b7a8;border-radius:13px;background:#fff5f1;color:#99442e;font-size:13px;line-height:1.6;overflow-wrap:anywhere}
.cm .pz{padding:28px 18px;text-align:center;border:1px dashed rgba(70,130,75,.3);border-radius:18px;background:rgba(255,255,255,.9);color:#817b70;font-size:14px;line-height:1.7}
.cm .bbs{display:inline;box-decoration-break:clone;-webkit-box-decoration-break:clone;white-space:pre-wrap}
.cm .bsp{display:inline-block;margin:4px 0;padding:4px 12px;border:1px solid #d0d4c0;border-radius:6px;background:#f3f4f6;color:#6b7280;font:600 12px system-ui;cursor:pointer}
.cm .bls{margin:8px 0;padding-left:22px;list-style:disc}
.cm .bls li{margin:3px 0;line-height:1.7;color:#39352f}
.cm .bhr{border:0;border-top:1px solid #d0d4c0;margin:14px 0}
.cm .ctr{margin-left:16px;padding-left:12px;border-left:2px solid rgba(57,131,75,.2);min-width:0}
.cm .ctl{margin-left:0;padding-left:0;border-left:0}
.cm .cft{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid #eeeee7}
.cm .cft button,.cm .clk{border:0;background:none;padding:4px 0;color:#39834b;font:600 12px system-ui;cursor:pointer;text-decoration:none}
.cm .petb{display:flex;flex-wrap:wrap;align-items:center;gap:10px;max-height:180px;overflow-x:hidden;overflow-y:auto;padding:10px}
.cm .peb{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:auto;height:28px;padding:0!important;margin:0;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;cursor:pointer}
.cm .peb img{display:block;width:auto;height:28px;max-width:96px;max-height:28px;object-fit:contain;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;padding:0;margin:0}
.cm .peb:disabled{cursor:default;opacity:.5}
.cm .peb:focus-visible{outline:2px solid #b89652;outline-offset:3px}
.cm .pesr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.cm .bem{display:inline-block;vertical-align:middle;width:auto;height:28px;max-width:96px;max-height:28px;object-fit:contain}
.cm .bsk{display:inline-block;vertical-align:middle;margin:4px 2px;max-width:140px;max-height:140px;width:auto;height:auto;object-fit:contain;border-radius:10px}
.cm .crp{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;background:#eef3e8;border:1px solid #d0d4c0;border-radius:10px;color:#4e6348;font-size:13px;overflow-wrap:anywhere}
@media(max-width:600px){.cm{width:calc(100% - 16px);padding:74px 0 35px}.cm .pc,.cm .pi{padding:14px;border-radius:16px}.cm .ctr{margin-left:8px;padding-left:7px}.cm .ctl{margin-left:0;padding-left:0}.cm .px{min-height:100px;font-size:16px}.cm .tbb,.cm .tbc,.cm .tbi,.cm .tbs{height:38px}.cm .tbs{max-width:150px}.cm .pmi{height:120px}.cm .pr{align-items:stretch;flex-direction:column;gap:10px}.cm .pb{min-height:46px;width:100%}.cm .pn{text-align:center}.cm .phd{gap:8px}.cm .phl{gap:8px}.cm .phr{gap:4px}}
`;
function Ed({ini=null,on,off,cap='написати коментар',lab='опублікувати',re=null}){
const[tx,sx]=us(ini?.text||'');const[pc,sp]=us(ini?.pics||[]);const[gf,sg]=us(ini?.gif||'');const[ge,se]=us(ini?.geo||'');const[er,sr]=us('');const[up,su]=us(false);const[sv,ss]=us(false);const[to,so]=us(false);const[cl,sc]=us('#000000');const[bg,sb]=us('#ffffff');const[sz,szs]=us(16);const[ff,sf]=us('Inter');const[op,os]=us(50);
const tr=ur(null);const fi=ur(null);const gi=ur(null);const fm=ur(null);const lv=ur(true);const mx=5000;
ue(()=>{lv.current=true;return()=>{lv.current=false}},[]);
ue(()=>{if(re){fm.current?.scrollIntoView?.({behavior:'smooth',block:'center'});tr.current?.focus()}},[re?.id]);
const wr=(nm,vl)=>{
const el=tr.current;if(!el)return;
const a=el.selectionStart,b=el.selectionEnd,v=tx.slice(a,b);
const x=vl===undefined?'['+nm+']':'['+nm+'='+vl+']';
sx(tx.slice(0,a)+x+v+'[/'+nm+']'+tx.slice(b));
setTimeout(()=>{el.focus();el.setSelectionRange(a+x.length,a+x.length+v.length)},0);
};
const wi=v=>{const el=tr.current;if(!el)return;const a=el.selectionStart,b=el.selectionEnd;sx(tx.slice(0,a)+v+tx.slice(b));setTimeout(()=>{el.focus();el.setSelectionRange(a+v.length,a+v.length)},0)};
const wl=()=>{const el=tr.current;if(!el)return;wi('[list]\n[*]'+(tx.slice(el.selectionStart,el.selectionEnd)||'пункт')+'\n[/list]')};
const we=u=>{const el=tr.current;if(!el||sv||up)return;const a=el.selectionStart,b=el.selectionEnd;const v='<emodzya=('+u+')>';sx(tx.slice(0,a)+v+tx.slice(b));setTimeout(()=>{el.focus();el.setSelectionRange(a+v.length,a+v.length)},0)};
const ws=u=>{const el=tr.current;if(!el||sv||up||tx.includes('[sticker]'))return;const a=el.selectionStart,b=el.selectionEnd;const v='[sticker]'+u+'[/sticker]';sx(tx.slice(0,a)+v+tx.slice(b));setTimeout(()=>{el.focus();el.setSelectionRange(a+v.length,a+v.length)},0)};
const uf=async(e,typ)=>{
const el=e.target,fs=Array.from(el.files||[]);
if(!fs.length)return;
sr('');
if(typ==='p'&&pc.length+fs.length>5){sr('макс 5 фото');el.value='';return}
su(true);
try{
for(const f of fs){
const fd=new FormData();fd.append('file',f);
const r=await fetch('/api/upload',{method:'POST',credentials:'include',body:fd});
const j=await r.json().catch(()=>null);
if(!r.ok||!j?.url)throw Error(j?.error||('помилка завантаження: '+r.status));
if(!lv.current)return;
if(typ==='p')sp(x=>[...x,j.url]);else sg(j.url);
}
}catch(e){if(lv.current)sr(e.message)}finally{if(lv.current)su(false);el.value=''}
};
const sub=async e=>{
e.preventDefault();if(sv||up||(!tx.trim()&&!pc.length&&!gf))return;
if(Array.from(tx).length>mx){sr('максимум 5000 символів');return}
ss(true);sr('');
try{
await on({text:tx,pics:pc,gif:gf,geo:ge});
if(lv.current){sx('');sp([]);sg('');se('');so(false)}
}catch(e){if(lv.current)sr(e.message)}finally{if(lv.current)ss(false)}
};
return <form ref={fm} className="pf" onSubmit={sub}>
<label className="pl">{cap}</label>
{re&&<div className="crp"><span>відповідь: <span translate="no">@{re.username}</span></span><button type="button" className="tbb" onClick={off} disabled={sv||up}>скасувати</button></div>}
{er&&<div className="pe" role="alert">{er}</div>}
<fieldset disabled={sv||up} style={{border:0,padding:0,margin:0,minWidth:0,display:'flex',flexDirection:'column',gap:12}}>
<div className="mtb"><button type="button" className="tbb" onClick={()=>so(!to)} title="форматування" aria-expanded={to}><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg></button><button type="button" className="tbb" onClick={()=>fi.current?.click()} disabled={pc.length>=5}>фото</button><button type="button" className="tbb" onClick={()=>gi.current?.click()} disabled={!!gf}>gif</button></div>
{to&&<div className="tb">
<div className="tbg"><button type="button" className="tbb" onClick={()=>wr('b')} title="жирний"><b>B</b></button><button type="button" className="tbb" onClick={()=>wr('i')} title="курсив"><i>I</i></button><button type="button" className="tbb" onClick={()=>wr('u')} title="підкреслений"><u>U</u></button><button type="button" className="tbb" onClick={()=>wr('s')} title="закреслений"><s>S</s></button></div>
<div className="tbg"><input type="color" className="tbc" value={cl} onChange={e=>sc(e.target.value)} title="колір"/><button type="button" className="tbb" onClick={()=>wr('color',cl)}>колір</button><input type="color" className="tbc" value={bg} onChange={e=>sb(e.target.value)} title="фон"/><button type="button" className="tbb" onClick={()=>wr('bg',bg)}>фон</button><button type="button" className="tbb" onClick={()=>wr('border',cl)}>рамка</button></div>
<div className="tbg"><input type="number" className="tbi" value={sz} min={8} max={72} onChange={e=>szs(+e.target.value)} title="px"/><button type="button" className="tbb" onClick={()=>wr('size',sz)}>розмір</button><select className="tbs" value={ff} onChange={e=>sf(e.target.value)}>{fn.map(f=><option key={f} value={f} style={{fontFamily:"'"+f+"',sans-serif"}}>{f}</option>)}</select><button type="button" className="tbb" onClick={()=>wr('font',ff)}>шрифт</button></div>
<div className="tbg"><button type="button" className="tbb" onClick={()=>wr('shadow',cl)}>тінь</button><button type="button" className="tbb" onClick={()=>wr('glow',cl)}>сяйво</button><input type="number" className="tbi" value={op} min={0} max={100} onChange={e=>os(+e.target.value)} title="%"/><button type="button" className="tbb" onClick={()=>wr('opacity',op)}>прозор</button></div>
<div className="tbg"><button type="button" className="tbb" onClick={()=>wr('spoiler')}>спойлер</button><button type="button" className="tbb" onClick={wl}>список</button><button type="button" className="tbb" onClick={()=>wi('[hr]')}>лінія</button></div>
</div>}{to&&<div className="petb" role="group" aria-label="емодзі">{emojis.map((u,i)=><button key={u} type="button" className="peb" disabled={sv||up} onPointerDown={e=>e.preventDefault()} onClick={()=>we(u)}><span className="pesr">емодзі</span><span className="pesr" translate="no">{i+1}</span><img src={u} alt="" loading="lazy" decoding="async"/></button>)}</div>}{to&&stickeri.length>0&&<div className="petb" role="group" aria-label="стикери">{stickeri.map((u,i)=><button key={u} type="button" className="peb" disabled={sv||up||tx.includes('[sticker]')} onPointerDown={e=>e.preventDefault()} onClick={()=>ws(u)}><span className="pesr">стикер</span><span className="pesr" translate="no">{i+1}</span><img src={'/stickeri/'+u} alt="" loading="lazy" decoding="async"/></button>)}</div>}
<input ref={fi} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e=>uf(e,'p')}/>
<input ref={gi} type="file" accept="image/gif" hidden onChange={e=>uf(e,'g')}/>
<textarea ref={tr} className="px" value={tx} onChange={e=>sx(e.target.value)} maxLength={mx} aria-label={cap} placeholder="напиши коментар..."/>
<input className="pmi2" value={ge} onChange={e=>se(e.target.value)} maxLength={100} placeholder="локація"/>
{(pc.length>0||gf)&&<div className="pv">{pc.map((v,i)=><div className="pvi" key={v+'-'+i}><img src={v} alt=""/><button type="button" className="pvr" aria-label="видалити фото" onClick={()=>sp(x=>x.filter((_,j)=>i!==j))}>×</button></div>)}{gf&&<div className="pvi" style={{width:120}}><img src={gf} alt=""/><button type="button" className="pvr" aria-label="видалити GIF" onClick={()=>sg('')}>×</button></div>}</div>}
<div className="pr" style={{margin:0}}><span className="pn">{Array.from(tx).length} / {mx}{up&&' • завантаження…'}</span><div className="phr">{ini&&<button type="button" className="tbb" onClick={off}>скасувати</button>}<button type="submit" className="pb" disabled={!tx.trim()&&!pc.length&&!gf}>{sv?'зберігаємо…':lab}</button></div></div>
</fieldset>
</form>;
}
const dt=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('uk-UA',{dateStyle:'medium',timeStyle:'short'}).format(d)};
function Hd({c}){
return <div className="phl"><a className="cav" href={'#user/'+encodeURIComponent(c.username||'')}><img src={c.photo||'/pictures/default_avatar.png'} alt=""/>{c.frame&&<img className="cfr" src={'/frames/'+encodeURIComponent(c.frame)} alt=""/>}</a><div className="pif"><div className="cna"><a className="pnm" translate="no" href={'#user/'+encodeURIComponent(c.username||'')}>{c.username||'невідомий'}</a><Galochki galka={c.galka}/></div><div className="ptm"><time dateTime={c.created_at}>{dt(c.created_at)}</time>{c.updated_at&&!c.deleted&&<span>ред. {dt(c.updated_at)}</span>}</div></div></div>;
}
function Stx({t}){const parts=String(t||'').split(/(\[sticker\][^\[\]]{1,200}\[\/sticker\])/gi);return <>{parts.map((p,i)=>{const m=/^\[sticker\]([^\[\]]{1,200})\[\/sticker\]$/i.exec(p);if(m){const u=/^[A-Za-z0-9._-]{1,80}$/.test(m[1])&&stickerSet.has(m[1])?'/stickeri/'+m[1]:'';return u?<img key={i} className="bsk" src={u} alt="" loading="lazy" decoding="async"/>:<span key={i}>{p}</span>}return <Rn key={i} t={p}/>})}</>}
function Md({c,on}){
return <><div className="pb2" translate="no"><Stx t={c.text||''}/></div>{c.geo&&<div className="pge">Локація:: <span translate="no">{c.geo}</span></div>}{Array.isArray(c.pics)&&c.pics.length>0&&<div className="pm">{c.pics.map((v,i)=><img className="pmi" src={v} key={v+'-'+i} alt="фотографія" onClick={()=>on(v)}/>)}</div>}{c.gif&&<img className="pg" src={c.gif} alt="GIF"/>}</>;
}
function Nd({c,dp=0,mp,me,ei,on,ed,off,sv,dl,re,bs}){
const[op,so]=us(true);
const ch=mp.get(c.id)||[];
return <div id={'comment-'+c.id} style={{scrollMarginTop:90}}><article className="pi"><div className="phd"><Hd c={c}/>{me?.id===c.uid&&!c.deleted&&ei!==c.id&&<div className="phr"><button type="button" className="tbb" disabled={bs} onClick={()=>ed(c.id)}>ред</button><button type="button" className="tbb" disabled={bs} onClick={()=>dl(c)}>вид</button></div>}</div>{c.deleted?<div className="pn">коментар видалено</div>:ei===c.id?<Ed ini={c} cap="редагування коментаря" lab="зберегти" on={v=>sv(c,v)} off={off}/>:<Md c={c} on={on}/>}<div className="cft">{me&&dp<11&&<button type="button" disabled={bs} onClick={()=>re(c)}>відповісти</button>}{ch.length>0&&<button type="button" onClick={()=>so(!op)} aria-expanded={op}>{op?'згорнути відповіді':'показати відповіді'} ({ch.length})</button>}</div></article>{op&&ch.length>0&&<div className={'ctr'+(dp>=3?' ctl':'')}>{ch.map(v=><Nd key={v.id} c={v} dp={dp+1} mp={mp} me={me} ei={ei} on={on} ed={ed} off={off} sv={sv} dl={dl} re={re} bs={bs}/>)}</div>}</div>;
}
export default function Cmt({pid=0,id=0}){
const[hv,sh]=us(()=>window.location.hash+' '+window.location.pathname);
const mt=hv.match(/(?:^|[ #])\/?comments\/(\d+)/);
const np=Number(pid||id||mt?.[1]||0);
const[po,sp]=us(null);const[ls,sl]=us([]);const[me,sm]=us(null);const[ld,sd]=us(true);const[er,se]=us('');const[cn,sn]=us(0);const[rp,sr]=us(null);const[ei,si]=us(null);const[ph,shp]=us('');const[rt,srt]=us(0);const[bs,sb]=us(false);const[ky,sk]=us(0);
const lv=ur(true);const ep=ur(0);
ue(()=>{lv.current=true;const on=()=>sh(window.location.hash+' '+window.location.pathname);window.addEventListener('hashchange',on);window.addEventListener('popstate',on);return()=>{lv.current=false;window.removeEventListener('hashchange',on);window.removeEventListener('popstate',on)}},[]);
ue(()=>{const ac=new AbortController();fetch('/api/me',{credentials:'include',signal:ac.signal}).then(r=>r.ok?r.json():null).then(j=>sm(j)).catch(()=>{});return()=>ac.abort()},[]);
ue(()=>{ep.current++;sr(null);si(null);sb(false);sk(0)},[np]);
ue(()=>{
const ac=new AbortController();
sp(null);sl([]);se('');sd(true);
if(!Number.isSafeInteger(np)||np<=0){se('не вказано допис');sd(false);return}
fetch('/api/comments?pid='+np,{credentials:'include',cache:'no-store',signal:ac.signal}).then(async r=>{const j=await r.json().catch(()=>null);if(!r.ok||!j?.post||!Array.isArray(j.comments))throw Error(j?.error||('помилка: '+r.status));return j}).then(j=>{if(ac.signal.aborted)return;sp(j.post);sl(j.comments);sn(j.count||0);sd(false)}).catch(e=>{if(e.name!=='AbortError'){se(e.message);sd(false)}});
return()=>ac.abort();
},[np,rt]);
const rq=async(method,data)=>{
const no=ep.current;
const url='/api/comments'+(method==='DELETE'?'?id='+data.id:'');
const r=await fetch(url,{method,credentials:'include',headers:{'Content-Type':'application/json'},...(method==='DELETE'?{}:{body:JSON.stringify(data)})});
const j=await r.json().catch(()=>null);
if(!r.ok||!j?.comment)throw Error(j?.error||('помилка: '+r.status));
if(!lv.current||ep.current!==no)return false;
sl(x=>x.some(v=>v.id===j.comment.id)?x.map(v=>v.id===j.comment.id?j.comment:v):[...x,j.comment]);
sn(j.count);se('');
return true;
};
const cr=async v=>{if(await rq('POST',{...v,pid:np,rid:rp?.id||null})){sr(null);sk(x=>x+1)}};
const sv=async(c,v)=>{if(await rq('PUT',{...v,id:c.id}))si(null)};
const dl=async c=>{
if(bs||!window.confirm('видалити коментар?'))return;
const no=ep.current;
sb(true);
try{if(await rq('DELETE',{id:c.id})){if(ei===c.id)si(null)}}catch(e){if(lv.current&&ep.current===no)se(e.message)}finally{if(lv.current&&ep.current===no)sb(false)}
};
const mp=new Map();
const ids=new Set(ls.map(c=>c.id));
for(const c of ls){const k=c.rid&&ids.has(c.rid)?c.rid:0;if(!mp.has(k))mp.set(k,[]);mp.get(k).push(c)}
return <main className="cm"><style>{'@import url("'+fu+'");'+st}</style><header style={{marginBottom:24}}><h1 style={{margin:'0 0 8px',fontSize:32,fontWeight:750,letterSpacing:-1}}>коментарі</h1><a className="clk" href="/">до стрічки</a></header>{er&&<div className="pe" role="alert" style={{marginBottom:16}}>{er}<div style={{marginTop:10}}><button type="button" className="tbb" onClick={()=>srt(x=>x+1)}>спробувати ще</button></div></div>}{ld?<div className="pz">завантаження…</div>:po&&<><article className="pi"><div className="phd"><Hd c={po}/></div><Md c={po} on={shp}/><div className="cft"><span className="pn">коментарів {cn}</span></div></article><div className="pc">{me?<Ed key={np+'-'+ky} re={rp} off={()=>sr(null)} on={cr}/>:<div className="pz">увійди щоб коментувати<br/><a className="clk" href="#login">увійти / зареєструватись</a></div>}</div><div className="phd"><h2 style={{margin:0,fontSize:19}}>коментарі ({cn})</h2><button className="tbb" type="button" disabled={bs} onClick={()=>srt(x=>x+1)}>оновити</button></div>{ls.length===0?<div className="pz">коментарів поки немає. будь першим!</div>:(mp.get(0)||[]).map(c=><Nd key={c.id} c={c} mp={mp} me={me} ei={ei} on={shp} ed={si} off={()=>si(null)} sv={sv} dl={dl} re={sr} bs={bs}/>)}</>}<Photka src={ph} onClose={()=>shp('')}/></main>;
}
