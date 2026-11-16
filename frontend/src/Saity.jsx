import{useState as us,useEffect as ue,useCallback as uc,useRef as ur}from'react';
import{useText}from'./lang';
export const siteTypes=[['personal','особисті сторінки'],['blog','блоги'],['forum','форуми'],['community','спільноти'],['news','новини'],['media','онлайн-журнали'],['education','освіта'],['science','наука'],['reference','довідники'],['library','бібліотеки'],['games','ігри'],['technology','технології'],['software','програми'],['music','музика'],['video','відео'],['art','мистецтво'],['portfolio','портфоліо'],['shop','магазини'],['services','сервіси'],['other','інше']];
const categories=new Map(siteTypes),pageSize=24,maxFile=5*1024*1024;
const st=`
.sy-page{width:min(760px,calc(100% - 32px));margin:0 auto;padding:104px 0 150px;font-family:system-ui,sans-serif;color:#302b25;position:relative;z-index:2}
.sy-head{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.sy-title{margin:0;font-size:clamp(27px,5vw,38px);font-weight:750;letter-spacing:-1.3px;color:#302b25}
.sy-card{border:1px solid rgba(46,140,70,.2);border-radius:22px;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);padding:22px;margin-bottom:16px}
.sy-h2{font-size:17px;font-weight:700;margin:0 0 16px}
.sy-form{display:flex;flex-direction:column;gap:13px}
.sy-fields{display:contents;border:0;padding:0;margin:0;min-width:0}
.sy-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.sy-label{display:flex;flex-direction:column;gap:6px;color:#4e6348;font-size:13px;font-weight:650;min-width:0}
.sy-input{height:40px;box-sizing:border-box;width:100%;min-width:0;padding:0 12px;border:1px solid #e2e4d8;border-radius:11px;background:rgba(250,250,245,.9);color:#302b25;font:400 14px system-ui,sans-serif;outline:none}
.sy-input:focus{border-color:#63a86c}
.sy-text{height:auto;min-height:110px;resize:vertical;padding:12px;line-height:1.65}
.sy-button{box-sizing:border-box;min-height:40px;padding:7px 18px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background:url('/pictures/button.png') center/cover no-repeat;color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;gap:6px}
.sy-button:hover:not(:disabled){filter:brightness(1.07)}
.sy-button:disabled{opacity:.5;cursor:not-allowed}
.sy-actions{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
.sy-note{color:#8a857a;font-size:12px;font-weight:400;line-height:1.5;overflow-wrap:anywhere}
.sy-filters{display:grid;grid-template-columns:minmax(0,1fr) 170px 155px;gap:10px;margin:24px 0 14px}
.sy-listhead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.sy-count{font-size:12px;color:#777064}
.sy-site{border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);padding:19px;margin-bottom:12px;overflow-wrap:anywhere}
.sy-sitegrid{display:grid;grid-template-columns:240px minmax(0,1fr);gap:18px;align-items:start}
.sy-shotlink{display:block;min-width:0;text-decoration:none;border:1px solid #e2e4d8;border-radius:12px;overflow:hidden;background:#f2f3eb}
.sy-shot{display:block;box-sizing:border-box;width:100%;aspect-ratio:16/10;object-fit:contain;background:#f2f3eb}
.sy-shot[hidden],.sy-failed[hidden]{display:none}
.sy-failed{display:flex;align-items:center;justify-content:center;aspect-ratio:16/10;padding:12px;box-sizing:border-box;text-align:center;color:#8a857a;font:12px system-ui,sans-serif}
.sy-site h2{margin:0 0 6px;font-size:17px;font-weight:750;line-height:1.4}
.sy-name{color:#302b25;text-decoration:none}
.sy-name:hover{text-decoration:underline}
.sy-url{display:block;margin-bottom:10px;color:#39834b;font-size:12px;line-height:1.5;text-decoration:none;overflow-wrap:anywhere}
.sy-url:hover{text-decoration:underline}
.sy-info{display:flex;align-items:center;flex-wrap:wrap;gap:5px 13px;color:#777064;font-size:12px;line-height:1.6;margin-bottom:10px}
.sy-author{color:#4e6348;text-decoration:none}
.sy-opis{white-space:pre-wrap;font-size:13px;line-height:1.7;margin:0 0 13px;color:#39352f}
.sy-error{padding:14px 16px;border:1px solid #e8b7a8;border-radius:13px;background:#fff5f1;color:#99442e;font-size:13px;line-height:1.6;margin-bottom:16px;overflow-wrap:anywhere}
.sy-form .sy-error{margin-bottom:0}
.sy-empty{padding:32px 18px;text-align:center;border:1px dashed rgba(70,130,75,.3);border-radius:18px;background:rgba(255,255,255,.9);color:#817b70;font-size:14px;line-height:1.7}
.sy-ok{font-size:13px;color:#39834b;margin-bottom:14px}
.sy-file{display:none}
.sy-preview{width:min(100%,440px);border:1px solid #e2e4d8;border-radius:12px;overflow:hidden;background:#f2f3eb}
.sy-preview img{display:block;width:100%;max-height:280px;object-fit:contain}
.sy-more{display:flex;justify-content:center;margin-top:18px}
.sy-page button:focus-visible,.sy-page a:focus-visible{outline:2px solid #479657;outline-offset:3px}
.sy-page [aria-busy=true]{cursor:progress}
@media(max-width:700px){.sy-sitegrid{grid-template-columns:200px minmax(0,1fr)}.sy-filters{grid-template-columns:1fr 1fr}.sy-filters>input{grid-column:1/-1}}
@media(max-width:600px){.sy-page{width:calc(100% - 16px);padding:74px 0 35px}.sy-card{padding:14px;border-radius:16px}.sy-grid{grid-template-columns:1fr}.sy-input{height:44px;font-size:16px}.sy-text{height:auto}.sy-button{min-height:44px}.sy-actions>.sy-button{flex:1}.sy-site{padding:14px}.sy-sitegrid{grid-template-columns:1fr;gap:13px}.sy-shot{max-height:290px}.sy-site .sy-actions>.sy-button{flex:1}.sy-filters{gap:8px}}
@media(max-width:360px){.sy-filters{grid-template-columns:1fr}.sy-filters>input{grid-column:auto}}
`;
export function normalizeSiteURL(value){
if(typeof value!=='string')return '';
const text=value.trim();if(!text||text.length>2048||/[\u0000-\u0020\u007f]/.test(text))return '';
try{const u=new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(text)?text:'https://'+text);if(!['http:','https:'].includes(u.protocol)||!u.hostname||u.username||u.password||u.href.length>2048)return '';return u.href}catch{return ''}
}
export function siteScreenshot(value){
if(typeof value!=='string'||!value)return '';
try{const u=new URL(value,window.location.origin);return u.origin===window.location.origin&&!u.search&&!u.hash&&/^\/uploads\/saity\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(u.pathname)?u.pathname:''}catch{return ''}
}
const positive=v=>Number.isSafeInteger(v)&&v>0;
const validItem=v=>!!v&&positive(v.id)&&positive(v.avtor_id)&&typeof v.nazva==='string'&&v.nazva.trim().length>0&&v.nazva.length<=320&&typeof v.opis==='string'&&v.opis.length<=10000&&typeof v.url==='string'&&!!normalizeSiteURL(v.url)&&categories.has(v.vyd)&&!!siteScreenshot(v.skrin)&&positive(v.revision)&&typeof v.created_at==='string'&&Number.isFinite(Date.parse(v.created_at))&&typeof v.updated_at==='string'&&Number.isFinite(Date.parse(v.updated_at))&&(v.username===undefined||typeof v.username==='string');
const serviceError='каталог сайтів ще не підключено';
async function api(path,options={}){
const ac=new AbortController(),outer=options.signal,abort=()=>ac.abort();if(outer?.aborted)ac.abort();else outer?.addEventListener('abort',abort,{once:true});const timer=setTimeout(abort,45000);
try{const r=await fetch(path,{...options,credentials:'include',cache:'no-store',signal:ac.signal,headers:{Accept:'application/json',...options.headers}});const j=r.status===204?null:await r.json().catch(()=>null);if(!r.ok||r.status!==204&&(!j||typeof j!=='object')){const unavailable=[405,501].includes(r.status)||r.status===404&&(!j||(options.method||'GET')==='GET'&&path.startsWith('/api/saity'))||r.ok&&!j;const e=Error(unavailable?serviceError:typeof j?.error==='string'?j.error:'не вдалося виконати запит');e.status=r.status;e.unavailable=unavailable;throw e}return j}catch(e){if(typeof e.status==='number')throw e;const x=Error('немає зв’язку із сервером, спробуй ще');x.status=0;throw x}finally{clearTimeout(timer);outer?.removeEventListener('abort',abort)}
}
async function checkImage(file){
if(!file||file.size<1||file.size>maxFile)throw Error('скриншот має бути не більший за 5 МБ');
if(!/\.(png|jpe?g|webp)$/i.test(file.name))throw Error('обери png jpg або webp');
const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
const png=bytes.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v),jpg=bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255,webp=bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
const mime=png?'image/png':jpg?'image/jpeg':webp?'image/webp':'';
if(!mime||file.type&&!['application/octet-stream',mime,...(jpg?['image/jpg']:[])].includes(file.type))throw Error('некоректний файл скриншота');
let width=0,height=0;
if(typeof createImageBitmap==='function'){const image=await createImageBitmap(file);width=image.width;height=image.height;image.close()}else{const url=URL.createObjectURL(file);try{const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('некоректний файл скриншота'));img.src=url});width=image.naturalWidth;height=image.naturalHeight}finally{URL.revokeObjectURL(url)}}
if(width<1||height<1||width>20000||height>20000||width*height>20000000)throw Error('завеликий розмір зображення');
}
function Shot({src,name}){
const[failed,sfailed]=us(false);ue(()=>sfailed(false),[src]);
return <a className="sy-shotlink" href={src} target="_blank" rel="noopener noreferrer" aria-label="відкрити скриншот"><img className="sy-shot" src={src} alt={name} translate="no" loading="lazy" decoding="async" referrerPolicy="no-referrer" hidden={failed} onError={()=>sfailed(true)}/><span className="sy-failed" hidden={!failed}>не вдалося завантажити скриншот</span></a>;
}
export default function Saity(){
const{t}=useText();
const[me,sme]=us(null),[authReady,sauthReady]=us(false),[authError,sauthError]=us(''),[data,sdata]=us({key:'',items:[],total:0,next:null}),[loading,sloading]=us(true),[error,serror]=us(''),[ready,sready]=us(false),[q,sq]=us(''),[query,squery]=us(''),[vyd,svyd]=us(''),[sort,ssort]=us('new');
const[nazva,snazva]=us(''),[opis,sopis]=us(''),[url,surl]=us(''),[type,stype]=us('personal'),[file,sfile]=us(null),[fileBusy,sfileBusy]=us(false),[fileError,sfileError]=us(''),[formError,sformError]=us(''),[done,sdone]=us(''),[editing,sediting]=us(null),[saving,ssaving]=us(false),[deleting,sdeleting]=us(null);
const live=ur(false),listing=ur(null),loadingRef=ur(false),authRequest=ur(null),action=ur(null),fileSeq=ur(0),fileURL=ur(''),input=ur(null),titleInput=ur(null),form=ur(null),loader=ur(()=>{}),authLoader=ur(()=>{}),nextRef=ur(null),editRef=ur(null),userRef=ur(0),draftOwner=ur(null);
const key=JSON.stringify([query,vyd,sort]),keyRef=ur(key);keyRef.current=key;nextRef.current=data.key===key?data.next:null;editRef.current=editing;userRef.current=me?.id||0;
const rows=data.key===key?data.items:[],total=data.key===key?data.total:0,busy=saving||deleting!==null;
const clearFile=uc(()=>{fileSeq.current++;if(fileURL.current){URL.revokeObjectURL(fileURL.current);fileURL.current=''}sfile(null);sfileBusy(false);sfileError('');if(input.current)input.current.value=''},[]);
const reset=uc(()=>{clearFile();snazva('');sopis('');surl('');stype('personal');sediting(null);sformError('')},[clearFile]);
const load=uc(async(more=false)=>{
const cursor=more?nextRef.current:null;if(more&&(!cursor||loadingRef.current))return;
listing.current?.abort();const ac=new AbortController();listing.current=ac;loadingRef.current=true;sloading(true);serror('');
const params=new URLSearchParams({limit:String(pageSize),sort});if(query)params.set('q',query);if(vyd)params.set('vyd',vyd);if(cursor)params.set('cursor',cursor);
try{const j=await api('/api/saity?'+params,{signal:ac.signal});if(!Array.isArray(j?.items)||j.items.length>pageSize||!j.items.every(validItem)||new Set(j.items.map(v=>v.id)).size!==j.items.length||!Number.isSafeInteger(j.total)||j.total<j.items.length||j.next!==null&&(typeof j.next!=='string'||!j.next||j.next.length>1024)||cursor&&j.next===cursor)throw Error('некоректна відповідь каталогу');if(!live.current||ac.signal.aborted||listing.current!==ac||keyRef.current!==key)return;sdata(old=>{const previous=more&&old.key===key?old.items:[],ids=new Set(previous.map(v=>v.id));return{key,items:[...previous,...j.items.filter(v=>!ids.has(v.id))],total:j.total,next:j.next}});sready(true)}catch(e){if(live.current&&!ac.signal.aborted&&listing.current===ac&&keyRef.current===key){serror(e.message||'не вдалося завантажити сайти');if(e.unavailable)sready(false)}}finally{if(live.current&&listing.current===ac){loadingRef.current=false;sloading(false)}}
},[key,query,vyd,sort]);
loader.current=load;
ue(()=>{const timer=setTimeout(()=>squery(q.trim()),300);return()=>clearTimeout(timer)},[q]);
ue(()=>{
live.current=true;
const auth=async()=>{authRequest.current?.abort();const ac=new AbortController();authRequest.current=ac;try{const j=await api('/api/me',{signal:ac.signal});if(live.current&&!ac.signal.aborted&&authRequest.current===ac){if(!positive(j?.id))throw Error('не вдалося перевірити вхід');sme(j);sauthError('');sauthReady(true)}}catch(e){if(live.current&&!ac.signal.aborted&&authRequest.current===ac){if(e.status===401){sme(null);sauthError('')}else sauthError(e.message||'не вдалося перевірити вхід');sauthReady(true)}}};
authLoader.current=auth;const refresh=()=>{if(!document.hidden&&navigator.onLine!==false)auth()};refresh();window.addEventListener('focus',refresh);window.addEventListener('online',refresh);document.addEventListener('visibilitychange',refresh);
return()=>{live.current=false;authRequest.current?.abort();listing.current?.abort();action.current?.ac.abort();fileSeq.current++;if(fileURL.current)URL.revokeObjectURL(fileURL.current);window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);document.removeEventListener('visibilitychange',refresh);authLoader.current=()=>{}};
},[]);
ue(()=>{if(!authReady)return;const id=me?.id||0;if(draftOwner.current!==null&&draftOwner.current!==id){action.current?.ac.abort();action.current=null;ssaving(false);sdeleting(null);reset();sdone('')}draftOwner.current=id},[me?.id,authReady,reset]);
ue(()=>{load();return()=>listing.current?.abort()},[load]);
const choose=async e=>{
const selected=e.target.files?.[0];if(!selected)return;const sequence=++fileSeq.current;sdone('');sfileError('');sfileBusy(true);
try{await checkImage(selected);if(!live.current||sequence!==fileSeq.current)return;if(fileURL.current)URL.revokeObjectURL(fileURL.current);const preview=URL.createObjectURL(selected);fileURL.current=preview;sfile({value:selected,preview})}catch(e){if(live.current&&sequence===fileSeq.current){sfileError(typeof e.message==='string'&&/[а-яіїєґ]/iu.test(e.message)?e.message:'некоректний файл скриншота');if(input.current)input.current.value=''}}finally{if(live.current&&sequence===fileSeq.current)sfileBusy(false)}
};
const edit=v=>{
if(action.current||fileBusy||!me||me.id!==v.avtor_id||editing)return;
if((nazva||opis||url||file)&&!window.confirm(t('Скасувати незбережені зміни?')))return;
clearFile();sformError('');sdone('');sediting(v);snazva(v.nazva);sopis(v.opis);surl(v.url);stype(v.vyd);form.current?.scrollIntoView?.({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});titleInput.current?.focus({preventScroll:true});
};
const submit=async e=>{
e.preventDefault();if(!me||!ready||action.current||fileBusy)return;sformError('');sdone('');
const name=nazva.trim(),address=normalizeSiteURL(url);if(!name||[...name].length>160){sformError('вкажи назву до 160 символів');return}if(!address){sformError('вкажи коректне посилання HTTP або HTTPS');return}if([...opis].length>5000||!categories.has(type)){sformError('невірні дані сайту');return}if(!file&&!editing){sformError('додай скриншот сайту');return}if(fileError){sformError('обери коректний скриншот або скасуй заміну');return}
const owner=me.id,previous=editing,fd=new FormData();fd.append('nazva',name);fd.append('opis',opis);fd.append('url',address);fd.append('vyd',type);if(file)fd.append('file',file.value);if(previous)fd.append('revision',String(previous.revision));
const token={ac:new AbortController(),owner};action.current=token;ssaving(true);
try{const j=await api('/api/saity'+(previous?'?id='+encodeURIComponent(previous.id):''),{method:previous?'PUT':'POST',body:fd,signal:token.ac.signal});if(!validItem(j)||j.avtor_id!==owner||previous&&j.id!==previous.id)throw Error('не вдалося підтвердити збереження');if(!live.current||token.ac.signal.aborted||userRef.current!==owner)return;reset();sdone(previous?'зміни збережено':'сайт додано');loader.current(false)}catch(e){if(live.current&&!token.ac.signal.aborted&&userRef.current===owner){sformError(e.message||'не вдалося зберегти сайт');if(e.status===401)authLoader.current();if(e.status===409)loader.current(false)}}finally{if(action.current===token){action.current=null;if(live.current)ssaving(false)}}
};
const remove=async v=>{
if(!me||me.id!==v.avtor_id||action.current||fileBusy||!window.confirm(t('Видалити цей сайт із каталогу?')))return;
const owner=me.id,token={ac:new AbortController(),owner};action.current=token;sdeleting(v.id);serror('');sdone('');
try{const result=await api('/api/saity?id='+encodeURIComponent(v.id)+'&revision='+encodeURIComponent(v.revision),{method:'DELETE',signal:token.ac.signal});if(result!==null&&result.ok!==true)throw Error('не вдалося підтвердити видалення');if(!live.current||token.ac.signal.aborted||userRef.current!==owner)return;if(editRef.current?.id===v.id)reset();sdone('сайт видалено');loader.current(false)}catch(e){if(live.current&&!token.ac.signal.aborted&&userRef.current===owner){serror(e.message||'не вдалося видалити сайт');if(e.status===401)authLoader.current();if(e.status===409)loader.current(false)}}finally{if(action.current===token){action.current=null;if(live.current)sdeleting(null)}}
};
return <main className="sy-page" id="sites"><style>{st}</style><header className="sy-head"><h1 className="sy-title">сайти</h1></header>
{authError&&<div className="sy-error" role="alert">{authError}<div className="sy-actions" style={{marginTop:10}}><button type="button" className="sy-button" onClick={()=>authLoader.current()}>спробувати ще</button></div></div>}
{!authReady?<section className="sy-card" role="status">завантаження…</section>:me?<section className="sy-card" ref={form} style={{scrollMarginTop:90}}><h2 className="sy-h2">{editing?'редагувати сайт':'додати сайт'}</h2><form className="sy-form" onSubmit={submit} aria-busy={saving}><fieldset className="sy-fields" disabled={busy}>
<div className="sy-grid"><label className="sy-label"><span>назва сайту</span><input ref={titleInput} className="sy-input" value={nazva} onChange={e=>snazva(e.target.value)} maxLength={160} required autoComplete="off" translate="no"/></label><label className="sy-label"><span>вид сайту</span><select className="sy-input" value={type} onChange={e=>stype(e.target.value)}>{siteTypes.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>
<label className="sy-label"><span>посилання</span><input className="sy-input" type="text" inputMode="url" value={url} onChange={e=>surl(e.target.value)} placeholder="https://www.mossad.gov.il" maxLength={2048} required autoCapitalize="none" autoComplete="url" spellCheck={false} translate="no"/></label>
<label className="sy-label"><span>опис</span><textarea className="sy-input sy-text" value={opis} onChange={e=>sopis(e.target.value)} maxLength={5000} rows={5} translate="no"/></label><span className="sy-note" translate="no">{[...opis].length} / 5000</span>
<div className="sy-actions"><input ref={input} className="sy-file" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" onChange={choose} disabled={busy||fileBusy}/><button type="button" className="sy-button" onClick={()=>input.current?.click()} disabled={busy||fileBusy}>{fileBusy?'перевірка…':editing?'змінити скриншот':'додати скриншот'}</button>{(file||fileError)&&<button type="button" className="sy-button" onClick={clearFile} disabled={busy}>{editing?'скасувати заміну':'прибрати файл'}</button>}{file&&<span className="sy-note" translate="no">{file.value.name} · {(file.value.size/1048576).toFixed(1)} MB</span>}</div>
{(file||editing)&&<div className="sy-preview"><img key={file?.preview||editing.skrin} src={file?.preview||siteScreenshot(editing.skrin)} alt="скриншот сайту" onError={e=>{e.currentTarget.style.display='none'}}/></div>}
{fileError&&<div className="sy-error" role="alert">{fileError}</div>}{formError&&<div className="sy-error" role="alert">{formError}</div>}
<div className="sy-actions"><button className="sy-button" type="submit" disabled={busy||fileBusy||!ready||!!fileError||!file&&!editing}>{saving?'збереження…':editing?'зберегти':'додати сайт'}</button>{editing&&<button className="sy-button" type="button" disabled={busy} onClick={()=>{reset();sdone('')}}>скасувати</button>}</div>
</fieldset></form></section>:<section className="sy-card"><a className="sy-button" href="/login">увійти</a></section>}
{done&&<div className="sy-ok" role="status">{done}</div>}
<div className="sy-filters"><input className="sy-input" value={q} onChange={e=>sq(e.target.value)} placeholder="пошук сайтів…" aria-label="пошук сайтів" maxLength={200} disabled={busy}/><select className="sy-input" value={vyd} onChange={e=>svyd(e.target.value)} aria-label="вид сайту" disabled={busy}><option value="">усі види</option>{siteTypes.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><select className="sy-input" value={sort} onChange={e=>ssort(e.target.value)} aria-label="сортування" disabled={busy}><option value="new">спочатку нові</option><option value="old">спочатку старі</option><option value="az">назва: А–Я</option><option value="za">назва: Я–А</option></select></div>
<div className="sy-listhead"><span className="sy-count"><span>знайдено</span>: <span translate="no">{total}</span></span><button className="sy-button" type="button" onClick={()=>load(false)} disabled={loading||busy}>оновити</button></div>
{error&&<div className="sy-error" role="alert">{error}</div>}
<div aria-busy={loading}>{loading&&!rows.length?<div className="sy-empty" role="status">завантаження…</div>:!rows.length&&!error?<div className="sy-empty">{query||vyd?'нічого не знайдено.':'сайтів поки немає'}</div>:rows.map(v=><article className="sy-site" key={v.id}><div className="sy-sitegrid"><Shot src={siteScreenshot(v.skrin)} name={v.nazva}/><div><h2><a className="sy-name" href={normalizeSiteURL(v.url)} target="_blank" rel="noopener noreferrer" translate="no">{v.nazva}</a></h2><a className="sy-url" href={normalizeSiteURL(v.url)} target="_blank" rel="noopener noreferrer" translate="no">{normalizeSiteURL(v.url)}</a><div className="sy-info"><span>{categories.get(v.vyd)}</span>{v.username&&<a className="sy-author" href={'/id/'+encodeURIComponent(v.avtor_id)} translate="no">{v.username}</a>}<time dateTime={v.created_at} translate="no">{new Date(v.created_at).toISOString().slice(0,10)}</time></div>{v.opis&&<p className="sy-opis" translate="no">{v.opis}</p>}<div className="sy-actions"><a className="sy-button" href={normalizeSiteURL(v.url)} target="_blank" rel="noopener noreferrer">відкрити сайт</a>{me?.id===v.avtor_id&&<><button type="button" className="sy-button" disabled={busy||fileBusy||!!editing} onClick={()=>edit(v)}>редагувати</button><button type="button" className="sy-button" disabled={busy||fileBusy} onClick={()=>remove(v)}>{deleting===v.id?'видалення…':'видалити'}</button></>}</div></div></div></article>)}</div>
{data.key===key&&data.next&&<div className="sy-more"><button type="button" className="sy-button" disabled={loading||busy} onClick={()=>load(true)}>{loading?'завантаження…':'показати ще'}</button></div>}
</main>;
}
