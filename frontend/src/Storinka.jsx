import{useState as us,useEffect as ue,useRef as ur}from'react';
import Posts,{Rn}from'./Posts';
import Music from'./music';
import Galochki from'./Galochki';
import{createPortal}from'react-dom';
const st=`
.p-bg{position:fixed;top:0;left:0;width:100vw;height:100vh;background-size:cover;background-position:center;z-index:-1;background-color:#fbfcf8}
.s-ps{width:min(760px,calc(100% - 32px));margin:0 auto;padding:76px 0 150px;font-family:system-ui,sans-serif;color:#302b25;position:relative;z-index:1}
.s-pc{border:1px solid rgba(46,140,70,.2);border-radius:22px;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);margin-bottom:10px;overflow:hidden;}
.s-prb{width:100%;height:220px;background:#e2e4d8;object-fit:cover;display:block;border-bottom:1px solid #d0d4c0}
.s-pra{width:130px;height:130px;border-radius:50%;border:5px solid #fff;margin-top:-65px;margin-left:24px;background:#fff;object-fit:cover;position:relative;z-index:2;}
.s-pri{padding:14px 20px 18px}
.s-prn{font-size:24px;font-weight:800;margin:0 0 4px;color:#302b25;letter-spacing:-.5px}
.s-on{font-size:12px;display:flex;align-items:center;gap:6px;font-weight:600;margin-bottom:6px}.s-og{color:#16a34a}.s-or{color:#8a857a}.s-dt{width:8px;height:8px;border-radius:50%;background:#16a34a;border:1px solid #fff;box-shadow:0 0 5px #16a34a}
.s-prs{color:#4e6348;font-size:14px;font-weight:600;margin-bottom:10px}
.s-pb{min-height:38px;padding:0 20px;border:1px solid rgba(57,136,75,.4);border-radius:12px;background-image:url('/pictures/button.png');background-position:center;background-size:cover;color:white;font:600 13px system-ui;cursor:pointer;transition:filter .2s;display:inline-flex;align-items:center;justify-content:center}
.s-pb:hover:not(:disabled){filter:brightness(1.07)}
.s-pb:disabled{opacity:.5;cursor:not-allowed}
.s-ig{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:12px}
.s-igi{background:rgba(255,255,255,.6);padding:10px 12px;border-radius:14px;border:1px solid #e2e4d8;min-width:0}
.s-igl{font-size:11px;color:#8b867b;text-transform:uppercase;font-weight:700;margin-bottom:4px;letter-spacing:.35px}
.s-igv{font-size:13px;color:#302b25;font-weight:500;word-break:break-word}
.s-fx{width:100%;height:38px;padding:0 12px;border:1px solid #d0d4c0;border-radius:10px;font:inherit;font-size:14px;outline:none;box-sizing:border-box;background:rgba(255,255,255,.86)}
.s-fxt{width:100%;min-height:100px;padding:12px;border:1px solid #d0d4c0;border-radius:10px;font:inherit;font-size:14px;outline:none;resize:vertical;box-sizing:border-box;background:rgba(255,255,255,.86)}
.s-fx:focus,.s-fxt:focus{border-color:#39834b;}
.s-mtb{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px;background:rgba(240,240,230,.6);padding:8px;border-radius:10px;border:1px solid #e2e4d8}
.s-tbb{height:30px;padding:0 10px;border:1px solid #d0d4c0;border-radius:8px;background:#fff;color:#302b25;font:600 12px system-ui;cursor:pointer;flex:none}
.s-tbb:hover{background:#eef0e0;border-color:#63a86c}
.s-sum .s-igi{background:rgba(250,251,246,.82)}
.s-more{display:flex;width:auto;min-height:32px;margin:10px 0 0 auto;padding:0 16px;border:1px solid rgba(57,136,75,.4);border-radius:10px;background:url('/pictures/button.png') center/cover no-repeat;color:#fff;font:600 12px system-ui;cursor:pointer;align-items:center;justify-content:center}
.s-moreinfo{display:none;margin-top:0}
.s-moreinfo.s-open{display:grid;margin-top:8px}
.s-posts{margin-top:-6px}
.s-posts>div{margin-top:0!important}
.s-gal{border:1px solid rgba(46,140,70,.2);border-radius:18px;background:rgba(255,255,255,.9);backdrop-filter:blur(10px);padding:14px;margin:0 0 8px;}
.s-gh{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.s-gt{margin:0;color:#302b25;font-size:16px;font-weight:750;letter-spacing:-.2px}
.s-gc{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.s-gp{display:block;width:100%;aspect-ratio:1;overflow:hidden;border-radius:11px;background:#e8eadf}
.s-gp img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .2s}
.s-gp:hover img{transform:scale(1.05)}
.s-gx{padding:18px 8px;text-align:center;color:#817b70;font-size:13px}
@media(max-width:600px){.s-ps{width:calc(100% - 24px);padding:68px 0 36px}.s-pc{border-radius:20px;margin-bottom:6px}.s-prb{height:140px}.s-pra{width:96px;height:96px;margin-top:-48px;margin-left:16px;border-width:4px}.s-pri{padding:10px 14px 14px}.s-prn{font-size:21px}.s-pb{width:100%;min-height:42px;border-radius:13px}.s-ig{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:10px}.s-igi{padding:9px 10px;border-radius:13px}.s-igl{font-size:10px;margin-bottom:5px}.s-igv{font-size:13px;line-height:1.45}.s-pc>div[style*="padding: 24px"]{padding:18px!important}.s-pc>div[style*="padding: 24px"]>h2{font-size:18px!important;margin-bottom:14px!important}.s-mtb{flex-wrap:nowrap;overflow-x:auto;overscroll-behavior-x:contain;padding:7px;gap:6px}.s-tbb{height:32px;padding:0 11px}.s-fxt{min-height:116px}.s-ig>div:not(.s-igi){min-width:0;padding:10px;background:rgba(255,255,255,.52);border:1px solid #e2e4d8;border-radius:12px}.s-ig>div:not(.s-igi) .s-fx{height:40px;padding:0 9px;font-size:13px}.s-pc>div[style*="padding: 24px"]>div[style*="display: flex; gap: 12px"]{gap:8px!important}.s-pc>div[style*="padding: 24px"]>div[style*="display: flex; gap: 12px"] .s-pb{width:calc(50% - 4px);padding:0 8px}.s-pc>div[style*="padding: 24px"]>div[style*="display: flex; gap: 10px"] .s-pb{width:auto;flex:1;padding:0 8px;font-size:12px}.s-pri .s-ig{margin-top:12px}.s-sum{grid-template-columns:repeat(2,minmax(0,1fr))}.s-sum .s-igi:first-child{grid-column:1/-1}.s-more{display:flex;width:auto;min-height:32px;margin:10px 0 0 auto;padding:0 16px;border:1px solid rgba(57,136,75,.4);border-radius:10px;background:url('/pictures/button.png') center/cover no-repeat;color:#fff;font:600 12px system-ui;cursor:pointer;align-items:center;justify-content:center}.s-more:active{filter:brightness(1.07)}.s-moreinfo{display:none}.s-moreinfo.s-open{display:grid;margin-top:8px}.s-posts{margin-top:-4px}.s-posts>div>div{margin-top:0!important;margin-bottom:8px!important}.s-gal{padding:12px;border-radius:16px;margin-bottom:6px}.s-gh{margin-bottom:10px}.s-gt{font-size:15px}.s-gc{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.s-gp{border-radius:9px}.s-gx{padding:14px 6px;font-size:12px}}
.s-avwrap{display:block;position:relative;width:140px;height:140px;flex-shrink:0;margin:-65px 0 0 24px;z-index:2}
.s-avwrap>.s-pra{position:absolute;inset:0;width:100%;height:100%;margin:0;border:5px solid #fff;box-sizing:border-box;border-radius:50%;object-fit:cover}
.s-avwrap.s-hasframe>.s-pra{inset:9%;width:82%;height:82%;border:0}
.s-avwrap>.s-avatarframe{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none}
.s-avwrap.s-editav{width:104px;height:104px;margin:0 0 16px}
.s-frame-shade{position:fixed;inset:0;z-index:11000;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:20px;background:rgba(48,43,37,.55);font-family:system-ui,sans-serif}
.s-frame-box{width:min(560px,100%);max-height:85vh;max-height:85dvh;overflow:auto;box-sizing:border-box;padding:20px;border:1px solid #d0d4c0;border-radius:18px;background:#fbfcf8;color:#302b25}
.s-frame-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
.s-frame-title{margin:0;font-size:18px;font-weight:750}
.s-frame-close{display:flex;align-items:center;justify-content:center;width:34px;height:34px;padding:0;flex-shrink:0;border:1px solid #d0d4c0;border-radius:9px;background:#fff;color:#39834b;font:24px/1 system-ui;cursor:pointer}
.s-frame-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:10px}
.s-frame-tile{display:block;box-sizing:border-box;min-width:0;padding:5px;border:1px solid #d0d4c0;border-radius:12px;background:#fff;cursor:pointer}
.s-frame-tile[aria-pressed="true"]{border-color:#39834b;box-shadow:0 0 0 1px #39834b}
.s-frame-tile:focus-visible,.s-frame-close:focus-visible{outline:2px solid #39834b;outline-offset:3px}
.s-frame-thumb{display:block;position:relative;width:100%;aspect-ratio:1;pointer-events:none}
.s-frame-base{position:absolute;inset:9%;width:82%;height:82%;border-radius:50%;object-fit:cover;background:#e2e4d8}
.s-frame-overlay{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.s-frame-none{position:absolute;inset:auto 0 0 auto;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#fff;color:#99442e;font:700 22px/1 system-ui}
.s-frame-note{margin:14px 0 0;color:#777064;font-size:12px;line-height:1.5}
.s-frame-error{padding:12px 0;color:#99442e;font-size:13px;line-height:1.5}
.s-frame-retry{border:1px solid #d0d4c0;border-radius:8px;background:#fff;padding:6px 12px;color:#39834b;font:600 12px system-ui;cursor:pointer}
@media(max-width:600px){.s-avwrap{width:104px;height:104px;margin-top:-48px;margin-left:16px}.s-avwrap>.s-pra{border-width:4px}.s-avwrap.s-hasframe>.s-pra{border:0}.s-avwrap.s-editav{width:104px;height:104px;margin:0 0 16px}.s-frame-shade{padding:12px}.s-frame-box{padding:16px}.s-frame-grid{grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:8px}}

.s-avwrap.s-avwrap{position:relative;display:block;width:140px;height:140px;min-width:140px;max-width:140px;min-height:140px;max-height:140px;isolation:isolate;overflow:visible}
.s-avwrap.s-avwrap>.s-pra{position:absolute!important;z-index:1!important;inset:0!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;margin:0!important;box-sizing:border-box!important}
.s-avwrap.s-avwrap.s-hasframe>.s-pra{inset:9%!important;width:82%!important;height:82%!important;border:0!important}
.s-avwrap.s-avwrap>img.s-avatarframe{position:absolute!important;z-index:2!important;inset:0!important;display:block;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;max-width:100%!important;max-height:100%!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-sizing:border-box!important;object-fit:contain!important;transform:none!important;pointer-events:none}
.s-avwrap.s-avwrap.s-editav{width:104px;height:104px;min-width:104px;max-width:104px;min-height:104px;max-height:104px}
.s-frame-thumb.s-frame-thumb{position:relative;display:block;isolation:isolate;overflow:hidden}
.s-frame-thumb>.s-frame-base{z-index:1}
.s-frame-thumb>img.s-frame-overlay{position:absolute!important;z-index:2!important;inset:0!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;max-width:100%!important;max-height:100%!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;object-fit:contain!important;transform:none!important}
.s-frame-thumb>.s-frame-none{z-index:3}
@media(max-width:600px){.s-avwrap.s-avwrap{width:104px;height:104px;min-width:104px;max-width:104px;min-height:104px;max-height:104px}}


.s-avwrap.s-avwrap>img.s-avatarframe{inset:9%!important;width:82%!important;height:82%!important;border-radius:50%!important;clip-path:circle(50% at 50% 50%)!important}
.s-frame-thumb>img.s-frame-overlay{inset:9%!important;width:82%!important;height:82%!important;border-radius:50%!important;clip-path:circle(50% at 50% 50%)!important}


.s-avwrap.s-avwrap>img.s-avatarframe{inset:9%!important;width:82%!important;height:82%!important;border-radius:0!important;clip-path:none!important;object-fit:contain!important}
.s-frame-thumb.s-frame-thumb{overflow:visible!important}
.s-frame-thumb>img.s-frame-overlay{inset:9%!important;width:82%!important;height:82%!important;border-radius:0!important;clip-path:none!important;object-fit:contain!important}

.s-gpv{position:relative;display:block}
.s-gpv-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:28px/1 system-ui;color:#fff;text-shadow:0 2px 12px #000;background:rgba(32,33,30,.18);transition:background .2s;pointer-events:none}
.s-gpv:hover .s-gpv-play{background:rgba(32,33,30,.32)}
@media(max-width:600px){.s-gpv-play{font-size:22px}}

.pf-in{position:relative;min-width:0}.pf-bt{display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:start;height:auto;min-height:40px;cursor:pointer}.pf-bt>span:first-child{overflow-wrap:anywhere;white-space:normal}.pf-po{margin-top:6px;padding:8px;background:#fbfcf8;border:1px solid #d0d4c0;border-radius:10px}.pf-li{max-height:230px;overflow:auto;overscroll-behavior:contain;margin-top:6px}.pf-op{display:block;width:100%;padding:8px;border:0;border-radius:6px;background:transparent;text-align:start;color:#302b25;font:inherit;font-size:13px;cursor:pointer;overflow-wrap:anywhere}.pf-op:hover,.pf-op[aria-pressed="true"]{background:#eaf1e7}.pf-op:disabled{opacity:.5;cursor:not-allowed}.pf-op:focus-visible,.pf-bt:focus-visible{outline:2px solid #39834b;outline-offset:2px}.pf-em{padding:10px;color:#817b70;font-size:13px}.pf-va{white-space:pre-wrap;overflow-wrap:anywhere}.pf-no{margin-bottom:14px;color:#817b70;font-size:13px;line-height:1.5}
`;
const pxs=s=>s.split('|').map(v=>v.trim()).filter(Boolean);
const pxi=pxs('Анархо-комунізм|Анархо-синдикалізм|Анархо-колективізм|Анархізм|Соціальний анархізм|Платформізм|Синтез-анархізм|Повстанський анархізм|Егоїстичний анархізм|Індивідуалістичний анархізм|Анархо-фемінізм|Квір-анархізм|Екоанархізм|Зелений анархізм|Анархо-примітивізм|Анархо-пацифізм|Християнський анархізм|Буддійський анархізм|Мютюелізм|Лібертарний комунізм|Радянський комунізм|Лівий комунізм|Комунізм робітничих рад|Бордиґізм|Автономізм|Операїзм|Марксизм|Ортодоксальний марксизм|Неомарксизм|Західний марксизм|Марксизм-ленінізм|Ленінізм|Троцькізм|Сталінізм|Маоїзм|Гонзалізм|Ходжаїзм|Тітоїзм|Єврокомунізм|Люксембурґіанство|Делеонізм|Чучхе|Націонал-комунізм|Націонал-більшовизм|Соціалізм|Демократичний соціалізм|Лібертарний соціалізм|Ринковий соціалізм|Гільдійський соціалізм|Кооперативний соціалізм|Християнський соціалізм|Ісламський соціалізм|Арабський соціалізм|Африканський соціалізм|Екосоціалізм|Феміністичний соціалізм|Соціалістичний фемінізм|Соціальний екологізм|Комуналізм|Демократичний конфедералізм|Партисипативна економіка|Синдикалізм|Соціал-демократія|Демократичний соціал-реформізм|Фабіанство|Бернштайніанство|Нордична модель|Прогресивізм|Соціальний лібералізм|Лівий лібералізм|Соціальний фемінізм|Зелена політика|Аграрний соціалізм|Аграризм|Джорджизм|Геолібертаріанство|Дистрибутизм|Солідаризм|Соціальний ринковий лад|Християнська демократія|Центризм|Радикальний центризм|Третій шлях|Лібералізм|Класичний лібералізм|Конституціоналізм|Республіканізм|Громадянський республіканізм|Плюралізм|Космополітизм|Інтернаціоналізм|Федералізм|Конфедералізм|Муніципалізм|Пряма демократія|Деліберативна демократія|Піратська політика|Ліберальний фемінізм|Ліберальний консерватизм|Консервативний лібералізм|Націонал-лібералізм|Економічний лібералізм|Неолібералізм|Ордолібералізм|Фіскальний консерватизм|Лібертаріанство|Праве лібертаріанство|Ліве лібертаріанство|Мінархізм|Анархо-капіталізм|Волюнтаризм|Агоризм|Об’єктивізм|Палеолібертаріанство|Консерватизм|Поміркований консерватизм|Соціальний консерватизм|Традиціоналізм|Націонал-консерватизм|Палеоконсерватизм|Неоконсерватизм|Лібертарний консерватизм|Зелений консерватизм|Патерналістський консерватизм|Релігійний консерватизм|Інтегралізм|Реакціонізм|Неореакція|Реставраціонізм|Авторитаризм|Бонапартизм|Цезаризм|Корпоратизм|Фашизм|Неофашизм|Націонал-соціалізм|Неонацизм|Штрассерізм|Фалангізм|Легіонеризм|Ультранаціоналізм|Етнонаціоналізм|Етноплюралізм|Громадянський націоналізм|Культурний націоналізм|Ліберальний націоналізм|Лівий націоналізм|Націонал-демократія|Панслов’янізм|Пантюркізм|Панарабізм|Панафриканізм|Сіонізм|Монархізм|Конституційний монархізм|Абсолютний монархізм|Виборний монархізм|Легітимізм|Теократія|Космізм|Біокосмізм|Імморталізм|Трансгуманізм|Демократичний трансгуманізм|Соціалістичний трансгуманізм|Лібертарний трансгуманізм|Анархо-трансгуманізм|Постгуманізм|Екстропіанство|Технопрогресивізм|Технократія|Меритократія|Епістократія|Ноократія|Кібердемократія|Криптоанархізм|Лівий акселераціонізм|Правий акселераціонізм|Лонгтермізм|Ефективний альтруїзм|Дегроус|Глибинна екологія|Екомодернізм|Соларпанк|Лунарпанк|Постанархізм|Постлівий анархізм|Постмарксизм|Аполітичність|Не визначився|Кучмізм');
const pxr=pxs('Християнство|Православ’я|Католицизм|Греко-католицизм|Протестантизм|Лютеранство|Кальвінізм|Англіканство|Баптизм|Методизм|П’ятдесятництво|Адвентизм|Квакерство|Свідки Єгови|Церква Ісуса Христа Святих останніх днів|Східні православні церкви|Ассирійська церква Сходу|Іслам|Сунізм|Шиїзм|Ібадизм|Ахмадія|Юдаїзм|Індуїзм|Буддизм|Тхеравада|Махаяна|Ваджраяна|Сикхізм|Джайнізм|Віра Бахаї|Зороастризм|Єзидизм|Мандеїзм|Даосизм|Конфуціанство|Синтоїзм|Тенгріанство|Бон|Растафаріанство|Каодай|Тенрікьо|Неоязичництво|Рідновірство|Германське неоязичництво|Кельтське неоязичництво|Вікка|Етнічні вірування|Анімізм|Шаманізм|Герметизм|Спіритуалізм|Теїстичний сатанізм|Нетеїстичний сатанізм|Атеїзм|Агностицизм|Агностичний атеїзм|Агностичний теїзм|Деїзм|Пантеїзм|Панентеїзм|Ігностицизм|Світський гуманізм|Духовність без релігії|Синкретизм|Не визначився');
const pxp=pxs('Акрофобія|Аерофобія|Агорафобія|Клаустрофобія|Соціальна фобія|Глософобія|Антропофобія|Енохлофобія|Аутофобія|Ніктофобія|Танатофобія|Некрофобія|Нозофобія|Канцерофобія|Кардіофобія|Ятрофобія|Нозокомефобія|Дентофобія|Томофобія|Гемофобія|Трипанофобія|Айхмофобія|Еметофобія|Фармакофобія|Токофобія|Фагофобія|Пнігофобія|Мізофобія|Зоофобія|Арахнофобія|Офідіофобія|Ентомофобія|Апіфобія|Мірмекофобія|Кінофобія|Айлурофобія|Орнітофобія|Іхтіофобія|Селахофобія|Мусофобія|Хіроптофобія|Герпетофобія|Батрахофобія|Аквафобія|Таласофобія|Батофобія|Гефірофобія|Амаксофобія|Сідеродромофобія|Тахофобія|Астрафобія|Анемофобія|Хіонофобія|Пірофобія|Сейсмофобія|Мегалофобія|Автоматонофобія|Педіофобія|Коулрофобія|Фобофобія');
const pxb=pxs('INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP');
const pxe=pxs('1|2|3|4|5|6|7|8|9');
const pxw=pxs('1w9|1w2|2w1|2w3|3w2|3w4|4w3|4w5|5w4|5w6|6w5|6w7|7w6|7w8|8w7|8w9|9w8|9w1');
const pxn=pxs('sp|so|sx|sp/so|sp/sx|so/sp|so/sx|sx/sp|sx/so');
const pxf=pxs('125|126|127|135|136|137|145|146|147|258|259|268|269|278|279|358|359|368|369|378|379|458|459|468|469|478|479');
const pxt=pxf.flatMap(v=>{const[a,b,c]=v;return[a+b+c,a+c+b,b+a+c,b+c+a,c+a+b,c+b+a]}).sort();
const pxc=pxt.flatMap(v=>[v,...pxn.map(n=>n+v)]);
const pxa=pxs('Різко негативне|Негативне|Нейтральне|Позитивне|Різко позитивне');
const pxm=pxs('Неодружений|Незаміжня|У стосунках|Одружений|Заміжня|Заручений|Заручена|Закоханий|Закохана|Цивільний шлюб|Партнерство|Відкриті стосунки|Усе складно|У пошуку|Розлучений|Розлучена|Вдівець|Вдова');
const pxd=[
{k:'ideology',l:'ідеологія',o:pxi,c:true},
{k:'ideologies',l:'додаткові ідеології',o:pxi,c:true,m:true},
{k:'religion',l:'релігійний світогляд',o:pxr,c:true},
{k:'smoking',l:'ставлення до куріння',o:pxa},
{k:'alcohol',l:'ставлення до алкоголю',o:pxa},
{k:'relationship',l:'сімейний стан',o:pxm,c:true},
{k:'mbti',l:'тип особистості',o:pxb,n:true},
{k:'enneagram',l:'еннеаграма',o:pxe,n:true},
{k:'enneawing',l:'крило еннеаграми',o:pxw,n:true},
{k:'enneasubtype',l:'підтип еннеаграми',o:pxe.flatMap(v=>['sp','so','sx'].map(n=>n+v)),n:true},
{k:'instinct',l:'інстинкти',o:pxn,n:true},
{k:'tritype',l:'тритип',o:pxc,n:true},
{k:'phobias',l:'фобії',o:pxp,c:true,m:true},
{k:'activity',l:'діяльність',a:true},
{k:'films',l:'фільми',a:true},
{k:'series',l:'серіали',a:true},
{k:'books',l:'книги',a:true},
{k:'quotes',l:'цитати',a:true},
{k:'school',l:'школа'},
{k:'university',l:'університет / ВНЗ'},
{k:'work',l:'місце роботи'},
{k:'kicq',l:'KICQ',n:true},
{k:'openvk',l:'OpenVK',n:true},
{k:'discord',l:'Discord',n:true},
{k:'steam',l:'Steam',n:true},
{k:'phone',l:'мобільний телефон',t:'tel',n:true}
];
const pxv=(v,m)=>m?(Array.isArray(v)?v.filter(x=>typeof x==='string'&&x.trim()):[]):(typeof v==='string'?v:'');
const pxhas=(v,m)=>m?pxv(v,true).length>0:!!pxv(v,false).trim();
const pxurl=v=>{try{const a=new URL(/^https?:\/\//i.test(v)?v:'https://'+v);return['http:','https:'].includes(a.protocol)&&!a.username&&!a.password?a.href:''}catch{return''}};
function Px({f,v,ch,off}){
const[q,sq]=us('');
const[op,so]=us(false);
const a=pxv(v,f.m),id='pf-'+f.k;
if(!f.o)return f.a?<textarea id={id} className="s-fxt" maxLength={2048} value={a} disabled={off} onChange={e=>ch(e.target.value)}/>:<input id={id} className="s-fx" type={f.t||'text'} maxLength={255} value={a} disabled={off} onChange={e=>ch(e.target.value)}/>;
const cur=f.m?a:a?[a]:[];
const sel=x=>{ch(f.m?(cur.includes(x)?cur.filter(t=>t!==x):cur.length<60?[...cur,x]:cur):x);if(!f.m){so(false);sq('')}};
const key=q.trim().toLocaleLowerCase();
const all=[...new Set([...f.o,...cur])];
const found=all.filter(x=>x.toLocaleLowerCase().includes(key));
return <div className="pf-in">
<button id={id} type="button" className="s-fx pf-bt" disabled={off} aria-expanded={op} aria-controls={id+'-list'} onClick={()=>so(x=>!x)}><span {...(f.n||cur.some(x=>!f.o.includes(x))?{translate:'no'}:{})}>{cur.length?cur.join(', '):'не вказано'}</span><span aria-hidden="true">{op?'▴':'▾'}</span></button>
{op&&<div className="pf-po" id={id+'-list'} onKeyDown={e=>{if(e.key==='Escape'){so(false);document.getElementById(id)?.focus()}}}>
<input className="s-fx" value={q} maxLength={120} onChange={e=>sq(e.target.value)} aria-label="пошук" placeholder="пошук"/>
<div className="pf-li">
<button type="button" className="pf-op" onClick={()=>{ch(f.m?[]:'');so(false);sq('')}}>не вказано</button>
{found.map(x=><button type="button" className="pf-op" key={x} aria-pressed={cur.includes(x)} disabled={f.m&&!cur.includes(x)&&cur.length>=60} onClick={()=>sel(x)}><span aria-hidden="true">{cur.includes(x)?'✓ ':''}</span><span {...(f.n||!f.o.includes(x)?{translate:'no'}:{})}>{x}</span></button>)}
{!found.length&&<div className="pf-em">нічого не знайдено</div>}
</div>
{f.c&&key&&!all.some(x=>x.toLocaleLowerCase()===key)&&<button type="button" className="pf-op" disabled={f.m&&cur.length>=60} onClick={()=>{sel(q.trim());sq('')}}><span>додати своє</span>: <span translate="no">{q.trim()}</span></button>}
</div>}
</div>;
}

const fls=[{k:'status',l:'статус'},{k:'misto',l:'місто'},{k:'kraina',l:'країна'},{k:'birth',l:'дата народження',t:'date'},{k:'gender',l:'стать'},{k:'hobbies',l:'хобі'},{k:'musica',l:'музика'},{k:'games',l:'ігри'},{k:'other',l:'інше'},{k:'persite',l:'сайт'},{k:'tg',l:'телеграм'},{k:'insta',l:'інстаграм'},{k:'x',l:'x'},{k:'youtube',l:'ютуб'},{k:'github',l:'гітхаб'},{k:'gitlab',l:'гітлаб'},{k:'spotify',l:'спотіфай'}];
const socs=[{k:'tg',i:'telegram.png'},{k:'insta',i:'insta.png'},{k:'x',i:'x.png'},{k:'youtube',i:'youtube.png'},{k:'github',i:'github.png'},{k:'gitlab',i:'gitlab.png'},{k:'spotify',i:'spot.png'},{k:'kicq',i:'kicq.png'},{k:'openvk',i:'openvk.png'},{k:'discord',i:'ds.png'},{k:'steam',i:'steam.png'}];

export default function Storinka({id,un,me}){
const[u,su]=us(null);const[ed,se]=us(false);const[fm,sfm]=us({});const[my,smy]=us(null);const[up,sup]=us(false);const[er,ser]=us('');const[more,sm]=us(false);const[photos,sphotos]=us([]);const[photoLoad,sphotoLoad]=us(true);
const fi=ur(null);const bi=ur(null);const bgi=ur(null);const bioRef=ur(null);
const[frameOpen,sFrameOpen]=us(false);const[frames,sFrames]=us([]);const[framesLoading,sFramesLoading]=us(false);const[framesError,sFramesError]=us('');const[frameReload,sFrameReload]=us(0);
const frameDialog=ur(null);

const profileMusicInput=ur(null);
const[musicError,setMusicError]=us('');
ue(()=>{
if(!u?.music)return;
const audio=new Audio('/api/profile-music/'+encodeURIComponent(u.music));
let live=true;
let pending=false;
audio.volume=0.5;
const remove=()=>{
document.removeEventListener('click',start);
document.removeEventListener('keydown',start);
};
const start=()=>{
if(!live||pending||!audio.paused)return;
pending=true;
audio.play().then(()=>{
pending=false;
if(live)remove();else audio.pause();
}).catch(()=>{
pending=false;
});
};
document.addEventListener('click',start);
document.addEventListener('keydown',start);
start();
return()=>{
live=false;
remove();
audio.pause();
audio.removeAttribute('src');
audio.load();
};
},[u?.id,u?.music,id,un,me]);
const uploadProfileMusic=async e=>{const input=e.target;const file=input.files?.[0];if(!file)return;setMusicError('');if(!/\.mp3$/i.test(file.name)||file.size===0||file.size>8*1024*1024){setMusicError('оберіть мп3 до 8 МБ');input.value='';return}sup(true);try{const encoded=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('не вдалося прочитати файл'));reader.readAsDataURL(file)});const r=await fetch('/api/profile-music',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:file.name,data:encoded})});const j=await r.json().catch(()=>null);if(!r.ok||!j?.name)throw Error(j?.error||('помилка: HTTP '+r.status));sfm(x=>({...x,music:j.name}))}catch(error){setMusicError(error.message)}finally{input.value='';sup(false)}};

