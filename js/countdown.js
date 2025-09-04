const TARGET = Date.parse('2029-01-20T17:00:00Z');
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
setInterval(render, 1000);
render();
function changeLang(lang) {
  localStorage.setItem('lang', lang);
  location.search = `?lang=${lang}`;
}
document.getElementById('enable-sound').addEventListener('click', () => {
  soundOn = true;
  audio.setEnabled(true);
  document.getElementById('mute-btn').textContent = t('mute');
  enableUI(true);
});
document.getElementById('mute-btn').addEventListener('click', toggleMute);
function setTheme(theme) {
  if (theme === 'auto') document.body.removeAttribute('class');
  else document.body.className = theme;
  localStorage.setItem('theme', theme);
}
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'auto';
  setTheme(savedTheme);
  if (savedTheme === 'auto') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }
});
