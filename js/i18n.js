const I18N = {
  en: { title: "Time left in Donald Trump’s presidency", sub: "U.S. presidential terms end at 12:00 noon ET on January 20.", enable: "Enable sound", mute: "Mute", evergreen: "Presidents by Term Length" },
  uk: { title: "Скільки часу залишилося Дональду Трампу на посаді президента США", sub: "Президентський термін у США закінчується о 12:00 за Східним часом 20 січня.", enable: "Увімкнути звук", mute: "Вимкнути", evergreen: "Президенти за тривалістю терміну" },
  es: { title: "Tiempo restante del mandato de Donald Trump", sub: "El mandato presidencial termina a las 12:00 ET el 20 de enero.", enable: "Activar sonido", mute: "Silenciar", evergreen: "Presidentes por duración del mandato" },
  fr: { title: "Temps restant du mandat de Donald Trump", sub: "Le mandat se termine à 12 h (ET) le 20 janvier.", enable: "Activer le son", mute: "Couper", evergreen: "Présidents par durée de mandat" },
  de: { title: "Verbleibende Amtszeit von Donald Trump", sub: "Die Amtszeit endet um 12:00 ET am 20. Januar.", enable: "Ton aktivieren", mute: "Aus", evergreen: "Präsidenten nach Amtsdauer" }
};
let lang = (new URLSearchParams(location.search).get('lang') || localStorage.getItem('lang') || 'en').slice(0, 2).toLowerCase();
if (!I18N[lang]) lang = 'en';
const t = k => I18N[lang][k] || k;
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.title = 'Presidency Clock — ' + t('title');
}
applyI18n();
