// js/app.js — безпечна версія (працює і без audio.js)
// Fallback i18n: якщо /js/i18n.js не завантажився, береться цей об'єкт
window.I18N = window.I18N || {
  en:{home:"Home",title:"Time left in Donald Trump’s presidency",sub:"U.S. presidential terms end at 12:00 noon ET on January 20 (Twentieth Amendment).",seconds:"Seconds",selectSound:"Sound",tickSound:"Ticking",beepSound:"Digital beep",unmute:"Unmute sound",mute:"Mute sound",shareX:"Share on X",shareFB:"Share on Facebook",copy:"Copy code",copied:"Copied!",evergreen:"Evergreen",digest:"AI Digest",about:"About",privacy:"Privacy",contact:"Contact",madeWith:"Made with",in:"in",kyiv:"Kyiv",termsNote:"Constitutional end of term: 12:00 ET, January 20, 2029."},
  uk:{home:"Головна",title:"Скільки часу залишилося Дональду Трампу на посаді президента США",sub:"Президентський термін у США закінчується о 12:00 за Східним часом 20 січня (Двадцята поправка).",seconds:"Секунди",selectSound:"Звук",tickSound:"Тихий «тік-так»",beepSound:"Електронний біп",unmute:"Увімкнути звук",mute:"Вимкнути звук",shareX:"Поділитися в X",shareFB:"Поділитися у Facebook",copy:"Скопіювати код",copied:"Скопійовано!",evergreen:"Вічнозелений",digest:"AI-дайджест",about:"Про нас",privacy:"Політика конфіденційності",contact:"Зв'язок",madeWith:"Зроблено з",in:"у",kyiv:"Києві",termsNote:"Кінець терміну: 12:00 ET, 20 січня 2029."},
  es:{home:"Inicio",title:"Tiempo restante del mandato de Donald Trump",sub:"El mandato termina a las 12:00 ET el 20 de enero.",seconds:"Segundos",selectSound:"Sonido",tickSound:"Tictac",beepSound:"Pitido digital",unmute:"Activar sonido",mute:"Silenciar",shareX:"Compartir en X",shareFB:"Compartir en Facebook",copy:"Copiar código",copied:"¡Copiado!",evergreen:"Evergreen",digest:"AI Digest",about:"Acerca de",privacy:"Privacidad",contact:"Contacto",madeWith:"Hecho con",in:"en",kyiv:"Kyiv",termsNote:"Fin del mandato: 12:00 ET, 20 de enero de 2029."},
  fr:{home:"Accueil",title:"Temps restant du mandat de Donald Trump",sub:"Le mandat se termine à 12 h (ET) le 20 janvier.",seconds:"Secondes",selectSound:"Son",tickSound:"Tic-tac",beepSound:"Bip numérique",unmute:"Activer le son",mute:"Couper le son",shareX:"Partager sur X",shareFB:"Partager sur Facebook",copy:"Copier le code",copied:"Copié !",evergreen:"Evergreen",digest:"AI Digest",about:"À propos",privacy:"Confidentialité",contact:"Contact",madeWith:"Fait avec",in:"à",kyiv:"Kyiv",termsNote:"Fin du mandat : 12:00 ET, 20 janvier 2029."},
  de:{home:"Start",title:"Verbleibende Amtszeit von Donald Trump",sub:"Die Amtszeit endet um 12:00 ET am 20. Januar.",seconds:"Sekunden",selectSound:"Sound",tickSound:"Ticken",beepSound:"Digitaler Piepton",unmute:"Ton ein",mute:"Stumm",shareX:"Auf X teilen",shareFB:"Auf Facebook teilen",copy:"Code kopieren",copied:"Kopiert!",evergreen:"Evergreen",digest:"AI-Digest",about:"Über uns",privacy:"Datenschutz",contact:"Kontakt",madeWith:"Gemacht mit",in:"in",kyiv:"Kyiv",termsNote:"Amtsende: 12:00 ET, 20. Januar 2029."}
};
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
