import{useState as us,useEffect as ue,useCallback as uc,useRef as ur}from'react';
import Photka from'./Photka';
import Galochki from'./Galochki';
import emojis from'./emoji-list';
const fn=['Inter','Roboto','Open Sans','Montserrat','Poppins','Lato','Nunito','Playfair Display','Merriweather','Lora','Bebas Neue','Oswald','Pacifico','Dancing Script','Caveat','Great Vibes','Cinzel','UnifrakturMaguntia','Press Start 2P','Shadows Into Light','Permanent Marker','Comfortaa','Righteous','Fira Code','JetBrains Mono'];
const fu='https://fonts.googleapis.com/css2?'+fn.map(f=>'family='+f.replace(/ /g,'+')).join('&')+'&display=swap';
const st=`
@import url('${fu}');
.qa{width:min(760px,calc(100% - 32px));margin:0 auto;padding:104px 0 150px;font-family:system-ui,sans-serif;color:#302b25;position:relative;z-index:2}
.qa .ph{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.qa .pt{margin:0;font-size:clamp(27px,5vw,38px);font-weight:750;letter-spacing:-1.3px;color:#302b25}
.qa .pd{margin:0;color:#777064;font-size:14px;line-height:1.6}
.qa .pc{border:1px solid rgba(46,140,70,.2);border-radius:22px;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);padding:22px;margin-bottom:24px}
.qa .pl{display:block;font-size:13px;font-weight:650;color:#4e6348;margin-bottom:11px}
.qa .pf{display:flex;flex-direction:column;gap:12px}
.qa .mt{display:flex;gap:8px;align-items:center;margin-bottom:4px}
.qa .tb{display:flex;gap:8px;padding:10px;background:rgba(240,240,230,.6);border:1px solid #e2e4d8;border-radius:12px;align-items:center;overflow-x:auto;margin-bottom:4px;-webkit-overflow-scrolling:touch}
.qa .tb::-webkit-scrollbar{height:4px}
.qa .tb::-webkit-scrollbar-track{background:transparent}
.qa .tb::-webkit-scrollbar-thumb{background:#d0d4c0;border-radius:4px}
.qa .tg{display:flex;gap:4px;align-items:center;padding-right:8px;border-right:1px solid #d0d4c0;flex-shrink:0}
.qa .tg:last-child{border-right:0;padding-right:0}
.qa .bt{min-width:32px;height:32px;padding:0 8px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;color:#302b25;font:600 13px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.qa .bt:hover{background:#eef0e0;border-color:#63a86c}
.qa .bt:disabled{opacity:.4;cursor:not-allowed}
.qa .co{width:34px;height:32px;padding:2px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;cursor:pointer;flex-shrink:0}
.qa .ni{height:32px;padding:0 10px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;font:inherit;font-size:12px;width:60px;outline:none;flex-shrink:0}
.qa .sl{height:32px;padding:0 8px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;font:inherit;font-size:12px;outline:none;max-width:160px;cursor:pointer;flex-shrink:0}
.qa .px{width:100%;min-height:125px;box-sizing:border-box;resize:vertical;padding:15px;border:1px solid #e2e4d8;border-radius:14px;background:rgba(250,250,245,.9);color:#302b25;font:inherit;font-size:14px;line-height:1.65;outline:none;transition:border-color .2s;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap}
.qa .px:focus{border-color:#63a86c}
.qa .px::placeholder{color:#a19b8e}
.qa .cm{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.qa .ip{height:34px;padding:0 12px;border:1px solid #d0d4c0;border-radius:10px;background:#fff;font:inherit;font-size:13px;outline:none;flex:1;min-width:140px}
.qa .pr{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.qa .pn{font-size:12px;color:#8b867b}
.qa .pb{min-height:43px;padding:0 21px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background-image:url('/pictures/button.png');background-position:center;background-size:cover;background-repeat:no-repeat;color:white;font:600 13px system-ui,sans-serif;cursor:pointer;transition:filter .2s;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
.qa .pb:hover:not(:disabled){filter:brightness(1.07)}
.qa .pb:disabled{opacity:.5;cursor:not-allowed}
.qa .pw{display:flex;flex-direction:column;gap:10px;margin:30px 0 15px}
.qa .wa{display:flex;align-items:center;justify-content:space-between;gap:12px}
.qa .pw h2{margin:0;font-size:19px;font-weight:700}
.qa .nb{font-size:12px;color:#777064}
.qa .wb{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.qa .pi{padding:21px;border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.9);margin-bottom:12px;overflow-wrap:anywhere;scroll-margin-top:90px;backdrop-filter:blur(8px)}
.qa .hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.qa .hl{display:flex;align-items:center;gap:12px;min-width:0}
.qa .hr{display:flex;gap:6px;align-items:center}
.qa .av{width:42px;height:42px;border-radius:50%;object-fit:cover;background:#e2e4d8;flex-shrink:0;border:1px solid #d0d4c0}
.qa .if{display:flex;flex-direction:column;gap:2px;min-width:0}
.qa .nm{font-size:15px;font-weight:700;color:#302b25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none}
.qa .dt{font-size:12px;color:#8a857a;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.qa .bo{white-space:pre-wrap;margin:0;font-size:14px;line-height:1.8;color:#39352f;overflow-wrap:break-word;word-break:normal;tab-size:4;font-variant-ligatures:none}
.qa .ge{margin-top:10px;font-size:12px;color:#4e6348;font-weight:600}
.qa .pm{display:flex;gap:6px;margin-top:12px;overflow-x:auto;padding-bottom:4px}
.qa .im{height:160px;border-radius:12px;object-fit:cover;flex-shrink:0;cursor:pointer;transition:transform .15s}
.qa .im:hover{transform:scale(1.02)}
.qa .pg{margin-top:12px;max-width:100%;border-radius:12px}
.qa .ft{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid #eeeee7;color:#8a857a;font-size:13px}
.qa .fb{display:inline-flex;align-items:center;gap:5px;cursor:pointer;user-select:none;background:none;border:0;padding:4px 6px;border-radius:6px;color:inherit;font:inherit;position:relative}
.qa .fb:hover{color:#39834b;background:rgba(57,131,75,.07)}
.qa .fb.ac{color:#e11d48;font-weight:600}
.qa .fb.ad{color:#6366f1;font-weight:600}
.qa .fb.ar{color:#16a34a;font-weight:600}
.qa .rp{position:absolute;bottom:100%;left:0;margin-bottom:6px;padding:8px 10px;background:#fff;border:1px solid #d0d4c0;border-radius:8px;color:#302b25;font-size:12px;white-space:nowrap;z-index:20;min-width:110px;max-height:160px;overflow-y:auto}
.qa .pe{padding:14px 16px;border:1px solid #e8b7a8;border-radius:13px;background:#fff5f1;color:#99442e;font-size:13px;line-height:1.6;margin-bottom:16px;overflow-wrap:anywhere}
.qa .pz{padding:34px 18px;text-align:center;border:1px dashed rgba(70,130,75,.3);border-radius:18px;background:rgba(255,255,255,.9);color:#817b70;font-size:14px;line-height:1.7;backdrop-filter:blur(8px)}
.qa .pk{display:flex;justify-content:center;align-items:center;gap:10px;padding:26px;color:#777064;font-size:13px}
.qa .dk{width:7px;height:7px;border-radius:50%;background:#479657;animation:pp 1s ease-in-out infinite alternate}
.qa .lg{text-align:center;padding:28px 20px;color:#777064;font-size:14px;line-height:1.7}
.qa .lg a{color:#39834b;font-weight:600;text-decoration:underline}
.qa .pv{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.qa .vi{position:relative;width:80px;height:80px;border-radius:10px;overflow:hidden;border:1px solid #d0d4c0}
.qa .vi img{width:100%;height:100%;object-fit:cover}
.qa .vr{position:absolute;top:3px;right:3px;width:20px;height:20px;border:0;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;cursor:pointer;font:700 12px system-ui;display:flex;align-items:center;justify-content:center;padding:0}
.qa .bbs{display:inline;box-decoration-break:clone;-webkit-box-decoration-break:clone;white-space:pre-wrap}
.qa .bsp{display:inline-block;margin:4px 0;padding:4px 12px;border:1px solid #d0d4c0;border-radius:6px;background:#f3f4f6;color:#6b7280;font:600 12px system-ui;cursor:pointer;user-select:none}
.qa .bls{margin:8px 0;padding-left:22px;list-style:disc}
.qa .bls li{margin:3px 0;line-height:1.7;color:#39352f}
.qa .bhr{border:0;border-top:1px solid #d0d4c0;margin:14px 0}
@keyframes pp{to{opacity:.3;transform:scale(.7)}}
@media(max-width:600px){.qa{width:calc(100% - 16px);padding:74px 0 35px}
.qa .pc{padding:14px;border-radius:16px}
.qa .pi{padding:14px}
.qa .px{min-height:100px;font-size:16px}
.qa .pb{min-height:46px;width:100%}
.qa .pw{margin-top:25px}
.qa .im{height:120px}
.qa .pr{flex-direction:column;align-items:stretch;gap:12px}
.qa .pn{text-align:center}
.qa .mt .bt{flex:1;height:40px;font-size:14px}
.qa .mt .bt:first-child{flex:0 0 46px}
.qa .bt,.qa .co,.qa .ni,.qa .sl,.qa .ip{height:38px}
.qa .cm{flex-direction:column;align-items:stretch}
.qa .sl{max-width:none;width:100%}
.qa .ft{gap:8px;justify-content:space-between}
.qa .fb{padding:6px 4px;font-size:13px}
.qa .wb{flex-direction:column;align-items:stretch}}

.qa .ef{display:flex;flex-direction:column;gap:12px;border:0;padding:0;margin:0;min-width:0}
.qa .ef:disabled{opacity:.65}
.qa .fl{display:flex;flex-direction:column;gap:8px;font-size:13px;font-weight:600;color:#4e6348}
.qa .rw{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.qa .ln{color:#39834b;text-decoration:none}
.qa .ga{display:block;width:56px;height:56px;border-radius:50px;object-fit:cover;background:#e2e4d8;border:1px solid #d0d4c0;flex-shrink:0}
.qa .gn{margin:0;font-size:22px;font-weight:750;overflow-wrap:anywhere}
.qa .bn{display:block;width:100%;max-height:240px;object-fit:cover;border-radius:14px;margin-bottom:18px;cursor:pointer}
.qa .ow{font-size:12px;color:#4e6348;font-weight:600}
.qa .au{display:flex;align-items:center;gap:4px;min-width:0}
.qa .au>.nm{min-width:0;flex:0 1 auto}
.qa .au .ln{overflow-wrap:anywhere}
.qa .rx{position:relative;display:inline-flex}
.qa .ok{font-size:13px;color:#39834b;margin-bottom:16px}
.qa .ip{box-sizing:border-box;min-height:38px}
.qa .bo{white-space:pre-wrap}
.qa .pc .bo{margin:12px 0}
.qa .sl{max-width:210px}
.qa .hd .hr{flex-shrink:0}
.qa .hl.ln{flex:1}
.qa .bt.ln{box-sizing:border-box}
.qa .rp{white-space:normal;width:180px;max-width:calc(100vw - 48px)}
.qa .rp .au{min-height:24px}
@media(max-width:600px){.qa .hd{flex-wrap:wrap}.qa .gn{font-size:19px}.qa .sl{width:100%;max-width:none}.qa .rw>.pb{width:auto}.qa .hr{margin-left:auto}.qa .ft{justify-content:flex-start}.qa .im{max-width:100%}.qa .ip{font-size:16px}.qa .fl .sl{font-size:16px}}
.qa .petb{display:flex;flex-wrap:wrap;align-items:center;gap:10px;max-height:180px;overflow-x:hidden;overflow-y:auto;padding:10px}
.qa .peb{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:auto;height:28px;padding:0!important;margin:0;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;cursor:pointer}
.qa .peb img{display:block;width:auto;height:28px;max-width:96px;max-height:28px;object-fit:contain;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;padding:0;margin:0}
.qa .peb:disabled{cursor:default;opacity:.5}
.qa .peb:focus-visible{outline:2px solid #b89652;outline-offset:3px}
.qa .pesr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.qa .pepreview{margin:8px 0}
.qa .qy{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start}
.qa.ql{width:min(980px,calc(100% - 32px))}
.qa.ql .qy{grid-template-columns:minmax(0,1fr) 210px}
.qa .qz{min-width:0}
.qa .qr{position:sticky;top:90px;min-width:0;padding:16px;border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.9);font-size:13px;line-height:1.7;overflow-wrap:anywhere}
.qa .qr h2{font-size:15px;margin:0 0 10px}
.qa .qr ol{padding-left:22px;margin:0}
.qa .qr li{padding-left:2px;margin:0 0 8px}
.qa .qb{font-size:12px;color:#99442e}
.qa .qt{min-height:34px;padding:6px 12px;font-size:12px;white-space:normal;text-align:center}
@media(max-width:900px){.qa.ql .qy{grid-template-columns:minmax(0,1fr)}.qa .qr{position:static;grid-row:1}}
@media(max-width:600px){.qa.ql{width:calc(100% - 16px)}.qa .qt{width:auto;min-height:38px}.qa .rw.qm{justify-content:flex-start}.qa .qr{padding:14px}}

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
export function rb(t){if(!t)return[];const r=[];let i=0,m;const rx=/\[(\/?)(b|i|u|s|color|bg|size|font|shadow|glow|border|opacity|url)(?:=([^\]]+))?\]|<emodzya=\(([^<>\r\n]{1,5000})\)>|\[kartinkaaaa\]\s*((?:https?:\/\/|\/(?!\/))[^\s<>\[\]]+)(?:\s*\[\/kartinkaaaa\])?/gi;const op=[];let k=0;while((m=rx.exec(t))!==null){if(m.index>i)r.push({t:'t',v:t.slice(i,m.index)});if(m[5]!==undefined){r.push({t:'mximage',v:m[5]});i=m.index+m[0].length;continue}if(m[4]!==undefined){r.push({t:'e',v:m[4]});i=m.index+m[0].length;continue}if(m[1]==='/'){for(let j=op.length-1;j>=0;j--)if(op[j].nm===m[2].toLowerCase()){r.push({t:'c',k:op[j].k});op.splice(j,1);break}}else{const kk=k++;op.push({nm:m[2].toLowerCase(),k:kk});r.push({t:'o',nm:m[2].toLowerCase(),vl:m[3],k:kk})}i=m.index+m[0].length}if(i<t.length)r.push({t:'t',v:t.slice(i)});return r}
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
return <Nd ns={splitBlocks(t)}/>;
}
function Ed({iv=null,on,off,cap='створи допис',lab='опублікувати',gp=false,fx={},community=false}){
const[mxName,mxSetName]=us(iv?.coauthor?.username||'');
const[tx,sx]=us(gp?(iv?.bio||''):(iv?.text||''));const[pc,spc]=us(iv?.pics||[]);const[gf,sgf]=us(iv?.gif||'');const[ge,sge]=us(iv?.geo||'');const[nm,snm]=us(iv?.name||'');const[mc,smc]=us(iv?.max_members??1000);const[ph,sph]=us(iv?.photo||'');const[bn,sbn]=us(iv?.banner||'');const[pm,spm]=us(iv?.posting||'owner');const[up,sup]=us(false);const[sv,ss]=us(false);const[er,se]=us('');const[cl,scl]=us('#000000');const[bg,sbg]=us('#ffffff');const[sz,ssz]=us(16);const[ff,sff]=us('Inter');const[op2,sop2]=us(50);const[to,sto]=us(false);
const[ru,sru]=us(iv?.rules||'');
const[jc,sjc]=us(iv?.join_closed===true);const[wel,swel]=us(iv?.welcome||'');const[as,sas]=us(false);
const tr=ur(null);const fi=ur(null);const gi=ur(null);const ai=ur(null);const bi=ur(null);const lv=ur(true);const bu=ur(false);const mx=5000;
const edid='pb-'+(gp?'bio':cap==='Пропоновка'?'suggest':'text')+'-'+(iv?.id||'new');
ue(()=>{lv.current=true;return()=>{lv.current=false}},[]);
const wt=(a,b,v='')=>{
const t=tr.current;if(!t||bu.current)return;
const s=t.selectionStart,e=t.selectionEnd,x=tx.slice(s,e)||v,n=tx.slice(0,s)+a+x+b+tx.slice(e);
if(n.length>mx){se('макс 5000 символів');return}
se('');sx(n);setTimeout(()=>{if(!lv.current)return;t.focus();t.setSelectionRange(s+a.length,s+a.length+x.length)},0);
};
const wr=(a,b,v)=>wt(v?'['+a+'='+v+']':'['+a+']','[/'+b+']');
const wi=v=>wt(v,'');
const wl=()=>wt('[list]\n[*]','\n[/list]','пункт');
const wu=()=>{const v=window.prompt('Посилання (http:// або https://):','https://');if(v===null)return;const u=su(v);if(!u){se('Вкажи коректне посилання http:// або https://');return}wt('[url='+u+']','[/url]','посилання')};
const wc=()=>{const v=window.prompt('Мова або назва файлу:','javascript');if(v===null)return;const n=v.trim();if(!n||n.length>64||/[\[\]<>\u0000-\u001f\u007f]/.test(n)){se('Невірна назва коду');return}wt('[code='+n+']','</code>','код')};
const we=u=>{
const t=tr.current;if(!t||bu.current)return;
let a=t.selectionStart,b=t.selectionEnd;
if(/^<emodzya=\([^<>\r\n]+\)>$/i.test(tx.slice(a,b)))a=b;
const v='<emodzya=('+u+')>',n=tx.slice(0,a)+v+tx.slice(b);
if(n.length>mx){se('макс 5000 символів');return}
se('');sx(n);setTimeout(()=>{if(!lv.current)return;t.focus();t.setSelectionRange(a,a+v.length)},0);
};
const oa=async(fs,ty='mix')=>{
if(!fs.length||bu.current)return;
se('');
if(fs.some(f=>ty==='g'?f.type!=='image/gif':ty==='a'||ty==='b'||ty==='p'?!['image/jpeg','image/png','image/webp'].includes(f.type):!['image/jpeg','image/png','image/webp','image/gif'].includes(f.type))){se(ty==='g'?'тільки GIF':ty==='mix'?'тільки JPG, PNG, WEBP або GIF':'тільки JPG, PNG або WEBP');return}
const gs=fs.filter(f=>f.type==='image/gif'),ps=fs.filter(f=>f.type!=='image/gif');
if((ty==='p'||ty==='mix')&&pc.length+ps.length>5){se('макс 5 фото');return}
if((ty==='g'||ty==='mix')&&gs.length+(gf?1:0)>1){se('макс 1 GIF');return}
bu.current=true;sup(true);
try{for(const f of fs){
const fd=new FormData();fd.append('file',f);
const r=await fetch('/api/upload',{method:'POST',credentials:'include',body:fd});
const j=await r.json().catch(()=>null);
if(!r.ok||typeof j?.url!=='string'||!j.url.startsWith('/uploads/'))throw Error(j?.error||'помилка завантаження');
if(!lv.current)return;
if(ty==='a')sph(j.url);else if(ty==='b')sbn(j.url);else if(f.type==='image/gif')sgf(j.url);else spc(x=>[...x,j.url]);
}}catch(e){if(lv.current)se(e.message)}finally{bu.current=false;if(lv.current)sup(false)}
};
const uf=(e,ty)=>{const el=e.target,fs=Array.from(el.files||[]);el.value='';return oa(fs,ty)};
const pa=e=>{if(gp)return;const d=e.clipboardData;if(!d)return;let fs=Array.from(d.items||[]).filter(x=>x.kind==='file'&&x.type.startsWith('image/')).map(x=>x.getAsFile()).filter(Boolean);if(!fs.length)fs=Array.from(d.files||[]).filter(f=>f.type.startsWith('image/'));if(!fs.length)return;e.preventDefault();oa(fs)};
const sb=async e=>{
e.preventDefault();if(bu.current)return;se('');
if(tx.length>mx||ru.length>mx){se('максимум 5000 символів');return}
if(gp&&(!nm.trim()||!Number.isInteger(Number(mc))||Number(mc)<Math.max(1,iv?.member_count||1)||Number(mc)>2147483647)){se('вкажи назву та допустиму кількість учасників');return}
if(!gp&&!tx.trim()&&!pc.length&&!gf)return;
bu.current=true;ss(true);
try{await on(gp?{name:nm.trim(),bio:tx,max_members:Number(mc),photo:ph,banner:bn,posting:pm,...(fx.rules?{rules:ru}:{}),...(fx.extras?{join_closed:jc,welcome:wel}:{})}:{text:tx,pics:pc,gif:gf,geo:ge,coauthor_username:mxName,...(community?{as_community:as}:{})});if(lv.current&&!gp&&!iv){sx('');mxSetName('');spc([]);sgf('');sge('')}}catch(e){if(lv.current)se(e.message)}finally{bu.current=false;if(lv.current)ss(false)}
};
return <section className="pc"><form className="pf" onSubmit={sb}><fieldset className="ef" disabled={sv||up}><legend className="pl">{cap}</legend>{gp&&<><label className="fl">назва спільноти<input className="ip" value={nm} onChange={e=>snm(e.target.value)} maxLength={100} required/></label><div className="rw"><button type="button" className="bt" onClick={()=>ai.current?.click()}>аватар</button><button type="button" className="bt" onClick={()=>bi.current?.click()}>банер</button></div><input ref={ai} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>uf(e,'a')}/><input ref={bi} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>uf(e,'b')}/><div className="pv">{ph&&<div className="vi"><img src={ph} alt=""/><button type="button" className="vr" aria-label="видалити аватар" onClick={()=>sph('')}>×</button></div>}{bn&&<div className="vi" style={{width:160}}><img src={bn} alt=""/><button type="button" className="vr" aria-label="видалити банер" onClick={()=>sbn('')}>×</button></div>}</div><label className="fl">максимальна кількість учасників<input type="number" className="ip" min={Math.max(1,iv?.member_count||1)} max={2147483647} step={1} value={mc} onChange={e=>smc(e.target.value)} required/></label><span className="pn">якщо що, власник також займає одне місце</span>{iv&&<label className="fl">хто може публікувати<select className="sl" value={pm} onChange={e=>spm(e.target.value)}><option value="owner">тільки власник</option><option value="all">усі</option></select><span className="pn">усі - ну, тобто усі учасники спільноти</span></label>}<label className="fl" htmlFor={edid}>опис спільноти</label>{fx.extras&&<><label className="rw"><input type="checkbox" checked={jc} onChange={e=>sjc(e.target.checked)}/>тимчасово закрити вступ</label><label className="fl">привітання після вступу<textarea className="px" value={wel} maxLength={500} onChange={e=>swel(e.target.value.slice(0,500))}/></label></>}</>}
<div className="mt"><button type="button" className={`bt${to?' ar':''}`} onClick={()=>sto(!to)} title="форматування"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg></button>{!gp&&<button type="button" className="bt" onClick={()=>fi.current?.click()} disabled={up||pc.length>=5}>фото</button>}{!gp&&<button type="button" className="bt" onClick={()=>gi.current?.click()} disabled={up||!!gf}>gif</button>}</div>{to&&<div className="tb"><div className="tg"><button type="button" className="bt" onClick={()=>wr('b','b')} title="жирний"><b>B</b></button><button type="button" className="bt" onClick={()=>wr('i','i')} title="курсив"><i>I</i></button><button type="button" className="bt" onClick={()=>wr('u','u')} title="підкреслений"><u>U</u></button><button type="button" className="bt" onClick={()=>wr('s','s')} title="закреслений"><s>S</s></button></div><div className="tg"><input type="color" className="co" value={cl} onChange={e=>scl(e.target.value)} title="колір"/><button type="button" className="bt" onClick={()=>wr('color','color',cl)}>колір</button><input type="color" className="co" value={bg} onChange={e=>sbg(e.target.value)} title="фон"/><button type="button" className="bt" onClick={()=>wr('bg','bg',bg)}>фон</button><button type="button" className="bt" onClick={()=>wr('border','border',cl)}>рамка</button></div><div className="tg"><input type="number" className="ni" value={sz} min={8} max={72} onChange={e=>ssz(+e.target.value)} title="px"/><button type="button" className="bt" onClick={()=>wr('size','size',sz)}>розмір</button><select className="sl" value={ff} onChange={e=>sff(e.target.value)}>{fn.map(f=><option key={f} value={f} style={{fontFamily:`'${f}',sans-serif`}}>{f}</option>)}</select><button type="button" className="bt" onClick={()=>wr('font','font',ff)}>шрифт</button></div><div className="tg"><button type="button" className="bt" onClick={()=>wr('shadow','shadow',cl)}>тінь</button><button type="button" className="bt" onClick={()=>wr('glow','glow',cl)}>сяйво</button><input type="number" className="ni" value={op2} min={0} max={100} onChange={e=>sop2(+e.target.value)} title="%"/><button type="button" className="bt" onClick={()=>wr('opacity','opacity',op2)}>прозор</button></div><div className="tg"><button type="button" className="bt" onClick={()=>wr('spoiler','spoiler')}>спойлер</button><button type="button" className="bt" onClick={wl}>список</button><button type="button" className="bt" onClick={()=>wi('[hr]')}>лінія</button></div><div className="tg"><button type="button" className="bt" onClick={wu}>посилання</button><button type="button" className="bt" onClick={()=>wt('[quote]','[/quote]','цитата')}>цитата</button><select className="sl" defaultValue="" title="заголовок" aria-label="заголовок" onChange={e=>{const n=e.currentTarget.value;if(n)wt('['+n+']','[/'+n+']','заголовок');e.currentTarget.value=''}}><option value="" disabled>заголовок</option>{[1,2,3,4,5,6].map(n=><option key={n} value={'h'+n}>{'H'+n}</option>)}</select><button type="button" className="bt" onClick={()=>wt('[table=Характеристики]\n[tr][th]Назва[/th][td]','[/td][/tr]\n[tr][th]Параметр[/th][td]Значення[/td][/tr]\n[/table]','значення')}>таблиця</button><button type="button" className="bt" onClick={wc}>код</button></div></div>}
{to&&<div className="tb petb" role="group" aria-label="емодзі">{emojis.map((u,i)=><button key={u} type="button" className="peb" disabled={sv||up} onPointerDown={e=>e.preventDefault()} onClick={()=>we(u)}><span className="pesr">емодзі</span><span className="pesr" translate="no">{i+1}</span><img src={u} alt="" loading="lazy" decoding="async"/></button>)}</div>}
<input ref={fi} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e=>uf(e,'p')}/><input ref={gi} type="file" accept="image/gif" hidden onChange={e=>uf(e,'g')}/>
<textarea ref={tr} id={edid} className="px" onPaste={pa} value={tx} onChange={e=>sx(e.target.value.slice(0,mx))} maxLength={mx} placeholder={gp?'напиши щось про спільноту...':'про що ти думаєш зараз?'}/>{tx.trim()&&<section className="pepreview" aria-label="попередній перегляд"><div className="bo" translate="no"><Rn t={tx}/></div></section>}{gp&&<label className="fl">правила<textarea className="px" value={ru} onChange={e=>sru(e.target.value.slice(0,mx))} maxLength={mx} disabled={!fx.rules}/></label>}
{!gp&&<><input className="ip" value={mxName} onChange={e=>mxSetName(e.target.value)} maxLength={51} autoComplete="off" spellCheck={false} placeholder="юзернейм другого автора" aria-label="юзернейм другого автора"/>{community&&<label className="fl"><select className="sl" value={as?'community':'user'} onChange={e=>sas(e.target.value==='community')}><option value="user">від мого імені</option><option value="community">від імені спільноти</option></select></label>}<input className="ip" value={ge} onChange={e=>sge(e.target.value)} maxLength={100} placeholder="локація"/>{pc.length>0&&<div className="pv">{pc.map((u,i)=><div key={u+i} className="vi"><img src={u} alt=""/><button type="button" className="vr" aria-label="видалити фото" onClick={()=>spc(x=>x.filter((_,j)=>j!==i))}>×</button></div>)}</div>}{gf&&<div className="pv"><div className="vi" style={{width:120}}><img src={gf} alt=""/><button type="button" className="vr" aria-label="видалити GIF" onClick={()=>sgf('')}>×</button></div></div>}</>}
{er&&<div className="pe" role="alert">{er}</div>}<div className="pr"><span className="pn">{tx.length} / {mx}{up&&' • завантаження…'}</span><div className="rw">{off&&<button type="button" className="bt" onClick={off}>скасувати</button>}<button className="pb" type="submit" disabled={sv||up||(!gp&&!tx.trim()&&!pc.length&&!gf)}>{sv?'зберігаємо…':lab}</button></div></div></fieldset></form></section>
}
const fc=new Map();
function Av({u,sz=42}){
const[fr,sf]=us('');
ue(()=>{let lv=true;sf('');if(typeof u.frame==='string'||!u.avtor_id)return;const id=u.avtor_id;if(!fc.has(id))fc.set(id,fetch('/api/user?id='+encodeURIComponent(id),{credentials:'include'}).then(r=>r.ok?r.json():null).then(j=>j?.frame||'').catch(()=>''));fc.get(id).then(v=>{if(lv)sf(v)});return()=>{lv=false}},[u.avtor_id,u.frame]);
const ff=typeof u.frame==='string'?u.frame:fr;
return <span style={{display:'block',position:'relative',width:sz,height:sz,flexShrink:0,isolation:'isolate'}}><img className="av" src={u.photo||'/pictures/default_avatar.png'} alt="" style={{display:'block',width:sz,height:sz,boxSizing:'border-box',position:'relative',zIndex:1}}/>{ff&&<img src={'/frames/'+encodeURIComponent(ff)} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',maxWidth:'100%',maxHeight:'100%',margin:0,padding:0,border:0,borderRadius:0,clipPath:'none',objectFit:'contain',zIndex:2,pointerEvents:'none'}}/>}</span>
}
async function aj(u,mt='GET',bd,sg){
const r=await fetch(u,{method:mt,credentials:'include',headers:{Accept:'application/json',...(bd===undefined?{}:{'Content-Type':'application/json'})},...(bd===undefined?{}:{body:JSON.stringify(bd)}),...(sg?{signal:sg}:{})});
const j=await r.json().catch(()=>null);if(!r.ok)throw Error(j?.error||(r.status===404?'API спільнот ще не підключено':'помилка: '+r.status));if(j===null)throw Error('невірна відповідь сервера');return j
}
const fm=v=>{if(!v)return'щойно';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('uk-UA',{dateStyle:'medium',timeStyle:'short'}).format(d)};
const gr=()=>{const h=window.location.hash.replace(/^#/,''),p=h||window.location.pathname,m=p.match(/^\/?communities(?:\/(\d+))?(?:\/post\/(\d+))?\/?$/);return{ci:m?Number(m[1]||0):0,pi:m?Number(m[2]||0):0}};
const ni=v=>Number.isSafeInteger(Number(v))&&Number(v)>0?Number(v):0;
export default function Pablik({id=null,q=''}){
const[fx,sfx]=us({rules:false,suggestions:false,moderation:false,extras:false});const[sgs2,ssgs2]=us([]);const[sgl,ssgl]=us(false);const[scn,sscn]=us(0);
const[rt,srt]=us(gr);const[gs,sgs]=us([]);const[cg,scg]=us(null);const[ps,sps]=us([]);const[ms,sms]=us([]);const[me,sme]=us(null);const[ld,sld]=us(true);const[dl,sdl]=us(false);const[ml,sml]=us(false);const[er,ser]=us('');const[ok,_sok]=us('');const[cf,scf]=us(false);const[ec,sec]=us(false);const[ei,sei]=us(null);const[tb,stb]=us('posts');const[sq,ssq]=us('');const[mq,smq]=us('');const[pq,spq]=us('');const[so,sso]=us('new');const[po,spo]=us('new');const[fi,sfi]=us('all');const[fs,sfs]=us('');const[ph,sph]=us('');const[rp,srp]=us(null);const[bu,sbu]=us([]);const[re,sre]=us(0);
const[cw,scw]=us(false);const sok=(text,custom=false)=>{scw(custom);_sok(text)};
const ci=id===null?rt.ci:ni(id);const sqr=ur(0);const srq=ur(0);const cr=ur(ci);cr.current=ci;const lv=ur(true);const br=ur(new Set());const vw=ur(new Set());const rr=ur(null);const tm=ur(null);const lp=ur(false);const mr=ur(0);
ue(()=>{lv.current=true;const ac=new AbortController();aj('/api/me','GET',undefined,ac.signal).then(j=>{if(lv.current)sme(j)}).catch(()=>{});aj('/api/pabliks/capabilities','GET',undefined,ac.signal).then(j=>{if(!ac.signal.aborted&&lv.current&&j?.version===1)sfx({rules:j.rules===true,suggestions:j.suggestions===true,moderation:j.moderation===true,extras:j.extras===true})}).catch(()=>{});const h=()=>srt(gr());window.addEventListener('hashchange',h);window.addEventListener('popstate',h);return()=>{lv.current=false;ac.abort();clearTimeout(tm.current);window.removeEventListener('hashchange',h);window.removeEventListener('popstate',h)}},[]);
ue(()=>{const ac=new AbortController();sld(true);aj('/api/pabliks','GET',undefined,ac.signal).then(j=>{if(!Array.isArray(j))throw Error('не масив');sgs(j)}).catch(e=>{if(!ac.signal.aborted)ser(e.message)}).finally(()=>{if(!ac.signal.aborted)sld(false)});return()=>ac.abort()},[re]);
ue(()=>{const ac=new AbortController();scg(null);sps([]);sms([]);sml(false);ssgs2([]);ssgl(false);sscn(0);sqr.current++;srq.current++;stb('posts');sec(false);sei(null);scf(false);smq('');spq('');ser('');sok('');srp(null);mr.current++;if(!ci){sdl(false);return()=>ac.abort()}sdl(true);aj('/api/pabliks?id='+ci,'GET',undefined,ac.signal).then(j=>{if(ni(j?.community?.id)!==ci||!Array.isArray(j.posts))throw Error('невірна відповідь сервера');scg(j.community);sps(j.posts);sscn(Math.max(0,Number(j.community.suggestions_count)||0))}).catch(e=>{if(!ac.signal.aborted)ser(e.message)}).finally(()=>{if(!ac.signal.aborted)sdl(false)});return()=>ac.abort()},[ci,re]);
ue(()=>{if(!ci||dl||!cg||!rt.pi)return;const el=document.getElementById('pablik-post-'+rt.pi);el?.scrollIntoView?.({behavior:'smooth',block:'center'})},[ci,dl,cg,ps,rt.pi]);
const ow=!!(me&&cg&&Number(me.id)===Number(cg.owner_id));const jo=!!(cg?.joined||ow);const wb=!!cg?.write_blocked&&!ow;const cp=!!(me&&cg&&(ow||(jo&&!wb&&cg.posting==='all')));const cs=!!(me&&cg&&jo&&!ow&&!wb);
const nv=(id=0)=>{window.location.hash='/communities'+(id?'/'+id:'')};
const ug=j=>{if(!j||!ni(j.id))throw Error('невірна відповідь сервера');if(!lv.current)return;sgs(x=>x.some(g=>g.id===j.id)?x.map(g=>g.id===j.id?j:g):[j,...x]);if(cr.current===Number(j.id)){scg(j);if(j.suggestions_count!==undefined)sscn(Math.max(0,Number(j.suggestions_count)||0))}};
const lk=async(k,fn)=>{if(br.current.has(k))return;br.current.add(k);sbu(x=>[...x,k]);ser('');sok('');try{await fn()}catch(e){if(lv.current)ser(e.message)}finally{br.current.delete(k);if(lv.current)sbu(x=>x.filter(v=>v!==k))}};
const mb=async id=>{const rn=++mr.current;sml(true);try{const j=await aj('/api/pabliks/members?cid='+id);if(!Array.isArray(j))throw Error('не масив');if(lv.current&&cr.current===id&&mr.current===rn)sms(j)}catch(e){if(lv.current&&cr.current===id&&mr.current===rn)ser(e.message)}finally{if(lv.current&&cr.current===id&&mr.current===rn)sml(false)}};
const jm=(g,ac)=>{if(!me){ser('увійди щоб вступити до спільноти');return}lk('gm'+g.id,async()=>{const j=await aj('/api/pabliks/members','POST',{cid:g.id,act:ac});ug(j);if(cr.current===0||cr.current===Number(g.id)){sok(ac==='join'?(String(j.welcome||'').trim()?j.welcome:'ти вступив до спільноти'):'ти вийшов зі спільноти',ac==='join'&&!!String(j.welcome||'').trim());if(cr.current===Number(g.id)&&tb==='members')mb(Number(g.id))}})};

const qs=async id=>{
if(!fx.suggestions||!ow)return;
const rn=++sqr.current;ssgl(true);ser('');
try{const j=await aj('/api/pabliks/suggestions?cid='+id);if(!Array.isArray(j?.items)||!Number.isSafeInteger(j.pending)||j.pending<0)throw Error('невірна відповідь сервера');if(lv.current&&cr.current===id&&sqr.current===rn){ssgs2(j.items);sscn(j.pending)}}catch(e){if(lv.current&&cr.current===id&&sqr.current===rn)ser(e.message)}finally{if(lv.current&&cr.current===id&&sqr.current===rn)ssgl(false)}
};
const ns=async d=>{
if(!fx.suggestions||!cs)throw Error('немає доступу');
const id=ci,rn=sqr.current,j=await aj('/api/pabliks/suggestions','POST',{cid:id,...d});
if(!ni(j?.id)||Number(j.cid)!==id)throw Error('невірна відповідь сервера');
if(lv.current&&cr.current===id&&sqr.current===rn){stb('posts');sok('збережено')}
};
const ds=(p,act)=>{
if(!ow||!fx.suggestions)return;
const id=ci;lk('sg',async()=>{
const j=await aj('/api/pabliks/suggestions','PUT',{id:p.id,act});
if(!j?.ok||Number(j.cid)!==id||Number(j.id)!==Number(p.id)||!Number.isSafeInteger(j.pending)||j.pending<0||(act==='accept'&&(!ni(j.post?.id)||Number(j.post.cid)!==id)))throw Error('невірна відповідь сервера');
if(lv.current&&cr.current===id){srq.current++;sqr.current++;ssgs2(x=>x.filter(v=>v.id!==p.id));ssgl(false);sscn(j.pending);if(j.post)sps(x=>[j.post,...x.filter(v=>v.id!==j.post.id)]);sok('збережено')}
})
};
const mm=(u,act)=>{
if(!ow||!fx.moderation||Number(u.id)===Number(cg.owner_id))return;
if(act==='kick'&&!window.confirm('вилучити з пабліку'))return;
const id=ci;lk('um',async()=>{
const j=await aj('/api/pabliks/members','POST',{cid:id,uid:Number(u.id),act});
if(!j?.community||Number(j.community.id)!==id||!j.ok||Number(j.uid)!==Number(u.id))throw Error('невірна відповідь сервера');
if(lv.current&&cr.current===id){mr.current++;sml(false);ug(j.community);sms(x=>act==='kick'?x.filter(v=>v.id!==u.id):x.map(v=>v.id===u.id?{...v,write_blocked:act==='block'}:v));sok('збережено')}
})
};
ue(()=>{if(!ci||!ow||!fx.suggestions)return;const ac=new AbortController(),rn=++srq.current;aj('/api/pabliks/suggestions?cid='+ci+'&count=1','GET',undefined,ac.signal).then(j=>{if(!Number.isSafeInteger(j?.pending)||j.pending<0)return;if(!ac.signal.aborted&&lv.current&&cr.current===ci&&srq.current===rn)sscn(j.pending)}).catch(()=>{});return()=>ac.abort()},[ci,ow,fx.suggestions,re]);

const manage=(act,pid=0,target=0)=>{if(!ow||!fx.extras)return;if(act==='transfer'&&!window.confirm('передати спільноту цьому учаснику?'))return;const id=ci;lk('manage'+id,async()=>{const j=await aj('/api/pabliks/manage','POST',{cid:id,pid,uid:target,act});if(!j?.ok||Number(j.community?.id)!==id)throw Error('невірна відповідь сервера');if(!lv.current||cr.current!==id)return;ug(j.community);sps(x=>x.map(p=>({...p,pinned:Number(p.id)===Number(j.community.pinned_post_id)})));if(act==='transfer'){sec(false);sei(null);ssgs2([]);sscn(0);stb('members');mb(id);sok('власність передано')}else sok('збережено')})};
const cgx=async d=>{const j=await aj('/api/pabliks','POST',d);ug(j);if(lv.current){scf(false);nv(j.id)}};
const sg=async d=>{const id=ci,j=await aj('/api/pabliks','PUT',{id,...d});ug(j);if(lv.current&&cr.current===id){sec(false);sok('збережено')}};
const dg=()=>{if(!window.confirm('Видалити спільноту та всі її дописи?'))return;const id=ci;lk('gd'+id,async()=>{await aj('/api/pabliks?id='+id,'DELETE');if(lv.current){sgs(x=>x.filter(g=>g.id!==id));if(cr.current===id)nv()}})};
const np=async d=>{const id=ci,j=await aj('/api/pabliks/posts','POST',{cid:id,...d});if(!ni(j?.id)||Number(j.cid)!==id)throw Error('невірна відповідь сервера');if(lv.current&&cr.current===id){sps(x=>[j,...x.filter(p=>p.id!==j.id)]);sok('опубліковано')}};
const ep=async d=>{const id=ci,pid=ei?.id;if(!pid)return;const j=await aj('/api/pabliks/posts','PUT',{id:pid,...d});if(Number(j?.id)!==pid||Number(j.cid)!==id)throw Error('невірна відповідь сервера');if(lv.current&&cr.current===id){sps(x=>x.map(p=>p.id===pid?j:p));sei(null);sok('збережено')}};
const dp=p=>{if(!window.confirm('Видалити допис?'))return;const id=ci;lk('pa'+p.id,async()=>{await aj('/api/pabliks/posts?id='+p.id,'DELETE');if(lv.current&&cr.current===id){sps(x=>x.filter(v=>v.id!==p.id));if(ei?.id===p.id)sei(null)}})};
const ac=uc(async(pid,act)=>{
if(!me){if(act!=='view')ser('увійди щоб взаємодіяти з дописами');return}
const id=cr.current,k=(act==='view'?'vw':'pa')+pid;if(br.current.has(k))return false;br.current.add(k);if(act!=='view')sbu(x=>[...x,k]);
try{const j=await aj('/api/pabliks/act','POST',{id:pid,act});if(Number(j?.id)!==pid||Number(j.cid)!==id)throw Error('невірна відповідь сервера');if(lv.current&&cr.current===id)sps(x=>x.map(p=>p.id===pid?(act==='view'?{...p,viewz:j.viewz}:j):p));return true}catch(e){if(act!=='view'&&lv.current&&cr.current===id)ser(e.message);return false}finally{br.current.delete(k);if(act!=='view'&&lv.current)sbu(x=>x.filter(v=>v!==k))}
},[me]);
ue(()=>{if(!me||!rr.current||typeof IntersectionObserver==='undefined')return;const ob=new IntersectionObserver(es=>{for(const e of es){if(!e.isIntersecting)continue;const id=Number(e.target.dataset.pid),ky=ci+':'+id;if(!id||vw.current.has(ky))continue;vw.current.add(ky);ac(id,'view').then(v=>{if(!v)vw.current.delete(ky)})}},{threshold:.5});rr.current.querySelectorAll('article[data-pid]').forEach(el=>ob.observe(el));return()=>ob.disconnect()},[ps,ci,me,ac,tb]);
const sh=async p=>{
const id=ci,u=window.location.origin+'/#/communities/'+id+'/post/'+p.id;
try{let cp=false;if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(u);cp=true}catch{}}if(!cp){const el=document.createElement('textarea');el.value=u;el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);try{el.select();cp=document.execCommand('copy')}finally{el.remove()}if(!cp)throw Error('не вдалося скопіювати посилання')}if(lv.current&&cr.current===id)sok('посилання скопійовано');if(me)await ac(p.id,'share')}catch(e){if(lv.current&&cr.current===id)ser(e.message)}
};
const qv=(q+' '+sq).trim().toLocaleLowerCase('uk');
const gl=gs.filter(g=>(!qv||[g.name,g.bio,g.owner_username].some(v=>String(v||'').toLocaleLowerCase('uk').includes(qv)))&&(fi!=='joined'||g.joined||Number(g.owner_id)===Number(me?.id))&&(fi!=='owned'||Number(g.owner_id)===Number(me?.id))&&(fi!=='free'||g.member_count<g.max_members)).sort((a,b)=>so==='az'?String(a.name).localeCompare(String(b.name),'uk'):so==='za'?String(b.name).localeCompare(String(a.name),'uk'):so==='members'?(b.member_count||0)-(a.member_count||0):so==='old'?new Date(a.created_at)-new Date(b.created_at):new Date(b.created_at)-new Date(a.created_at));
const pl=ps.filter(p=>!pq||[p.text,p.username,p.geo,p.as_community?p.community_name:''].some(v=>String(v||'').toLocaleLowerCase('uk').includes(pq.toLocaleLowerCase('uk')))).sort((a,b)=>{if(!!a.pinned!==!!b.pinned)return Number(!!b.pinned)-Number(!!a.pinned);if(fs==='likes'&&a.laiki!==b.laiki)return(b.laiki||0)-(a.laiki||0);if(fs==='dislikes'&&a.dislaiki!==b.dislaiki)return(b.dislaiki||0)-(a.dislaiki||0);if(fs==='reposts'&&a.reposts!==b.reposts)return(b.reposts||0)-(a.reposts||0);return po==='old'?new Date(a.created_at)-new Date(b.created_at):new Date(b.created_at)-new Date(a.created_at)});
const mu=ms.filter(u=>!mq||String(u.username||'').toLocaleLowerCase('uk').includes(mq.toLocaleLowerCase('uk')));
const rules=String(cg?.rules||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
return <main className={'qa'+(ci&&rules.length?' ql':'')} ref={rr} onClick={()=>srp(null)}><style>{st}</style><header className="ph"><h1 className="pt">спільноти</h1><p className="pd">знаходь своїх, створюй та спілкуйся</p></header><div className="qy"><div className="qz">
{er&&<div className="pe" role="alert">{er}<div className="rw" style={{marginTop:10}}><button type="button" className="bt" onClick={()=>sre(x=>x+1)}>спробувати ще</button><button type="button" className="bt" onClick={()=>ser('')}>закрити</button></div></div>}{ok&&!er&&<div className="ok" role="status" translate={cw?'no':undefined}>{ok}</div>}
{!ci?<><div className="rw" style={{marginBottom:16}}>{me?<button type="button" className="pb" onClick={()=>scf(v=>!v)}>{cf?'скасувати':'створити спільноту'}</button>:<a className="ln" href="#login">увійди щоб створити спільноту</a>}</div>{cf&&me&&<Ed gp fx={fx} on={cgx} off={()=>scf(false)} cap="нова спільнота" lab="створити"/>}<section className="pw"><div className="wa"><h2>{qv?'результати пошуку':'всі спільноти'}</h2><span className="nb">всього: {gl.length}</span></div><div className="wb"><input className="ip" value={sq} onChange={e=>ssq(e.target.value)} placeholder="пошук назви, опису, власника..."/><select className="sl" value={so} onChange={e=>sso(e.target.value)}><option value="new">спочатку нові</option><option value="old">спочатку старі</option><option value="members">найбільше учасників</option><option value="az">за алфавітом (А-Я)</option><option value="za">за алфавітом (Я-А)</option></select><select className="sl" value={fi} onChange={e=>sfi(e.target.value)}><option value="all">всі спільноти</option><option value="joined">мої спільноти</option><option value="owned">я власник</option><option value="free">є вільні місця</option></select></div></section>{ld?<div className="pk"><span className="dk"/><span>завантаження…</span></div>:!gl.length&&!er?<div className="pz">{qv||fi!=='all'?'нічого не знайдено.':'спільнот поки немає. створи першу!'}</div>:gl.map(g=><article className="pi" key={g.id}><div className="hd"><a className="hl ln" href={'#/communities/'+g.id}><img className="ga" src={g.photo||'/pictures/default_avatar.png'} alt=""/><div className="if"><span className="nm" translate="no">{g.name}</span><span className="dt">учасників: {g.member_count} / {g.max_members}</span></div></a><div className="hr">{Number(g.owner_id)===Number(me?.id)?<span className="ow">власник</span>:g.joined?<button className="bt" type="button" disabled={bu.includes('gm'+g.id)} onClick={()=>jm(g,'leave')}>вийти</button>:<button className="bt" type="button" disabled={!me||g.join_closed||g.member_count>=g.max_members||bu.includes('gm'+g.id)} onClick={()=>jm(g,'join')}>{g.join_closed?'вступ тимчасово закрито':g.member_count>=g.max_members?'місць немає':'вступити'}</button>}</div></div>{g.bio&&<div className="bo" translate="no"><Rn t={g.bio}/></div>}<div className="ge">власник: <a className="ln" href={'#user/'+encodeURIComponent(g.owner_username||'')} translate="no">@{g.owner_username}</a></div></article>)}</>:<><div className="rw" style={{marginBottom:16}}><a className="bt ln" href="#/communities">до спільнот</a></div>{dl?<div className="pk"><span className="dk"/><span>завантаження…</span></div>:cg&&<><section className="pc">{cg.banner&&<img className="bn" src={cg.banner} alt="" onClick={()=>sph(cg.banner)}/>}<div className="hd"><div className="hl"><img className="ga" src={cg.photo||'/pictures/default_avatar.png'} alt="" onClick={()=>{if(cg.photo)sph(cg.photo)}}/><div className="if"><h2 className="gn" translate="no">{cg.name}</h2><span className="dt">учасників: {cg.member_count} / {cg.max_members}</span></div></div></div>{cg.bio&&<div className="bo" translate="no"><Rn t={cg.bio}/></div>}<div className="ge">власник: <a className="ln" href={'#user/'+encodeURIComponent(cg.owner_username||'')} translate="no">@{cg.owner_username}</a></div><div className="rw" style={{marginTop:16}}>{ow?<><button className="bt" type="button" onClick={()=>sec(v=>!v)}>налаштування</button><button className="bt" type="button" disabled={bu.includes('gd'+ci)} onClick={dg}>видалити спільноту</button></>:jo?<button className="bt" type="button" disabled={bu.includes('gm'+ci)} onClick={()=>jm(cg,'leave')}>вийти зі спільноти</button>:<button className="pb" type="button" disabled={!me||cg.join_closed||cg.member_count>=cg.max_members||bu.includes('gm'+ci)} onClick={()=>jm(cg,'join')}>{cg.join_closed?'вступ тимчасово закрито':cg.member_count>=cg.max_members?'місць немає':'вступити'}</button>}<button className={'bt'+(tb==='posts'?' ar':'')} type="button" onClick={()=>stb('posts')}>дописи</button><button className={'bt'+(tb==='members'?' ar':'')} type="button" onClick={()=>{stb('members');mb(ci)}}>учасники</button>{ow&&<button className={'bt'+(tb==='suggestions'?' ar':'')} type="button" disabled={!fx.suggestions} onClick={()=>{stb('suggestions');qs(ci)}}>Пропоновки <span>({scn})</span></button>}{cs&&<button className={'bt'+(tb==='suggest'?' ar':'')} type="button" disabled={!fx.suggestions} onClick={()=>stb(v=>v==='suggest'?'posts':'suggest')}>Пропоновка</button>}</div>{!me&&<p className="pn"><a className="ln" href="#login">увійди щоб вступити до спільноти</a></p>}</section>
{ec&&ow&&<Ed key={'group-'+ci} gp fx={fx} iv={cg} on={sg} off={()=>sec(false)} cap="налаштування спільноти" lab="зберегти"/>}
{tb==='suggestions'&&ow?<><div className="rw" style={{marginBottom:16}}><button className="bt" type="button" disabled={sgl||!fx.suggestions} onClick={()=>qs(ci)}>оновити</button></div>{sgl?<div className="pk"><span className="dk"/>завантаження…</div>:!sgs2.length?<div className="pz">тут поки немає дописів.</div>:sgs2.map(p=><article className="pi" key={p.id}><div className="hd"><div className="hl"><a href={'#user/'+encodeURIComponent(p.username)}><Av u={p}/></a><div className="if"><div className="au"><a className="nm" href={'#user/'+encodeURIComponent(p.username)} translate="no">{p.username||'невідомий'}</a><Galochki galka={p.galka}/></div><MxCoauthor u={p.coauthor}/><time className="dt" dateTime={p.created_at}>{fm(p.created_at)}</time></div></div></div><div className="bo" translate="no"><Rn t={p.text||''}/></div>{p.geo&&<div className="ge">Локація:: <span translate="no">{p.geo}</span></div>}{Array.isArray(p.pics)&&p.pics.length>0&&<div className="pm">{p.pics.filter(u=>typeof u==='string'&&u.startsWith('/uploads/')).map((u,i)=><img key={u+i} className="im" src={u} alt="" onClick={()=>sph(u)}/>)}</div>}{p.gif&&<img className="pg" src={p.gif} alt=""/>}<div className="rw" style={{marginTop:14}}><button type="button" className="pb qt" disabled={bu.includes('sg')} onClick={()=>ds(p,'accept')}>прийняти</button><button type="button" className="pb qt" disabled={bu.includes('sg')} onClick={()=>ds(p,'reject')}>відхилити</button></div></article>)}</>:tb==='suggest'&&cs?<Ed key={'suggest-'+ci} cap="Пропоновка" lab="Пропоновка" on={ns} off={()=>stb('posts')}/>:tb==='members'?<><div className="wb" style={{marginBottom:16}}><input className="ip" value={mq} onChange={e=>smq(e.target.value)} placeholder="пошук учасників..."/><button type="button" className="bt" disabled={ml} onClick={()=>mb(ci)}>оновити</button></div>{ml?<div className="pk"><span className="dk"/>завантаження…</div>:!mu.length?<div className="pz">нікого не знайдено.</div>:mu.map(u=><article className="pi" key={u.id}><div className="hd"><div className="hl"><a href={'#user/'+encodeURIComponent(u.username)}><Av u={{...u,avtor_id:u.id}} sz={50}/></a><div className="if"><div className="au"><a className="nm" href={'#user/'+encodeURIComponent(u.username)} translate="no">{u.username}</a><Galochki galka={u.galka}/></div><span className="dt">{fm(u.joined_at)}</span></div></div>{Number(u.id)===Number(cg.owner_id)?<span className="ow">власник</span>:ow&&<div className="rw qm"><a className="ln" href={'#/communities/'+ci} aria-disabled={!fx.extras||bu.includes('manage'+ci)} onClick={e=>{e.preventDefault();manage('transfer',0,Number(u.id))}}>передати власність</a><button type="button" className="pb qt" disabled={!fx.moderation||bu.includes('um')} onClick={()=>mm(u,'kick')}>вилучити з пабліку</button><button type="button" className="pb qt" disabled={!fx.moderation||bu.includes('um')} onClick={()=>mm(u,u.write_blocked?'unblock':'block')}>{u.write_blocked?'дозволити писати пости':'заборонити писати пости'}</button></div>}</div></article>)}</>:<>{cp?<Ed key={'new-'+ci} on={np} community={ow&&fx.extras}/>:wb?null:<div className="pc lg">{!me?<a className="ln" href="#login">увійди щоб публікувати дописи</a>:!jo?'вступи до спільноти щоб публікувати дописи':'публікувати може тільки власник'}</div>}<div className="pw"><div className="wa"><h2>{pq?'результати пошуку':'останні дописи'}</h2><span className="nb">всього: {pl.length}</span></div><div className="wb"><input className="ip" value={pq} onChange={e=>spq(e.target.value)} placeholder="пошукайте щось, може знайдете..."/><select className="sl" value={po} onChange={e=>spo(e.target.value)}><option value="new">від нових до старих</option><option value="old">від старих до нових</option></select><select className="sl" value={fs} onChange={e=>sfs(e.target.value)}><option value="">додаткове сортування</option><option value="likes">найбільше лайків</option><option value="dislikes">найбільше дизлайків</option><option value="reposts">найбільше репостів</option></select></div></div>{!pl.length?<div className="pz">{pq?'нічого не знайдено.':'тут поки немає дописів.'}</div>:pl.map(p=><article className="pi" id={'pablik-post-'+p.id} data-pid={p.id} key={p.id}>{p.pinned&&<div className="ow">закріплений пост</div>}<div className="hd"><div className="hl"><a href={p.as_community?'#/communities/'+p.cid:'#user/'+encodeURIComponent(p.username)}><Av u={p.as_community?{photo:p.community_photo,frame:'',avtor_id:0}:p}/></a><div className="if"><div className="au"><a className="nm" href={p.as_community?'#/communities/'+p.cid:'#user/'+encodeURIComponent(p.username)} translate="no">{(p.as_community?p.community_name:p.username)||'невідомий'}</a>{!p.as_community&&<Galochki galka={p.galka}/>}</div><MxCoauthor u={p.coauthor}/><div className="dt"><time dateTime={p.created_at}>{fm(p.created_at)}</time>{p.zredagovano&&<span>ред. {fm(p.zkoli)}</span>}</div></div></div>{me&&(p.as_community?ow:ow||Number(me.id)===Number(p.avtor_id))&&<div className="hr">{ow&&fx.extras&&<a className="ln" href={'#/communities/'+ci+'/post/'+p.id} aria-disabled={bu.includes('manage'+ci)} onClick={e=>{e.preventDefault();manage(p.pinned?'unpin':'pin',Number(p.id))}}>{p.pinned?'відкріпити пост':'закріпити пост'}</a>}{(p.as_community?ow:Number(me.id)===Number(p.avtor_id))&&!wb&&<button type="button" className="bt" onClick={()=>sei(p)}>ред</button>}<button type="button" className="bt" disabled={bu.includes('pa'+p.id)} onClick={()=>dp(p)}>вид</button></div>}</div>{ei?.id===p.id?<Ed key={'edit-'+p.id} iv={ei} on={ep} off={()=>sei(null)} cap="редагування допису" lab="зберегти"/>:<><div className="bo" translate="no"><Rn t={p.text||''}/></div>{p.geo&&<div className="ge">Локація:: <span translate="no">{p.geo}</span></div>}{Array.isArray(p.pics)&&p.pics.length>0&&<div className="pm">{p.pics.filter(u=>typeof u==='string'&&u.startsWith('/uploads/')).map((u,i)=><img key={u+i} className="im" src={u} alt="" onClick={()=>sph(u)}/>)}</div>}{p.gif&&<img className="pg" src={p.gif} alt=""/>}</>}
<div className="ft">
<button type="button" className={`fb${p.my_r===1?' ac':''}`} disabled={bu.includes('pa'+p.id)} onClick={()=>ac(p.id,'like')}><svg viewBox="0 0 24 24" width="16" height="16" fill={p.my_r===1?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>{p.laiki||0}</button><button type="button" className={`fb${p.my_r===-1?' ad':''}`} disabled={bu.includes('pa'+p.id)} onClick={()=>ac(p.id,'dislike')}><svg viewBox="0 0 24 24" width="16" height="16" fill={p.my_r===-1?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09L10 9l4 3-2 5 1.5-4-3.5-2.5 2-4.41C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>{p.dislaiki||0}</button>
<div className="rx" onMouseEnter={()=>srp(p.id)} onMouseLeave={()=>srp(null)}><button type="button" className={'fb'+(p.my_rp?' ar':'')} disabled={bu.includes('pa'+p.id)} aria-expanded={rp===p.id} onFocus={()=>srp(p.id)} onBlur={e=>{if(!e.currentTarget.parentElement.contains(e.relatedTarget))srp(null)}} onTouchStart={e=>{e.stopPropagation();clearTimeout(tm.current);lp.current=false;tm.current=setTimeout(()=>{lp.current=true;srp(p.id)},400)}} onTouchEnd={()=>clearTimeout(tm.current)} onTouchCancel={()=>{clearTimeout(tm.current);lp.current=false}} onClick={e=>{e.stopPropagation();if(!lp.current)ac(p.id,'repost');lp.current=false}}>репост {p.reposts||0}</button>{rp===p.id&&<div className="rp" onClick={e=>e.stopPropagation()}>{Array.isArray(p.rp_users)&&p.rp_users.length?p.rp_users.map(u=><div className="au" key={u.id??u.username}><a className="ln" href={'#user/'+encodeURIComponent(u.username)} translate="no">@{u.username}</a><Galochki galka={u.galka}/></div>):'немає репостів'}</div>}</div><button type="button" className="fb" disabled={bu.includes('pa'+p.id)} onClick={()=>sh(p)}>поділитися {p.shared||0}</button><span className="fb" style={{cursor:'default',marginLeft:'auto'}}>пер. {p.viewz||0}</span>
</div>

</article>)}</>}
</>}
</>}
</div>{ci&&rules.length>0&&<aside className="qr"><h2>правила</h2><ol translate="no">{rules.map((v,i)=><li key={i}><Rn t={v}/></li>)}</ol></aside>}</div><Photka src={ph} onClose={()=>sph('')}/></main>
}

