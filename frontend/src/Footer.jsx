import{memo,useState as us}from'react';
import{languages}from'./lang';
const flags=[
{code:"ua",file:"ua.png",name:"Українська"},
{code:"en",file:"gb.png",name:"English"},
{code:"ru",file:"ru.png",name:"Русский"},
{code:"be",file:"by.png",name:"Беларуская"},
{code:"pl",file:"pl.png",name:"Polski"},
{code:"ka",file:"ge.png",name:"ქართული"},
{code:"kk",file:"kz.png",name:"Қазақша"},
{code:"he",file:"il.png",name:"עברית"},
{code:"cs",file:"cz.png",name:"Čeština"},
{code:"sk",file:"sk.png",name:"Slovenčina"},
{code:"ro",file:"ro.png",name:"Română"},
{code:"isv",file:"psl.png",name:"Medžuslovjansky"},
{code:"de",file:"de.png",name:"Deutsch"},
{code:"zh",file:"cn.png",name:"简体中文"},
{code:"et",file:"ee.png",name:"Eesti"},
{code:"lv",file:"lv.png",name:"Latviešu"},
{code:"lt",file:"lt.png",name:"Lietuvių"},
{code:"sr",file:"rs.png",name:"Српски"},
{code:"sl",file:"si.png",name:"Slovenščina"},
{code:"hr",file:"hr.png",name:"Hrvatski"},
{code:"bs",file:"ba.png",name:"Bosanski"},
{code:"mk",file:"mk.png",name:"Македонски"},
{code:"lb",file:"lu.png",name:"Lëtzebuergesch"},
{code:"cnr",file:"me.png",name:"Crnogorski"},
{code:"tr",file:"tr.png",name:"Türkçe"},
{code:"el",file:"gr.png",name:"Ελληνικά"},
{code:"mn",file:"mn.png",name:"Монгол"},
{code:"ja",file:"jp.png",name:"日本語"},
{code:"ko",file:"kr.png",name:"한국어"},
{code:"it",file:"it.png",name:"Italiano"},
{code:"fr",file:"fr.png",name:"Français"},
{code:"nl",file:"nl.png",name:"Nederlands"},
{code:"bg",file:"bg.png",name:"Български"},
{code:"hu",file:"hu.png",name:"Magyar"},
{code:"uz",file:"uz.png",name:"O‘zbekcha"},
{code:"tg",file:"tj.png",name:"Тоҷикӣ"},
{code:"ky",file:"kg.png",name:"Кыргызча"},
{code:"tk",file:"tm.png",name:"Türkmençe"},
{code:"az",file:"az.png",name:"Azərbaycanca"},
{code:"hy",file:"am.png",name:"Հայերեն"},
{code:"sq",file:"al.png",name:"Shqip"},
{code:"da",file:"dk.png",name:"Dansk"},
{code:"ga",file:"ie.png",name:"Gaeilge"},
{code:"nb",file:"no.png",name:"Norsk bokmål"},
{code:"sv",file:"se.png",name:"Svenska"},
{code:"fi",file:"fi.png",name:"Suomi"},
{code:"es",file:"es.png",name:"Español"},
{code:"pt",file:"pt.png",name:"Português"},
{code:"eo",file:"eo.gif",name:"Esperanto"},
{code:"crh",name:"Qırımtatarca"},
{code:"gag",name:"Gagauzça"},
{code:"rue",name:"Русиньскый"},
{code:"cu",name:"Словѣньскъ ѩꙁыкъ"},
{code:"x-surzhyk",name:"Суржик"},
{code:"x-mriya",name:"Мрійчанська"},
{code:"uk-x-halych",name:"Галицька говірка"},
{code:"ru-x-donetsk",name:"Донецкий говор"},
{code:"ru-x-odesa",name:"Одесский говор"}
];
function Footer({l,ch}){
const[er,se]=us({});
const[op,so]=us(false);const[q,sq]=us('');const nq=q.trim().toLowerCase();
const av=flags.filter(f=>languages.includes(f.code));const fl=nq?av.filter(f=>f.name.toLowerCase().includes(nq)||f.code.toLowerCase().includes(nq)):av;
const cur=av.find(f=>f.code===l);
const sl=(c)=>{so(false);sq('');if(l!==c)ch(c)};
return(
<footer className="mlf" translate="no" aria-label="Переклад сайту">
<style>{`
.mlf{position:static;flex:0 0 auto;width:100%;box-sizing:border-box;margin-top:auto;padding:20px 16px 24px;text-align:center}
.mlf-title{margin:0 0 10px;color:#777064;font:400 12px/1.5 system-ui,sans-serif}
.mlf-title2{margin:0 0 10px;color:#777064;font:400 14px/1.5 system-ui,sans-serif}
.mlf-title3{margin:0 0 10px;color:#777064;font:400 12px/1.5 system-ui,sans-serif}
.mlf-picker{position:relative;display:inline-block;direction:ltr}
.mlf-trigger{appearance:none;-webkit-appearance:none;display:flex;align-items:center;justify-content:center;gap:8px;box-sizing:border-box;min-width:140px;height:34px;margin:0;padding:4px 12px;border:1px solid #d8d2c8;border-radius:4px;background:#fff;box-shadow:none;cursor:pointer;touch-action:manipulation;color:#777064;font:500 12px/1 system-ui,sans-serif;transition:none;animation:none;transform:none}
.mlf-trigger:hover,.mlf-trigger:active{border:1px solid #d8d2c8;background:#fff;box-shadow:none;transform:none}
.mlf-trigger:focus{outline:none}
.mlf-trigger:focus-visible{outline:1px dashed #777064;outline-offset:2px}
.mlf-trigger-flag{display:block;width:18px;height:11px;object-fit:contain;border:0;box-shadow:none;pointer-events:none;user-select:none;-webkit-user-select:none}
.mlf-trigger-code{display:flex;align-items:center;justify-content:center;width:28px;height:21px;color:#777064;font:500 10px/1 system-ui,sans-serif;pointer-events:none;user-select:none}
.mlf-trigger-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px}
.mlf-trigger-arrow{display:block;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid #777064;pointer-events:none}
.mlf-list{position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);z-index:20;box-sizing:border-box;width:220px;max-height:260px;overflow-y:auto;margin:0;padding:6px;border:1px solid #d8d2c8;border-radius:4px;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,.12);list-style:none;direction:ltr}
.mlf-search{display:block;box-sizing:border-box;width:100%;height:28px;margin:0 0 6px;padding:4px 8px;border:1px solid #d8d2c8;border-radius:3px;background:#fff;color:#777064;font:500 12px/1 system-ui,sans-serif;outline:none}.mlf-search:focus{border-color:#b8b2a8}.mlf-item{appearance:none;-webkit-appearance:none;display:flex;align-items:center;gap:8px;box-sizing:border-box;width:100%;height:30px;margin:0;padding:3px 8px;border:0;border-radius:3px;background:transparent;box-shadow:none;cursor:pointer;touch-action:manipulation;color:#777064;font:500 12px/1 system-ui,sans-serif;text-align:left;transition:none;animation:none;transform:none}
.mlf-item:hover,.mlf-item:active{background:#f3f0ea;border:0;box-shadow:none;transform:none}
.mlf-item:focus{outline:none}
.mlf-item:focus-visible{outline:1px dashed #777064;outline-offset:-2px}
.mlf-item[aria-pressed="true"]{background:#ece7de;border:0;box-shadow:none;transform:none}
.mlf-flag{display:block;width:18px;height:11px;object-fit:contain;border:0;box-shadow:none;pointer-events:none;user-select:none;-webkit-user-select:none;flex:0 0 auto}
.mlf-code{display:flex;align-items:center;justify-content:center;width:28px;height:21px;color:#777064;font:500 10px/1 system-ui,sans-serif;pointer-events:none;user-select:none;flex:0 0 auto}
.mlf-name{flex:1 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`}</style>
<p className="mlf-title2">mriya.ink by teftelya</p>
<p className="mlf-title3">форк проєкту від (ВАШ НІКНЕЙМ ЮЗЕРНЕЙМ ПСЕВДОНІМ ЩЕ ЩОСЬ)</p>
<p className="mlf-title">Переклад сайту</p>
<div className="mlf-picker">
<button className="mlf-trigger" type="button" aria-haspopup="listbox" aria-expanded={op} aria-label="Language" onClick={()=>so(v=>!v)}>
{cur&&cur.file&&(er[cur.code]?(
<span className="mlf-trigger-code" aria-hidden="true">{cur.file.slice(0,-4).toUpperCase()}</span>
):(
<img className="mlf-trigger-flag" src={'/flags/'+cur.file+'?v=2'} alt="" width="28" height="21" draggable={false} onError={()=>se(v=>({...v,[cur.code]:true}))}/>
))}
<span className="mlf-trigger-name">{cur?cur.name:'-'}</span>
<span className="mlf-trigger-arrow" aria-hidden="true"/>
</button>
{op&&(
<ul className="mlf-list" role="listbox" aria-label="Language"><li role="presentation"><input className="mlf-search" type="text" value={q} onChange={e=>sq(e.target.value)} placeholder="Пошук…" aria-label="Search language" autoFocus /></li>
{(fl.length?fl:av).map(f=>(
<li key={f.code} role="presentation">
<button className="mlf-item" type="button" role="option" title={f.name} aria-label={f.name} aria-pressed={l===f.code} aria-selected={l===f.code} onClick={()=>sl(f.code)}>
{f.file&&(er[f.code]?(
<span className="mlf-code" aria-hidden="true">{f.file.slice(0,-4).toUpperCase()}</span>
):(
<img className="mlf-flag" src={'/flags/'+f.file+'?v=2'} alt="" width="28" height="21" draggable={false} onError={()=>se(v=>({...v,[f.code]:true}))}/>
))}
<span className="mlf-name">{f.name}</span>
</button>
</li>
))}
</ul>
)}
</div>
</footer>
);
}
export default memo(Footer);
