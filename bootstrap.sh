#!/usr/bin/env bash
set -euo pipefail

mkdir -p assets css js pages data/evergreen scripts .github/workflows

# -------- assets --------
cat > assets/logo.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" aria-label="Presidency Clock">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a237e"/>
      <stop offset="1" stop-color="#0d47a1"/>
    </linearGradient>
  </defs>
  <rect rx="10" ry="10" width="240" height="60" fill="url(#g)"/>
  <g fill="#fff">
    <circle cx="40" cy="30" r="18" fill="none" stroke="#fff" stroke-width="3"/>
    <line x1="40" y1="30" x2="40" y2="16" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <line x1="40" y1="30" x2="54" y2="30" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <text x="78" y="38" font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial" font-size="18" font-weight="700">PRESIDENCY CLOCK</text>
  </g>
</svg>
EOF

# -------- css --------
cat > css/style.css <<'EOF'
:root{
  --bg:#0b1020; --fg:#e8edf7; --muted:#9fb3c8; --accent:#3d6cff;
  --card:#121833; --card-border:#24305a;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;height:100%;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial;color:var(--fg);background:var(--bg)}
a{color:var(--accent);text-decoration:none}
header,footer{padding:14px 18px;border-bottom:1px solid var(--card-border)}
header{display:flex;align-items:center;gap:14px}
header img{height:32px;width:auto}
nav{margin-left:auto;display:flex;gap:12px;flex-wrap:wrap}
nav a{padding:8px 10px;border:1px solid var(--card-border);border-radius:8px;background:rgba(255,255,255,0.03)}
nav a.active{border-color:var(--accent)}
.container{max-width:1100px;margin:0 auto;padding:24px}
.hero{display:grid;grid-template-columns:1fr;gap:18px;align-items:center;margin-top:18px}
.countdown{display:flex;gap:10px;flex-wrap:wrap}
.tile{background:var(--card);border:1px solid var(--card-border);padding:16px 14px;border-radius:14px;min-width:110px;text-align:center}
.tile .num{font-size:32px;font-weight:800}
.tile .lbl{color:var(--muted);font-size:12px;letter-spacing:.05em;text-transform:uppercase}
.controls{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
.btn{border:1px solid var(--card-border);background:rgba(255,255,255,0.04);color:var(--fg);padding:10px 12px;border-radius:10px;cursor:pointer}
.btn[aria-pressed="true"]{outline:2px solid var(--accent);}
.share{display:flex;gap:10px;margin-top:8px}
.card{background:var(--card);border:1px solid var(--card-border);border-radius:14px;padding:16px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
footer{border-top:1px solid var(--card-border);border-bottom:none;color:var(--muted)}
.lang-switch{display:flex;gap:8px}
.badge{font-size:12px;padding:6px 8px;border:1px solid var(--card-border);border-radius:8px}
.ads{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:14px}
.ad-box{min-height:120px;background:rgba(255,255,255,0.03);border:1px dashed var(--card-border);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--muted)}
h1,h2,h3{margin:0 0 8px}
h1{font-size:28px} h2{font-size:22px}
small.muted{color:var(--muted)}
.table{width:100%;border-collapse:collapse}
.table th,.table td{border-bottom:1px solid var(--card-border);padding:10px 8px;text-align:left}
.table th{color:var(--muted);font-weight:600}
.notice{font-size:12px;color:var(--muted);margin-top:10px}
EOF

# -------- js: i18n --------
cat > js/i18n.js <<'EOF'
window.I18N = {
  en:{title:"Time left in Donald Trump’s presidency",sub:"U.S. presidential terms end at 12:00 noon ET on January 20 (Twentieth Amendment).",tickSound:"Ticking",beepSound:"Digital beep",mute:"Mute sound",unmute:"Unmute sound",embed:"Embed widget",share:"Share",shareX:"Share on X",shareFB:"Share on Facebook",ads:"Sponsored",evergreen:"Evergreen: Longest & shortest terms",digest:"AI Digest",about:"About",privacy:"Privacy",contact:"Contact",lang:"Language",selectSound:"Sound",copied:"Code copied!",copy:"Copy code",seconds:"seconds",widgetTitle:"Presidency Clock — widget",evergreenTitle:"Leaders by time in office",country:"Country",name:"Leader",days:"Days in office",source:"Source",lastUpdate:"Last update",viewDigest:"View digest",todayAt:"today at",prevAt:"previously at",digestIntro:"Top political headlines, updated twice daily (05:00 & 20:00 Kyiv time).",translationsNote:"Automatic translations are generated for convenience and may contain errors.",emailUs:"Email us",madeWith:"Made with",and:"and",in:"in",kyiv:"Kyiv",termsNote:"Constitutional end of term: 12:00 ET, January 20, 2029."},
  uk:{title:"Скільки часу залишилося Дональду Трампу на посаді президента США",sub:"Президентський термін у США закінчується о 12:00 за східним часом 20 січня (Двадцята поправка).",tickSound:"Тихий \"тік-так\"",beepSound:"Електронний біп",mute:"Вимкнути звук",unmute:"Увімкнути звук",embed:"Вбудувати віджет",share:"Поділитися",shareX:"Поділитися в X",shareFB:"Поділитися у Facebook",ads:"Реклама",evergreen:"Вічнозелений: найдовші та найкоротші терміни",digest:"AI-дайджест",about:"Про нас",privacy:"Політика конфіденційності",contact:"Зв'язок",lang:"Мова",selectSound:"Звук",copied:"Код скопійовано!",copy:"Скопіювати код",seconds:"секунд",widgetTitle:"Presidency Clock — віджет",evergreenTitle:"Керівники за тривалістю перебування при владі",country:"Країна",name:"Керівник",days:"Днів на посаді",source:"Джерело",lastUpdate:"Останнє оновлення",viewDigest:"Перейти до дайджесту",todayAt:"сьогодні о",prevAt:"раніше о",digestIntro:"Головні політичні новини, оновлення двічі на добу (05:00 та 20:00 за Києвом).",translationsNote:"Автоматичні переклади можуть містити помилки.",emailUs:"Напишіть нам",madeWith:"Зроблено з",and:"та",in:"у",kyiv:"Києві",termsNote:"Конституційне завершення терміну: 12:00 ET, 20 січня 2029."},
  es:{title:"Tiempo restante del mandato de Donald Trump",sub:"El mandato presidencial termina a las 12:00 (hora del Este) del 20 de enero (Vigésima Enmienda).",tickSound:"Tictac",beepSound:"Pitido digital",mute:"Silenciar",unmute:"Activar sonido",embed:"Insertar widget",share:"Compartir",shareX:"Compartir en X",shareFB:"Compartir en Facebook",ads:"Patrocinado",evergreen:"Evergreen: mandatos más largos y cortos",digest:"AI Digest",about:"Acerca de",privacy:"Privacidad",contact:"Contacto",lang:"Idioma",selectSound:"Sonido",copied:"¡Código copiado!",copy:"Copiar código",seconds:"segundos",widgetTitle:"Presidency Clock — widget",evergreenTitle:"Líderes por tiempo en el cargo",country:"País",name:"Líder",days:"Días en el cargo",source:"Fuente",lastUpdate:"Última actualización",viewDigest:"Ver digest",todayAt:"hoy a las",prevAt:"antes a las",digestIntro:"Titulares políticos, actualizados dos veces al día (05:00 y 20:00 hora de Kyiv).",translationsNote:"Las traducciones automáticas pueden contener errores.",emailUs:"Escríbenos",madeWith:"Hecho con",and:"y",in:"en",kyiv:"Kyiv",termsNote:"Fin constitucional del mandato: 12:00 ET, 20 de enero de 2029."},
  fr:{title:"Temps restant du mandat de Donald Trump",sub:"Le mandat présidentiel se termine à 12 h (heure de l’Est) le 20 janvier (Vingtième Amendement).",tickSound:"Tic-tac",beepSound:"Bip numérique",mute:"Couper le son",unmute:"Activer le son",embed:"Intégrer le widget",share:"Partager",shareX:"Partager sur X",shareFB:"Partager sur Facebook",ads:"Sponsorisé",evergreen:"Evergreen : mandats les plus longs et les plus courts",digest:"AI Digest",about:"À propos",privacy:"Confidentialité",contact:"Contact",lang:"Langue",selectSound:"Son",copied:"Code copié !",copy:"Copier le code",seconds:"secondes",widgetTitle:"Presidency Clock — widget",evergreenTitle:"Dirigeants par durée au pouvoir",country:"Pays",name:"Dirigeant",days:"Jours en fonction",source:"Source",lastUpdate:"Dernière mise à jour",viewDigest:"Voir le digest",todayAt:"aujourd’hui à",prevAt:"précédemment à",digestIntro:"Principales actualités politiques, mises à jour deux fois par jour (05:00 et 20:00, heure de Kyiv).",translationsNote:"Les traductions automatiques peuvent comporter des erreurs.",emailUs:"Écrivez-nous",madeWith:"Fait avec",and:"et",in:"à",kyiv:"Kyiv",termsNote:"Fin constitutionnelle du mandat : 12:00 ET, 20 janvier 2029."},
  de:{title:"Verbleibende Amtszeit von Donald Trump",sub:"Die Amtszeit endet um 12:00 Uhr ET am 20. Januar (Zwanzigster Verfassungszusatz).",tickSound:"Ticken",beepSound:"Digitaler Piepton",mute:"Stumm",unmute:"Ton ein",embed:"Widget einbetten",share:"Teilen",shareX:"Auf X teilen",shareFB:"Auf Facebook teilen",ads:"Anzeige",evergreen:"Evergreen: längste & kürzeste Amtszeiten",digest:"AI-Digest",about:"Über uns",privacy:"Datenschutz",contact:"Kontakt",lang:"Sprache",selectSound:"Sound",copied:"Code kopiert!",copy:"Code kopieren",seconds:"Sekunden",widgetTitle:"Presidency Clock — Widget",evergreenTitle:"Führende nach Amtszeit",country:"Land",name:"Staatsoberhaupt",days:"Tage im Amt",source:"Quelle",lastUpdate:"Letzte Aktualisierung",viewDigest:"Digest anzeigen",todayAt:"heute um",prevAt:"zuvor um",digestIntro:"Wichtigste Politik-Schlagzeilen, zweimal täglich aktualisiert (05:00 & 20:00 Kyiv-Zeit).",translationsNote:"Automatische Übersetzungen können Fehler enthalten.",emailUs:"Schreib uns",madeWith:"Gemacht mit",and:"und",in:"in",kyiv:"Kyiv",termsNote:"Verfassungsmäßiges Amtsende: 12:00 ET, 20. Januar 2029."}
};
EOF

# -------- js: audio --------
cat > js/audio.js <<'EOF'
class ClockAudio{
  constructor(){ this.ctx=null; this.enabled=false; this.mode='tick'; }
  ensure(){ if(!this.ctx) this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }
  setMode(m){ this.mode=m; }
  toggle(on){ this.enabled=(on===undefined)?!this.enabled:on; if(this.enabled) this.ensure(); return this.enabled; }
  playTick(){
    if(!this.enabled) return;
    this.ensure();
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='square'; o.frequency.value=(this.mode==='beep')?880:220;
    g.gain.value=0.001; g.gain.exponentialRampToValueAtTime(0.00001,this.ctx.currentTime+0.08);
    o.connect(g).connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.08);
  }
}
window.ClockAudio=ClockAudio;
EOF

# -------- js: app --------
cat > js/app.js <<'EOF'
const TARGET_ISO_UTC='2029-01-20T17:00:00Z'; // 12:00 ET
const targetTs=Date.parse(TARGET_ISO_UTC);
const qs=(s,el=document)=>el.querySelector(s);
const qsa=(s,el=document)=>[...el.querySelectorAll(s)];
const params=new URLSearchParams(location.search);
let lang=(params.get('lang')||localStorage.getItem('lang')||(navigator.language||'en').split('-')[0]).toLowerCase();
if(!window.I18N[lang]) lang='en';
const t=k=>window.I18N[lang][k]||k;

function applyI18n(){
  qsa('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  qsa('[data-i18n-attr]').forEach(el=>{ const [attr,key]=el.dataset.i18nAttr.split('|'); el.setAttribute(attr,t(key)); });
  const shareText=encodeURIComponent(t('title'));
  const url=encodeURIComponent(location.origin+location.pathname+'?lang='+lang);
  qs('#share-x').href=`https://twitter.com/intent/tweet?text=${shareText}&url=${url}`;
  qs('#share-fb').href=`https://www.facebook.com/sharer/sharer.php?u=${url}`;
  document.title=t('title');
  const metaDesc=qs('meta[name="description"]'); if(metaDesc) metaDesc.setAttribute('content', t('sub')+' '+t('termsNote'));
  qsa('link[rel="alternate"][hreflang]').forEach(l=>l.remove());
  Object.keys(window.I18N).forEach(code=>{
    const l=document.createElement('link'); l.rel='alternate'; l.hreflang=code; l.href=location.origin+location.pathname+'?lang='+code; document.head.appendChild(l);
  });
}
function switchLang(newLang){ lang=newLang; localStorage.setItem('lang',lang); applyI18n(); }

const audio=new ClockAudio(); let muted=true; let mode='tick';
function setSoundMode(m){ mode=m; audio.setMode(mode); qsa('.sound-option').forEach(b=>b.setAttribute('aria-pressed', b.dataset.mode===mode?'true':'false')); }
function toggleMute(){ muted=!muted; audio.toggle(!muted); const btn=qs('#mute-btn'); btn.textContent=muted?t('unmute'):t('mute'); }
const pad=n=>String(n).padStart(2,'0');

function renderCountdown(){
  const now=Date.now(); let diff=Math.max(0, targetTs-now);
  const sec=Math.floor(diff/1000)%60, min=Math.floor(diff/60000)%60, hr=Math.floor(diff/3600000)%24, day=Math.floor(diff/86400000);
  qs('#days .num').textContent=day; qs('#hours .num').textContent=pad(hr); qs('#minutes .num').textContent=pad(min); qs('#seconds .num').textContent=pad(sec);
  if(!muted) audio.playTick(); if(diff===0) clearInterval(timer);
}
let timer;
function start(){
  applyI18n(); setSoundMode('tick'); renderCountdown(); timer=setInterval(renderCountdown,1000);
  qsa('[data-lang]').forEach(b=>b.addEventListener('click',()=>switchLang(b.dataset.lang)));
  qsa('.sound-option').forEach(b=>b.addEventListener('click',()=>setSoundMode(b.dataset.mode)));
  qs('#mute-btn').addEventListener('click',toggleMute);
  qs('#copy-embed').addEventListener('click',()=>{
    const code=`<script src="${location.origin}/js/embed.js" data-lang="${lang}" data-theme="dark" async></script>`;
    navigator.clipboard.writeText(code).then(()=>{ qs('#copy-embed').textContent=t('copied'); setTimeout(()=>qs('#copy-embed').textContent=t('copy'),1200); });
  });
}
document.addEventListener('DOMContentLoaded',start);
EOF

# -------- js: embed --------
cat > js/embed.js <<'EOF'
(function(){
  const currentScript=document.currentScript;
  const base=currentScript.src.replace(/\/js\/embed\.js.*/,'');
  const lang=currentScript.dataset.lang||'en';
  const theme=currentScript.dataset.theme||'dark';
  const iframe=document.createElement('iframe');
  iframe.src=`${base}/widget.html?lang=${encodeURIComponent(lang)}&theme=${encodeURIComponent(theme)}`;
  iframe.style.width='100%'; iframe.style.border='0'; iframe.style.borderRadius='12px'; iframe.style.minHeight='120px';
  function resize(e){ if(e.data && e.data.type==='presidencyclock-size'){ iframe.style.height=e.data.height+'px'; } }
  window.addEventListener('message',resize);
  currentScript.parentNode.insertBefore(iframe,currentScript);
})();
EOF

# -------- html: widget --------
cat > widget.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Presidency Clock — Widget</title>
<link rel="stylesheet" href="./css/style.css">
<style>
:root{ --bg:transparent; } body{ background:transparent; padding:0; } .card{ box-shadow:none; }
.widget-wrap{padding:8px} .small{font-size:12px;color:var(--muted)} .controls{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.tile{min-width:84px;padding:10px 8px} .tile .num{font-size:24px}
</style>
<script src="./js/i18n.js"></script>
<script src="./js/audio.js"></script>
<script>
  const params=new URLSearchParams(location.search); const theme=params.get('theme')||'dark';
  if(theme==='light'){ document.documentElement.style.setProperty('--bg','#fff'); document.documentElement.style.setProperty('--fg','#111'); document.documentElement.style.setProperty('--card','#f7f9fc'); document.documentElement.style.setProperty('--card-border','#e0e6ef'); document.documentElement.style.setProperty('--muted','#5b6b7d'); }
  function postSize(){ const h=document.body.scrollHeight; parent.postMessage({type:'presidencyclock-size',height:h}, '*'); }
  new ResizeObserver(postSize).observe(document.body);
</script>
</head>
<body>
<div class="widget-wrap">
  <div class="countdown" id="countdown">
    <div class="tile" id="days"><div class="num">0</div><div class="lbl">DAYS</div></div>
    <div class="tile" id="hours"><div class="num">00</div><div class="lbl">HOURS</div></div>
    <div class="tile" id="minutes"><div class="num">00</div><div class="lbl">MINUTES</div></div>
    <div class="tile" id="seconds"><div class="num">00</div><div class="lbl">SECONDS</div></div>
  </div>
  <div class="controls">
    <button class="btn sound-option" data-mode="tick">Tick</button>
    <button class="btn sound-option" data-mode="beep">Beep</button>
    <button id="mute-btn" class="btn">Unmute</button>
  </div>
  <div class="small" data-i18n="termsNote"></div>
</div>
<script src="./js/app.js"></script>
<script>
  const params2=new URLSearchParams(location.search); const lang=params2.get('lang')||'en';
  if(I18N[lang]){ 
    document.querySelectorAll('.tile .lbl')[0].textContent='Days';
    document.querySelectorAll('.tile .lbl')[1].textContent='Hours';
    document.querySelectorAll('.tile .lbl')[2].textContent='Minutes';
    document.querySelectorAll('.tile .lbl')[3].textContent=I18N[lang]['seconds'];
    document.title=I18N[lang]['widgetTitle'];
    document.querySelector('[data-i18n="termsNote"]').textContent=I18N[lang]['termsNote'];
    document.querySelector('#mute-btn').textContent=I18N[lang]['unmute'];
    document.querySelectorAll('.sound-option')[0].textContent=I18N[lang]['tickSound'];
    document.querySelectorAll('.sound-option')[1].textContent=I18N[lang]['beepSound'];
  }
</script>
</body>
</html>
EOF

# -------- html: index --------
cat > index.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Presidency Clock</title>
<meta name="description" content="Countdown to the constitutional end of the current U.S. presidential term.">
<link rel="icon" href="./assets/logo.svg"><link rel="stylesheet" href="./css/style.css"><link rel="canonical" href="https://presidencyclock.com/">
</head>
<body>
<header>
  <img src="./assets/logo.svg" alt="Presidency Clock logo" width="160" height="40" loading="eager">
  <nav>
    <a href="./index.html" class="active" data-i18n="share"></a>
    <a href="./pages/evergreen.html" data-i18n="evergreen"></a>
    <a href="./pages/digest.html" data-i18n="digest"></a>
    <a href="./pages/about.html" data-i18n="about"></a>
    <a href="./pages/privacy.html" data-i18n="privacy"></a>
    <a href="./pages/contact.html" data-i18n="contact"></a>
  </nav>
</header>
<main class="container">
  <section class="hero card">
    <h1 data-i18n="title"></h1>
    <p class="muted" data-i18n="sub"></p>
    <div class="countdown" aria-live="polite" aria-label="countdown">
      <div class="tile" id="days"><div class="num">0</div><div class="lbl">Days</div></div>
      <div class="tile" id="hours"><div class="num">00</div><div class="lbl">Hours</div></div>
      <div class="tile" id="minutes"><div class="num">00</div><div class="lbl">Minutes</div></div>
      <div class="tile" id="seconds"><div class="num">00</div><div class="lbl" data-i18n="seconds"></div></div>
    </div>
    <div class="controls">
      <span class="badge" data-i18n="selectSound"></span>
      <button class="btn sound-option" data-mode="tick" data-i18n="tickSound" aria-pressed="true"></button>
      <button class="btn sound-option" data-mode="beep" data-i18n="beepSound" aria-pressed="false"></button>
      <button id="mute-btn" class="btn" data-i18n="unmute"></button>
      <div class="lang-switch" aria-label="language">
        <button class="btn" data-lang="en">EN</button>
        <button class="btn" data-lang="uk">UK</button>
        <button class="btn" data-lang="es">ES</button>
        <button class="btn" data-lang="fr">FR</button>
        <button class="btn" data-lang="de">DE</button>
      </div>
    </div>
    <div class="share">
      <a id="share-x" class="btn" target="_blank" rel="noopener" data-i18n="shareX"></a>
      <a id="share-fb" class="btn" target="_blank" rel="noopener" data-i18n="shareFB"></a>
      <button id="copy-embed" class="btn" data-i18n="copy"></button>
    </div>
    <small class="muted" data-i18n="termsNote"></small>
  </section>

  <section class="ads">
    <div class="ad-box" id="ad-1">Ad slot 1 — 300×250</div>
    <div class="ad-box" id="ad-2">Ad slot 2 — 300×250</div>
    <div class="ad-box" id="ad-3">Ad slot 3 — 728×90</div>
  </section>
</main>
<footer class="container">
  <small class="muted">
    <span data-i18n="madeWith"></span> ♥ <span data-i18n="in"></span> <span data-i18n="kyiv"></span> ·
    <a href="./pages/privacy.html" data-i18n="privacy"></a> ·
    <a href="./pages/contact.html" data-i18n="contact"></a>
  </small>
</footer>
<script src="./js/i18n.js"></script>
<script src="./js/audio.js"></script>
<script src="./js/app.js"></script>
</body>
</html>
EOF

# -------- pages: evergreen --------
cat > pages/evergreen.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Evergreen — Presidency Clock</title>
<link rel="stylesheet" href="../css/style.css"><link rel="icon" href="../assets/logo.svg">
</head>
<body>
<header>
  <a href="../index.html"><img src="../assets/logo.svg" alt="Presidency Clock" width="160" height="40"></a>
  <nav>
    <a href="./evergreen.html" class="active" data-i18n="evergreen"></a>
    <a href="./digest.html" data-i18n="digest"></a>
    <a href="./about.html" data-i18n="about"></a>
    <a href="./privacy.html" data-i18n="privacy"></a>
    <a href="./contact.html" data-i18n="contact"></a>
  </nav>
</header>
<main class="container">
  <h1 data-i18n="evergreenTitle"></h1>
  <p class="muted">This page renders sortable tables per country from simple JSON files in <code>/data/evergreen/</code>. Edit or expand the data without touching code.</p>
  <div id="tables"></div>
  <p class="notice" data-i18n="translationsNote"></p>
</main>
<footer class="container">
  <small class="muted"><a href="../index.html">Home</a> · <a href="./digest.html" data-i18n="digest"></a></small>
</footer>
<script src="../js/i18n.js"></script>
<script src="../js/evergreen.js"></script>
</body>
</html>
EOF

cat > js/evergreen.js <<'EOF'
const params=new URLSearchParams(location.search);
let lang=(params.get('lang')||localStorage.getItem('lang')||'en').toLowerCase();
if(!I18N[lang]) lang='en';
const t=k=>I18N[lang][k]||k;
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  const countries=['us','ua','ca','mx','es','fr','de'];
  const container=document.getElementById('tables');
  countries.forEach(async c=>{
    try{
      const res=await fetch(`../data/evergreen/${c}.json`);
      const json=await res.json();
      json.rows.sort((a,b)=>a.days-b.days);
      const card=document.createElement('section'); card.className='card';
      card.innerHTML=`<h2>${json.title}</h2>
        <table class="table">
          <thead><tr><th>${t('name')}</th><th>${t('days')}</th><th>${t('source')}</th></tr></thead>
          <tbody>${json.rows.map(r=>`<tr><td>${r.name}</td><td>${r.days}</td><td><a href="${r.link}" target="_blank" rel="noopener">${new URL(r.link).hostname}</a></td></tr>`).join('')}</tbody>
        </table>
        <small class="muted">${t('lastUpdate')}: ${json.updated}</small>`;
      container.appendChild(card);
    }catch(e){
      const card=document.createElement('section'); card.className='card';
      card.innerHTML=`<h2>${c.toUpperCase()}</h2><p>Data file missing.</p>`;
      container.appendChild(card);
    }
  });
});
EOF

# -------- sample evergreen data --------
cat > data/evergreen/us.json <<'EOF'
{
  "title": "United States — Presidents by time in office (sample data)",
  "updated": "2025-08-29",
  "rows": [
    {"name": "William Henry Harrison", "days": 31, "link": "https://en.wikipedia.org/wiki/William_Henry_Harrison"},
    {"name": "James A. Garfield", "days": 199, "link": "https://en.wikipedia.org/wiki/James_A._Garfield"},
    {"name": "George Washington", "days": 2922, "link": "https://en.wikipedia.org/wiki/George_Washington"},
    {"name": "Franklin D. Roosevelt", "days": 4422, "link": "https://en.wikipedia.org/wiki/Franklin_D._Roosevelt"}
  ]
}
EOF

cat > data/evergreen/ua.json <<'EOF'
{
  "title": "Україна — Президенти за тривалістю на посаді (зразок)",
  "updated": "2025-08-29",
  "rows": [
    {"name": "Леонід Кравчук", "days": 923, "link": "https://uk.wikipedia.org/wiki/%D0%9A%D1%80%D0%B0%D0%B2%D1%87%D1%83%D0%BA_%D0%9B%D0%B5%D0%BE%D0%BD%D1%96%D0%B4_%D0%9C%D0%B0%D0%BA%D0%B0%D1%80%D0%BE%D0%B2%D0%B8%D1%87"},
    {"name": "Петро Порошенко", "days": 1827, "link": "https://uk.wikipedia.org/wiki/%D0%9F%D0%BE%D1%80%D0%BE%D1%88%D0%B5%D0%BD%D0%BA%D0%BE_%D0%9F%D0%B5%D1%82%D1%80%D0%BE_%D0%9E%D0%BB%D0%B5%D0%BA%D1%81%D1%96%D0%B9%D0%BE%D0%B2%D0%B8%D1%87"},
    {"name": "Володимир Зеленський", "days": 2292, "link": "https://uk.wikipedia.org/wiki/%D0%97%D0%B5%D0%BB%D0%B5%D0%BD%D1%81%D1%8C%D0%BA%D0%B8%D0%B9_%D0%92%D0%BE%D0%BB%D0%BE%D0%B4%D0%B8%D0%BC%D0%B8%D1%80_%D0%9E%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%BE%D0%B2%D0%B8%D1%87"}
  ]
}
EOF

cat > data/evergreen/ca.json <<'EOF'
{"title":"Canada — Prime Ministers by time in office (sample)","updated":"2025-08-29","rows":[{"name":"Kim Campbell","days":132,"link":"https://wikipedia.org/wiki/Kim_Campbell"},{"name":"John A. Macdonald","days":6935,"link":"https://wikipedia.org/wiki/John_A._Macdonald"}]}
EOF
cat > data/evergreen/mx.json <<'EOF'
{"title":"México — Presidentes por tiempo en el cargo (ejemplo)","updated":"2025-08-29","rows":[{"name":"Pedro Lascuráin","days":1,"link":"https://es.wikipedia.org/wiki/Pedro_Lascur%C3%A1in"},{"name":"Porfirio Díaz","days":11315,"link":"https://es.wikipedia.org/wiki/Porfirio_D%C3%ADaz"}]}
EOF
cat > data/evergreen/es.json <<'EOF'
{"title":"España — Presidentes del Gobierno por tiempo (ejemplo)","updated":"2025-08-29","rows":[{"name":"Leopoldo Calvo-Sotelo","days":643,"link":"https://es.wikipedia.org/wiki/Leopoldo_Calvo-Sotelo"},{"name":"Felipe González","days":5110,"link":"https://es.wikipedia.org/wiki/Felipe_Gonz%C3%A1lez"}]}
EOF
cat > data/evergreen/fr.json <<'EOF'
{"title":"France — Présidents par durée (exemple)","updated":"2025-08-29","rows":[{"name":"Louis-Napoléon Bonaparte","days":1460,"link":"https://fr.wikipedia.org/wiki/Louis-Napol%C3%A9on_Bonaparte"},{"name":"François Mitterrand","days":5110,"link":"https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Mitterrand"}]}
EOF
cat > data/evergreen/de.json <<'EOF'
{"title":"Deutschland — Bundeskanzler nach Amtszeit (Beispiel)","updated":"2025-08-29","rows":[{"name":"Kurt Georg Kiesinger","days":1095,"link":"https://de.wikipedia.org/wiki/Kurt_Georg_Kiesinger"},{"name":"Angela Merkel","days":5840,"link":"https://de.wikipedia.org/wiki/Angela_Merkel"}]}
EOF

# -------- pages: digest --------
cat > pages/digest.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI Digest — Presidency Clock</title>
<link rel="stylesheet" href="../css/style.css"><link rel="icon" href="../assets/logo.svg">
</head>
<body>
<header>
  <a href="../index.html"><img src="../assets/logo.svg" alt="Presidency Clock" width="160" height="40"></a>
  <nav>
    <a href="./digest.html" class="active" data-i18n="digest"></a>
    <a href="./evergreen.html" data-i18n="evergreen"></a>
    <a href="./about.html" data-i18n="about"></a>
    <a href="./privacy.html" data-i18n="privacy"></a>
    <a href="./contact.html" data-i18n="contact"></a>
  </nav>
</header>
<main class="container">
  <h1 data-i18n="digest"></h1>
  <p class="muted" data-i18n="digestIntro"></p>
  <div id="digest" class="grid"></div>
  <p class="notice" data-i18n="translationsNote"></p>
</main>
<footer class="container">
  <small class="muted"><a href="../index.html">Home</a> · <a href="./privacy.html" data-i18n="privacy"></a></small>
</footer>
<script src="../js/i18n.js"></script>
<script src="../js/digest.js"></script>
</body>
</html>
EOF

cat > js/digest.js <<'EOF'
const params=new URLSearchParams(location.search);
let lang=(params.get('lang')||localStorage.getItem('lang')||'en').toLowerCase();
if(!I18N[lang]) lang='en';
const t=k=>I18N[lang][k]||k;
function applyI18n(){ document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n)); }
async function loadDigest(){
  try{
    const res=await fetch('../data/digest.json?_='+Date.now());
    const {updated_kyiv, items}=await res.json();
    const holder=document.getElementById('digest');
    holder.innerHTML=items.map(x=>`
      <article class="card">
        <h3><a href="${x.url}" target="_blank" rel="noopener">${x.title}</a></h3>
        <small class="muted">${x.source} · ${new Date(x.published).toLocaleString()}</small>
        ${x.summary?`<p>${x.summary}</p>`:''}
      </article>
    `).join('');
    const info=document.createElement('p'); info.className='notice';
    const dt=new Date(updated_kyiv);
    info.textContent=t('lastUpdate')+': '+dt.toLocaleString(undefined,{hour:'2-digit',minute:'2-digit'})+' Kyiv';
    document.querySelector('main').appendChild(info);
    const LT=window.LT_ENDPOINT||null;
    if(LT && lang!=='en'){
      for(const card of document.querySelectorAll('#digest .card')){
        const h3=card.querySelector('h3'); const p=card.querySelector('p'); const text=(h3.textContent+(p?'\n'+p.textContent:''));
        const resp=await fetch(LT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:text,source:'en',target:lang})});
        if(resp.ok){ const txt=await resp.json(); const [first,...rest]=txt.translatedText.split('\n'); h3.textContent=first; if(p) p.textContent=rest.join('\n'); }
      }
    }
  }catch(e){ document.getElementById('digest').innerHTML='<p>Failed to load digest.</p>'; }
}
document.addEventListener('DOMContentLoaded',()=>{ applyI18n(); loadDigest(); });
EOF

