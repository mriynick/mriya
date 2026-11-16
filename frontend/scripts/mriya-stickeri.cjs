const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'..','public','stickeri');
if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});
const ext=new Set(['.png','.jpg','.jpeg','.gif','.webp','.avif']);
const list=fs.readdirSync(dir).filter(f=>ext.has(path.extname(f).toLowerCase())&&fs.statSync(path.join(dir,f)).isFile()).sort((a,b)=>a<b?-1:a>b?1:0);
fs.writeFileSync(path.join(__dirname,'..','src','stickeri-list.js'),'export default '+JSON.stringify(list)+';\n');
console.log('Stickeri: '+list.length);
