// js/app.js — безпечна версія (працює і без audio.js)
(function(){
  const TARGET = Date.parse('2029-01-20T17:00:00Z'); // 12:00 ET
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  // мова
  const params = new URLSearchParams(location.search);
  let lang = (params.get('lang') || localStorage.getItem('lang') || (navigator.language||'en')).slice(0,2).toLowerCase();
  if (!window.I18N || !window.I18N[lang]) lang = 'en';
  const t = k => (window.I18N && window.I18N[lang] && window.I18N[lang][k]) || k;

  // i18n заповнення текстів + лінки шарингу
  function applyI18n(){
    $$('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
    const url  = encodeURIComponent(location.origin + location.pathname + '?lang=' + lang);
    const text = encodeURIComponent(t('title'));
    const x  = $('#share-x');   if (x)  x.href  = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    const fb = $('#share-fb');  if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    document.title = t('title');
  }

  // м’який фолбек аудіо (щоб нічого не ламало)
  const AudioCtor = window.ClockAudio || function(){};
  AudioCtor.prototype.setMode = AudioCtor.prototype.setMode || function(){};
  AudioCtor.prototype.toggle  = AudioCtor.prototype.toggle  || function(){ return false; };
  AudioCtor.prototype.playTick= AudioCtor.prototype.playTick|| function(){};
  const audio = new AudioCtor();
  let muted = true, mode = 'tick';

  function setSoundMode(m){
    mode = m; if (audio.setMode) audio.setMode(mode);
    $$('.sound-option').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode===mode)));
  }
  function toggleMute(){
    muted = !muted; if (audio.toggle) audio.toggle(!muted);
    const btn = $('#mute-btn'); if (btn) btn.textContent = muted ? t('unmute') : t('mute');
  }
  const pad = n => String(n).padStart(2,'0');

  function render(){
    const diff = Math.max(0, TARGET - Date.now());
    const s = Math.floor(diff/1000)%60, m = Math.floor(diff/60000)%60, h = Math.floor(diff/3600000)%24, d = Math.floor(diff/86400000);
    const dN = $('#days .num'), hN = $('#hours .num'), mN = $('#minutes .num'), sN = $('#seconds .num');
    if (dN) { dN.textContent = d; hN.textContent = pad(h); mN.textContent = pad(m); sN.textContent = pad(s); }
    if (!muted && audio.playTick) audio.playTick();
  }

  document.addEventListener('DOMContentLoaded', function(){
    applyI18n();
    setSoundMode('tick'); toggleMute(); // перший клік увімкне звук, за замовчуванням мовчимо
    render(); setInterval(render, 1000);

    // події
    $$('.sound-option').forEach(b => b.addEventListener('click', () => setSoundMode(b.dataset.mode)));
    const mute = $('#mute-btn'); if (mute) mute.addEventListener('click', toggleMute);
    $$('.lang-switch .btn').forEach(b => b.addEventListener('click', () => { lang=b.dataset.lang; localStorage.setItem('lang',lang); applyI18n(); }));
    const copy = $('#copy-embed');
    if (copy) copy.addEventListener('click', () => {
      const code = `<script src="${location.origin}/js/embed.js" data-lang="${lang}" data-theme="dark" async><\\/script>`;
      navigator.clipboard.writeText(code).then(()=>{ copy.textContent = t('copied'); setTimeout(()=>copy.textContent=t('copy'),1200); });
    });
  });
})();
