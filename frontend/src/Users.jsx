import{useState as us,useEffect as ue,useMemo as um}from'react';
import{Rn}from'./Posts';
import Galochki from'./Galochki';

const st=`
.ps{width:min(760px,calc(100% - 32px));margin:0 auto;padding:104px 0 150px;font-family:system-ui,sans-serif;color:#302b25;position:relative;z-index:2}
.ph{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.pt{margin:0;font-size:clamp(27px,5vw,38px);font-weight:750;letter-spacing:-1.3px;color:#302b25}
.pd{margin:0;color:#777064;font-size:14px;line-height:1.6}
.pw{display:flex;flex-direction:column;gap:10px;margin:10px 0 15px}
.pwt{display:flex;align-items:center;justify-content:space-between;gap:12px}
.pw h2{margin:0;font-size:19px;font-weight:700}
.pn2{font-size:12px;color:#777064}
.pwb{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.pmi2{height:34px;padding:0 12px;border:1px solid #d0d4c0;border-radius:10px;background:#fff;font:inherit;font-size:13px;outline:none;flex:1;min-width:140px}
.pmi2:focus{border-color:#63a86c}
.tbs{height:34px;padding:0 8px;border:1px solid #d0d4c0;border-radius:10px;background:#fff;font:inherit;font-size:13px;outline:none;max-width:160px;cursor:pointer;flex-shrink:0}
.tbs:focus{border-color:#63a86c}
.pi{padding:18px 21px;border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.9);margin-bottom:12px;overflow-wrap:anywhere;backdrop-filter:blur(8px);display:flex;flex-direction:column;gap:10px;text-decoration:none}
.phd{display:flex;align-items:center;justify-content:space-between;gap:12px}
.phl{display:flex;align-items:center;gap:12px;min-width:0;flex:1}
.pav{width:50px;height:50px;border-radius:50%;object-fit:cover;background:#e2e4d8;flex-shrink:0;border:1px solid #d0d4c0}
.pif{display:flex;flex-direction:column;gap:2px;min-width:0}
.pnm{font-size:16px;font-weight:700;color:#302b25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gku-name{display:flex;align-items:center;gap:4px;min-width:0}
.gku-name>.pnm{min-width:0;flex:0 1 auto}
.ptm{font-size:13px;color:#8a857a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.on{font-size:12px;display:flex;align-items:center;gap:6px;white-space:nowrap;font-weight:600}
.og{color:#16a34a}
.or{color:#8a857a}
.dt{width:8px;height:8px;background:#16a34a;border-radius:50%;box-shadow:0 0 5px #16a34a;flex-shrink:0}
.pbo{font-size:13px;color:#39352f;line-height:1.5;margin:0;word-break:break-word}
.pge{font-size:12px;color:#4e6348;font-weight:600;display:flex;gap:10px;flex-wrap:wrap}
.pz{padding:34px 18px;text-align:center;border:1px dashed rgba(70,130,75,.3);border-radius:18px;background:rgba(255,255,255,.9);color:#817b70;font-size:14px;line-height:1.7;backdrop-filter:blur(8px)}
.pk{display:flex;justify-content:center;align-items:center;gap:10px;padding:26px;color:#777064;font-size:13px}
.pd3{width:7px;height:7px;border-radius:50%;background:#479657;animation:pp 1s ease-in-out infinite alternate}
@keyframes pp{to{opacity:.3;transform:scale(.7)}}
@media(max-width:600px){.ps{width:calc(100% - 16px);padding:74px 0 35px}.pi{padding:14px}.tbs{max-width:none;width:100%}.pwb{flex-direction:column;align-items:stretch}.pav{width:42px;height:42px}.pnm{font-size:15px}.on{font-size:11px}}

.users-avatar-wrap{display:block;position:relative;width:50px;height:50px;flex-shrink:0;isolation:isolate}
.users-avatar-wrap>.pav{display:block;position:relative;z-index:1;width:100%;height:100%;box-sizing:border-box}
.users-avatar-wrap>img.users-avatar-frame{position:absolute!important;inset:0!important;z-index:2!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;clip-path:none!important;object-fit:contain!important;pointer-events:none}
@media(max-width:600px){.users-avatar-wrap{width:42px;height:42px}}

`;

