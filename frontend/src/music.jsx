import{useState as us,useEffect as ue,useCallback as uc,useRef as ur}from'react';
import{playMusic,removeMusic}from'./player';
import{cleanAudio}from'./audio-clean';
import{uploadMusic}from'./music-upload';
export const genres=[['pop','поп'],['rock','рок'],['hiphop','хіп-хоп'],['electronic','електронна'],['house','хаус'],['techno','техно'],['dnb','драм-енд-бейс'],['dubstep','дабстеп'],['trance','транс'],['ambient','ембієнт'],['jazz','джаз'],['blues','блюз'],['soul','соул'],['funk','фанк'],['disco','диско'],['rnb','ритм-енд-блюз'],['reggae','регі'],['country','кантрі'],['folk','фолк'],['classical','класична'],['metal','метал'],['punk','панк'],['indie','інді'],['soundtrack','саундтрек']];
const gs=new Set(genres.map(v=>v[0])),limit=100*1024*1024;
const st=`
.mu-page{width:min(760px,calc(100% - 32px));margin:0 auto;padding:104px 0 150px;font-family:system-ui,sans-serif;color:#302b25;position:relative;z-index:2}
.mu-head{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.mu-title{margin:0;font-size:clamp(27px,5vw,38px);font-weight:750;letter-spacing:-1.3px;color:#302b25}
.mu-card{border:1px solid rgba(46,140,70,.2);border-radius:22px;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);padding:22px;margin-bottom:16px}
.mu-h2{font-size:17px;font-weight:700;margin:0 0 16px}
.mu-form{display:flex;flex-direction:column;gap:13px}
.mu-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.mu-label{display:flex;flex-direction:column;gap:6px;color:#4e6348;font-size:13px;font-weight:650;min-width:0}
.mu-input{height:40px;box-sizing:border-box;width:100%;min-width:0;padding:0 12px;border:1px solid #e2e4d8;border-radius:11px;background:rgba(250,250,245,.9);color:#302b25;font:400 14px system-ui,sans-serif;outline:none}
.mu-input:focus{border-color:#63a86c}
.mu-text{height:auto;min-height:90px;resize:vertical;padding:12px;line-height:1.65}
.mu-button{min-height:40px;padding:0 18px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background:url('/pictures/button.png') center/cover no-repeat;color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}
.mu-button:hover:not(:disabled){filter:brightness(1.07)}
.mu-button:disabled{opacity:.5;cursor:not-allowed}
.mu-actions{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
.mu-note{color:#8a857a;font-size:12px;font-weight:400;line-height:1.5;overflow-wrap:anywhere}
.mu-search{display:grid;grid-template-columns:1fr 180px;gap:10px;margin:24px 0 16px}
.mu-track{border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);padding:19px;margin-bottom:12px;overflow-wrap:anywhere}
.mu-track h2,.mu-track h3{margin:0 0 9px;font-size:17px;font-weight:750;line-height:1.4}
.mu-info{display:flex;flex-wrap:wrap;gap:6px 18px;color:#777064;font-size:12px;line-height:1.6;margin:0 0 12px}
.mu-info strong{color:#4e6348;font-weight:600}
.mu-opis{white-space:pre-wrap;font-size:13px;line-height:1.7;margin:0 0 13px;color:#39352f}
.mu-error{padding:14px 16px;border:1px solid #e8b7a8;border-radius:13px;background:#fff5f1;color:#99442e;font-size:13px;line-height:1.6;margin-bottom:16px;overflow-wrap:anywhere}
.mu-empty{padding:32px 18px;text-align:center;border:1px dashed rgba(70,130,75,.3);border-radius:18px;background:rgba(255,255,255,.9);color:#817b70;font-size:14px;line-height:1.7}
.mu-ok{font-size:13px;color:#39834b;margin-bottom:14px}
.mu-file{display:none}
.mu-page button:focus-visible,.mu-page a:focus-visible{outline:2px solid #479657;outline-offset:3px}
@media(max-width:600px){.mu-page{width:calc(100% - 16px);padding:74px 0 35px}.mu-card{padding:14px;border-radius:16px}.mu-grid,.mu-search{grid-template-columns:1fr}.mu-input{height:44px;font-size:16px}.mu-text{height:auto}.mu-button{min-height:44px}.mu-actions>.mu-button{flex:1}.mu-track{padding:14px}}
.mu-page.mu-profile{width:100%;margin:0;padding:0;z-index:auto;}
.mu-profile .mu-head{flex-direction:row;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;}
.mu-profile .mu-title{font-size:16px;letter-spacing:-.2px;}
.mu-profile .mu-search{margin:0 0 12px;}
.mu-profile .mu-track:last-child{margin-bottom:0;}
.mu-profile .mu-empty{padding:18px 8px;border:0;border-radius:0;background:transparent;font-size:13px;}
@media(max-width:600px){.mu-profile .mu-title{font-size:15px}.mu-profile .mu-search{gap:8px}}
`;
const norm=v=>String(v??'').normalize('NFKC').toLocaleLowerCase().trim();
const fileok=f=>!!f&&/\.(mp3|wav)$/i.test(f.name)&&['','audio/mpeg','audio/mp3','audio/wav','audio/wave','audio/x-wav','audio/vnd.wave','application/octet-stream'].includes(f.type);
export default function Music({uid=null,embedded=false}={}){
const[ls,sls]=us([]),[me,sm]=us(null),[ld,sld]=us(true),[er,ser]=us(''),[fe,sfe]=us(''),[done,sdone]=us(''),[sv,ssv]=us(false),[del,sdel]=us(null),[q,sq]=us(''),[fg,sfg]=us(''),[na,sna]=us(''),[au,sau]=us(''),[al,sal]=us(''),[yr,syr]=us(''),[op,sop]=us(''),[gn,sgn]=us('pop'),[fl,sfl]=us(null);
const[pc,spc]=us(null);
const input=ur(null),filter=ur(null),busy=ur(false),live=ur(false),abort=ur(null),upload=ur(null),deleting=ur(null);
const load=uc(async()=>{
abort.current?.abort();const ac=new AbortController();abort.current=ac;sld(true);ser('');if(uid!==null)sls([]);
try{const r=await fetch('/api/music',{credentials:'include',cache:'no-store',signal:ac.signal,headers:{Accept:'application/json'}});const j=await r.json().catch(()=>null);if(!r.ok)throw Error([404,405,501].includes(r.status)?'музичний сервіс ще не підключено':j?.error||'не вдалося завантажити музику');if(j===null)throw Error('музичний сервіс ще не підключено');if(!Array.isArray(j)||j.some(v=>!v||!Number.isSafeInteger(Number(v.id))||typeof v.nazva!=='string'||typeof v.failik!=='string'||!gs.has(v.genre)))throw Error('не вдалося завантажити музику');if(live.current&&!ac.signal.aborted&&abort.current===ac)sls(uid===null?j:j.filter(v=>Number(v.uploader)===Number(uid)))}catch(e){if(e.name!=='AbortError'&&!ac.signal.aborted&&abort.current===ac&&live.current)ser(e.message||'не вдалося завантажити музику')}finally{if(live.current&&abort.current===ac)sld(false)}
},[uid]);
ue(()=>{live.current=true;const ac=new AbortController();fetch('/api/me',{credentials:'include',cache:'no-store',signal:ac.signal}).then(r=>r.ok?r.json():null).then(j=>{if(live.current&&!ac.signal.aborted)sm(j?.id?j:null)}).catch(()=>{});load();return()=>{live.current=false;ac.abort();abort.current?.abort();upload.current?.abort();deleting.current?.abort()}},[load]);
const choose=e=>{sfe('');sdone('');const f=e.target.files?.[0]||null;if(!f){sfl(null);return}if(!fileok(f)){sfe('тільки MP3 або WAV');sfl(null);e.target.value='';return}if(f.size<=0||f.size>limit){sfe('');sfl(null);e.target.value='';return}sfl(f)};
const submit=async e=>{
e.preventDefault();if(!me||busy.current)return;sfe('');sdone('');
if(!na.trim()||!au.trim()){sfe('вкажи назву та виконавця');return}
if(!gs.has(gn)||na.trim().length>160||au.trim().length>160||al.trim().length>160||op.length>5000){sfe('невірні дані запиту');return}
if(yr!==''&&(!/^\d{4}$/.test(yr)||Number(yr)<1000||Number(yr)>9999)){sfe('невірний рік випуску');return}
if(!fileok(fl)){sfe('Тільки MP3 або WAV');return}
if(fl.size<=0||fl.size>limit){sfe('');return}
const ac=new AbortController();upload.current=ac;busy.current=true;ssv(true);spc(0);
try{const prepared=await cleanAudio(fl,{signal:ac.signal,onProgress:v=>{if(live.current&&upload.current===ac&&!ac.signal.aborted)spc(v)}});if(ac.signal.aborted||!live.current)throw new DOMException('Aborted','AbortError');spc(0);const j=await uploadMusic(prepared,{nazva:na.trim(),genre:gn,author:au.trim(),albom:al.trim(),godvipuska:yr===''?null:Number(yr),opis:op},{signal:ac.signal,onProgress:v=>{if(live.current&&upload.current===ac&&!ac.signal.aborted)spc(v)}});if(ac.signal.aborted||!live.current)throw new DOMException('Aborted','AbortError');if(!j||!Number.isSafeInteger(Number(j.id))||typeof j.failik!=='string'||typeof j.nazva!=='string'||!gs.has(j.genre))throw Error('помилка завантаження');if(live.current){abort.current?.abort();sld(false);sls(v=>[j,...v.filter(x=>Number(x.id)!==Number(j.id))]);sna('');sau('');sal('');syr('');sop('');sgn('pop');sfl(null);if(input.current)input.current.value='';sdone('опубліковано')}}catch(e){if(e.name!=='AbortError'&&live.current)sfe(e.message||'помилка завантаження')}finally{busy.current=false;if(upload.current===ac)upload.current=null;if(live.current){ssv(false);spc(null)}}
};
const remove=async v=>{
if(!me||Number(v.uploader)!==Number(me.id)||del!==null||!window.confirm('ви точно хочете видалити цю музику?'))return;
const ac=new AbortController();deleting.current=ac;sdel(Number(v.id));ser('');
try{const r=await fetch('/api/music?id='+encodeURIComponent(v.id),{method:'DELETE',credentials:'include',signal:ac.signal});if(!r.ok){const j=await r.json().catch(()=>null);throw Error(j?.error||'помилка')}removeMusic(v.id);if(live.current){abort.current?.abort();sld(false);sls(x=>x.filter(t=>Number(t.id)!==Number(v.id)))}}catch(e){if(e.name!=='AbortError'&&live.current)ser(e.message||'помилка')}finally{if(live.current)sdel(null)}
};
const terms=norm(q).split(/\s+/).filter(Boolean),rows=ls.filter(v=>{
if(uid!==null&&Number(v.uploader)!==Number(uid))return false;
if(fg&&v.genre!==fg)return false;
const label=genres.find(x=>x[0]===v.genre)?.[1]||'',visible=Array.from(filter.current?.options||[]).find(x=>x.value===v.genre)?.textContent||label;
const text=norm([v.nazva,v.author,v.albom,v.godvipuska,v.opis,v.genre,label,visible].join(' '));return terms.every(t=>text.includes(t));
});
const Root=embedded?'div':'main',Title=embedded?'h2':'h1',TrackTitle=embedded?'h3':'h2';
return <Root className={'mu-page'+(embedded?' mu-profile':'')} id={embedded?undefined:'music'}><style>{st}</style><header className="mu-head"><Title className="mu-title">музика</Title>{embedded&&<span className="mu-note" translate="no">{ld?'…':er?'-':ls.length}</span>}</header>{!embedded&&(me?<section className="mu-card"><h2 className="mu-h2">додати музику</h2><form className="mu-form" onSubmit={submit}><fieldset disabled={sv} style={{border:0,padding:0,margin:0,minWidth:0,display:'contents'}}><div className="mu-grid"><label className="mu-label"><span>Назва</span><input className="mu-input" value={na} onChange={e=>sna(e.target.value)} required maxLength={160}/></label><label className="mu-label"><span>жанр</span><select className="mu-input" value={gn} onChange={e=>sgn(e.target.value)}>{genres.map(([k,n])=><option key={k} value={k}>{n}</option>)}</select></label><label className="mu-label"><span>виконавець</span><input className="mu-input" value={au} onChange={e=>sau(e.target.value)} required maxLength={160}/></label><label className="mu-label"><span>альбом</span><input className="mu-input" value={al} onChange={e=>sal(e.target.value)} maxLength={160}/></label><label className="mu-label"><span>рік випуску</span><input className="mu-input" type="number" min={1000} max={9999} step={1} value={yr} onChange={e=>syr(e.target.value)} inputMode="numeric"/></label></div><label className="mu-label"><span>опис</span><textarea className="mu-input mu-text" value={op} onChange={e=>sop(e.target.value)} maxLength={5000}/></label><span className="mu-note" translate="no">{op.length} / 5000</span><div className="mu-actions"><input id="mu-audio-file" ref={input} className="mu-file" type="file" accept=".mp3,.wav,audio/mpeg,audio/wav,audio/x-wav" onChange={choose}/><button type="button" className="mu-button" onClick={()=>input.current?.click()}>аудіофайл (MP3 або WAV)</button>{fl&&<span className="mu-note" translate="no">{fl.name} · {(fl.size/1048576).toFixed(1)} MB</span>}</div><span className="mu-note"></span>{fe&&<div className="mu-error" role="alert">{fe}</div>}<div className="mu-actions"><button className="mu-button" type="submit" disabled={sv||!fl}>{sv?'завантаження…':'завантажити'}</button></div></fieldset>{sv&&<div className="mu-actions" role="status"><span className="mu-note">завантаження…</span>{pc!==null&&<span className="mu-note" translate="no">{pc}%</span>}<button type="button" className="mu-button" onClick={()=>upload.current?.abort()}>скасувати</button></div>}</form></section>:<section className="mu-card"><a className="mu-button" href="#login">увійти / зареєструватись</a></section>)}{done&&<div className="mu-ok" role="status">{done}</div>}<div className="mu-search"><input className="mu-input" value={q} onChange={e=>sq(e.target.value)} placeholder="пошук назви, виконавця, альбому..." aria-label="пошук назви, виконавця, альбому..."/><select ref={filter} className="mu-input" value={fg} onChange={e=>sfg(e.target.value)} aria-label="жанр"><option value="">усі жанри</option>{genres.map(([k,n])=><option key={k} value={k}>{n}</option>)}</select></div>{er&&<div className="mu-error" role="alert">{er}<div className="mu-actions" style={{marginTop:10}}><button type="button" className="mu-button" onClick={load} disabled={ld}>оновити</button></div></div>}{ld?<div className="mu-empty" role="status">завантаження…</div>:rows.length===0&&!er?<div className="mu-empty">{q||fg?'нічого не знайдено.':'музики поки немає'}</div>:rows.map(v=><article className="mu-track" key={v.id}><TrackTitle translate="no">{v.nazva}</TrackTitle><div className="mu-info"><span><strong>виконавець</strong>: <span translate="no">{v.author}</span></span>{v.albom&&<span><strong>альбом</strong>: <span translate="no">{v.albom}</span></span>}{v.godvipuska&&<span><strong>рік випуску</strong>: <span translate="no">{v.godvipuska}</span></span>}<span><strong>жанр</strong>: <span>{genres.find(x=>x[0]===v.genre)?.[1]||''}</span></span></div>{v.opis&&<p className="mu-opis" translate="no">{v.opis}</p>}<div className="mu-actions"><button type="button" className="mu-button" onClick={()=>{if(!playMusic(rows,v.id))ser('не вдалося відтворити аудіо')}}>слухати</button>{me&&Number(me.id)===Number(v.uploader)&&<button type="button" className="mu-button" disabled={del!==null} onClick={()=>remove(v)}>видалити</button>}</div></article>)}</Root>;
}