# -------- sample digest data --------
cat > data/digest.json <<'EOF'
{
  "updated_kyiv": "2025-08-29T05:00:00+03:00",
  "items": [
    {
      "title": "Parliament passes key budget bill amid coalition talks",
      "url": "https://example.com/news/1",
      "source": "Example News",
      "published": "2025-08-29T01:00:00Z",
      "summary": "Lawmakers approved the spending package after an all-night session, clearing the way for further negotiations."
    },
    {
      "title": "EU leaders meet to discuss security and energy prices",
      "url": "https://example.com/news/2",
      "source": "Example Wire",
      "published": "2025-08-28T19:30:00Z",
      "summary": "The agenda includes support for Ukraine, trade, and efforts to curb inflation."
    }
  ]
}
EOF

# -------- pages: about/privacy/contact/404 --------
cat > pages/about.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>About — Presidency Clock</title><link rel="stylesheet" href="../css/style.css"><link rel="icon" href="../assets/logo.svg"></head><body>
<header><a href="../index.html"><img src="../assets/logo.svg" alt="Presidency Clock" width="160" height="40"></a>
<nav><a href="./about.html" class="active" data-i18n="about"></a><a href="./privacy.html" data-i18n="privacy"></a><a href="./contact.html" data-i18n="contact"></a></nav></header>
<main class="container"><section class="card"><h1 data-i18n="about"></h1><p>Presidency Clock — мінімалістичний сайт зі зворотним відліком до конституційного завершення чинного президентського терміну у США. Є віджет, 5 мов, evergreen-розділ, AI-дайджест і місця під рекламу.</p></section></main>
<footer class="container"><small class="muted"><a href="../index.html">Home</a></small></footer>
<script src="../js/i18n.js"></script><script>document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=I18N[(localStorage.getItem('lang')||'en')][el.dataset.i18n||'about']);</script>
</body></html>
EOF

