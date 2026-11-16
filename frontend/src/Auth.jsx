import{useState as us,useEffect as ue,useRef as ur}from'react';
const st=`
.au{width:min(420px,calc(100% - 32px));margin:120px auto 60px;font-family:system-ui,sans-serif;color:#302b25}
.ab{border:1px solid rgba(46,140,70,.2);border-radius:22px;background:rgba(255,255,255,.82);backdrop-filter:blur(14px);padding:28px 24px}
.at{margin:0 0 6px;font-size:clamp(22px,4vw,28px);font-weight:750;letter-spacing:-.8px}
.ad{margin:0 0 22px;color:#777064;font-size:13px;line-height:1.5}
.af{display:flex;flex-direction:column;gap:14px}
.al{display:flex;flex-direction:column;gap:5px}
.al span{font-size:12px;font-weight:650;color:#4e6348}
.ai{height:42px;padding:0 14px;border:1px solid #e2e4d8;border-radius:12px;background:rgba(250,250,245,.9);color:#302b25;font:inherit;font-size:14px;outline:none;transition:border-color .2s}
.ai:focus{border-color:#63a86c}
.ai::placeholder{color:#a19b8e}
.as{height:42px;padding:0 14px;border:1px solid #e2e4d8;border-radius:12px;background:rgba(250,250,245,.9);color:#302b25;font:inherit;font-size:14px;outline:none;cursor:pointer}
.as:focus{border-color:#63a86c}
.ab2{min-height:43px;padding:0 21px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background-image:url('/pictures/button.png');background-position:center;background-size:cover;background-repeat:no-repeat;color:white;font:600 13px system-ui,sans-serif;cursor:pointer;transition:filter .2s;margin-top:4px}
.ab2:hover:not(:disabled){filter:brightness(1.07)}
.ab2:disabled{opacity:.5;cursor:not-allowed}
.ae{padding:12px 14px;border:1px solid #e8b7a8;border-radius:11px;background:#fff5f1;color:#99442e;font-size:13px;line-height:1.5}
.ao{padding:12px 14px;border:1px solid #b7d8bc;border-radius:11px;background:#f2faf3;color:#39834b;font-size:13px;line-height:1.5}
.as2{font-size:13px;color:#777064;text-align:center;margin-top:16px}
.as2 a{color:#39834b;font-weight:600;cursor:pointer;text-decoration:underline}
.ap{font-size:12px;color:#39834b;font-weight:600;cursor:pointer;text-decoration:underline;align-self:flex-start;margin-top:2px}
@media(max-width:600px){.au{margin:90px auto 40px}.ab{padding:22px 18px;border-radius:18px}}
`;
function Auth(){
const[mo,sm]=us('in');
const[lg,sl]=us('');
const[un,su]=us('');
const[po,so]=us('');
const[pw,sp]=us('');
const[gn,sg]=us('');
const[vc,sv]=us('');
const[er,se]=us('');
const[ok,sok]=us('');
const[ld,sd]=us(false);
const[sp2,ssp2]=us(false);
const[ch,sch]=us(''),[acode,sacode]=us(''),[due,sdue]=us(0),[clock,sclock]=us(Date.now());const ab=ur(false);
ue(()=>{if(mo!=='2f')return;const timer=setInterval(()=>sclock(Date.now()),1000);return()=>clearInterval(timer)},[mo]);
const hi=async e=>{
e.preventDefault();
se('');sok('');
if(ld||ab.current)return;
ab.current=true;sd(true);
try{
const r=await fetch('/api/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:lg,passw:pw})});
const j=await r.json().catch(()=>null);
if(!r.ok)throw Error(j?.error||'помилка');
if(j?.requires_2fa===true){if(typeof j.challenge!=='string'||j.challenge.length!==43)throw Error('невірна відповідь сервера');sch(j.challenge);sacode('');sdue(Date.now()+(j.retry_after||60)*1000);sclock(Date.now());sm('2f');sok('код відправлено на '+j.email);sp('');return}
if(j?.ok!==true||!Number.isSafeInteger(j.id))throw Error('невірна відповідь сервера');
window.location.hash='#feed';
window.location.reload();
}catch(e){se(e.message)}finally{ab.current=false;sd(false)}
};
const hr=async e=>{
e.preventDefault();
se('');sok('');
if(ld||ab.current)return;
ab.current=true;sd(true);
try{
const r=await fetch('/api/reg',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({un:un,poshta:po,passw:pw,gender:gn})});
const j=await r.json().catch(()=>null);
if(!r.ok)throw Error(j?.error||'помилка');
sm('vf');
sok('код відправлено на '+po);
}catch(e){se(e.message)}finally{ab.current=false;sd(false)}
};
const hv=async e=>{
e.preventDefault();
se('');
if(ld||ab.current)return;
ab.current=true;sd(true);
try{
const r=await fetch('/api/ver',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({un:un,vc:vc})});
const j=await r.json().catch(()=>null);
if(!r.ok)throw Error(j?.error||'невірний код');
sm('in');
sok('пошту підтверджено - тепер увійди');
}catch(e){se(e.message)}finally{ab.current=false;sd(false)}
};
const av=async e=>{
e.preventDefault();if(ld||ab.current)return;ab.current=true;sd(true);se('');
try{const r=await fetch('/api/auth/code',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({challenge:ch,code:acode})});const j=await r.json().catch(()=>null);if(!r.ok)throw Error(j?.error||'невірний код');if(j?.ok!==true||j.action!=='login')throw Error('невірна відповідь сервера');window.location.hash='#feed';window.location.reload()}catch(e){se(e.message)}finally{ab.current=false;sd(false)}
};
const ar=async()=>{
if(ld||ab.current||Date.now()<due)return;ab.current=true;sd(true);se('');
try{const r=await fetch('/api/auth/resend',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({challenge:ch})});const j=await r.json().catch(()=>null);if(!r.ok)throw Error(j?.error||'помилка');sdue(Date.now()+(j.retry_after||60)*1000);sclock(Date.now());sacode('');sok('код відправлено на '+j.email)}catch(e){se(e.message)}finally{ab.current=false;sd(false)}
};
return <main className="au"><style>{st}</style><div className="ab">{mo==='in'?<><h1 className="at">вхід</h1><p className="ad">увійди в свій акаунт</p><form className="af" onSubmit={hi}>{ok&&<div className="ao">{ok}</div>}{er&&<div className="ae">{er}</div>}<label className="al"><span>пошта або юзернейм</span><input className="ai" type="text" value={lg} onChange={e=>sl(e.target.value)} placeholder="loh13513 або zelensky@ukr.net" required/></label><label className="al"><span>пароль</span><input className="ai" type={sp2?'text':'password'} value={pw} onChange={e=>sp(e.target.value)} placeholder="......" required/></label><a className="ap" onClick={()=>ssp2(!sp2)}>{sp2?'сховати пароль':'показати пароль'}</a><button className="ab2" type="submit" disabled={ld}>{ld?'входимо…':'увійти'}</button></form><p className="as2">немає акаунту? <a onClick={()=>{sm('up');se('');sok('')}}>зареєструйся</a></p></>:mo==='2f'?<><h1 className="at">2fa</h1><p className="ad">введи код з листа, він діє 5 хвилин</p>{ok&&<div className="ao" role="status">{ok}</div>}<form className="af" onSubmit={av}>{er&&<div className="ae" role="alert">{er}</div>}<label className="al"><span>код з пошти</span><input className="ai" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" value={acode} onChange={e=>sacode(e.target.value.replace(/[^0-9]/g,''))} placeholder="000000" maxLength={6} disabled={ld} required/></label><button className="ab2" type="submit" disabled={ld||acode.length!==6}>{ld?'перевіряємо…':'увійти'}</button><button className="ap" style={{border:0,background:'none',padding:0}} type="button" disabled={ld||clock<due} onClick={ar}>надіслати ще раз{clock<due&&<span translate="no"> ({Math.max(0,Math.ceil((due-clock)/1000))})</span>}</button><button className="ap" style={{border:0,background:'none',padding:0}} type="button" disabled={ld} onClick={()=>{sm('in');sch('');sacode('');se('');sok('')}}>назад</button></form></>:mo==='up'?<><h1 className="at">реєстрація</h1><p className="ad">створи свій акаунт мрії</p><form className="af" onSubmit={hr}>{er&&<div className="ae">{er}</div>}<label className="al"><span>юзернейм</span><input className="ai" type="text" value={un} onChange={e=>su(e.target.value)} placeholder="mriynyak" minLength={2} maxLength={30} required/></label><label className="al"><span>пошта</span><input className="ai" type="email" value={po} onChange={e=>so(e.target.value)} placeholder="zelensky@ukr.net" required/></label><label className="al"><span>пароль</span><input className="ai" type={sp2?'text':'password'} value={pw} onChange={e=>sp(e.target.value)} placeholder="......" minLength={6} required/></label><a className="ap" onClick={()=>ssp2(!sp2)}>{sp2?'сховати пароль':'показати пароль'}</a><label className="al"><span>гендер</span><select className="as" value={gn} onChange={e=>sg(e.target.value)} required><option value="">обери…</option><option value="чоловік">чоловік</option><option value="жінка">жінка</option><option value="інше">інше (???)</option></select></label><button className="ab2" type="submit" disabled={ld}>{ld?'реєструємо…':'зареєструватись'}</button></form><p className="as2">вже є акаунт? <a onClick={()=>{sm('in');se('')}}>увійди</a></p></>:<><h1 className="at">підтвердження</h1><p className="ad">введи код з листа, він діє 5 хвилин</p>{ok&&<div className="ao">{ok}</div>}<form className="af" onSubmit={hv}>{er&&<div className="ae">{er}</div>}<label className="al"><span>код з пошти</span><input className="ai" type="text" value={vc} onChange={e=>sv(e.target.value)} placeholder="000000" maxLength={6} required/></label><button className="ab2" type="submit" disabled={ld}>{ld?'перевіряємо…':'підтвердити'}</button></form><p className="as2">код не прийшов? <a onClick={hr}>надіслати ще раз</a></p><p className="as2"><a onClick={()=>{sm('in');se('');sok('')}}>увійди</a></p></>}</div></main>;
}
export default Auth;