const userFrameCache=new Map();
function UserAvatar({u}){
const[f,sf]=us('');
ue(()=>{
let live=true;
sf('');
if(typeof u.frame==='string')return;
if(!u.id)return;
if(!userFrameCache.has(u.id))userFrameCache.set(u.id,fetch('/api/user?id='+encodeURIComponent(u.id),{credentials:'include'}).then(r=>r.ok?r.json():null).then(j=>j?.frame||'').catch(()=>''));
userFrameCache.get(u.id).then(v=>{if(live)sf(v)});
return()=>{live=false};
},[u.id,u.frame]);
const frame=typeof u.frame==='string'?u.frame:f;
return <span className="users-avatar-wrap"><img className="pav" src={u.ph||'/pictures/default_avatar.png'} alt=""/>{frame&&<img className="users-avatar-frame" src={'/frames/'+encodeURIComponent(frame)} alt=""/>}</span>;
}
export default function Users(){
const[ur,su]=us([]);const[ld,sl]=us(true);const[sq,ssq]=us('');const[s1,ss1]=us('active');const[s2,ss2]=us('all');const[s3,ss3]=us('all');

ue(()=>{
let lv=true;
const ldU=()=>{
fetch('/api/users').then(r=>r.ok?r.json():[]).then(d=>{if(lv){su(Array.isArray(d)?d:[]);sl(false)}}).catch(()=>{if(lv)sl(false)});
};
ldU();
const iv=setInterval(ldU,10000);
return()=>{lv=false;clearInterval(iv)};
},[]);

const go=l=>{
if(!l)return{t:'',o:false};
let d=new Date(l);
let m=Math.floor((new Date()-d)/60000);
if(m<5)return{t:'в мережі',o:true};
if(m<60)return{t:`був ${m} хв`,o:false};
let h=Math.floor(m/60);
if(h<24)return{t:`був ${h} год`,o:false};
let dy=Math.floor(h/24);
if(dy<30)return{t:`був ${dy} дн`,o:false};
return{t:`був ${d.toLocaleDateString('uk-UA')}`,o:false};
};

const fu=um(()=>{
let r=ur.filter(u=>{
const q=sq.toLowerCase();
const m=[u.un,u.st,u.bo,u.mi,u.kr,...['ideology','ideologies','religion','smoking','alcohol','relationship','mbti','enneagram','enneawing','enneasubtype','instinct','tritype','phobias','activity','films','series','books','quotes','school','university','work','kicq','openvk','discord','steam','phone','games'].flatMap(k=>Array.isArray(u[k])?u[k]:[u[k]])].some(v=>typeof v==='string'&&v.toLowerCase().includes(q));
if(!m)return false;
if(s2==='photo'&&!u.ph)return false;
if(s2==='bio'&&!u.bo)return false;

const g=(u.ge||'').toLowerCase().trim();
if(s3==='m'&&!g.startsWith('чолов'))return false;
if(s3==='w'&&!g.startsWith('жін'))return false;
if(s3==='o'&&(g.startsWith('чолов')||g.startsWith('жін')))return false;

return true;
});

r.sort((a,b)=>{
if(s1==='az')return(a.un||'').localeCompare(b.un||'');
if(s1==='za')return(b.un||'').localeCompare(a.un||'');
if(s1==='new'){
const ta=new Date(a.ra).getTime()||0;
const tb=new Date(b.ra).getTime()||0;
return tb-ta;
}
if(s1==='old'){
const ta=new Date(a.ra).getTime()||0;
const tb=new Date(b.ra).getTime()||0;
return ta-tb;
}
const ta=new Date(a.la).getTime()||0;
const tb=new Date(b.la).getTime()||0;
return tb-ta;
});
return r;
},[ur,sq,s1,s2,s3]);

return(
<main className="ps">
<style>{st}</style>
<header className="ph">
<h1 className="pt">користувачі</h1>
<p className="pd">знайди нових друзів та спілкуйся</p>
</header>
<div className="pw">
<div className="pwt">
<h2>{sq?'результати пошуку':'всі користувачі'}</h2>
<span className="pn2">всього: {fu.length}</span>
</div>
<div className="pwb">
<input className="pmi2" value={sq} onChange={e=>ssq(e.target.value)} placeholder="пошук ім'я, статус, місто, опис..." />
<select className="tbs" value={s1} onChange={e=>ss1(e.target.value)}>
<option value="active">спочатку активні</option>
<option value="new">спочатку нові</option>
<option value="old">спочатку старі</option>
<option value="az">за алфавітом (А-Я)</option>
<option value="za">за алфавітом (Я-А)</option>
</select>
<select className="tbs" value={s2} onChange={e=>ss2(e.target.value)}>
<option value="all">всі користувачі</option>
<option value="photo">з аватаром</option>
<option value="bio">з описом</option>
</select>
<select className="tbs" value={s3} onChange={e=>ss3(e.target.value)}>
<option value="all">всі статі</option>
<option value="m">чоловіки</option>
<option value="w">жінки</option>
<option value="o">інше</option>
</select>
</div>
</div>
{ld?(
<div className="pk"><span className="pd3"/><span>завантаження…</span></div>
):fu.length===0?(
<div className="pz">{sq?'нікого не знайдено.':'поки що тут пусто.'}</div>
):(
fu.map(u=>{
let{t,o}=go(u.la);
return(
<a key={u.id} href={`#user/${u.un}`} className="pi">
<div className="phd">
<div className="phl">
<UserAvatar u={u}/>
<div className="pif">
<span className="gku-name"><span className="pnm">{u.un||'невідомий'}</span><Galochki galka={u.galka} as="span"/></span>
<span className="ptm">{u.st||'без статусу'}</span>
</div>
</div>
<div className={`on ${o?'og':'or'}`}>
{o&&<span className="dt"></span>}
{t}
</div>
</div>
{u.bo&&<div className="pbo"><Rn t={u.bo}/></div>}
{(u.mi||u.kr)&&<div className="pge">{[u.mi,u.kr].filter(Boolean).join(', ')}</div>}
</a>
)
})
)}
</main>
);
}