cat > pages/privacy.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Privacy — Presidency Clock</title><link rel="stylesheet" href="../css/style.css"><link rel="icon" href="../assets/logo.svg"></head><body>
<header><a href="../index.html"><img src="../assets/logo.svg" alt="Presidency Clock" width="160" height="40"></a>
<nav><a href="./privacy.html" class="active" data-i18n="privacy"></a><a href="./about.html" data-i18n="about"></a><a href="./contact.html" data-i18n="contact"></a></nav></header>
<main class="container"><section class="card"><h1 data-i18n="privacy"></h1><p>We use minimal first-party cookies (language preference) and serve advertising via Google AdSense when configured. No analytics by default. Contact us for data questions.</p></section></main>
<footer class="container"><small class="muted"><a href="../index.html">Home</a></small></footer>
<script src="../js/i18n.js"></script><script>document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=I18N[(localStorage.getItem('lang')||'en')][el.dataset.i18n]);</script>
</body></html>
EOF

cat > pages/contact.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Contact — Presidency Clock</title><link rel="stylesheet" href="../css/style.css"><link rel="icon" href="../assets/logo.svg"></head><body>
<header><a href="../index.html"><img src="../assets/logo.svg" alt="Presidency Clock" width="160" height="40"></a>
<nav><a href="./contact.html" class="active" data-i18n="contact"></a><a href="./about.html" data-i18n="about"></a><a href="./privacy.html" data-i18n="privacy"></a></nav></header>
<main class="container"><section class="card"><h1 data-i18n="contact"></h1><p><a href="mailto:presidencyclock@gmail.com">presidencyclock@gmail.com</a></p></section></main>
<footer class="container"><small class="muted"><a href="../index.html">Home</a></small></footer>
<script src="../js/i18n.js"></script><script>document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=I18N[(localStorage.getItem('lang')||'en')][el.dataset.i18n]);</script>
</body></html>
EOF

