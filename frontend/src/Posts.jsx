import{useState as us,useEffect as ue,useCallback as uc,useRef as ur}from'react';
import Photka from './Photka';
import Galochki from'./Galochki';
import emojis from'./emoji-list';
import stickeri from'./stickeri-list';
const stickerSet=new Set(stickeri);
const stickerURL=v=>/^[A-Za-z0-9._-]{1,80}$/.test(v)&&stickerSet.has(v)?'/stickeri/'+v:'';
const ty=[["general","Загальне"],["dating","Знайомства"],["company","Пошук компанії"],["announcements","Оголошення"],["questions","Питання"],["news","Новина"],["articles","Стаття"],["stories","Історія"],["creativity","Творчість"],["reviews","Огляд"],["instructions","Інструкція"],["events","Подія"],["feedback","Відгук"],["help","Допомога"],["confessions","Зізнання"],["appeals","Звернення"],["memories","Спогади"],["shitpost","Щітпост"]];
function xp(v){
const tx=String(v??''),m=/(?:^|\r?\n)\[mriya_type=([a-z_]+)\][ \t]*(?:\r?\n)?$/i.exec(tx),ky=m?.[1]?.toLowerCase();
return m&&ty.some(v=>v[0]===ky)?{tx:tx.slice(0,m.index),ty:ky}:{tx,ty:'general'};
}
function xt(v,k){
const tx=xp(v).tx,ky=ty.some(v=>v[0]===k)?k:'general';
return(tx?tx+'\n':'')+'[mriya_type='+ky+']';
}
function xm(p,q,k){
if(xp(p?.text).ty!==k)return false;
if(!q)return true;
return[xp(p?.text).tx,String(p?.username??''),String(p?.geo??'')].some(v=>v.toLocaleLowerCase('uk').includes(q));
}
const fn=['Inter','Roboto','Open Sans','Montserrat','Poppins','Lato','Nunito','Playfair Display','Merriweather','Lora','Bebas Neue','Oswald','Pacifico','Dancing Script','Caveat','Great Vibes','Cinzel','UnifrakturMaguntia','Press Start 2P','Shadows Into Light','Permanent Marker','Comfortaa','Righteous','Fira Code','JetBrains Mono'];
const fu='https://fonts.googleapis.com/css2?'+fn.map(f=>'family='+f.replace(/ /g,'+')).join('&')+'&display=swap';
const st=`
.jz{position:relative}
.jy{position:absolute;left:calc(100% + 8px);top:21px;display:block;width:110px;height:auto;max-width:none;aspect-ratio:707/120;object-fit:contain;border:0;border-radius:0;background:transparent;box-shadow:none;pointer-events:none}
@media(max-width:1020px){.jz{display:grid;grid-template-columns:minmax(0,1fr) clamp(52px,12vw,100px);gap:8px;align-items:start}.jz>.pi{min-width:0}.jy{position:static;width:100%;margin-top:21px}}

@import url('${fu}');
.ps{width:min(760px,calc(100% - 32px));margin:0 auto;padding:104px 0 150px;font-family:system-ui,sans-serif;color:#302b25;position:relative;z-index:2}
.ph{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.pt{margin:0;font-size:clamp(27px,5vw,38px);font-weight:750;letter-spacing:-1.3px;color:#302b25}
.pd{margin:0;color:#777064;font-size:14px;line-height:1.6}
.pc{border:1px solid rgba(46,140,70,.2);border-radius:22px;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);padding:22px;margin-bottom:24px}
.pl{display:block;font-size:13px;font-weight:650;color:#4e6348;margin-bottom:11px}
.pf{display:flex;flex-direction:column;gap:12px}
.mtb{display:flex;gap:8px;align-items:center;margin-bottom:4px}
.tb{display:flex;gap:8px;padding:10px;background:rgba(240,240,230,.6);border:1px solid #e2e4d8;border-radius:12px;align-items:center;overflow-x:auto;margin-bottom:4px;-webkit-overflow-scrolling:touch}
.tb::-webkit-scrollbar{height:4px}
.tb::-webkit-scrollbar-track{background:transparent}
.tb::-webkit-scrollbar-thumb{background:#d0d4c0;border-radius:4px}
.petb{display:flex;flex-wrap:wrap;align-items:center;gap:10px;max-height:180px;overflow-x:hidden;overflow-y:auto;padding:10px;}
.peb{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:auto;height:28px;padding:0!important;margin:0;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;cursor:pointer;}
.peb img{display:block;width:auto;height:28px;max-width:96px;max-height:28px;object-fit:contain;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;padding:0;margin:0;}
.peb:disabled{cursor:default;opacity:.5;}
.peb:focus-visible{outline:2px solid #b89652;outline-offset:3px;}
.pesr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.bsk{display:inline-block;vertical-align:middle;margin:4px 2px;max-width:140px;max-height:140px;width:auto;height:auto;object-fit:contain;border-radius:10px;}
.pepreview{margin:8px 0;}
.tbg{display:flex;gap:4px;align-items:center;padding-right:8px;border-right:1px solid #d0d4c0;flex-shrink:0}
.tbg:last-child{border-right:0;padding-right:0}
.tbb{min-width:32px;height:32px;padding:0 8px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;color:#302b25;font:600 13px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.tbb:hover{background:#eef0e0;border-color:#63a86c}
.tbb:disabled{opacity:.4;cursor:not-allowed}
.tbc{width:34px;height:32px;padding:2px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;cursor:pointer;flex-shrink:0}
.tbi{height:32px;padding:0 10px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;font:inherit;font-size:12px;width:60px;outline:none;flex-shrink:0}
.tbs{height:32px;padding:0 8px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;font:inherit;font-size:12px;outline:none;max-width:160px;cursor:pointer;flex-shrink:0}
.px{width:100%;min-height:125px;box-sizing:border-box;resize:vertical;padding:15px;border:1px solid #e2e4d8;border-radius:14px;background:rgba(250,250,245,.9);color:#302b25;font:inherit;font-size:14px;line-height:1.65;outline:none;transition:border-color .2s;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap}
.px:focus{border-color:#63a86c}
.px::placeholder{color:#a19b8e}
.pmt{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.pmi2{height:34px;padding:0 12px;border:1px solid #d0d4c0;border-radius:10px;background:#fff;font:inherit;font-size:13px;outline:none;flex:1;min-width:140px}
.pr{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.pn{font-size:12px;color:#8b867b}
.pb{min-height:43px;padding:0 21px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background-image:url('/pictures/button.png');background-position:center;background-size:cover;background-repeat:no-repeat;color:white;font:600 13px system-ui,sans-serif;cursor:pointer;transition:filter .2s;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
.pb:hover:not(:disabled){filter:brightness(1.07)}
.pb:disabled{opacity:.5;cursor:not-allowed}
.pw{display:flex;flex-direction:column;gap:10px;margin:30px 0 15px}
.pwt{display:flex;align-items:center;justify-content:space-between;gap:12px}
.pw h2{margin:0;font-size:19px;font-weight:700}
.pn2{font-size:12px;color:#777064}
.pwb{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.pi{padding:21px;border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.9);margin-bottom:12px;overflow-wrap:anywhere;scroll-margin-top:90px;backdrop-filter:blur(8px)}
.phd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.phl{display:flex;align-items:center;gap:12px;min-width:0}
.phr{display:flex;gap:6px;align-items:center}
.pav{width:42px;height:42px;border-radius:50%;object-fit:cover;background:#e2e4d8;flex-shrink:0;border:1px solid #d0d4c0}
.pif{display:flex;flex-direction:column;gap:2px;min-width:0}
.pnm{font-size:15px;font-weight:700;color:#302b25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none}
.gk-author{display:flex;align-items:center;gap:4px;min-width:0}
.gk-author>.pnm{min-width:0;flex:0 1 auto}
.gk-reposter{display:flex;align-items:center;gap:4px;min-height:22px}
.ptm{font-size:12px;color:#8a857a;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.pb2{white-space:pre-wrap;margin:0;font-size:14px;line-height:1.8;color:#39352f;overflow-wrap:break-word;word-break:normal;tab-size:4;font-variant-ligatures:none}
.pge{margin-top:10px;font-size:12px;color:#4e6348;font-weight:600}
.pm{display:flex;gap:6px;margin-top:12px;overflow-x:auto;padding-bottom:4px}
.pmi{height:160px;border-radius:12px;object-fit:cover;flex-shrink:0;cursor:pointer;transition:transform .15s}
.pmi:hover{transform:scale(1.02)}
.pg{margin-top:12px;max-width:100%;border-radius:12px}
.pft{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid #eeeee7;color:#8a857a;font-size:13px}
.pfb{display:inline-flex;align-items:center;gap:5px;cursor:pointer;user-select:none;background:none;border:0;padding:4px 6px;border-radius:6px;color:inherit;font:inherit;position:relative}
.pfb:hover{color:#39834b;background:rgba(57,131,75,.07)}
.pfb.act{color:#e11d48;font-weight:600}
.pfb.actd{color:#6366f1;font-weight:600}
.pfb.actr{color:#16a34a;font-weight:600}
.rpp{position:absolute;bottom:100%;left:0;margin-bottom:6px;padding:8px 10px;background:#fff;border:1px solid #d0d4c0;border-radius:8px;color:#302b25;font-size:12px;white-space:nowrap;z-index:20;min-width:110px;max-height:160px;overflow-y:auto}
.pe{padding:14px 16px;border:1px solid #e8b7a8;border-radius:13px;background:#fff5f1;color:#99442e;font-size:13px;line-height:1.6;margin-bottom:16px;overflow-wrap:anywhere}
.pz{padding:34px 18px;text-align:center;border:1px dashed rgba(70,130,75,.3);border-radius:18px;background:rgba(255,255,255,.9);color:#817b70;font-size:14px;line-height:1.7;backdrop-filter:blur(8px)}
.pk{display:flex;justify-content:center;align-items:center;gap:10px;padding:26px;color:#777064;font-size:13px}
.pd3{width:7px;height:7px;border-radius:50%;background:#479657;animation:pp 1s ease-in-out infinite alternate}
.pl2{text-align:center;padding:28px 20px;color:#777064;font-size:14px;line-height:1.7}
.pl2 a{color:#39834b;font-weight:600;text-decoration:underline}
.pv{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.pvi{position:relative;width:80px;height:80px;border-radius:10px;overflow:hidden;border:1px solid #d0d4c0}
.pvi img{width:100%;height:100%;object-fit:cover}
.pvr{position:absolute;top:3px;right:3px;width:20px;height:20px;border:0;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;cursor:pointer;font:700 12px system-ui;display:flex;align-items:center;justify-content:center;padding:0}
.bbs{display:inline;box-decoration-break:clone;-webkit-box-decoration-break:clone;white-space:pre-wrap}
.bsp{display:inline-block;margin:4px 0;padding:4px 12px;border:1px solid #d0d4c0;border-radius:6px;background:#f3f4f6;color:#6b7280;font:600 12px system-ui;cursor:pointer;user-select:none}
.bls{margin:8px 0;padding-left:22px;list-style:disc}
.bls li{margin:3px 0;line-height:1.7;color:#39352f}
.bhr{border:0;border-top:1px solid #d0d4c0;margin:14px 0}
@keyframes pp{to{opacity:.3;transform:scale(.7)}}
@media(max-width:600px){.ps{width:calc(100% - 16px);padding:74px 0 35px}.pc{padding:14px;border-radius:16px}.pi{padding:14px}.px{min-height:100px;font-size:16px}.pb{min-height:46px;width:100%}.pw{margin-top:25px}.pmi{height:120px}.pr{flex-direction:column;align-items:stretch;gap:12px}.pn{text-align:center}.mtb .tbb{flex:1;height:40px;font-size:14px}.mtb .tbb:first-child{flex:0 0 46px}.tbb,.tbc,.tbi,.tbs,.pmi2{height:38px}.pmt{flex-direction:column;align-items:stretch}.tbs{max-width:none;width:100%}.pft{gap:8px;justify-content:space-between}.pfb{padding:6px 4px;font-size:13px}.pwb{flex-direction:column;align-items:stretch}}
`;
const bc=`
.bqt{margin:10px 0;padding:10px 14px;border:1px solid #d0d4c0;border-radius:3px;background:transparent;color:inherit;min-width:0}
.bqv::before{content:'“';margin-right:4px;color:#777064}
.bqv::after{content:'”';margin-left:4px;color:#777064}
.bqa{display:block;margin-top:6px;color:#777064;font:italic 12px/1.5 system-ui,sans-serif}
.bhh{display:block;color:inherit;font-family:inherit;font-weight:750;line-height:1.35;margin:16px 0 8px;overflow-wrap:anywhere}
.bhh1{font-size:28px}.bhh2{font-size:24px}.bhh3{font-size:21px}.bhh4{font-size:18px}.bhh5{font-size:16px}.bhh6{font-size:14px}
.btw{display:block;max-width:100%;min-width:0;overflow-x:auto;margin:12px 0;white-space:normal;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
.bta{width:100%;border-collapse:collapse;border-spacing:0;background:transparent;font:inherit;color:inherit;line-height:1.6;table-layout:auto}
.bta caption{text-align:left;caption-side:top;padding:0 0 8px;font-weight:700;color:inherit;white-space:pre-wrap}
.bta th,.bta td{border:1px solid #cfd3c8;padding:8px 11px;text-align:left;vertical-align:top;min-width:80px;white-space:pre-wrap;overflow-wrap:anywhere;box-sizing:border-box}
.bta th{background:#f0f1eb;font-weight:650}
.bcd{display:block;min-width:0;max-width:100%;margin:12px 0;border:1px solid #d5d8d2;border-radius:10px;background:#f1f2ef;overflow:hidden;white-space:normal;box-sizing:border-box;color:#302b25}
.bch{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;border-bottom:1px solid #d5d8d2;background:#e7e9e4;font:500 12px/1.5 system-ui,sans-serif}
.bcl{min-width:0;overflow-wrap:anywhere;white-space:pre-wrap}
.bcp{flex:0 0 auto;padding:4px 8px;border:1px solid #c7ccc1;border-radius:5px;background:transparent;color:#4e6348;font:500 12px/1.4 system-ui,sans-serif;cursor:pointer}
.bcp:hover{background:#dde1d6}.bcp:disabled{opacity:.5;cursor:default}
.bcd pre{display:block;margin:0;padding:14px;max-width:100%;overflow:auto;white-space:pre;word-break:normal;overflow-wrap:normal;tab-size:4;color:#302b25;font:13px/1.65 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;box-sizing:border-box;cursor:text;text-align:left}
.bcd code{display:block;white-space:pre;font:inherit;color:inherit;background:transparent;border:0;padding:0;margin:0;tab-size:4}
.bso{display:block;min-width:0;white-space:pre-wrap;cursor:pointer;border-radius:3px}
.bso:focus-visible,.bcp:focus-visible,.btw:focus-visible,.bcd pre:focus-visible{outline:2px solid #63a86c;outline-offset:3px}
.bso a{cursor:pointer}.bso pre,.bso code{cursor:text}
@media(max-width:600px){.bhh1{font-size:25px}.bhh2{font-size:22px}.bhh3{font-size:19px}.bta th,.bta td{padding:7px 9px}.bcd pre{padding:11px;font-size:12px}.bcp{min-height:32px}}
`;
export function rb(t){if(!t)return[];const r=[];let i=0,m;const rx=/\[(\/?)(b|i|u|s|color|bg|size|font|shadow|glow|border|opacity|url)(?:=([^\]]+))?\]|<emodzya=\(([^<>\r\n]{1,5000})\)>|\[kartinkaaaa\]\s*((?:https?:\/\/|\/(?!\/))[^\s<>\[\]]+)(?:\s*\[\/kartinkaaaa\])?/gi;const op=[];let k=0;while((m=rx.exec(t))!==null){if(m.index>i)r.push({t:'t',v:t.slice(i,m.index)});if(m[5]!==undefined){r.push({t:'mximage',v:m[5]});i=m.index+m[0].length;continue}
if(m[6]!==undefined){r.push({t:'sk',v:m[6]});i=m.index+m[0].length;continue}if(m[4]!==undefined){r.push({t:'e',v:m[4]});i=m.index+m[0].length;continue}if(m[1]==='/'){for(let j=op.length-1;j>=0;j--)if(op[j].nm===m[2].toLowerCase()){r.push({t:'c',k:op[j].k});op.splice(j,1);break}}else{const kk=k++;op.push({nm:m[2].toLowerCase(),k:kk});r.push({t:'o',nm:m[2].toLowerCase(),vl:m[3],k:kk})}i=m.index+m[0].length}if(i<t.length)r.push({t:'t',v:t.slice(i)});return r}
export function bs(stk){const sty={};let hasBg=false;const sh=[];let hasBorder=false;for(const o of stk){if(o.nm==='b')sty.fontWeight='700';else if(o.nm==='i')sty.fontStyle='italic';else if(o.nm==='u')sty.textDecoration=(sty.textDecoration?sty.textDecoration+' ':'')+'underline';else if(o.nm==='s')sty.textDecoration=(sty.textDecoration?sty.textDecoration+' ':'')+'line-through';else if(o.nm==='color'&&/^#[0-9a-f]{3,8}$/i.test(o.vl||''))sty.color=o.vl;else if(o.nm==='bg'&&/^#[0-9a-f]{3,8}$/i.test(o.vl||'')){sty.background=o.vl;hasBg=true}else if(o.nm==='size'){const n=parseInt(o.vl,10);if(n>=8&&n<=72)sty.fontSize=n+'px'}else if(o.nm==='font'&&fn.includes(o.vl))sty.fontFamily=`'${o.vl}', system-ui, sans-serif`;else if(o.nm==='shadow'&&/^#[0-9a-f]{3,8}$/i.test(o.vl||''))sh.push(`2px 2px 4px ${o.vl}`);else if(o.nm==='glow'&&/^#[0-9a-f]{3,8}$/i.test(o.vl||''))sh.push(`0 0 8px ${o.vl},0 0 16px ${o.vl}`);else if(o.nm==='border'&&/^#[0-9a-f]{3,8}$/i.test(o.vl||'')){sty.border=`2px solid ${o.vl}`;hasBorder=true}else if(o.nm==='opacity'){const n=parseInt(o.vl,10);if(n>=0&&n<=100)sty.opacity=n/100}}if(sh.length)sty.textShadow=sh.join(',');if(hasBg||hasBorder){sty.padding='2px 6px';sty.borderRadius='4px'}return sty}
function mxImageURL(value){
try{const raw=String(value).trim();if(!/^(https?:\/\/|\/(?!\/))/i.test(raw)||/[\u0000-\u001f\u007f]/.test(raw))return '';const u=new URL(raw,typeof window==='undefined'?'https://mriya.invalid':window.location.origin);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return '';return raw}catch{return ''}
}
function mxYouTube(value){
try{
const raw=String(value),clean=raw.replace(/[),.!?;:]+$/g,''),u=new URL(clean);
if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.port)return null;
const host=u.hostname.toLowerCase(),parts=u.pathname.split('/').filter(Boolean);let id='';
if(['youtu.be','www.youtu.be'].includes(host)&&parts.length===1)id=parts[0];
else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){
if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
else if(parts.length===2&&['shorts','live','embed'].includes(parts[0]))id=parts[1];
}
if(!/^[A-Za-z0-9_-]{11}$/.test(id))return null;
const time=u.searchParams.get('start')||u.searchParams.get('t')||u.hash.replace(/^#t=/,'');let start=0;
if(/^\d+$/.test(time))start=Number(time);
else if(/^(?:\d+h)?(?:\d+m)?(?:\d+s)?$/.test(time||'')){const m=(time||'').match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);start=Number(m?.[1]||0)*3600+Number(m?.[2]||0)*60+Number(m?.[3]||0)}
if(!Number.isSafeInteger(start)||start<0||start>2147483647)start=0;
return{src:'https://www.youtube-nocookie.com/embed/'+id+(start?'?start='+start:''),suffix:raw.slice(clean.length)};
}catch{return null}
}
function MxYouTube({url}){
const data=mxYouTube(url);if(!data)return null;
return <><span className="mx-youtube" style={{display:'inline-block',width:'min(560px, 100%)',maxWidth:'100%',verticalAlign:'top',whiteSpace:'normal',lineHeight:0,margin:'6px 0'}}><iframe src={data.src} title="YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" style={{display:'block',width:'100%',aspectRatio:'16 / 9',height:'auto',border:0}}/></span>{data.suffix}</>;
}
function MxImage({url}){
const src=mxImageURL(url),[failed,sf]=us(false);ue(()=>sf(false),[src]);
if(!src||failed)return <span>{'[kartinkaaaa]'+url+'[/kartinkaaaa]'}</span>;
return <img className="mx-inline-image" src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>sf(true)} style={{display:'inline-block',verticalAlign:'middle',maxWidth:'100%',maxHeight:'80vh',width:'auto',height:'auto',objectFit:'contain'}}/>;
}
function MxCoauthor({u}){
if(!u||!Number.isSafeInteger(Number(u.id))||Number(u.id)<1||typeof u.username!=='string'||!u.username)return null;
return <a className="mx-coauthor" href={'#user/'+encodeURIComponent(u.username)} translate="no" style={{display:'flex',alignItems:'center',gap:5,fontSize:12,fontWeight:400,lineHeight:'20px',marginTop:3,color:'inherit',textDecoration:'none',maxWidth:'100%',overflowWrap:'anywhere'}}><img src={u.photo||'/pictures/default_avatar.png'} alt="" loading="lazy" decoding="async" style={{display:'block',width:18,height:18,flexShrink:0,objectFit:'cover',borderRadius:'50%'}}/><span>{u.username}</span></a>;
}
const uRx=/(https?:\/\/[^\s\[\]]+)/gi;
function rT(v,sty,kp){const ps=[];let li=0,m;const rx=new RegExp(uRx.source,'gi');while((m=rx.exec(v))!==null){if(m.index>li)ps.push({u:0,v:v.slice(li,m.index)});ps.push({u:1,v:m[0]});li=m.index+m[0].length}if(li<v.length)ps.push({u:0,v:v.slice(li)});if(!ps.length)return <span key={kp} className="bbs" style={sty}>{v}</span>;return ps.map((p,i)=>p.u?mxYouTube(p.v)?<MxYouTube key={kp+i} url={p.v}/>:<a key={kp+i} href={p.v} target="_blank" rel="noopener noreferrer" className="bbs" style={{...sty,color:'#2563eb',textDecoration:'underline'}}>{p.v}</a>:<span key={kp+i} className="bbs" style={sty}>{p.v}</span>)}
const emojiSet=new Set(emojis);
const emojiPart=v=>encodeURIComponent(v).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
function emojiURL(v){
try{
const base=typeof window==='undefined'?'https://mriya.invalid':window.location.origin,u=new URL(String(v).trim(),base);
if(u.origin!==base||u.username||u.password||u.search||u.hash)return '';
const p=u.pathname.split('/').map(x=>emojiPart(decodeURIComponent(x))).join('/');
return emojiSet.has(p)?p:'';
}catch{return ''}
}
function emojiStyle(stk){
const f=[];let b=false,i=false;
for(const o of stk){
if(o.nm==='b')b=true;
if(o.nm==='i')i=true;
if(!/^#[0-9a-f]{3,8}$/i.test(o.vl||''))continue;
if(o.nm==='shadow')f.push('drop-shadow(2px 2px 4px '+o.vl+')');
if(o.nm==='glow')f.push('drop-shadow(0 0 8px '+o.vl+')','drop-shadow(0 0 16px '+o.vl+')');
}
if(b)f.push('drop-shadow(.4px 0 0 currentColor)','drop-shadow(-.4px 0 0 currentColor)');
return{height:'1em',width:'auto',maxWidth:'100%',maxHeight:'none',objectFit:'contain',verticalAlign:'-.15em',display:'inline-block',border:0,borderRadius:0,padding:0,margin:0,filter:f.length?f.join(' '):undefined,transform:i?'skewX(-10deg)':undefined};
}
function Inline({t}){const tk=rb(t);const stk=[];const el=[];let kk=0;for(const x of tk){if(x.t==='t'){const st=bs(stk),u=stk.slice().reverse().find(v=>v.nm==='url');if(u){const hr=su(u.vl||x.v);el.push(hr&&mxYouTube(hr)?<MxYouTube key={'i'+kk++} url={hr}/>:hr?<a key={'i'+kk++} href={hr} target="_blank" rel="noopener noreferrer" className="bbs" style={{...st,color:'#2563eb',textDecoration:'underline'}}>{x.v}</a>:<span key={'i'+kk++} className="bbs" style={st}>{x.v}</span>)}else el.push(rT(x.v,st,'i'+kk++))}else if(x.t==='mximage'){el.push(<MxImage key={'i'+kk++} url={x.v}/>)}else if(x.t==='e'){const st=bs(stk),u=[...stk].reverse().find(o=>o.nm==='url'),link=u&&su(u.vl||''),src=emojiURL(x.v),v=src?<img className="bem" src={src} alt="" style={emojiStyle(stk)} decoding="async"/>:'<emodzya=('+x.v+')>';if(link)el.push(<a key={'i'+kk++} href={link} target="_blank" rel="noopener noreferrer" style={{...st,color:st.color||'#2563eb',textDecoration:st.textDecoration||'underline'}}>{v}</a>);else el.push(<span key={'i'+kk++} className="bbs" style={st}>{v}</span>)}else if(x.t==='o')stk.push({nm:x.nm,vl:x.vl,k:x.k});else if(x.t==='c'){const i=stk.findIndex(o=>o.k===x.k);if(i>=0)stk.splice(i,1)}}return <>{el}</>}
function su(v){
v=String(v||'').trim().replace(/^(["'])([\s\S]*)\1$/,'$2');
if(!/^https?:\/\//i.test(v)||/[\u0000-\u0020\u007f]/.test(v)||v.length>2048)return '';
try{const u=new URL(v);return u.hostname&&(u.protocol==='https:'||u.protocol==='http:')?u.href:''}catch{return ''}
}
async function cb(t){
if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(t);return true}catch{}}
if(typeof document==='undefined')return false;
const a=document.activeElement,e=document.createElement('textarea');
e.value=t;e.setAttribute('readonly','');e.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';document.body.appendChild(e);
try{e.focus();e.select();e.setSelectionRange(0,e.value.length);return document.execCommand('copy')===true}catch{return false}
finally{e.remove();try{a?.focus({preventScroll:true})}catch{}}
}
function Cd({t,lg}){
const[cp,sc]=us(0),tm=ur(null),lv=ur(true);
ue(()=>{lv.current=true;return()=>{lv.current=false;clearTimeout(tm.current)}},[]);
const cc=async()=>{const ok=await cb(t);if(!lv.current)return;sc(ok?1:2);clearTimeout(tm.current);tm.current=setTimeout(()=>{if(lv.current)sc(0)},1800)};
return <figure className="bcd"><figcaption className="bch"><span className="bcl" translate="no">{lg||'text'}</span><button type="button" className="bcp" onClick={cc} disabled={!t.length}>{cp===1?'скопійовано':cp===2?'не вдалося скопіювати':'скопіювати'}</button></figcaption><pre tabIndex={0} translate="no" data-no-translate="true"><code translate="no" data-language={lg||'text'}>{t}</code></pre></figure>;
}
function Sp({t,ns}){
const[o,so]=us(false);
if(!o)return <button type="button" className="bsp" aria-expanded="false" onClick={e=>{e.stopPropagation();so(true)}}>спойлер</button>;
return <div className="bso" tabIndex={0} title="Натисни на текст, щоб сховати спойлер" onClick={e=>{e.stopPropagation();if(e.target.closest?.('a,button,input,textarea,select,pre,code'))return;if(window.getSelection()?.toString())return;so(false)}} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();so(false)}}}>{ns?<Nd ns={ns}/>:<Inline t={t}/>}</div>;
}
function Ls({t,ns}){
const it=[];let a=[];
const put=()=>{if(a.some(n=>n.type!=='text'||n.text.trim()))it.push(a);a=[]};
for(const n of ns||[{type:'text',text:t||''}]){
if(n.type!=='text'){a.push(n);continue}
const p=n.text.split(/\[\*\]/i);p.forEach((v,i)=>{if(i)put();if(v)a.push({type:'text',text:v})});
}
put();return <ul className="bls">{it.map((v,i)=><li key={i}><Nd ns={v}/></li>)}</ul>;
}
function splitBlocks(t){
t=String(t??'');const ro={type:'root',ns:[]},sk=[ro];
const rx=/\[(\/?)(spoiler|list|quote|h[1-6]|table|tr|th|td)(?:=([^\]\r\n]{0,160}))?\]|\[hr\]|\[code(?:=([^\]\r\n]{0,80}))?\]|<code(?:=([^>\r\n]{0,80}))?>/gi;
let at=0,m,ct=0;
const add=v=>{if(!v)return;const a=sk[sk.length-1].ns,p=a[a.length-1];if(p?.type==='text')p.text+=v;else a.push({type:'text',text:v})};
while((m=rx.exec(t))!==null){
if(++ct>4096)return[{type:'text',text:t}];
add(t.slice(at,m.index));at=rx.lastIndex;
if(/^\[code|^<code/i.test(m[0])){
const cr=/\[\/code\]|<\/code\s*>/gi;cr.lastIndex=rx.lastIndex;const cm=cr.exec(t);
if(!cm){add(t.slice(m.index));at=t.length;break}
sk[sk.length-1].ns.push({type:'code',text:t.slice(rx.lastIndex,cm.index),arg:(m[4]??m[5]??'text').trim().replace(/^(["'])([\s\S]*)\1$/,'$2'),closed:true});
rx.lastIndex=cr.lastIndex;at=rx.lastIndex;continue;
}
if(m[0].toLowerCase()==='[hr]'){sk[sk.length-1].ns.push({type:'hr'});continue}
const nm=m[2].toLowerCase();
if(m[1]){
const n=sk[sk.length-1];
if(sk.length>1&&n.type===nm){n.closed=true;n.raw=t.slice(n.start,rx.lastIndex);sk.pop()}else add(m[0]);
}else{
if(sk.length>=25)return[{type:'text',text:t}];
const n={type:nm,arg:(m[3]||'').trim().replace(/^(["'])([\s\S]*)\1$/,'$2'),ns:[],start:m.index,closed:false};
sk[sk.length-1].ns.push(n);sk.push(n);
}
}
add(t.slice(at));for(let i=1;i<sk.length;i++)sk[i].raw=t.slice(sk[i].start);return ro.ns;
}
function Tb({n}){
const rs=n.ns.filter(v=>v.type!=='text'||v.text.trim());
const good=rs.length>0&&rs.length<=50&&rs.every(r=>r.type==='tr'&&r.closed&&r.ns.filter(v=>v.type!=='text'||v.text.trim()).length>0&&r.ns.filter(v=>v.type!=='text'||v.text.trim()).length<=12&&r.ns.every(c=>(c.type==='text'&&!c.text.trim())||((c.type==='td'||c.type==='th')&&c.closed)));
if(!good)return <Inline t={n.raw}/>;
return <div className="btw" tabIndex={0} role="region" aria-label={n.arg||'Таблиця'}><table className="bta">{n.arg&&<caption>{n.arg}</caption>}<tbody>{rs.map((r,i)=>{const cs=r.ns.filter(v=>v.type!=='text'||v.text.trim()),hd=cs.every(c=>c.type==='th');return <tr key={i}>{cs.map((c,j)=>{const Tg=c.type;return <Tg key={j} scope={c.type==='th'?(hd?'col':'row'):undefined}><Nd ns={c.ns}/></Tg>})}</tr>})}</tbody></table></div>;
}
function Nd({ns}){
return <>{ns.map((n,i)=>{
if(n.type==='text')return <Inline key={i} t={n.text}/>;
if(n.type==='code')return <Cd key={i} t={n.text} lg={n.arg}/>;
if(n.type==='hr')return <hr key={i} className="bhr"/>;
if(!n.closed)return <Inline key={i} t={n.raw||''}/>;
if(n.type==='spoiler')return <Sp key={i} ns={n.ns}/>;
if(n.type==='list')return <Ls key={i} ns={n.ns}/>;
if(n.type==='quote')return <blockquote key={i} className="bqt"><div className="bqv"><Nd ns={n.ns}/></div>{n.arg&&<cite className="bqa">{n.arg}</cite>}</blockquote>;
if(/^h[1-6]$/.test(n.type)){const Tg=n.type;return <Tg key={i} className={'bhh bhh'+n.type.slice(1)}><Nd ns={n.ns}/></Tg>}
if(n.type==='table')return <Tb key={i} n={n}/>;
return <Inline key={i} t={n.raw||''}/>;
})}</>;
}
export function Rn({t}){
ue(()=>{let el=document.getElementById('mriya-posts-bb-v2');if(!el){el=document.createElement('style');el.id='mriya-posts-bb-v2';document.head.appendChild(el)}if(el.textContent!==bc)el.textContent=bc},[]);
return <Nd ns={splitBlocks(xp(t).tx)}/>;
}
const postFrameCache=new Map();
function PostAvatar({p}){
const[f,sf]=us('');
ue(()=>{
let live=true;
sf('');
if(typeof p.frame==='string')return;
if(!p.avtor_id)return;
const id=p.avtor_id;
if(!postFrameCache.has(id))postFrameCache.set(id,fetch('/api/user?id='+encodeURIComponent(id),{credentials:'include'}).then(r=>r.ok?r.json():null).then(j=>j?.frame||'').catch(()=>''));
postFrameCache.get(id).then(v=>{if(live)sf(v)});
return()=>{live=false};
},[p.avtor_id,p.frame]);
const frame=typeof p.frame==='string'?p.frame:f;
return <span style={{display:'block',position:'relative',width:42,height:42,flexShrink:0,isolation:'isolate'}}><img className="pav" src={p.photo||'/pictures/default_avatar.png'} alt="" style={{display:'block',width:42,height:42,boxSizing:'border-box',position:'relative',zIndex:1}}/>{frame&&<img src={'/frames/'+encodeURIComponent(frame)} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',maxWidth:'100%',maxHeight:'100%',margin:0,padding:0,border:0,borderRadius:0,clipPath:'none',objectFit:'contain',zIndex:2,pointerEvents:'none'}}/>}</span>;
}
export default function Posts({q='',uid=null,hideHeader=false}){
const[mxName,mxSetName]=us('');const[mxEdit,mxSetEdit]=us('');
const[ka,sa]=us('general'),[kb,sb]=us('general'),[kc,sd]=us('general');
const ks=ur(0),ku=ur({ka:'general',q:''}),kh=ur('');
const[ps,sp]=us([]);const[tx,stx]=us('');const[pc,spc]=us([]);const[gf,sgf]=us('');const[vd,svd]=us('publichno');const[ge,sge]=us('');const[up,sup]=us(false);const[ld,sl]=us(true);const[sv,ss]=us(false);const[er,se]=us('');const[ok,so]=us('');const[rt,sr]=us(0);const[me,sm]=us(null);const[cl,scl]=us('#000000');const[bg,sbg]=us('#ffffff');const[sz,ssz]=us(16);const[ff,sff]=us('Inter');const[op2,sop2]=us(50);const[to,sto]=us(false);const[sq,ssq]=us('');const[s1,ss1]=us('new');const[s2,ss2]=us('');const[eid,seid]=us(null);const[etx,setx]=us('');const[evd,sevd]=us('publichno');const[ege,sege]=us('');const[rpo,srpo]=us(null);const[photo,sphoto]=us('');const[cs,scs]=us([]);const[cn,scn]=us('');const[ecn,secn]=us('');const[ce,sce]=us(false);const[cb,scb]=us(false);
const tr=ur(null);const fi=ur(null);const gi=ur(null);const vw=ur(new Set());const tm=ur(null);const lp=ur(false);const sc=ur(false);const mx=5000;const mk=mx-xt('',kb).length-1,ml=mx-xt('',kc).length-1;const dk=ur('');const ub=ur(false);
const ap=uid?`/api/posts?uid=${uid}`:'/api/posts';
const sx=v=>{stx(v);if(dk.current)try{if(v)window.localStorage.setItem(dk.current,xt(v,kb));else window.localStorage.removeItem(dk.current)}catch{}};
const kv=k=>{sb(k);if(dk.current)try{if(tx)window.localStorage.setItem(dk.current,xt(tx,k));else window.localStorage.removeItem(dk.current)}catch{}};
ue(()=>{
dk.current=me?.id?'mriya_post_draft:'+me.id:'';
let v='';if(dk.current)try{v=window.localStorage.getItem(dk.current)||''}catch{}
const kt=xp(v);stx(kt.tx.slice(0,mx));sb(kt.ty);
},[me?.id]);
const lc=uc(async()=>{scb(true);sce(false);try{const r=await fetch('/api/posts/cities',{credentials:'include',cache:'no-store'});const j=await r.json().catch(()=>null);if(!r.ok||!Array.isArray(j)||j.some(v=>typeof v!=='string'))throw Error();scs(j)}catch{sce(true)}finally{scb(false)}},[]);
ue(()=>{if(me?.id)lc()},[me?.id,lc]);
ue(()=>{if(me?.misto&&cs.length){const v=cs.find(x=>x.trim().toLowerCase()===me.misto.trim().toLowerCase());if(v)scn(x=>x||v)}},[me?.misto,cs]);
ue(()=>{fetch('/api/me',{credentials:'include'}).then(r=>r.ok?r.json():null).then(j=>sm(j)).catch(()=>{})},[]);
const[pn,spn]=us(null),[pl,spl]=us(false),[pe,spe]=us(''),[dq,sdq]=us((q+' '+sq).trim().toLocaleLowerCase('uk'));
const pg=ur({seq:0,next:null,busy:false,controller:null}),pd=ur(new Set()),ptail=ur(null),proot=ur(null);
const[hk,shk]=us(()=>typeof window==='undefined'?'':window.location.hash);
const pq=(q+' '+sq).trim().toLocaleLowerCase('uk');
ku.current={ka,q:pq};
ue(()=>{const t=setTimeout(()=>sdq(pq),300);return()=>clearTimeout(t)},[pq]);
ue(()=>{const h=()=>{sc.current=false;shk(window.location.hash)};window.addEventListener('hashchange',h);return()=>window.removeEventListener('hashchange',h)},[]);
const pu=uc(cursor=>{const u=new URL(ap,window.location.origin);u.searchParams.set('sort',s2||s1);if(dq)u.searchParams.set('q',dq);if(!s2){u.searchParams.set('page','1');u.searchParams.set('limit','20');if(cursor)u.searchParams.set('cursor',cursor)}return u.pathname+u.search},[ap,dq,s1,s2]);
const pp=j=>{if(Array.isArray(j)){if(!s2)throw Error('помилка');j={items:j,next:null}}if(!j||!Array.isArray(j.items)||(j.next!==null&&typeof j.next!=='string')||j.next==='')throw Error('помилка');if(j.items.some(p=>!p||!Number.isSafeInteger(p.id)||p.id<1))throw Error('помилка');return j};
const rq=uc(async()=>{
const seq=pg.current.seq+1;pg.current.controller?.abort();const controller=new AbortController();pg.current={seq,next:null,busy:true,controller};spn(null);spl(false);spe('');se('');sp([]);sl(true);sc.current=false;ks.current=0;
try{
const r=await fetch(pu(null),{credentials:'include',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});const j=await r.json().catch(()=>null);if(!r.ok)throw Error(j?.error||`помилка: ${r.status}`);const page=pp(j);if(pg.current.seq!==seq||controller.signal.aborted)return;
ks.current=page.items.some(p=>!pd.current.has(p.id)&&xm(p,ku.current.q,ku.current.ka))?0:1;
const seen=new Set();sp(page.items.filter(p=>!pd.current.has(p.id)&&!seen.has(p.id)&&seen.add(p.id)));pg.current.next=page.next;spn(page.next);
}catch(e){if(pg.current.seq===seq&&!controller.signal.aborted)se(`${e.message}. щось зламалось`)}finally{if(pg.current.seq===seq&&!controller.signal.aborted){pg.current.busy=false;sl(false)}}
},[pu,me?.id]);
ue(()=>{rq();return()=>{pg.current.controller?.abort();pg.current.seq++;pg.current.busy=false}},[rq,rt]);
const pm=uc(async()=>{
const state=pg.current,cursor=state.next;if(state.busy||!cursor||s2||pq!==dq)return;const seq=state.seq,controller=new AbortController();state.busy=true;state.controller=controller;spl(true);spe('');
try{
const r=await fetch(pu(cursor),{credentials:'include',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});const j=await r.json().catch(()=>null);if(!r.ok)throw Error(j?.error||`помилка: ${r.status}`);const page=pp(j);if(pg.current.seq!==seq||controller.signal.aborted)return;if(page.next===cursor)throw Error('помилка');
ks.current=page.items.some(p=>!pd.current.has(p.id)&&xm(p,ku.current.q,ku.current.ka))?0:ks.current+1;
sp(items=>{const seen=new Set(items.map(p=>p.id));return[...items,...page.items.filter(p=>!pd.current.has(p.id)&&!seen.has(p.id)&&seen.add(p.id))]});state.next=page.next;spn(page.next);
}catch(e){if(pg.current.seq===seq&&!controller.signal.aborted)spe(e.message)}finally{if(pg.current.seq===seq&&!controller.signal.aborted){state.busy=false;spl(false)}}
},[pu,s2,pq,dq]);
ue(()=>{const el=ptail.current;if(!el||ld||pl||pe||!pn||s2||pq!==dq||ks.current>=5||typeof IntersectionObserver==='undefined')return;const ob=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))pm()},{rootMargin:'600px 0px'});ob.observe(el);return()=>ob.disconnect()},[ld,pl,pe,pn,s2,pq,dq,pm,ps.length,ka]);
ue(()=>{if(!/^#post-[1-9][0-9]*$/.test(hk)||kh.current===hk)return;const kp=ps.find(p=>p.id===Number(hk.slice(6)));if(!kp)return;kh.current=hk;const kt=xp(kp.text).ty;if(kt!==ka){ks.current=0;sc.current=false;sa(kt)}},[hk,ps,ka]);
ue(()=>{if(!/^#post-[1-9][0-9]*$/.test(hk)||ld||pl||pe||!pn||pq||s2)return;const id=Number(hk.slice(6));if(!ps.some(p=>p.id===id))pm()},[hk,ld,pl,pe,pn,pq,s2,ps,pm]);

ue(()=>{if(!ld&&ps.length&&!sc.current&&window.location.hash.startsWith('#post-')){const el=document.getElementById(window.location.hash.slice(1));if(el){sc.current=true;setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'center'}),100)}}},[ld,ps,ka]);
const act=uc(async(id,a)=>{try{const r=await fetch('/api/act',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,act:a})});const j=await r.json().catch(()=>null);if(!r.ok)throw Error(j?.error||'помилка');sp(x=>x.map(p=>p.id===id?{...p,...j}:p))}catch(e){if(a!=='view')se(e.message)}},[]);
ue(()=>{if(typeof IntersectionObserver==='undefined')return;const ob=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const id=+e.target.dataset.pid;if(id&&!vw.current.has(id)){vw.current.add(id);act(id,'view')}}})},{threshold:0.5});(proot.current?.querySelectorAll('article[data-pid]')||[]).forEach(el=>ob.observe(el));return()=>ob.disconnect()},[ps,act]);
const we=u=>{
const t=tr.current;if(!t||sv||ub.current)return;
let a=t.selectionStart,b=t.selectionEnd;
if(/^<emodzya=\([^<>\r\n]+\)>$/i.test(tx.slice(a,b)))a=b;
const v='<emodzya=('+u+')>',n=tx.slice(0,a)+v+tx.slice(b);
if(n.length>mk){se('макс '+mk+' символів для обраного виду');return}
se('');sx(n);setTimeout(()=>{t.focus();t.setSelectionRange(a,a+v.length)},0);
};
const wr=(op,cl2,vl)=>{const t=tr.current;if(!t)return;const s=t.selectionStart,e=t.selectionEnd;const sel=tx.slice(s,e);const tg=vl?`[${op}=${vl}]`:`[${op}]`;const tc=`[/${cl2}]`;const nt=tx.slice(0,s)+tg+sel+tc+tx.slice(e);sx(nt);setTimeout(()=>{t.focus();t.setSelectionRange(s+tg.length,e+tg.length)},0)};
const wi=(ins)=>{const t=tr.current;if(!t)return;const s=t.selectionStart;const nt=tx.slice(0,s)+ins+tx.slice(s);sx(nt);setTimeout(()=>{t.focus();t.setSelectionRange(s+ins.length,s+ins.length)},0)};
const wl=()=>{const t=tr.current;if(!t)return;const s=t.selectionStart,e=t.selectionEnd;const sel=tx.slice(s,e)||'пункт';const ins=`[list]\n[*]${sel}\n[/list]`;const nt=tx.slice(0,s)+ins+tx.slice(e);sx(nt);setTimeout(()=>{t.focus();t.setSelectionRange(s+8,s+8+sel.length)},0)};
const wt=(a,b,v='')=>{
const t=tr.current;if(!t)return;
const s=t.selectionStart,e=t.selectionEnd,x=tx.slice(s,e)||v,n=tx.slice(0,s)+a+x+b+tx.slice(e);
if(n.length>mk){se('макс '+mk+' символів для обраного виду');return}
se('');sx(n);setTimeout(()=>{t.focus();t.setSelectionRange(s+a.length,s+a.length+x.length)},0);
};
const wu=()=>{
const v=window.prompt('Посилання (http:// або https://):','https://');if(v===null)return;
const u=su(v);if(!u){se('Вкажи коректне посилання http:// або https://');return}
wt('[url='+u+']','[/url]','посилання');
};
const wc=()=>{
const v=window.prompt('Мова або назва файлу:','javascript');if(v===null)return;
const n=v.trim();if(!n||n.length>64||/[\[\]<>\u0000-\u001f\u007f]/.test(n)){se('Невірна назва коду');return}
wt('[code='+n+']','</code>','код');
};
const uf=async(f)=>{if(!f)return null;const fd=new FormData();fd.append('file',f);try{const r=await fetch('/api/upload',{method:'POST',credentials:'include',body:fd});const j=await r.json().catch(()=>null);if(!r.ok)throw Error(j?.error||'помилка завантаження');return j}catch(e){se(e.message);return null}};
const oa=async fs=>{
if(!fs.length||ub.current||sv)return;
if(fs.some(f=>!['image/jpeg','image/png','image/webp','image/gif'].includes(f.type))){se('тільки JPG, PNG, WEBP або GIF');return}
const gs=fs.filter(f=>f.type==='image/gif'),ps=fs.filter(f=>f.type!=='image/gif');
if(pc.length+ps.length>5){se('макс 5 фото');return}
if(gs.length+(gf?1:0)>1){se('макс 1 GIF');return}
ub.current=true;sup(true);se('');
try{for(const f of fs){const j=await uf(f);if(j?.url){if(f.type==='image/gif')sgf(j.url);else spc(x=>[...x,j.url])}}}finally{ub.current=false;sup(false)}
};
const op=async e=>{const fs=Array.from(e.target.files||[]);try{await oa(fs)}finally{if(fi.current)fi.current.value=''}};
const og=async e=>{const f=e.target.files?.[0];try{if(f)await oa([f])}finally{if(gi.current)gi.current.value=''}};
const pa=e=>{
const d=e.clipboardData;if(!d)return;
let fs=Array.from(d.items||[]).filter(x=>x.kind==='file'&&x.type.startsWith('image/')).map(x=>x.getAsFile()).filter(Boolean);
if(!fs.length)fs=Array.from(d.files||[]).filter(f=>f.type.startsWith('image/'));
if(!fs.length)return;
e.preventDefault();oa(fs);
};
const cr=uc(async e=>{e.preventDefault();if(!me)return;if((!xp(tx).tx.trim()&&pc.length===0&&!gf)||sv||ub.current)return;if(xt(tx,kb).length>mx){se('макс '+mk+' символів для обраного виду');return}if(vd==='misto'&&!cn.trim()){se('обери місто для цього допису');return}ss(true);se('');so('');try{const r=await fetch('/api/posts',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:xt(tx,kb),pics:pc,gif:gf,vidimist:vd,geo:ge,misto:vd==='misto'?cn:'',coauthor_username:mxName})});const j=await r.json().catch(()=>null);if(!r.ok)throw Error(j?.error||'помилка');sx('');mxSetName('');spc([]);sgf('');sge('');svd('publichno');so('опубліковано');ks.current=0;sa(kb);sp(x=>[j,...x.filter(y=>y.id!==j.id)]);sr(x=>x+1)}catch(e){se(e.message)}finally{ss(false)}},[tx,pc,gf,vd,ge,sv,me,cn,mxName,kb]);
const svE=async(id)=>{const ep=ps.find(p=>p.id===id);if(!xp(etx).tx.trim()&&!ep?.pics?.length&&!ep?.gif){se('додай текст, фото або GIF');return}if(xt(etx,kc).length>mx){se('макс '+ml+' символів для обраного виду');return}if(evd==='misto'&&!ecn.trim()){se('обери місто для цього допису');return}try{const r=await fetch('/api/posts',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,text:xt(etx,kc),vidimist:evd,geo:ege,misto:evd==='misto'?ecn:'',coauthor_username:mxEdit})});const j=await r.json().catch(()=>null);if(!r.ok)throw Error(j?.error||'помилка');sp(x=>x.map(p=>p.id===id?{...p,...j}:p));seid(null);sr(x=>x+1)}catch(e){se(e.message)}};
const dlP=async(id)=>{if(!window.confirm('ви точно хочете видалити цей пост?'))return;try{const r=await fetch(`/api/posts?id=${id}`,{method:'DELETE',credentials:'include'});if(!r.ok)throw Error('помилка');pd.current.add(id);sp(x=>x.filter(p=>p.id!==id))}catch(e){se(e.message)}};
const ws=u=>{const t=tr.current;if(!t||sv||ub.current||tx.includes('[sticker]'))return;const a=t.selectionStart,b=t.selectionEnd;const v='[sticker]'+u+'[/sticker]',n=tx.slice(0,a)+v+tx.slice(b);if(n.length>mk){se('макс '+mk+' символів для обраного виду');return}sx(n);setTimeout(()=>{t.focus();t.setSelectionRange(a+v.length,a+v.length)},0)};
const shP=(id)=>{const u=`${window.location.origin}${window.location.pathname}#post-${id}`;if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).catch(()=>{});else{const ta=document.createElement('textarea');ta.value=u;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta)}act(id,'share');so('посилання скопійовано')};
const fm=v=>{if(!v)return'щойно';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('uk-UA',{dateStyle:'medium',timeStyle:'short'}).format(d)};
const qv=(q+' '+sq).trim().toLocaleLowerCase('uk');
const fl=ps.filter(p=>{if(xp(p.text).ty!==ka)return false;if(!qv)return true;const txt=xp(p.text).tx.toLocaleLowerCase('uk');const usr=String(p.username??'').toLocaleLowerCase('uk');const geo=String(p.geo??'').toLocaleLowerCase('uk');return txt.includes(qv)||usr.includes(qv)||geo.includes(qv)}).sort((a,b)=>{if(s2==='likes'&&b.laiki!==a.laiki)return(b.laiki||0)-(a.laiki||0);if(s2==='dislikes'&&b.dislaiki!==a.dislaiki)return(b.dislaiki||0)-(a.dislaiki||0);if(s2==='reposts'&&b.reposts!==a.reposts)return(b.reposts||0)-(a.reposts||0);const ta=new Date(a.created_at).getTime()||0;const tb=new Date(b.created_at).getTime()||0;return s1==='old'?ta-tb:tb-ta});
const[jp,sjp]=us(null);
const[jb,sjb]=us(true);
ue(()=>{
if(uid||qv){sjp(null);return}
const now=Date.now(),eligible=ps.filter(p=>{if(xp(p.text).ty!==ka)return false;const t=new Date(p.created_at).getTime(),l=Number(p.laiki??0),v=Number(p.viewz??0);return p.id!=null&&p.vidimist==='publichno'&&Number.isFinite(t)&&now-t>21600000&&Number.isFinite(l)&&l<5&&Number.isFinite(v)&&v<100});
sjp(id=>eligible.some(p=>p.id===id)?id:eligible.length?eligible[Math.floor(Math.random()*eligible.length)].id:null);
},[ps,uid,qv,ka]);
const jf=jb&&!uid&&!qv&&jp!=null;
const ji=jf?fl.findIndex(p=>p.id===jp):-1;
if(ji>0)fl.unshift(fl.splice(ji,1)[0]);
const cC=!uid||(me&&me.id===uid);
return <main ref={proot} className="ps" id="feed" onClick={()=>srpo(null)}><style>{st}</style>{!hideHeader&&<header className="ph"><h1 className="pt">стрічка</h1><p className="pd">ділися думками ВІЛЬНО</p></header>}{me&&cC?<section className="pc"><form className="pf" onSubmit={cr}><label className="pl" htmlFor="pt2">створи допис</label><div className="mtb"><button type="button" className={`tbb${to?' actr':''}`} onClick={()=>sto(!to)} title="форматування"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg></button><button type="button" className="tbb" onClick={()=>fi.current?.click()} disabled={up||pc.length>=5}>фото</button><button type="button" className="tbb" onClick={()=>gi.current?.click()} disabled={up||!!gf}>gif</button></div>{to&&<div className="tb"><div className="tbg"><button type="button" className="tbb" onClick={()=>wr('b','b')} title="жирний"><b>B</b></button><button type="button" className="tbb" onClick={()=>wr('i','i')} title="курсив"><i>I</i></button><button type="button" className="tbb" onClick={()=>wr('u','u')} title="підкреслений"><u>U</u></button><button type="button" className="tbb" onClick={()=>wr('s','s')} title="закреслений"><s>S</s></button></div><div className="tbg"><input type="color" className="tbc" value={cl} onChange={e=>scl(e.target.value)} title="колір"/><button type="button" className="tbb" onClick={()=>wr('color','color',cl)}>колір</button><input type="color" className="tbc" value={bg} onChange={e=>sbg(e.target.value)} title="фон"/><button type="button" className="tbb" onClick={()=>wr('bg','bg',bg)}>фон</button><button type="button" className="tbb" onClick={()=>wr('border','border',cl)}>рамка</button></div><div className="tbg"><input type="number" className="tbi" value={sz} min={8} max={72} onChange={e=>ssz(+e.target.value)} title="px"/><button type="button" className="tbb" onClick={()=>wr('size','size',sz)}>розмір</button><select className="tbs" value={ff} onChange={e=>sff(e.target.value)}>{fn.map(f=><option key={f} value={f} style={{fontFamily:`'${f}',sans-serif`}}>{f}</option>)}</select><button type="button" className="tbb" onClick={()=>wr('font','font',ff)}>шрифт</button></div><div className="tbg"><button type="button" className="tbb" onClick={()=>wr('shadow','shadow',cl)}>тінь</button><button type="button" className="tbb" onClick={()=>wr('glow','glow',cl)}>сяйво</button><input type="number" className="tbi" value={op2} min={0} max={100} onChange={e=>sop2(+e.target.value)} title="%"/><button type="button" className="tbb" onClick={()=>wr('opacity','opacity',op2)}>прозор</button></div><div className="tbg"><button type="button" className="tbb" onClick={()=>wr('spoiler','spoiler')}>спойлер</button><button type="button" className="tbb" onClick={wl}>список</button><button type="button" className="tbb" onClick={()=>wi('[hr]')}>лінія</button></div><div className="tbg"><button type="button" className="tbb" onClick={wu}>посилання</button><button type="button" className="tbb" onClick={()=>wt('[quote]','[/quote]','цитата')}>цитата</button><select className="tbs" defaultValue="" title="заголовок" aria-label="заголовок" onChange={e=>{const n=e.currentTarget.value;if(n)wt('['+n+']','[/'+n+']','заголовок');e.currentTarget.value=''}}><option value="" disabled>заголовок</option>{[1,2,3,4,5,6].map(n=><option key={n} value={'h'+n}>{'H'+n}</option>)}</select><button type="button" className="tbb" onClick={()=>wt('[table=Характеристики]\n[tr][th]Назва[/th][td]','[/td][/tr]\n[tr][th]Параметр[/th][td]Значення[/td][/tr]\n[/table]','значення')}>таблиця</button><button type="button" className="tbb" onClick={wc}>код</button></div></div>}{to&&<div className="tb petb" role="group" aria-label="емодзі">{emojis.map((u,i)=><button key={u} type="button" className="peb" disabled={sv||up} onPointerDown={e=>e.preventDefault()} onClick={()=>we(u)}><span className="pesr">емодзі</span><span className="pesr" translate="no">{i+1}</span><img src={u} alt="" loading="lazy" decoding="async"/></button>)}</div>}{to&&stickeri.length>0&&<div className="tb petb" role="group" aria-label="стикери">{stickeri.map((u,i)=><button key={u} type="button" className="peb" disabled={sv||up||tx.includes('[sticker]')} onPointerDown={e=>e.preventDefault()} onClick={()=>ws(u)}><span className="pesr">стикер</span><span className="pesr" translate="no">{i+1}</span><img src={'/stickeri/'+u} alt="" loading="lazy" decoding="async"/></button>)}</div>}<input ref={fi} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={op}/><input ref={gi} type="file" accept="image/gif" hidden onChange={og}/><textarea ref={tr} id="pt2" className="px" onPaste={pa} disabled={sv} value={tx} onChange={e=>sx(e.target.value)} maxLength={mk} placeholder="про що ти думаєш зараз?"/>{tx.trim()&&<section className="pepreview" aria-label="попередній перегляд"><div className="pb2"><Rn t={tx}/></div></section>}<div className="pmt"><select className="tbs" value={kb} onChange={e=>kv(e.target.value)} aria-label="вид допису">{ty.map(v=><option key={v[0]} value={v[0]}>{v[1]}</option>)}</select><input className="pmi2" value={mxName} onChange={e=>mxSetName(e.target.value)} maxLength={51} autoComplete="off" spellCheck={false} placeholder="юзернейм другого автора" aria-label="юзернейм другого автора"/><input className="pmi2" value={ge} onChange={e=>sge(e.target.value)} maxLength={100} placeholder="локація"/><select className="tbs" value={vd} onChange={e=>svd(e.target.value)} title="видимість"><option value="publichno">видимість: всі</option><option value="privatka">видимість: ніхто</option><option value="misto">видимість: для міста</option></select>{vd==='misto'&&<><select className="tbs" value={cn} onChange={e=>scn(e.target.value)} aria-label="обери місто" disabled={cb}><option value="">{cb?'завантаження…':'обери місто'}</option>{cn&&!cs.includes(cn)&&<option value={cn} translate="no">{cn}</option>}{cs.map(v=><option key={v} value={v} translate="no">{v}</option>)}</select>{ce&&<><span role="alert">не вдалося завантажити міста</span><button type="button" className="tbb" onClick={lc} disabled={cb}>оновити</button></>}</>}</div>{pc.length>0&&<div className="pv">{pc.map((u,i)=><div key={u} className="pvi"><img src={u} alt=""/><button type="button" className="pvr" onClick={()=>spc(x=>x.filter((_,j)=>j!==i))}>×</button></div>)}</div>}{gf&&<div className="pv"><div className="pvi" style={{width:120}}><img src={gf} alt=""/><button type="button" className="pvr" onClick={()=>sgf('')}>×</button></div></div>}
<div className="pr"><span className="pn">{tx.length} / {mk}{up&&' • завантаження…'}</span><button className="pb" type="submit" disabled={sv||up||(!xp(tx).tx.trim()&&pc.length===0&&!gf)}>{sv?'публікуємо…':'опублікувати'}</button></div></form></section>:!me?<section className="pc pl2"><p style={{margin:0}}>увійди щоб публікувати дописи</p><a href="#login">увійти / зареєструватись</a></section>:null}{er&&<div className="pe" role="alert">{er}<div style={{marginTop:10}}><button className="pb" type="button" onClick={()=>{sl(true);sr(x=>x+1)}}>спробувати ще</button></div></div>}{ok&&!er&&<div style={{fontSize:13,color:'#39834b',marginBottom:16}} role="status">{ok}</div>}{!uid&&<label><input type="checkbox" checked={jb} onChange={e=>sjb(e.target.checked)}/> Жар-Птиця</label>}<div className="pw"><div className="pwt"><h2>{qv?'результати пошуку':(uid?'':'останні дописи')}</h2><span className="pn2"></span></div><div className="pwb"><select className="tbs" value={ka} onChange={e=>{const k=e.target.value;ks.current=0;sa(k);kv(k);sc.current=false}} aria-label="вид дописів у стрічці">{ty.map(v=><option key={v[0]} value={v[0]}>{v[1]}</option>)}</select><input className="pmi2" value={sq} maxLength={200} onChange={e=>ssq(e.target.value)} placeholder="пошукайте щось, може знайдете..."/><select className="tbs" value={s1} onChange={e=>ss1(e.target.value)}><option value="new">від нових до старих</option><option value="old">від старих до нових</option></select><select className="tbs" value={s2} onChange={e=>ss2(e.target.value)}><option value="">додаткове сортування</option><option value="likes">найбільше лайків</option><option value="dislikes">найбільше дизлайків</option><option value="reposts">найбільше репостів</option></select></div></div>{ld?<div className="pk"><span className="pd3"/><span>завантаження…</span></div>:fl.length===0&&!er?<div className="pz">{pn||pl?'у завантаженій частині ще немає дописів цього виду.':qv?'нічого не знайдено.':'тут поки немає дописів.'}<br/>{pn||pl?'пошук можна продовжити нижче.':qv?'спробуй інший запит.':'будь першим!'}</div>:fl.map((p,i)=><div key={p.id??`${p.created_at??''}-${i}`} className={jf&&p.id===jp?'jz':undefined}><article className="pi" id={`post-${p.id}`} data-pid={p.id} key={p.id??`${p.created_at??''}-${i}`}><div className="phd"><div className="phl"><a href={`#user/${p.username}`}><PostAvatar p={p}/></a><div className="pif"><div className="gk-author"><a className="pnm" href={`#user/${p.username}`}>{p.username||'невідомий'}</a><Galochki galka={p.galka}/></div><MxCoauthor u={p.coauthor}/><div className="ptm"><time dateTime={p.created_at}>{fm(p.created_at)}</time>{p.zredagovano&&<span> ред. {fm(p.zkoli)}</span>}{p.vidimist==='privatka'&&<span>ніхто</span>}{p.vidimist==='misto'&&<span><span>для міста</span>: <span translate="no">{p.misto}</span></span>}</div></div></div>{me&&<div className="phr">{me.id===p.avtor_id&&<button type="button" className="tbb" onClick={()=>{seid(p.id);const kt=xp(p.text);setx(kt.tx);sd(kt.ty);sevd(p.vidimist||'publichno');sege(p.geo||'');secn(p.misto||'');mxSetEdit(p.coauthor?.username||'')}}>ред</button>}{(me.id===p.avtor_id||me.galka?.label==='Модератор'||me.galka?.label==='Головний адміністратор')&&<button type="button" className="tbb" onClick={()=>dlP(p.id)}>вид</button>}</div>}</div>{eid===p.id?<div className="pf"><textarea className="px" value={etx} maxLength={ml} onChange={e=>setx(e.target.value)}/><div className="pmt"><select className="tbs" value={kc} onChange={e=>sd(e.target.value)} aria-label="вид редагованого допису">{ty.map(v=><option key={v[0]} value={v[0]}>{v[1]}</option>)}</select><input className="pmi2" value={mxEdit} onChange={e=>mxSetEdit(e.target.value)} maxLength={51} autoComplete="off" spellCheck={false} placeholder="юзернейм другого автора" aria-label="юзернейм другого автора"/><input className="pmi2" value={ege} onChange={e=>sege(e.target.value)} placeholder="локація"/><select className="tbs" value={evd} onChange={e=>sevd(e.target.value)}><option value="publichno">всі</option><option value="privatka">ніхто</option><option value="misto">для міста</option></select>{evd==='misto'&&<><select className="tbs" value={ecn} onChange={e=>secn(e.target.value)} aria-label="обери місто" disabled={cb}><option value="">{cb?'завантаження…':'обери місто'}</option>{ecn&&!cs.includes(ecn)&&<option value={ecn} translate="no">{ecn}</option>}{cs.map(v=><option key={v} value={v} translate="no">{v}</option>)}</select>{ce&&<><span role="alert">не вдалося завантажити міста</span><button type="button" className="tbb" onClick={lc} disabled={cb}>оновити</button></>}</>}<button type="button" className="tbb" onClick={()=>svE(p.id)}>зберегти</button><button type="button" className="tbb" onClick={()=>seid(null)}>скасувати</button></div></div>:<div className="pb2"><Rn t={p.text||''}/></div>}{p.geo&&eid!==p.id&&<div className="pge">Локація:: {p.geo}</div>}{p.pics&&p.pics.length>0&&<div className="pm">{p.pics.filter(u=>u&&u.length>5&&u!=='[]'&&u!=='{}').map(u=><img key={u} className="pmi" loading="lazy" decoding="async" src={u} alt="" onClick={()=>sphoto(u)}/>)}</div>}{p.gif&&<img className="pg" loading="lazy" decoding="async" src={p.gif} alt=""/>}<div className="pft"><button type="button" className={`pfb${p.my_r===1?' act':''}`} onClick={()=>act(p.id,'like')}><svg viewBox="0 0 24 24" width="16" height="16" fill={p.my_r===1?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>{p.laiki||0}</button><button type="button" className={`pfb${p.my_r===-1?' actd':''}`} onClick={()=>act(p.id,'dislike')}><svg viewBox="0 0 24 24" width="16" height="16" fill={p.my_r===-1?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09L10 9l4 3-2 5 1.5-4-3.5-2.5 2-4.41C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>{p.dislaiki||0}</button><button type="button" className="pfb" onClick={()=>{window.location.hash="/comments/"+p.id}}>коментарів {p.skilki_commentariv||0}</button><div className={`pfb${p.my_rp?' actr':''}`} onMouseEnter={()=>srpo(p.id)} onMouseLeave={()=>srpo(null)} onTouchStart={e=>{e.stopPropagation();lp.current=false;tm.current=setTimeout(()=>{lp.current=true;srpo(p.id)},400)}} onTouchEnd={e=>{e.stopPropagation();clearTimeout(tm.current)}} onClick={e=>{e.stopPropagation();if(!lp.current)act(p.id,'repost')}}>репост {p.reposts||0}{rpo===p.id&&<div className="rpp" onClick={e=>e.stopPropagation()}>{Array.isArray(p.rp_users)&&p.rp_users.length>0?p.rp_users.map(u=><div className="gk-reposter" key={u.id??u.username}><span>@{u.username}</span><Galochki galka={u.galka}/></div>):p.rp_u&&p.rp_u.length>0?p.rp_u.map(u=><div key={u}>@{u}</div>):'немає репостів'}</div>}</div><button type="button" className="pfb" onClick={()=>shP(p.id)}>поділитися {p.shared||0}</button><span className="pfb" style={{cursor:'default',marginLeft:'auto'}}>пер. {p.viewz||0}</span></div></article>{jf&&p.id===jp&&<img className="jy" src="/жан.png" width={707} height={120} alt="" decoding="async" onError={e=>{e.currentTarget.hidden=true;e.currentTarget.parentElement.classList.remove('jz')}}/>}</div>)}{!ld&&(pn||pl||pe)&&<div className="pk" ref={ptail}>{pe&&<span role="alert">{pe}</span>}{pl?<><span className="pd3"/><span>завантаження…</span></>:<button className="pb" type="button" onClick={()=>{ks.current=0;pm()}}>{pe?'спробувати ще':ks.current>=5?'шукати далі':'завантажити'}</button>}</div>}<Photka src={photo} onClose={()=>sphoto('')}/></main>}


