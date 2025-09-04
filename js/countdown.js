const TARGET = Date.parse('2029-01-20T17:00:00Z');
let soundOn = false;

function render() {
  const d = Math.max(0, TARGET - Date.now());
  const days = Math.floor(d / 86400000);
  const hours = Math.floor((d / 3600000) % 24).toString().padStart(2, '0');
  const minutes = Math.floor((d / 60000) % 60).toString().padStart(2, '0');
  const seconds = Math.floor((d / 1000) % 60).toString().padStart(2, '0');
  document.getElementById('countdown').innerHTML = `
    <div><span>Days</span>${days}</div>
    <div><span>Hours</span>${hours}</div>
    <div><span>Minutes</span>${minutes}</div>
    <div><span>Seconds</span>${seconds}</div>
  `;
}

function changeLang(lang) {
  localStorage.setItem('lang', lang);
  location.search = `?lang=${lang}`;
}

function setTheme(theme) {
  if (theme === 'auto') document.body.removeAttribute('class');
  else document.body.className = theme;
  localStorage.setItem('theme', theme);
  if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  setInterval(render, 1000);
  const savedLang = localStorage.getItem('lang') || 'en';
  document.querySelector('.lang-switch').value = savedLang;
  const savedTheme = localStorage.getItem('theme') || 'auto';
  document.querySelector('.theme-toggle').value = savedTheme;
  setTheme(savedTheme);

  document.getElementById('enable-sound').addEventListener('click', () => {
    soundOn = true;
    document.getElementById('mute-btn').textContent = t('mute');
  });
  document.getElementById('mute-btn').addEventListener('click', () => {
    soundOn = false;
    document.getElementById('mute-btn').textContent = t('unmute');
  });
});