const frameSrc=name=>'/frames/'+encodeURIComponent(name);
const frameShow=e=>{e.currentTarget.style.visibility='visible'};
const frameHide=e=>{e.currentTarget.style.visibility='hidden'};
const pickFrame=name=>{sfm(x=>({...x,frame:name}));sFrameOpen(false)};

ue(()=>{sFrameOpen(false)},[id,un,me]);

ue(()=>{
if(!frameOpen)return;
const controller=new AbortController();
let live=true;
sFramesLoading(true);sFramesError('');sFrames([]);
fetch('/api/frames',{credentials:'include',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal}).then(async r=>{
const j=await r.json().catch(()=>null);
if(!r.ok||!Array.isArray(j))throw Error('не вдалося завантажити рамки');
return j.filter(v=>typeof v==='string'&&/\.png$/i.test(v)&&!/[\\/\u0000-\u001f]/.test(v));
}).then(j=>{if(live)sFrames(j)}).catch(e=>{if(live&&e.name!=='AbortError')sFramesError(e.message||'не вдалося завантажити рамки')}).finally(()=>{if(live)sFramesLoading(false)});
return()=>{live=false;controller.abort()};
},[frameOpen,frameReload]);

ue(()=>{
if(!frameOpen)return;
const oldOverflow=document.body.style.overflow;
const previous=document.activeElement;
document.body.style.overflow='hidden';
const focusable=()=>Array.from(frameDialog.current?.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]')||[]);
const key=e=>{
if(e.key==='Escape'){e.preventDefault();e.stopPropagation();sFrameOpen(false);return}
if(e.key!=='Tab')return;
const all=focusable();
if(!all.length){e.preventDefault();return}
const first=all[0],last=all[all.length-1];
if(e.shiftKey&&(document.activeElement===first||!frameDialog.current?.contains(document.activeElement))){e.preventDefault();last.focus()}
else if(!e.shiftKey&&(document.activeElement===last||!frameDialog.current?.contains(document.activeElement))){e.preventDefault();first.focus()}
};
const focusTimer=setTimeout(()=>focusable()[0]?.focus(),0);
document.addEventListener('keydown',key,true);
return()=>{
clearTimeout(focusTimer);
document.removeEventListener('keydown',key,true);
document.body.style.overflow=oldOverflow;
if(previous?.isConnected&&typeof previous.focus==='function')previous.focus();
};
},[frameOpen]);

