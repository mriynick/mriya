const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),base=path.join(root,'public','emoji'),out=path.join(root,'src','emoji-list.js'),list=[];
const enc=s=>encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
const scan=(dir,parts=[])=>{
for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){
if(e.isSymbolicLink())continue;
if(e.isDirectory())scan(path.join(dir,e.name),[...parts,e.name]);
else if(e.isFile()&&/\.(?:png|apng|jpe?g|jfif|pjpeg|pjp|gif|webp|avif|svg|bmp|ico)$/i.test(e.name))list.push('/emoji/'+[...parts,e.name].map(enc).join('/'));
}
};
fs.mkdirSync(base,{recursive:true});scan(base);
const text='export default '+JSON.stringify(list)+';\n';
if(!fs.existsSync(out)||fs.readFileSync(out,'utf8')!==text)fs.writeFileSync(out,text);
console.log('Emoji: '+list.length);