cat > pages/404.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404 — Presidency Clock</title><link rel="stylesheet" href="../css/style.css"><link rel="icon" href="../assets/logo.svg"></head><body>
<main class="container"><section class="card"><h1>404</h1><p>Page not found.</p><p><a href="../index.html">Go home</a></p></section></main>
</body></html>
EOF

# -------- github actions (digest twice a day Kyiv) --------
cat > .github/workflows/digest.yml <<'EOF'
name: Update AI Digest
on:
  schedule:
    - cron: "0 * * * *"  # hourly; script writes only at 05:00/20:00 Europe/Kyiv
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - name: Fetch digest
        env:
          LT_URL: ${{ secrets.LT_URL }}
          LT_API_KEY: ${{ secrets.LT_API_KEY }}
        run: node scripts/fetch_digest.mjs
      - name: Commit & push
        run: |
          if [[ -n "$(git status --porcelain)" ]]; then
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            git add data/digest.json
            git commit -m "chore: update digest [skip ci]"
            git push
          fi
EOF

cat > package.json <<'EOF'
{
  "name": "presidencyclock",
  "type": "module",
  "private": true,
  "version": "1.0.0",
  "scripts": { "digest": "node scripts/fetch_digest.mjs" },
  "dependencies": {
    "rss-parser": "^3.12.0",
    "node-fetch": "^3.3.2",
    "date-fns-tz": "^3.3.1"
  }
}
EOF

