const max=100*1024*1024;
const aborted=()=>new DOMException('Aborted','AbortError');
export async function cleanAudio(file,{signal,onProgress=()=>{}}={}){
if(signal?.aborted)throw aborted();
if(!file||file.size<=0||file.size>max)throw Error('макс 100 МБ');
if(!/\.(mp3|wav)$/i.test(file.name))throw Error('тільки MP3 або WAV');
let ff=null,timer=null,timed=false,finished=false;
const cancel=()=>{if(ff)ff.terminate()};
const stop=()=>{if(signal?.aborted)throw aborted();if(timed)throw Error('помилка завантаження')};
const run=async()=>{
const url='/ffmpeg/ffmpeg-0.12.15/index.js';
const {FFmpeg}=await import(/* @vite-ignore */ url);
stop();ff=new FFmpeg();
ff.on('progress',v=>{if(!finished&&!signal?.aborted)onProgress(Math.min(99,Math.max(0,Math.floor((Number(v.progress)||0)*100))))});
await ff.load({classWorkerURL:location.origin+'/ffmpeg/ffmpeg-0.12.15/worker.js',coreURL:location.origin+'/ffmpeg/core-0.12.10/ffmpeg-core.js',wasmURL:location.origin+'/ffmpeg/core-0.12.10/ffmpeg-core.wasm'});
stop();
let bytes=new Uint8Array(await file.arrayBuffer());
stop();
const input=/\.wav$/i.test(file.name)?'input.wav':'input.mp3';
await ff.writeFile(input,bytes);bytes=null;
stop();
const code=await ff.exec(['-hide_banner','-v','error','-i',input,'-map','0:a:0','-vn','-sn','-dn','-map_metadata','-1','-map_chapters','-1','-c:a','libmp3lame','-b:a','192k','-ar','44100','-ac','2','-fflags','+bitexact','-flags:a','+bitexact','-id3v2_version','0','-write_id3v1','0','-write_xing','0','-f','mp3','audio.mp3'],1200000);
stop();
if(code!==0)throw Error('помилка завантаження');
await ff.deleteFile(input);
const data=await ff.readFile('audio.mp3');
stop();
if(!(data instanceof Uint8Array)||!data.byteLength)throw Error('помилка завантаження');
if(data.byteLength>max)throw Error('макс 100 МБ');
const result=new File([data],'audio.mp3',{type:'audio/mpeg'});
onProgress(100);
return result;
};
let abortHandler;
const interrupted=new Promise((_,reject)=>{
abortHandler=()=>{cancel();reject(aborted())};
signal?.addEventListener('abort',abortHandler,{once:true});
timer=setTimeout(()=>{timed=true;cancel();reject(Error('помилка завантаження'))},1200000);
});
try{return await Promise.race([run(),interrupted])}
catch(e){if(signal?.aborted)throw aborted();if(e?.message==='макс 100 МБ')throw e;console.error('FFmpeg:',e);throw Error('помилка завантаження')}
finally{finished=true;clearTimeout(timer);signal?.removeEventListener('abort',abortHandler);cancel()}
}