ue(()=>{fetch('/api/me',{credentials:'include'}).then(r=>r.ok?r.json():null).then(j=>smy(j)).catch(()=>{})},[]);

ue(()=>{
ser('');
su(null);
let q='/api/user';if(id)q+=`?id=${encodeURIComponent(id)}`;else if(un)q+=`?un=${encodeURIComponent(un)}`;
fetch(q,{credentials:'include'}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{su(j);sfm(j)}).catch(()=>ser('користувача не знайдено'));
},[id,un,me]);

ue(()=>{if(!u?.id)return;let live=true;sphotoLoad(true);fetch(`/api/posts?uid=${encodeURIComponent(u.id)}`,{credentials:'include',headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{if(!live)return;const a=[];const seen=new Set();if(Array.isArray(j))j.forEach(p=>{const pics=Array.isArray(p.pics)?p.pics:[];pics.forEach(src=>{if(typeof src==='string'&&src.length>5&&src!=='[]'&&src!=='{}'&&!seen.has(src)){seen.add(src);a.push({src,id:p.id})}})});sphotos(a)}).catch(()=>{if(live)sphotos([])}).finally(()=>{if(live)sphotoLoad(false)});return()=>{live=false}},[u?.id]);

const[videos,svideos]=us([]);const[videoLoad,svideoLoad]=us(true);
ue(()=>{const uid=Number(u?.id);if(!uid)return;let live=true;svideoLoad(true);fetch(`/api/videos?uid=${encodeURIComponent(uid)}&limit=50&sort=new`,{credentials:'include',headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{if(!live)return;const items=Array.isArray(j?.items)?j.items:[];svideos(items.filter(v=>v&&Number(v.avtor_id)===uid&&v.status==='ready'&&typeof v.preview==='string'&&v.preview))}).catch(()=>{if(live)svideos([])}).finally(()=>{if(live)svideoLoad(false)});return()=>{live=false}},[u?.id]);
const vprev=v=>{if(typeof v!=='string'||!v)return '';try{const b=window.location.origin,u2=new URL(v,b);if(u2.origin!==b)return '';if(!u2.pathname.startsWith('/api/video-previews/'))return '';return u2.pathname+u2.search}catch{return ''}};
const vlink=id=>`/videos?video=${encodeURIComponent(id)}#videos`;


const uf=async(f)=>{if(!f)return null;const fd=new FormData();fd.append('file',f);try{const r=await fetch('/api/upload',{method:'POST',credentials:'include',body:fd});const j=await r.json();return r.ok?j.url:null}catch{return null}};
const op=async(e,k)=>{const f=e.target.files?.[0];if(!f)return;sup(true);const r=await uf(f);if(r)sfm(x=>({...x,[k]:r}));sup(false);if(e.target)e.target.value=''};
const sv=async()=>{if(up)return;ser('');sup(true);try{const bad=['persite','tg','insta','x','youtube','github','gitlab','spotify','kicq','openvk','discord','steam'].some(k=>{const v=typeof fm[k]==='string'?fm[k].trim():'';return v&&!/^https?:\/\/\S+$/i.test(v)});if(bad)throw Error('козаче, нам потрібне посилання');const changed=pxd.some(f=>JSON.stringify(pxv(fm[f.k],f.m))!==JSON.stringify(pxv(u[f.k],f.m)));if(changed&&!pxd.every(f=>Object.prototype.hasOwnProperty.call(u,f.k)))throw Error('нові поля ще не підключені до сервера');const r=await fetch('/api/user',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(fm)});if(!r.ok)throw Error('помилка збереження');su(fm);se(false)}catch(e){ser(e.message)}finally{sup(false)}};
const wr=(op,cl,vl)=>{const t=bioRef.current;if(!t)return;const s=t.selectionStart,e=t.selectionEnd;const sel=(fm.bio||'').slice(s,e);const tg=vl?`[${op}=${vl}]`:`[${op}]`;const tc=`[/${cl}]`;const nt=(fm.bio||'').slice(0,s)+tg+sel+tc+(fm.bio||'').slice(e);sfm(x=>({...x,bio:nt}));setTimeout(()=>{t.focus();t.setSelectionRange(s+tg.length,e+tg.length+sel.length)},0)};

const go=l=>{if(!l)return{t:'',o:false};let d=new Date(l),m=Math.floor((new Date()-d)/60000);if(m<5)return{t:'в мережі',o:true};if(m<60)return{t:`був ${m} хв`,o:false};let h=Math.floor(m/60);if(h<24)return{t:`був ${h} год`,o:false};let dy=Math.floor(h/24);if(dy<30)return{t:`був ${dy} дн`,o:false};return{t:`був ${d.toLocaleDateString('uk-UA')}`,o:false}};


const[friendRelation,setFriendRelation]=us({direction:'none',status:'none',id:0});
const[friendBusy,setFriendBusy]=us(false);
const[friendError,setFriendError]=us('');
ue(()=>{
if(!u?.id||!my?.id||Number(u.id)===Number(my.id)){
setFriendRelation({direction:'none',status:'none',id:0});
return;
}
let live=true;
setFriendError('');
fetch('/api/druzi?uid='+encodeURIComponent(u.id),{credentials:'include',cache:'no-store',headers:{Accept:'application/json'}})
.then(r=>r.ok?r.json():Promise.reject())
.then(j=>{if(live)setFriendRelation(j)})
.catch(()=>{if(live)setFriendRelation({direction:'none',status:'none',id:0})});
return()=>{live=false};
},[u?.id,my?.id]);

const friendAction=async act=>{
if(friendBusy||!u?.id)return;
setFriendBusy(true);
setFriendError('');
try{
const r=await fetch('/api/druzi',{
method:'POST',
credentials:'include',
headers:{'Content-Type':'application/json',Accept:'application/json'},
body:JSON.stringify({uid:Number(u.id),act,id:Number(friendRelation.id)||0})
});
const j=await r.json().catch(()=>null);
if(!r.ok)throw Error(j?.error||'не вдалося змінити стан дружби');
setFriendRelation(j||{direction:'none',status:'none',id:0});
}catch(e){setFriendError(e.message||'помилка запиту')}
finally{setFriendBusy(false)}
};

const[friends,sfriends]=us([]),[friendLoad,sfriendLoad]=us(true);
ue(()=>{
const uid=Number(u?.id)||0;
if(!uid){sfriendLoad(false);return}
let live=true;
sfriendLoad(true);
fetch("/api/druzi/list?uid="+encodeURIComponent(uid),{credentials:"include",cache:"no-store",headers:{Accept:"application/json"}})
.then(r=>r.ok?r.json():Promise.reject())
.then(j=>{if(live)sfriends(Array.isArray(j?.friends)?j.friends:[])})
.catch(()=>{if(live)sfriends([])})
.finally(()=>{if(live)sfriendLoad(false)});
return()=>{live=false}
},[u?.id]);

if(er&&!u)return <><style>{st}</style><main className="s-ps"><div className="s-pc" style={{padding:40,textAlign:'center'}}>{er}</div></main></>;
if(!u)return <><style>{st}</style><main className="s-ps"><div className="s-pc" style={{padding:40,textAlign:'center'}}>завантаження...</div></main></>;
const ism=my&&my.id===u.id;
const rest=[...fls,...pxd].filter(f=>!['status','misto','kraina'].includes(f.k)&&!socs.some(s=>s.k===f.k)&&pxhas(u[f.k],f.m));
let d='';try{d=u.register_at?new Date(u.register_at).toLocaleDateString('uk-UA'):''}catch(e){d=''}

return(
<>
<style>{st}</style>
<div className="p-bg" style={u.bg?{backgroundImage:`url(${u.bg})`}:{}}/>
<main className="s-ps" key={u.id}>
<div className="s-pc">
{ed?(
<div style={{padding:24}}>
<h2 style={{margin:'0 0 16px',fontSize:20}}>редагування профілю</h2>
{!pxd.every(f=>Object.prototype.hasOwnProperty.call(u,f.k))&&<div className="pf-no">нові поля ще не підключені до сервера</div>}
<span className={'s-avwrap s-editav'+(fm.frame?' s-hasframe':'')}><img className="s-pra" src={fm.photo||'/pictures/default_avatar.png'} alt=""/>{fm.frame&&<img className="s-avatarframe" src={frameSrc(fm.frame)} alt="" width="512" height="512" draggable={false} onLoad={frameShow} onError={frameHide}/>}</span>
{er&&<div style={{color:'red',marginBottom:12}}>{er}</div>}
<div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
<button type="button" className="s-pb" onClick={()=>fi.current?.click()} disabled={up}>аватар</button>
<button type="button" className="s-pb" onClick={()=>sFrameOpen(true)} disabled={up}>рамки аватара</button>

<button type="button" className="s-pb" onClick={()=>bi.current?.click()} disabled={up}>банер</button>
<button type="button" className="s-pb" onClick={()=>bgi.current?.click()} disabled={up}>фон сторінки</button>
</div>
<input ref={fi} type="file" accept="image/*" hidden onChange={e=>op(e,'photo')}/>
<input ref={bi} type="file" accept="image/*" hidden onChange={e=>op(e,'bannerok')}/>
<input ref={bgi} type="file" accept="image/*" hidden onChange={e=>op(e,'bg')}/>
<div style={{marginBottom:16}}>
<label className="s-igl">про себе</label>
<div className="s-mtb">
<button type="button" className="s-tbb" onClick={()=>wr('b','b')}><b>B</b></button>
<button type="button" className="s-tbb" onClick={()=>wr('i','i')}><i>I</i></button>
<button type="button" className="s-tbb" onClick={()=>wr('u','u')}><u>U</u></button>
<button type="button" className="s-tbb" onClick={()=>wr('s','s')}><s>S</s></button>
<button type="button" className="s-tbb" onClick={()=>wr('size','size','20')}>розмір</button>
<button type="button" className="s-tbb" onClick={()=>wr('color','color','#39834b')}>колір</button>
<button type="button" className="s-tbb" onClick={()=>wr('spoiler','spoiler')}>спойлер</button>
</div>
<textarea ref={bioRef} className="s-fxt" value={fm.bio||''} onChange={e=>sfm(x=>({...x,bio:e.target.value}))} placeholder="напиши щось про себе..."/>
</div>
<div className="s-ig">
{fls.map(f=>(
<div key={f.k}>
<label className="s-igl" htmlFor={"pf-"+f.k}>{f.l}</label>
<input id={"pf-"+f.k} className="s-fx" type={f.t||'text'} value={fm[f.k]||''} onChange={e=>sfm(x=>({...x,[f.k]:e.target.value}))}/>
</div>
))}
{pxd.map(f=><div key={f.k}><label className="s-igl" htmlFor={"pf-"+f.k}>{f.l}</label><Px f={f} v={fm[f.k]} off={up} ch={v=>sfm(x=>({...x,[f.k]:v}))}/></div>)}
</div>
<div style={{display:'flex',gap:12,marginTop:20}}>
<button type="button" className="s-pb" onClick={sv} disabled={up}>зберегти</button>
<button type="button" className="s-pb" disabled={up} onClick={()=>{sfm(u);se(false);ser('')}}>скасувати</button>
</div>
</div>
):(
<>
<img className="s-prb" src={u.bannerok||'/pictures/default_banner.png'} alt=""/>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',paddingRight:24}}>
<span className={'s-avwrap'+(u.frame?' s-hasframe':'')}><img className="s-pra" src={u.photo||'/pictures/default_avatar.png'} alt=""/>{u.frame&&<img className="s-avatarframe" src={frameSrc(u.frame)} alt="" width="512" height="512" draggable={false} onLoad={frameShow} onError={frameHide}/>}</span>
{ism&&<button type="button" className="s-pb" style={{marginTop:16}} onClick={()=>se(true)}>редагувати</button>}
{!ism&&my?.id&&Number(my.id)!==Number(u.id)&&<div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end',marginTop:16}}>
{friendRelation.direction==='friend'?
<button type="button" className="s-pb" disabled>ви друзі</button>:
friendRelation.direction==='outgoing'?
<button type="button" className="s-pb" disabled={friendBusy} onClick={()=>friendAction('cancel')}>{friendBusy?'...':'скасувати запит'}</button>:
friendRelation.direction==='incoming'?
<>
<button type="button" className="s-pb" disabled={friendBusy} onClick={()=>friendAction('accept')}>{friendBusy?'...':'прийняти'}</button>
<button type="button" className="s-pb" disabled={friendBusy} onClick={()=>friendAction('decline')}>відхилити</button>
</>:
<button type="button" className="s-pb" disabled={friendBusy} onClick={()=>friendAction('send')}>{friendBusy?'...':'додати в друзі'}</button>}
{friendError&&<span role="alert" style={{width:'100%',fontSize:12,color:'#b33'}}>{friendError}</span>}
</div>}
</div>
<div className="s-pri">
<h1 className="s-prn" style={{display:'flex',alignItems:'center',gap:6}}><span style={{minWidth:0,overflowWrap:'anywhere'}}>{u.username}</span><Galochki galka={u.galka} size={18}/></h1>
{u.la&&(()=>{let{t,o}=go(u.la);return <div className={`s-on ${o?'s-og':'s-or'}`}>{o&&<span className="s-dt"></span>}{t}</div>})()}
{u.status&&<div className="s-prs">{u.status}</div>}
{socs.some(s=>pxurl(u[s.k]))&&<div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>{socs.filter(s=>pxurl(u[s.k])).map(s=><a key={s.k} href={pxurl(u[s.k])} target="_blank" rel="noopener noreferrer" title={s.k}><img src={'/soc/'+s.i} alt={s.k} style={{width:26,height:26,objectFit:'contain',borderRadius:6}}/></a>)}</div>}
{u.bio&&<div style={{fontSize:14,lineHeight:1.6,color:'#39352f',marginTop:12,whiteSpace:'pre-wrap'}}><Rn t={u.bio}/></div>}
<div className="s-ig s-sum">
<div className="s-igi">
<div className="s-igl">на сайті з</div>
<div className="s-igv">{d}</div>
</div>
{u.misto&&<div className="s-igi"><div className="s-igl">місто</div><div className="s-igv">{u.misto}</div></div>}
{u.kraina&&<div className="s-igi"><div className="s-igl">країна</div><div className="s-igv">{u.kraina}</div></div>}
</div>
{rest.length>0&&<button type="button" className="s-more" aria-expanded={more} onClick={()=>sm(x=>!x)}>{more?'менше':'більше...'}</button>}
<div className={`s-ig s-moreinfo${more?' s-open':''}`}>
{rest.map(f=>(
<div key={f.k} className="s-igi">
<div className="s-igl">{f.l}</div>
{['persite','youtube','github','gitlab','spotify','x','insta','tg','openvk','steam'].includes(f.k)&&pxurl(u[f.k])?(
<a className="s-igv pf-va" translate="no" href={pxurl(u[f.k])} target="_blank" rel="noopener noreferrer" style={{color:'#39834b'}}>{u[f.k]}</a>
):(
<div className="s-igv pf-va" {...(!f.o||f.n?{translate:'no'}:{})}>{f.m?pxv(u[f.k],true).map((x,i)=><div key={i} {...(!f.o?.includes(x)?{translate:'no'}:{})}>{x}</div>):<span {...(f.o&&!f.o.includes(u[f.k])?{translate:'no'}:{})}>{u[f.k]}</span>}</div>
)}
</div>
))}
</div>
</div>
</>
)}
</div>
<section className="s-gal s-friends">
<div className="s-gh">
<h2 className="s-gt">друзі</h2>
<span className="s-igv">{friends.length}</span>
</div>
{friendLoad?
<div className="s-gx">завантаження...</div>
:friends.length?
<div className="s-gc">
{friends.map(fr=>
<a className="s-gp" key={fr.id} href={"/id/"+encodeURIComponent(fr.id)}>
<img src={fr.photo||"/pictures/default_avatar.png"} alt="" loading="lazy"/>
</a>
)}
</div>
:<div className="s-gx">друзів поки немає</div>}
</section>
<section className="s-gal">
<div className="s-gh"><h2 className="s-gt">фотографії</h2><span className="s-igv">{photos.length}</span></div>
{photoLoad?<div className="s-gx">завантаження фотографій...</div>:photos.length>0?<div className="s-gc">{photos.map((p,i)=><a className="s-gp" key={`${p.id}-${p.src}-${i}`} href={p.src} target="_blank" rel="noopener noreferrer"><img src={p.src} alt="фото якесь" loading="lazy"/></a>)}</div>:<div className="s-gx">фотографій поки немає</div>}
</section>
<section className="s-gal">
<div className="s-gh"><h2 className="s-gt">відео</h2><span className="s-igv">{videos.length}</span></div>
{videoLoad?<div className="s-gx">завантаження відео...</div>:videos.length>0?<div className="s-gc">{videos.map(v=>{const src=vprev(v.preview);const href=vlink(v.id);return src?<a className="s-gp s-gpv" key={v.id} href={href} aria-label={v.nazva||'відео'}><img src={src} alt={v.nazva||''} loading="lazy"/><span className="s-gpv-play" aria-hidden="true">▶</span></a>:null})}</div>:<div className="s-gx">відео поки немає</div>}
</section>
<section className="s-gal s-music"><Music key={u.id} uid={u.id} embedded/></section>
<div className="s-posts"><Posts uid={u.id} hideHeader={true}/></div>
{frameOpen&&createPortal(
<div className="s-frame-shade" onClick={e=>{if(e.target===e.currentTarget)sFrameOpen(false)}}>
<section ref={frameDialog} className="s-frame-box" role="dialog" aria-modal="true" aria-labelledby="profile-frame-title">
<div className="s-frame-head">
<h2 className="s-frame-title" id="profile-frame-title">рамки аватара</h2>
<button className="s-frame-close" type="button" aria-label="закрити" onClick={()=>sFrameOpen(false)}>×</button>
</div>
{framesLoading?<div className="s-frame-note">завантаження…</div>:framesError?(
<div className="s-frame-error">
{framesError}
<div style={{marginTop:10}}><button className="s-frame-retry" type="button" onClick={()=>sFrameReload(x=>x+1)}>спробувати ще</button></div>
</div>
):(
<>
<div className="s-frame-grid">
<button className="s-frame-tile" type="button" aria-label="без рамки" aria-pressed={!fm.frame} onClick={()=>pickFrame('')}>
<span className="s-frame-thumb">
<img className="s-frame-base" src={fm.photo||'/pictures/default_avatar.png'} alt=""/>
<span className="s-frame-none" aria-hidden="true">∅</span>
</span>
</button>
{frames.map((name,i)=>(
<button className="s-frame-tile" type="button" key={name} aria-label={'рамка '+(i+1)} aria-pressed={fm.frame===name} onClick={()=>pickFrame(name)}>
<span className="s-frame-thumb">
<img className="s-frame-base" src={fm.photo||'/pictures/default_avatar.png'} alt=""/>
<img className="s-frame-overlay" src={frameSrc(name)} alt="" width="512" height="512" loading="lazy" draggable={false} onLoad={frameShow} onError={frameHide}/>
</span>
</button>
))}
</div>
{frames.length===0&&<p className="s-frame-note">рамок поки немає</p>}
<p className="s-frame-note">обери рамку</p>
</>
)}
</section>
</div>,document.body)}
</main>
</>
);
}
export{pxd as profileFields};
