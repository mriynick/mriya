import Golovna from'./golovna';
import Music from'./music';
import Videos from'./videos';
import{useState as us,useEffect as ue}from'react';
import Posts from'./Posts';
import Cmt from'./comments';
import Pablik from'./Pablik';
import Storinka from'./Storinka';
import Auth from'./Auth';
import Header from'./Header';
import Flash from'./Flash';
import Users from'./Users';
import Noti from'./Noti';
import Footer from'./Footer';
import Saity from'./Saity';
import Hosting from'./hosting';
import Rules from'./Rules';
import Reports from'./reports';
import useAutoLang,{languages}from'./lang';

const gP=()=>{
const h=window.location.hash.replace(/^#/,'');
let p=(h||window.location.pathname||'/').replace(/\/+$/,'')||'/';
if(!p.startsWith('/'))p='/'+p;
if(/^\/comments\/\d+$/.test(p))return{rt:'cm',v:Number(p.split('/')[2])};
if(/^\/communities(?:\/\d+(?:\/post\/\d+)?)?$/.test(p))return{rt:'pb'};
if(p==='/')return{rt:'go'};
if(p==='/feed')return{rt:'f'};
if(p==='/login')return{rt:'l'};
if(p==='/me')return{rt:'m'};
if(p==='/music')return{rt:'mu'};
if(p==='/videos')return{rt:'vi',v:new URLSearchParams(window.location.search).get('video')||''};
if(p==='/flash')return{rt:'fl'};
if(p==='/users')return{rt:'us'};
if(p==='/noti'||p==='/notifications')return{rt:'nt'};
if(p==='/rules')return{rt:'ru'};
if(p==='/reports')return{rt:'rp'};
if(p==='/saity')return{rt:'st'};
if(p==='/hosting')return{rt:'hs'};
if(p.startsWith('/id/'))return{rt:'i',v:p.split('/id/')[1]};
if(p.startsWith('/user/')){const v=p.slice('/user/'.length);try{return{rt:'u',v:decodeURIComponent(v)}}catch{return{rt:'u',v}}}
return{rt:'f'};
};

export default function App(){
const{l,ch}=useAutoLang();
const[r,sr]=us(gP());

ue(()=>{
const h=()=>{sr(gP());window.scrollTo(0,0)};
window.addEventListener('popstate',h);
window.addEventListener('hashchange',h);
return()=>{
window.removeEventListener('popstate',h);
window.removeEventListener('hashchange',h);
};
},[]);

ue(()=>{
let switching=false;
const kd=e=>{
if(e.key!=='F2')return;
e.preventDefault();
e.stopImmediatePropagation();
if(e.repeat||switching)return;
switching=true;
try{
const stored=localStorage.getItem('m_lang')||'ua';
const current=stored==='uk'?'ua':stored;
const i=languages.indexOf(current);
if(!ch(languages[(i+1)%languages.length]))switching=false;
}catch{
switching=false;
}
};
window.addEventListener('keydown',kd,true);
return()=>window.removeEventListener('keydown',kd,true);
},[ch]);

return(
<div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
{!['m','i','u'].includes(r.rt)&&<style>{`html{min-height:100vh;background:#e7e4de url('/bg.png') center center/cover no-repeat fixed!important}html::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;box-shadow:inset 0 0 110px rgba(0,0,0,.52),inset 0 0 28px rgba(0,0,0,.24)}body{margin:0!important;background:transparent!important}#root{box-sizing:border-box!important;width:calc(100% - 32px)!important;max-width:1024px!important;margin:16px auto!important;padding:0!important;background:#fff!important;border:1px solid rgba(0,0,0,.2);border-radius:14px;box-shadow:0 20px 55px rgba(0,0,0,.38),0 6px 16px rgba(0,0,0,.28),0 1px 3px rgba(0,0,0,.3),inset 0 2px 1px rgba(255,255,255,.95),inset 0 -2px 3px rgba(0,0,0,.09)}#root>div{min-height:calc(100vh - 32px)!important}@media(max-width:600px){#root{width:calc(100% - 16px)!important;margin:8px auto!important;border-radius:10px}#root>div{min-height:calc(100vh - 16px)!important}}`}</style>}
<div style={{flex:'1 0 auto',minWidth:0}}>
<Header/>
{r.rt==='go'&&<Golovna><Posts/></Golovna>}
{r.rt==='f'&&<Posts/>}
{r.rt==='cm'&&<Cmt key={r.v} pid={r.v}/>}
{r.rt==='pb'&&<Pablik/>}
{r.rt==='l'&&<Auth/>}
{r.rt==='m'&&<Storinka me/>}
{r.rt==='i'&&<Storinka id={r.v}/>}
{r.rt==='u'&&<Storinka un={r.v}/>}
{r.rt==='fl'&&<Flash/>}
{r.rt==='mu'&&<Music/>}
{r.rt==='vi'&&<Videos key={r.v||'all'}/>}
{r.rt==='us'&&<Users/>}
{r.rt==='nt'&&<Noti/>}
{r.rt==='st'&&<Saity/>}
{r.rt==='hs'&&<Hosting/>}
{r.rt==='ru'&&<Rules/>}
{r.rt==='rp'&&<Reports/>}
</div>
<Footer l={l} ch={ch}/>
</div>
);
}
