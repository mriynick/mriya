import{useState as us,useEffect as ue}from'react';
import{useText}from'./lang';
const st=`
.gl-page{box-sizing:border-box;width:min(760px,calc(100% - 32px));margin:0 auto;padding:94px 0 70px;font:12px/1.5 Arial,Helvetica,sans-serif;color:#302b25;position:relative;z-index:2;overflow-wrap:anywhere}
.gl-page *{box-sizing:border-box}
.gl-page h1,.gl-page h2,.gl-page p,.gl-page blockquote,.gl-page figcaption{color:inherit}
.gl-frame{border:1px solid #d6d8cf;background:#fff}
.gl-title{margin:0;padding:12px 16px 0;border:0;background:none;font:700 13px/1.5 Arial,Helvetica,sans-serif}
.gl-layout{display:grid;grid-template-columns:minmax(0,1fr) 184px;align-items:stretch}
.gl-content{min-width:0;padding:14px 16px}
.gl-row{display:grid;grid-template-columns:16px minmax(0,1fr);gap:7px;align-items:start;margin:0 0 14px}
.gl-icon{display:block;width:16px!important;height:16px!important;min-width:16px;max-width:16px;object-fit:contain;image-rendering:crisp-edges;image-rendering:pixelated;flex:0 0 16px}
.gl-row>.gl-icon{margin-top:1px}
.gl-page p{margin:0;font:inherit}
.gl-sectionhead{display:flex;align-items:center;gap:7px;margin:20px 0 0;padding:4px 0;border-bottom:1px solid #d6d8cf}
.gl-sectionhead h2{margin:0;font:700 12px/1.5 Arial,Helvetica,sans-serif}
.gl-review{margin:0;padding:10px 0;border-bottom:1px solid #e7e8e2}
.gl-review:last-child{border-bottom:0;padding-bottom:0}
.gl-review blockquote{margin:0;padding:0;font:inherit}
.gl-review p{white-space:pre-line}
.gl-review figcaption{margin:4px 0 0;text-align:right;font:700 11px/1.5 Arial,Helvetica,sans-serif}
.gl-visit{min-width:0;padding:8px;background:#f7f7f5;border-left:1px solid #e2e3dc;align-self:stretch}
.gl-visit .gl-sectionhead{margin:0 0 8px;padding:4px;background:#eaece6;border-bottom:0;align-items:flex-start}
.gl-visit .gl-sectionhead>.gl-icon{margin-top:1px}
.gl-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:12px}
.gl-button{display:inline-flex;align-items:center;justify-content:center;max-width:100%;min-height:36px;padding:7px 14px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background:url('/pictures/button.png') center/cover no-repeat;color:#fff;font:12px/1.4 Arial,Helvetica,sans-serif;text-align:center;text-decoration:none;cursor:pointer}
.gl-button:hover{filter:brightness(1.06)}
.gl-button:focus-visible{outline:2px solid #479657;outline-offset:2px}
.gl-message{padding:10px;border:1px solid #d6d8cf;background:#fff}
@media(max-width:600px){.gl-page{width:calc(100% - 16px);padding:70px 0 30px}.gl-layout{grid-template-columns:1fr}.gl-content{padding:12px}.gl-visit{padding:10px 12px;border-left:0;border-top:1px solid #e2e3dc}.gl-visit .gl-sectionhead{padding:4px 6px}.gl-button{min-height:34px;padding:6px 12px}}
`;
const reviews=[
['Secius','MRIYA NEVA DAI'],
['Stain','Крутий сайт дуже нішево та крута тіпа тут сидіти та спілкуватися з людьми. Мяу.'],
['betelgeuse','Прикольний проект. Особливо подобається відношення автора до свободи, таких проектів у наш час дійсно мало.'],
['Morphusss','Я учасник бета тесту соцмережі "Мрія", і за цей час мені дуже сподобався цей сайт. Широка кастомізація профілю, приємний та дуже зрозумілий інтерфейс. Ще сподобалося, що правила вільні та справедливі. Короче кажучи, мрія це дуже круто, а це був лише бета тест. Сподіваюсь що в майбутньому буде ще більше різних корисних штук, та сайт буде тільки розвиватися.'],
['FlameHeart','Як один із бета-тестерів, можу сказати, що сайт вийшов дуже хорошим. Це, звісно, не Фейсбук, але якщо мрія буде вдосконалюватися і надалі, вона, як на мене, зможе стати для нього гідним, локальним конкурентом'],
['nuancsik','мрія це щось таке нішеве де люди всі одне одного знають, як у селі, особливо мені подобается що є різні теми, можна постити майже що завгодно, і проект розвивается і може з цого вийде щось унікальне, а не як копія твіттера, інстаграма чи фейсбука'],
['m1tq','Прікольна соцмережа для тих кому хочеться свободи. Широка кастомізація, Flash-ігри, і багато чого іншого. Всьо-таки Мрія лучше чим Друзі'],
['Friday','Мрія познайомила мене з чудовими людьми та подарувала незабутній досвід.\nСподіваюся, що проєкт буде і далі розквітати, даруючи чудові емоції кожному своєму користувачу!']
];
export function openFeed(e){
if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
e.preventDefault();try{window.sessionStorage.setItem('mriya_guest_browse','1')}catch{}window.history.pushState(null,'','/feed');window.dispatchEvent(new PopStateEvent('popstate'));
}
export function Welcome(){
const{t}=useText();
return <main className="gl-page" id="golovna"><style>{st}</style><div className="gl-frame"><h1 className="gl-title">{t('Mriya - ділися думками ВІЛЬНО')}</h1><div className="gl-layout"><div className="gl-content">
<div className="gl-row"><img className="gl-icon" src="/computer.png" width="16" height="16" alt="" aria-hidden="true" decoding="async"/><p>{t('Вільна соціальна мережа для твоїх думок, творчості та спілкування. Висловлюйся відкрито, ділися файлами, знаходь друзів і створюй власний куточок інтернету - саме такий, яким хочеш бачити його саме ти!')}</p></div>
<div className="gl-row"><img className="gl-icon" src="/eye.png" width="16" height="16" alt="" aria-hidden="true" decoding="async"/><p>{t('Тобі не потрібно підлаштовуватися під чужі правила. Налаштовуй свою сторінку, розповідай про те, що тебе хвилює, публікуй власні роботи або просто ділися повсякденним життям')}</p></div>
<section aria-labelledby="gl-reviews-title"><header className="gl-sectionhead"><img className="gl-icon" src="/world.png" width="16" height="16" alt="" aria-hidden="true" decoding="async"/><h2 id="gl-reviews-title">{t('Що кажуть користувачі?')}</h2></header>{reviews.map(([name,text])=><figure className="gl-review" key={name} translate="no"><blockquote><p>{text}</p></blockquote><figcaption>- {name}</figcaption></figure>)}</section>
</div><aside className="gl-visit" aria-labelledby="gl-visit-title"><header className="gl-sectionhead"><img className="gl-icon" src="/time.png" width="16" height="16" alt="" aria-hidden="true" decoding="async"/><h2 id="gl-visit-title">{t('Спочатку познайомимося?')}</h2></header><p>{t('Ще не вирішили, чи хочете реєструватися? Зазирніть усередину без акаунта: перегляньте відкриті сторінки й відчуйте, чи це ваше місце')}</p><div className="gl-actions"><a className="gl-button" href="/feed" onClick={openFeed}>{t('Спочатку подивитися')}</a></div></aside></div></div></main>;
}
export default function Golovna({children}){
const{t}=useText();
const[state,sstate]=us('loading'),[attempt,sattempt]=us(0);
const[browsing]=us(()=>{try{return window.sessionStorage.getItem('mriya_guest_browse')==='1'}catch{return false}});
ue(()=>{
if(browsing)return;
let live=true,active=null,timerID=null;
const check=async()=>{
if(document.hidden)return;
active?.abort();clearTimeout(timerID);const ac=new AbortController();active=ac;const timer=setTimeout(()=>{ac.abort();if(live&&active===ac)sstate('error')},12000);timerID=timer;
try{
const r=await fetch('/api/me',{credentials:'include',cache:'no-store',signal:ac.signal,headers:{Accept:'application/json'}});
let next='error';if(r.status===401)next='guest';else if(r.ok){const j=await r.json();if(Number.isSafeInteger(j?.id)&&j.id>0)next='member'}
if(live&&active===ac&&!ac.signal.aborted)sstate(next);
}catch{if(live&&active===ac)sstate('error')}finally{clearTimeout(timer);if(active===ac)active=null}
};
const show=()=>{if(!document.hidden)check()};
check();window.addEventListener('focus',show);window.addEventListener('online',show);window.addEventListener('mriya-profile-updated',show);document.addEventListener('visibilitychange',show);
return()=>{live=false;active?.abort();clearTimeout(timerID);active=null;window.removeEventListener('focus',show);window.removeEventListener('online',show);window.removeEventListener('mriya-profile-updated',show);document.removeEventListener('visibilitychange',show)};
},[attempt,browsing]);
if(browsing||state==='member')return children;
if(state==='guest')return <Welcome/>;
return <main className="gl-page gl-status" id="golovna-status" aria-busy={state==='loading'}><style>{st}</style><div className="gl-message">{state==='loading'?<p role="status">{t('завантаження…')}</p>:<><p role="alert">{t('Не вдалося перевірити вхід. Спробуйте ще раз.')}</p><div className="gl-actions"><button className="gl-button" type="button" onClick={()=>{sstate('loading');sattempt(v=>v+1)}}>{t('спробувати ще')}</button><a className="gl-button" href="/feed" onClick={openFeed}>{t('Спочатку подивитися')}</a></div></>}</div></main>;
}