cat > scripts/fetch_digest.mjs <<'EOF'
import Parser from 'rss-parser';
import { utcToZonedTime, format } from 'date-fns-tz';
const KYIV_TZ='Europe/Kyiv';
const now=new Date(); const kyivNow=utcToZonedTime(now, KYIV_TZ);
const hour=kyivNow.getHours();
if(![5,20].includes(hour)){ console.log('Not a digest window (Kyiv hour =',hour,') — skipping.'); process.exit(0); }
const feeds=[
  'https://feeds.reuters.com/reuters/worldNews',
  'https://rss.apnews.com/hub/ap-top-news',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://www.politico.com/rss/politics-news.xml'
];
const parser=new Parser();
function uniqBy(arr,keyFn){ const s=new Set(); return arr.filter(x=>{const k=keyFn(x); if(s.has(k)) return false; s.add(k); return true;}); }
function pickTop(items,n=10){ return items.sort((a,b)=>new Date(b.isoDate||b.pubDate||0)-new Date(a.isoDate||a.pubDate||0)).slice(0,n); }
const all=[];
for(const url of feeds){
  try{
    const feed=await parser.parseURL(url);
    for(const item of feed.items){
      const t=(item.title||'').toLowerCase();
      if(['election','president','parliament','congress','senate','cabinet','prime minister','white house','kremlin','eu','policy','sanction','diplom','protest','vote','law','trump','biden','ukraine','china','war','nato'].some(k=>t.includes(k))){
        all.push({ title:item.title, url:item.link, source:(feed.title||new URL(url).hostname).replace(/\s*RSS\s*$/i,''), published:item.isoDate||item.pubDate||new Date().toISOString(), summary:item.contentSnippet?.slice(0,220)||'' });
      }
    }
  }catch(e){ console.warn('Failed feed',url,e.message); }
}
const items=pickTop(uniqBy(all,x=>x.title));
const updated_kyiv=format(kyivNow, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: KYIV_TZ });
import fs from 'fs'; fs.mkdirSync('data', {recursive:true}); fs.writeFileSync('data/digest.json', JSON.stringify({updated_kyiv,items}, null, 2));
console.log('Wrote data/digest.json with', items.length, 'items at', updated_kyiv);
EOF

# -------- README --------
cat > README.md <<'EOF'
# Presidency Clock — static site
- Countdown to the constitutional end of the current U.S. presidential term (Jan 20, 2029, 12:00 ET).
- Two sounds (tick / digital beep), mute.
- Embeddable widget (`/js/embed.js`).
- Social share (X/Twitter, Facebook).
- 5 languages (EN, UK, ES, FR, DE).
- Evergreen tables from `/data/evergreen`.
- AI Digest auto-updated by GitHub Actions at 05:00 & 20:00 Kyiv.
- SEO: hreflang, internal links, 404, basic pages.
- Google Ads: 3 slots (replace placeholders in `index.html`).

## Quick start (GitHub Pages)
1. Push these files to a repo.
2. Settings → Pages → deploy from `main / root`.
3. (Optional) Add custom domain `presidencyclock.com` with DNS + `CNAME`.

## Widget
```html
<script src="https://presidencyclock.com/js/embed.js" data-lang="uk" data-theme="dark" async></script>
