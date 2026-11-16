import{useEffect as ue}from'react';
const st=`
.pvk{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(48,43,37,.72);backdrop-filter:blur(3px);box-sizing:border-box}
.pvk-box{width:min(900px,100%);max-height:90vh;display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(46,140,70,.2);border-radius:18px;background:#fbfcf8}
.pvk-bar{height:48px;flex:0 0 48px;display:flex;align-items:center;justify-content:space-between;padding:0 12px 0 16px;color:#302b25;font:600 13px system-ui,sans-serif;background:rgba(255,255,255,.9);border-bottom:1px solid #e2e4d8;box-sizing:border-box}
.pvk-title{display:flex;align-items:center;gap:9px;min-width:0}
.pvk-dot{width:8px;height:8px;border-radius:50%;background:#39834b;flex:none}
.pvk-close{width:36px;height:36px;border:1px solid #d0d4c0;border-radius:10px;background:#fff;color:#39834b;font:400 24px/1 system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:none}
.pvk-close:hover{background:#eef0e0;border-color:#63a86c}
.pvk-img{display:block;width:100%;height:auto;max-height:calc(90vh - 48px);object-fit:contain;background:#e2e4d8}
@media(max-width:600px){.pvk{padding:16px;background:rgba(48,43,37,.72);backdrop-filter:blur(2px)}.pvk-box{width:100%;max-height:84vh;max-height:84dvh;border-radius:17px}.pvk-bar{height:48px;flex-basis:48px;padding:0 12px 0 15px;background:#fbfcf8;font-size:14px}.pvk-close{width:42px;height:42px;border-radius:12px;background:#f1f3e9;font-size:26px}.pvk-img{max-height:calc(84vh - 48px);max-height:calc(84dvh - 48px);background:#fbfcf8}}
@media(max-width:360px){.pvk{padding:12px}.pvk-box{max-height:88vh;max-height:88dvh}.pvk-img{max-height:calc(88vh - 48px);max-height:calc(88dvh - 48px)}}
`;
export default function Photka({src,onClose}){
ue(()=>{if(!src)return;const ov=document.body.style.overflow;document.body.style.overflow='hidden';const ky=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',ky);return()=>{document.body.style.overflow=ov;window.removeEventListener('keydown',ky)}},[src,onClose]);
if(!src)return null;
return <><style>{st}</style><div className="pvk" role="dialog" aria-modal="true" aria-label="перегляд фотографії" onClick={onClose}><div className="pvk-box" onClick={e=>e.stopPropagation()}><div className="pvk-bar"><span className="pvk-title"></span><button type="button" className="pvk-close" onClick={onClose} aria-label="закрити">×</button></div><img className="pvk-img" src={src} alt="фотографія" draggable="false"/></div></div></>;
}
