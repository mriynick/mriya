import{useState as us,useEffect as ue,useLayoutEffect as ul,useRef as ur,useId as ui}from'react';
import{createPortal}from'react-dom';

export default function Galochki({galka,size=14,as='button'}){
const pic=typeof galka?.pic==='string'?galka.pic:'';
const label=typeof galka?.label==='string'&&galka.label.trim()?galka.label:'Верифікований користувач';
const valid=!!pic&&!/[\\/\u0000-\u001f\u007f]/.test(pic)&&pic!=='.'&&pic!=='..';
const px=Number.isFinite(size)?Math.max(8,Math.min(64,size)):14;
const[open,so]=us(false);
const[failed,sf]=us('');
const[pos,sp]=us({left:0,top:0});
const anchor=ur(null);
const panel=ur(null);
const timer=ur(null);
const id=ui();
const Tag=as==='span'?'span':'button';
const show=()=>{clearTimeout(timer.current);so(true)};
const hide=()=>{clearTimeout(timer.current);timer.current=setTimeout(()=>so(false),120)};
ue(()=>{so(false);clearTimeout(timer.current)},[pic,label]);
ue(()=>()=>clearTimeout(timer.current),[]);
ul(()=>{
if(!open||!valid||failed===pic||!anchor.current||!panel.current)return;
const a=anchor.current.getBoundingClientRect();
const p=panel.current.getBoundingClientRect();
const w=document.documentElement.clientWidth;
const h=document.documentElement.clientHeight;
const left=Math.max(8,Math.min(a.left+a.width/2-p.width/2,w-p.width-8));
const above=a.top-p.height-6;
const top=Math.max(8,Math.min(above>=8?above:a.bottom+6,h-p.height-8));
sp({left,top});
},[open,pic,label,px,valid,failed]);
ue(()=>{
if(!open)return;
const close=()=>{clearTimeout(timer.current);so(false)};
const outside=e=>{if(!anchor.current?.contains(e.target)&&!panel.current?.contains(e.target))close()};
const scroll=e=>{if(e.target===window||e.target===document||!panel.current?.contains(e.target))close()};
const key=e=>{if(e.key==='Escape')close()};
document.addEventListener('pointerdown',outside,true);
document.addEventListener('keydown',key);
window.addEventListener('scroll',scroll,true);
window.addEventListener('resize',close);
return()=>{
document.removeEventListener('pointerdown',outside,true);
document.removeEventListener('keydown',key);
window.removeEventListener('scroll',scroll,true);
window.removeEventListener('resize',close);
};
},[open]);
if(!valid||failed===pic)return null;
return <>
<Tag ref={anchor} className="galki-trigger" type={Tag==='button'?'button':undefined} role={Tag==='span'?'img':undefined} translate="no" aria-label={label} aria-expanded={Tag==='button'?open:undefined} aria-controls={open?id:undefined} onMouseEnter={show} onMouseLeave={()=>{if(document.activeElement!==anchor.current)hide()}} onFocus={show} onBlur={hide} onPointerDown={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){clearTimeout(timer.current);so(false)}}} onClick={e=>{e.preventDefault();e.stopPropagation();show()}} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,width:px,height:px,padding:0,margin:0,border:0,borderRadius:0,background:'transparent',boxShadow:'none',verticalAlign:'middle',lineHeight:0,cursor:'help',transition:'none',animation:'none'}}>
<img src={'/galki/'+encodeURIComponent(pic)} alt="" width={px} height={px} draggable={false} onError={()=>{sf(pic);so(false)}} style={{display:'block',width:px,height:px,objectFit:'contain',border:0,pointerEvents:'none',userSelect:'none'}}/>
</Tag>
{open&&typeof document!=='undefined'&&createPortal(<div ref={panel} id={id} className="galki-panel" role="tooltip" translate="no" dir="auto" onMouseEnter={show} onMouseLeave={hide} onClick={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()} style={{position:'fixed',left:pos.left,top:pos.top,zIndex:10050,boxSizing:'border-box',width:'max-content',minWidth:'min(110px,calc(100vw - 16px))',maxWidth:'min(280px,calc(100vw - 16px))',maxHeight:'min(160px,calc(100vh - 16px))',overflowY:'auto',padding:'8px 10px',background:'#fff',border:'1px solid #d0d4c0',borderRadius:8,color:'#302b25',font:'400 12px/1.5 system-ui,sans-serif',textAlign:'start',whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{label}</div>,document.body)}
</>;
}
