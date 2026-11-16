const max=100*1024*1024;
const abortError=()=>new DOMException('Aborted','AbortError');
const failure=(r,j)=>Error([404,405,501].includes(r.status)?'музичний сервіс ще не підключено':typeof j?.error==='string'&&j.error?j.error:'помилка завантаження');
function musicWait(ms,signal){return new Promise((resolve,reject)=>{
if(signal?.aborted){reject(abortError());return}
const done=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);resolve()};
const cancel=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);reject(abortError())};
const timer=setTimeout(done,ms);signal?.addEventListener('abort',cancel,{once:true});
})}
async function musicRequest(url,body,signal,retry=false){
const text=JSON.stringify(body);
for(let at=0;at<(retry?4:1);at++){
if(signal?.aborted)throw abortError();
const ac=new AbortController(),cancel=()=>ac.abort(),timer=setTimeout(cancel,45000);
signal?.addEventListener('abort',cancel,{once:true});
let error=null,again=true;
try{
const r=await fetch(url,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json',Accept:'application/json'},body:text,signal:ac.signal});
const j=await r.json().catch(()=>null);
if(r.ok){if(!j)throw Error('помилка завантаження');return j}
again=[408,409,425,429,500,502,503,504].includes(r.status);error=failure(r,j);
}catch(e){if(signal?.aborted)throw abortError();error=Error('помилка завантаження')}
finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel)}
if(!retry||!again||at===3)throw(error?.name==='AbortError'?Error('помилка завантаження'):error||Error('помилка завантаження'));
await musicWait(500*2**at,signal);
}
}
export async function uploadMusic(file,metadata,{signal,onProgress=()=>{}}={}){
if(signal?.aborted)throw abortError();
if(!(file instanceof Blob)||file.size<=0||file.size>max)throw Error('макс 100 МБ');
let token='',published=false,workers=[];
const group=new AbortController(),cancel=()=>group.abort();
signal?.addEventListener('abort',cancel,{once:true});
try{
onProgress(0);
const start=await musicRequest('/api/music-upload?op=start',{size:file.size},group.signal);
if(typeof start.token!=='string'||!/^[a-f0-9]{32}$/.test(start.token))throw Error('помилка завантаження');
token=start.token;
const size=start.chunkSize,count=Math.ceil(file.size/size);
if(size!==131072||start.parts!==count)throw Error('помилка завантаження');
let next=0,sent=0;
const worker=async()=>{
for(;;){
if(group.signal.aborted)throw abortError();
const index=next++;if(index>=count)return;
const a=new Uint8Array(await file.slice(index*size,Math.min(file.size,(index+1)*size)).arrayBuffer());
if(group.signal.aborted)throw abortError();
let text='';for(let i=0;i<a.length;i+=8192)text+=String.fromCharCode(...a.subarray(i,i+8192));
const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',a));
const sha256=Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
const j=await musicRequest('/api/music-upload?op=part&token='+token+'&index='+index,{data:btoa(text),sha256},group.signal,true);
if(j.index!==index)throw Error('помилка завантаження');
sent+=a.length;onProgress(Math.min(99,Math.floor(sent/file.size*100)));
}
};
workers=Array.from({length:Math.min(2,count)},()=>worker());
await Promise.all(workers);
const finish=await musicRequest('/api/music-upload?op=finish&token='+token,{},group.signal,true);
if(finish.token!==token)throw Error('помилка завантаження');
onProgress(100);
const row=await musicRequest('/api/music',{nazva:metadata.nazva,genre:metadata.genre,author:metadata.author,albom:metadata.albom,godvipuska:metadata.godvipuska,opis:metadata.opis,upload:token},group.signal);
if(!row||!Number.isSafeInteger(Number(row.id))||Number(row.id)<=0||typeof row.failik!=='string'||typeof row.nazva!=='string')throw Error('помилка завантаження');
published=true;return row;
}catch(e){group.abort();await Promise.allSettled(workers);if(signal?.aborted)throw abortError();throw(e?.name==='Error'?e:Error('помилка завантаження'))}
finally{
signal?.removeEventListener('abort',cancel);
if(token&&!published){
const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),10000);
void fetch('/api/music-upload?token='+encodeURIComponent(token),{method:'DELETE',credentials:'include',headers:{Accept:'application/json'},keepalive:true,signal:ac.signal}).catch(()=>{}).finally(()=>clearTimeout(timer));
}
}
}
