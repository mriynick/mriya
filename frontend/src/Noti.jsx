import{useState as us,useEffect as ue,useCallback as uc}from'react'
const Noti=()=>{
const[nt,sn]=us([])
const[ld,sl]=us(1)
const gt=uc(async()=>{try{const r=await fetch('/api/noti');const d=await r.json();sn(Array.isArray(d)?d:[])}catch(e){sn([])}finally{sl(0)}},[])
ue(()=>{gt()},[gt])
const rd=async()=>{await fetch('/api/noti/rd',{method:'POST'});gt()}
const cl=async()=>{await fetch('/api/noti/cl',{method:'POST'});sn([])}
return<div className="np">
<style>{`.np{max-width:600px;margin:0 auto;padding:16px 8px;color:#eee;font-family:sans-serif}.nh{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.nh h2{margin:0;font-size:18px;font-weight:400;text-transform:lowercase}.nb{display:flex;gap:8px}.nb button{background:#1a1a1a;border:1px solid #333;color:#aaa;padding:4px 12px;cursor:pointer;border-radius:2px;font-size:12px}.nb button:hover{border-color:#555;color:#eee}.ni{display:flex;align-items:center;gap:12px;padding:10px;border-bottom:1px solid #222;text-decoration:none;color:inherit}.ni:hover{background:#161616}.ni.ur{border-left:2px solid #777}.na{width:36px;height:36px;border-radius:50%;object-fit:cover;background:#222;flex-shrink:0}.nc{flex:1;min-width:0;overflow:hidden}.nt{font-size:14px;line-height:1.3;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nu{font-weight:600;color:#fff;margin-right:4px}.nd{font-size:11px;color:#555;margin-top:2px}.em{padding:24px;text-align:center;color:#555;font-size:14px}`}</style>
<div className="nh"><h2>сповіщення</h2><div className="nb"><button onClick={rd}>прочитано</button><button onClick={cl}>очистити</button></div></div>
{ld?<div className="em">...</div>:(nt.length===0)?<div className="em">порожньо</div>:nt.map(n=>{const t=n.typ||'';const h=t==='fl_like'?'#':n.pid?'/p/'+n.pid:'#';const tx=t==='fl_like'?'вподобав гру':(t==='like'?'вподобав допис':(t==='dislike'?'дизлайкнув допис':(t==='repost'?'поширив допис':(t==='share'?'поділився дописом':'активність'))));return<a key={n.id||Math.random()} href={h} className={'ni '+(n.rd?'':'ur')}><img className="na" src={n.ph||''} alt="" onError={e=>{e.target.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2236%22 height=%2236%22 viewBox=%220 0 24 24%22 fill=%22%23333%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22/%3E%3Cpath d=%22M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z%22/%3E%3C/svg%3E'}} /><div className="nc"><div className="nt"><span className="nu">{n.un||'хтось'}</span> {tx}</div>{n.ptx?<div className="nd">«{n.ptx}»</div>:null}<div className="nd">{n.ca?new Date(n.ca).toLocaleString('uk-UA',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}</div></div></a>})}
</div>}
export default Noti
