import{useState as us,useEffect as ue}from'react'
import Galochki from'./Galochki';

const st=`
.f-bg{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:#fbfcf8;z-index:-1}
.f-ps{width:min(760px,calc(100% - 32px));margin:0 auto;padding:76px 0 150px;font-family:system-ui,sans-serif;color:#302b25;position:relative;z-index:1}
.f-pc{border:1px solid rgba(46,140,70,.2);border-radius:22px;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);margin-bottom:10px;padding:24px}
.f-pb{min-height:38px;padding:0 20px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background-image:url('/pictures/button.png');background-position:center;background-size:cover;color:white;font:600 13px system-ui;cursor:pointer;transition:filter .2s;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap}
.f-pb:hover:not(:disabled){filter:brightness(1.07)}
.f-pb:disabled{opacity:.5;cursor:not-allowed}
.f-fx{width:100%;height:38px;padding:0 12px;border:1px solid #d0d4c0;border-radius:10px;font:inherit;font-size:14px;outline:none;box-sizing:border-box;background:rgba(255,255,255,.86)}
.f-fx:focus{border-color:#39834b}
.f-ig{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:16px}
.f-igi{background:rgba(255,255,255,.6);padding:14px;border-radius:14px;border:1px solid #e2e4d8;display:flex;flex-direction:column;gap:10px}
.f-ti{font-size:20px;font-weight:800;margin:0 0 16px;color:#302b25;letter-spacing:-.5px}
.f-gn{font-size:18px;font-weight:700;color:#39834b;cursor:pointer;margin:0;word-break:break-word;text-decoration:none;border:0;background:0;padding:0;font-family:inherit;text-align:left}
.f-gn:hover{text-decoration:underline}
.f-gu{display:flex;align-items:center;gap:8px;font-size:13px;color:#4e6348;font-weight:600}
.f-ga{width:24px;height:24px;border-radius:50%;object-fit:cover;background:#e2e4d8}
.f-er{color:#ff4757;font-size:13px;font-weight:600;margin-bottom:10px}
@media(max-width:600px){
.f-ps{width:calc(100% - 24px);padding:68px 0 36px}
.f-pc{border-radius:20px;padding:18px}
.f-pb{width:100%;min-height:42px;border-radius:13px}
.f-ig{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.f-igi{padding:11px;border-radius:13px}
.f-fx{height:40px;font-size:13px;padding:0 8px}
.f-ti{font-size:18px}
.f-gn{font-size:16px}
}
`

function op(na,fl){
const u=fl.startsWith('http')||fl.startsWith('//')?fl:(window.location.origin+(fl.startsWith('/')?fl:'/'+fl))
const t=String(na||'flash').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const src=JSON.stringify(u)
const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+t+'</title><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}#g{width:100%;height:100%;display:block}</style></head><body><div id="g"></div><script src="https://unpkg.com/@ruffle-rs/ruffle"><\/script><script>window.RufflePlayer=window.RufflePlayer||{};window.RufflePlayer.config={autoplay:"on",unmuteOverlay:"hidden",letterbox:"on",allowScriptAccess:false,allowNetworking:"none"};function go(){try{var r=window.RufflePlayer.newest();var p=r.createPlayer();p.style.width="100%";p.style.height="100%";document.getElementById("g").appendChild(p);p.load('+src+');}catch(e){document.body.innerText=String(e)}}if(window.RufflePlayer&&window.RufflePlayer.newest){go()}else{window.addEventListener("load",go)}<\/script></body></html>'
const bl=new Blob([html],{type:'text/html'})
const url=URL.createObjectURL(bl)
const w=window.open(url,'_blank','width=960,height=720,menubar=no,toolbar=no,location=no,status=no,scrollbars=no,resizable=yes')
if(!w)alert('дозвольте спливаючі вікна')
setTimeout(()=>URL.revokeObjectURL(url),60000)
}

export default function Flash(){
const[ls,sl]=us([])
const[na,sn]=us('')
const[fl,sf]=us(null)
const[er,se]=us('')
const[up,sup]=us(false)

const gf=async()=>{
try{
const r=await fetch('/api/flash',{credentials:'include'})
if(r.ok)sl(await r.json())
}catch(e){}
}
ue(()=>{gf()},[])

const uld=async(e)=>{
e.preventDefault()
se('')
if(!fl||!na)return se('заповніть всі поля')
if(!fl.name.toLowerCase().endsWith('.swf'))return se('тільки .swf файли')
sup(true)
try{
const rd=new FileReader()
rd.onload=async()=>{
try{
const b64=String(rd.result).split(',')[1]
const r=await fetch('/api/upload',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:fl.name,data:b64})})
if(!r.ok)throw new Error('помилка завантаження файлу')
const d=await r.json()
const r2=await fetch('/api/flash',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({na,fl:d.url})})
if(!r2.ok)throw new Error('помилка створення')
sn('')
sf(null)
se('')
e.target.reset()
gf()
}catch(err){se(err.message||'помилка')}
finally{sup(false)}
}
rd.onerror=()=>{se('помилка читання файлу');sup(false)}
rd.readAsDataURL(fl)
}catch(err){se(err.message||'помилка');sup(false)}
}

return(
<>
<style>{st}</style>
<div className="f-bg"/>
<main className="f-ps">
<div className="f-pc">
<h2 className="f-ti">опублікувати гру</h2>
{er?<div className="f-er">{er}</div>:null}
<form onSubmit={uld} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
<input className="f-fx" value={na} onChange={e=>sn(e.target.value)} placeholder="назва гри" disabled={up}/>
<input className="f-fx" type="file" accept=".swf,application/x-shockwave-flash" onChange={e=>sf(e.target.files&&e.target.files[0]?e.target.files[0]:null)} disabled={up} style={{paddingTop:'7px',background:'rgba(255,255,255,0.5)'}}/>
<button className="f-pb" type="submit" disabled={up||!na||!fl} style={{alignSelf:'flex-start'}}>{up?'завантаження...':'завантажити'}</button>
</form>
</div>
<div className="f-pc" style={{padding:'24px 18px'}}>
<h2 className="f-ti" style={{margin:'0 0 10px 6px'}}>всі ігри</h2>
{ls.length===0?<div style={{color:'#8b867b',padding:'0 6px',fontSize:'14px'}}>поки немає ігор</div>:
<div className="f-ig">
{ls.map(i=>(
<div key={i.id} className="f-igi">
<div className="f-gu">
<img className="f-ga" src={i.photo||'/pictures/default_avatar.png'} alt=""/>
<span style={{display:'inline-flex',alignItems:'center',gap:4,minWidth:0}}><span style={{minWidth:0,overflowWrap:'anywhere'}}>{i.username}</span><Galochki galka={i.galka}/></span>
</div>
<button type="button" className="f-gn" onClick={()=>op(i.na,i.fl)}>{i.na}</button>
</div>
))}
</div>}
</div>
</main>
</>
)
}
