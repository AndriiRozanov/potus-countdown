const I18N = {
  en: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds", home: "home", evergreen: "evergreen", digest: "digest", about: "about", privacy: "privacy", contact: "contact", title: "Time left in Donald Trump’s presidency", sub: "U.S. presidential terms end at 12:00 noon ET on January 20 (Twentieth Amendment).", selectSound: "Sound", tickSound: "Ticking", beepSound: "Digital beep", enable: "Enable sound", unmute: "Unmute", mute: "Mute", shareX: "Share on X", shareFB: "Share on Facebook", madeWith: "Made with", in: "in", kyiv: "Kyiv", termsNote: "Constitutional end of term: 12:00 ET, January 20, 2029." },
  uk: { days: "Дні", hours: "Години", minutes: "Хвилини", seconds: "Секунди", home: "головна", evergreen: "вічнозелений", digest: "дайджест", about: "про нас", privacy: "конфіденційність", contact: "зв'язок", title: "Скільки часу залишилося Дональду Трампу на посаді президента США", sub: "Президентський термін у США закінчується о 12:00 за Східним часом 20 січня (Двадцята поправка).", selectSound: "Звук", tickSound: "Тихий «тік-так»", beepSound: "Електронний біп", enable: "Увімкнути звук", unmute: "Увімкнути", mute: "Вимкнути", shareX: "Поділитися в X", shareFB: "Поділитися у Facebook", madeWith: "Зроблено з", in: "у", kyiv: "Києві", termsNote: "Кінець терміну: 12:00 ET, 20 січня 2029." },
  es: { days: "Días", hours: "Horas", minutes: "Minutos", seconds: "Segundos", home: "inicio", evergreen: "evergreen", digest: "ai digest", about: "acerca de", privacy: "privacidad", contact: "contacto", title: "Tiempo restante del mandato de Donald Trump", sub: "El mandato presidencial termina a las 12:00 ET el 20 de enero.", selectSound: "Sonido", tickSound: "Tictac", beepSound: "Pitido digital", enable: "Activar sonido", unmute: "Activar", mute: "Silenciar", shareX: "Compartir en X", shareFB: "Compartir en Facebook", madeWith: "Hecho con", in: "en", kyiv: "Kyiv", termsNote: "Fin del mandato: 12:00 ET, 20 de enero de 2029." },
  fr: { days: "Jours", hours: "Heures", minutes: "Minutes", seconds: "Secondes", home: "accueil", evergreen: "evergreen", digest: "ai digest", about: "à propos", privacy: "confidentialité", contact: "contact", title: "Temps restant du mandat de Donald Trump", sub: "Le mandat se termine à 12 h (ET) le 20 janvier.", selectSound: "Son", tickSound: "Tic-tac", beepSound: "Bip numérique", enable: "Activer le son", unmute: "Activer", mute: "Couper", shareX: "Partager sur X", shareFB: "Partager sur Facebook", madeWith: "Fait avec", in: "à", kyiv: "Kyiv", termsNote: "Fin du mandat : 12:00 ET, 20 janvier 2029." },
  de: { days: "Tage", hours: "Stunden", minutes: "Minuten", seconds: "Sekunden", home: "start", evergreen: "evergreen", digest: "ai-digest", about: "über uns", privacy: "datenschutz", contact: "kontakt", title: "Verbleibende Amtszeit von Donald Trump", sub: "Die Amtszeit endet um 12:00 ET am 20. Januar.", selectSound: "Sound", tickSound: "Ticken", beepSound: "Digitaler Piepton", enable: "Ton aktivieren", unmute: "Ein", mute: "Aus", shareX: "Auf X teilen", shareFB: "Auf Facebook teilen", madeWith: "Gemacht mit", in: "in", kyiv: "Kyiv", termsNote: "Amtsende: 12:00 ET, 20. Januar 2029." }
};

/* простий звуковий генератор (гучний tick/beep, дружній до iOS) */
class ClockAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.mode = 'tick';
  }
  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  setMode(m) {
    this.mode = m;
  }
  setEnabled(on) {
    this.enabled = !!on;
    if (this.enabled) this.ensure();
  }
  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }
  click() {
    if (!this.enabled) return;
    this.ensure();
    const ctx = this.ctx, osc = ctx.createOscillator(), g = ctx.createGain();
    const isBeep = this.mode === 'beep';
    osc.type = isBeep ? 'square' : 'sine';
    osc.frequency.value = isBeep ? 1000 : 520;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.006);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.10);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.11);
  }
}

const TARGET = Date.parse('2029-01-20T17:00:00Z');
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
let lang = (new URLSearchParams(location.search).get('lang') || localStorage.getItem('lang') || (navigator.language || 'en')).slice(0, 2).toLowerCase();
if (!I18N[lang]) lang = 'en';
const t = k => I18N[lang][k] || k;

function applyI18n() {
  $$('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  const url = encodeURIComponent(location.origin + location.pathname + '?lang=' + lang);
  const text = encodeURIComponent(t('title'));
  const x = $('#share-x'), fb = $('#share-fb');
  if (x) x.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  document.title = 'Presidency Clock — ' + t('title');
}

const audio = new ClockAudio();
let soundOn = false, mode = 'tick', prevSec = null;
let interval; // Додаємо змінну для інтервалу, щоб його зупинити

function enableUI(on) {
  $$('.sound-option,#mute-btn').forEach(b => b.disabled = !on);
  $('#enable-sound').style.display = on ? 'none' : 'inline-block';
}

function setMode(m) {
  mode = m;
  audio.setMode(mode);
  $$('.sound-option').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
}

function toggleMute() {
  soundOn = !soundOn;
  audio.setEnabled(soundOn);
  $('#mute-btn').textContent = soundOn ? t('mute') : t('unmute');
}

function render() {
  let d = Math.max(0, TARGET - Date.now());
  const s = Math.floor(d / 1000) % 60,
    m = Math.floor(d / 60000) % 60,
    h = Math.floor(d / 3600000) % 24,
    day = Math.floor(d / 86400000);
  $('#days .num').textContent = day;
  $('#hours .num').textContent = String(h).padStart(2, '0');
  $('#minutes .num').textContent = String(m).padStart(2, '0');
  $('#seconds .num').textContent = String(s).padStart(2, '0');
  if (soundOn && s !== prevSec) {
    audio.click();
    prevSec = s;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Додаємо перевірку на embed-режим
  const params = new URLSearchParams(location.search);
  const isEmbed = params.get('embed') === '1';
  if (isEmbed) {
    // Ховаємо непотрібне для embed: рекламу, меню, шаринг, звук тощо
    $$('.ad-slot, nav, .share-buttons, .sound-controls, footer').forEach(el => { if (el) el.style.display = 'none'; });
    // Зробимо таймер компактним (додай це в CSS, якщо потрібно: width: 100%; max-width: 300px;)
  }

  applyI18n();
  render();
  interval = setInterval(render, 1000); // Запускаємо інтервал

  // Увімкнення звуку лише після кліку користувача (політики браузерів)
  $('#enable-sound').addEventListener('click', () => {
    try { audio.ensure(); } catch (e) { }
    soundOn = true;
    audio.setEnabled(true);
    enableUI(true);
    setMode('tick');
    $('#mute-btn').textContent = t('mute');
  });
  $$('.sound-option').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  $('#mute-btn').addEventListener('click', toggleMute);
  // до кліку — кнопки звуку вимкнені
  enableUI(false);
});
