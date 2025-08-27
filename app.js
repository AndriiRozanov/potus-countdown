(function(){
  "use strict";

  /* ===== Конфіг ===== */
  // 20 Jan 2029, 12:00 Washington (EST = UTC-5) => 17:00 UTC
  const INAUG_UTC = Date.UTC(2029, 0, 20, 17, 0, 0);
  const qs = new URLSearchParams(location.search);
  const $ = (s)=>document.querySelector(s);

  /* ===== I18N ===== */
  const I18N = {
    uk: {
      title:"СКІЛЬКИ ДОНАЛЬДУ ТРАМПУ ЗАЛИШИЛОСЬ БУТИ ПРЕЗИДЕНТОМ?",
      h1:"СКІЛЬКИ ДОНАЛЬДУ ТРАМПУ<br>ЗАЛИШИЛОСЬ БУТИ ПРЕЗИДЕНТОМ?",
      subtitle:"Відлік до <b>20 січня 2029, 12:00 (Вашингтон)</b>.",
      theme:"Тема:", sound:"Звук:", lang:"Мова:",
      soundOff:"Вимкнено", soundElectronic:"Електронний", soundClassic:"Класичний",
      days:"Днів", hours:"Годин", minutes:"Хвилин", seconds:"Секунд",
      share:"Поширити:", faqQ:"Як рахується час?",
      faqA:"Відлік ведеться до миті <b>20 січня 2029, 12:00</b> за часом Вашингтона (EST), що відповідає <b>17:00 UTC</b>. Рахуємо різницю між вашою локальною датою та цією фіксованою міткою.",
      manageConsent:"Налаштування cookies", privacy:"Політика конфіденційності", about:"Про сайт", donate:"Підтримати"
    },
    en: {
      title:"HOW LONG DOES DONALD TRUMP HAVE LEFT AS PRESIDENT?",
      h1:"HOW LONG DOES DONALD TRUMP<br>HAVE LEFT AS PRESIDENT?",
      subtitle:"Countdown to <b>January 20, 2029, 12:00 (Washington)</b>.",
      theme:"Theme:", sound:"Sound:", lang:"Language:",
      soundOff:"Off", soundElectronic:"Electronic", soundClassic:"Classic",
      days:"Days", hours:"Hours", minutes:"Minutes", seconds:"Seconds",
      share:"Share:", faqQ:"How is the time calculated?",
      faqA:"We count down to <b>January 20, 2029, 12:00</b> Washington time (EST), which equals <b>17:00 UTC</b>. We compute the difference between your local time and this fixed timestamp.",
      manageConsent:"Cookie settings", privacy:"Privacy policy", about:"About", donate:"Support"
    }
  };

  /* ===== Storage ===== */
  const storage = {
    get(k, d){ try{ const v = localStorage.getItem(k); return v===null?d:v }catch{ return d } },
    set(k, v){ try{ localStorage.setItem(k, v) }catch{} }
  };

  /* ===== State ===== */
  let lang  = (qs.get('lang')  || storage.get('lang', navigator.language?.toLowerCase().startsWith('uk')?'uk':'en')).toLowerCase();
  if(!['uk','en'].includes(lang)) lang='uk';

  let theme = (qs.get('theme') || storage.get('theme', 'auto')).toLowerCase();
  if(!['auto','light','dark'].includes(theme)) theme='auto';

  // sound: off|electronic|classic
  let sound = (qs.get('sound') || storage.get('sound', 'off')).toLowerCase();
  if(!['off','electronic','classic'].includes(sound)) sound='off';

  const isEmbed = qs.get('embed') === '1';

  /* ===== Theme ===== */
  function applyTheme(){
    const actual = theme==='auto'
      ? (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', actual);
    const el = $('#valTheme'); if(el) el.textContent = theme[0].toUpperCase()+theme.slice(1);
  }
  applyTheme();
  try{
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{ if(theme==='auto') applyTheme(); });
  }catch{}

  /* ===== I18N render ===== */
  function t(k){ return I18N[lang][k]; }
  function applyI18n(){
    document.documentElement.lang = (lang==='uk'?'uk':'en');
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(key==='h1' || key==='subtitle' || key==='faqA'){ el.innerHTML = t(key); }
      else { el.textContent = t(key); }
    });
    const valLang = $('#valLang'); if(valLang) valLang.textContent = (lang==='uk'?'UA':'EN');
    const valSound = $('#valSound'); if(valSound) valSound.textContent =
      (sound==='off'?t('soundOff'):(sound==='electronic'?t('soundElectronic'):t('soundClassic')));
    const ogLoc = document.querySelector('meta[property="og:locale"]');
    if(ogLoc) ogLoc.setAttribute('content', lang==='uk'?'uk_UA':'en_US');
    buildShareLinks();
  }
  applyI18n();

  /* ===== Timer ===== */
  const elD=$('#d'), elH=$('#h'), elM=$('#m'), elS=$('#s');

  function flip(el, val){
    if(!el) return;
    if(el.textContent !== val){
      el.textContent = val;
      el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
    }
  }

  function tick(){
    const now = Date.now();
    let diff = Math.max(0, INAUG_UTC - now);
    const days = Math.floor(diff / 86400000); diff -= days*86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours*3600000;
    const minutes = Math.floor(diff / 60000); diff -= minutes*60000;
    const seconds = Math.floor(diff / 1000);

    flip(elD, String(days));
    flip(elH, String(hours).padStart(2,'0'));
    flip(elM, String(minutes).padStart(2,'0'));
    flip(elS, String(seconds).padStart(2,'0'));

    playTick();
  }

  setInterval(tick, 1000);
  tick();

  /* ===== Sound (Web Audio) ===== */
  let audioCtx = null, audioReady = false;
  const VOL = 0.25;

  function ensureAudio(){
    if(audioReady) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    audioCtx.resume && audioCtx.resume();
    audioReady = true;
  }
  function prime(){
    ensureAudio();
    document.removeEventListener('click', prime);
    document.removeEventListener('keydown', prime);
    document.removeEventListener('touchstart', prime);
  }
  document.addEventListener('click', prime, {passive:true});
  document.addEventListener('keydown', prime);
  document.addEventListener('touchstart', prime, {passive:true});

  function beepElectronic(){
    if(!audioCtx) return;
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type='square'; o.frequency.value=880; o.connect(g); g.connect(audioCtx.destination);
    const n = audioCtx.currentTime;
    g.gain.setValueAtTime(0.0001, n);
    g.gain.exponentialRampToValueAtTime(VOL, n+0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, n+0.06);
    o.start(n); o.stop(n+0.08);
  }
  function beepClassic(){
    if(!audioCtx) return;
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type='triangle'; o.frequency.value=3000; o.connect(g); g.connect(audioCtx.destination);
    const n = audioCtx.currentTime;
    g.gain.setValueAtTime(0.0001, n);
    g.gain.exponentialRampToValueAtTime(VOL*0.7, n+0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, n+0.03);
    o.start(n); o.stop(n+0.04);
  }
  function playTick(){
    if(sound==='off' || !audioCtx) return;
    try{ (sound==='electronic' ? beepElectronic : beepClassic)(); }catch{}
  }

  /* ===== Buttons ===== */
  $('#btnTheme')?.addEventListener('click', ()=>{
    theme = theme==='auto' ? 'light' : theme==='light' ? 'dark' : 'auto';
    storage.set('theme', theme); applyTheme();
  });
  $('#btnSound')?.addEventListener('click', ()=>{
    sound = sound==='off' ? 'electronic' : sound==='electronic' ? 'classic' : 'off';
    storage.set('sound', sound); ensureAudio(); applyI18n();
  });
  $('#btnLang')?.addEventListener('click', ()=>{
    lang = (lang==='uk') ? 'en' : 'uk';
    storage.set('lang', lang); applyI18n();
  });

  /* ===== Share ===== */
  const shareX = $('#share-x'), shareFB = $('#share-fb');

  function buildShareLinks(){
    const url = new URL(location.href);
    url.searchParams.delete('embed'); // у шерінгу не показуємо режим віджета
    const shareUrl = url.toString();
    const text = (lang==='uk'
      ? 'СКІЛЬКИ ДОНАЛЬДУ ТРАМПУ ЗАЛИШИЛОСЬ БУТИ ПРЕЗИДЕНТОМ?'
      : 'HOW LONG DOES DONALD TRUMP HAVE LEFT AS PRESIDENT?');

    if(navigator.share){
      [shareX, shareFB].forEach(a=>{
        a?.addEventListener('click', async (e)=>{
          e.preventDefault();
          try{ await navigator.share({title:text, text, url:shareUrl}); }catch{}
        });
      });
      return;
    }

    if(shareX){
      const x = new URL('https://twitter.com/intent/tweet');
      x.searchParams.set('text', text);
      x.searchParams.set('url', shareUrl);
      shareX.href = x.toString();
    }
    if(shareFB){
      const fb = new URL('https://www.facebook.com/sharer/sharer.php');
      fb.searchParams.set('u', shareUrl);
      shareFB.href = fb.toString();
    }

    function popup(e){
      const a=e.currentTarget, w=580,h=420, y=(screen.height-h)/2, x=(screen.width-w)/2;
      window.open(a.href, 'share', `width=${w},height=${h},left=${x},top=${y},noopener`);
      e.preventDefault();
    }
    [shareX, shareFB].forEach(a=>{ a?.addEventListener('click', popup); });
  }
  buildShareLinks();

  /* ===== Embed mode ===== */
  if(isEmbed){
    $('#controls')?.remove(); $('#adTop')?.remove(); $('#adMid')?.remove(); $('#adBottom')?.remove();
    $('#share')?.remove(); $('#faq')?.remove(); $('#footer')?.remove();
    $('#title') && ($('#title').style.display='none');
    $('#subtitle') && ($('#subtitle').style.display='none');
    $('#card') && ( $('#card').style.background='transparent', $('#card').style.boxShadow='none', $('#card').style.border='0' );
    document.body.style.backgroundImage='none';
  }

  /* ===== Consent placeholder ===== */
  $('#consent')?.addEventListener('click', (e)=>{
    e.preventDefault();
    alert(lang==='uk' ? 'Тут відкриватиметься панель керування cookie (CMP).' : 'A cookie consent (CMP) panel will open here.');
  });

  // Невеличкий лог для перевірки у консолі
  console.log('PresidencyClock loaded ✓');
})();
