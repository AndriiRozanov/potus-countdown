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
  const shareText=encodeURIComponent(t('title'));
  const url=encodeURIComponent(location.origin+location.pathname+'?lang='+lang);
  const x=qs('#share-x'), fb=qs('#share-fb');
  if(x) x.href=`https://twitter.com/intent/tweet?text=${shareText}&url=${url}`;
  if(fb) fb.href=`https://www.facebook.com/sharer/sharer.php?u=${url}`;
  document.title=t('title');
}
function switchLang(newLang){ lang=newLang; localStorage.setItem('lang',lang); applyI18n(); }

const audio=new ClockAudio(); let muted=true; let mode='tick';
function setSoundMode(m){ mode=m; audio.setMode(mode); qsa('.sound-option').forEach(b=>b.setAttribute('aria-pressed', b.dataset.mode===mode?'true':'false')); }
function toggleMute(){ muted=!muted; audio.toggle(!muted); const btn=qs('#mute-btn'); if(btn) btn.textContent=muted?t('unmute'):t('mute'); }
const pad=n=>String(n).padStart(2,'0');

function renderCountdown(){
  const now=Date.now(); let diff=Math.max(0, targetTs-now);
  const sec=Math.floor(diff/1000)%60, min=Math.floor(diff/60000)%60, hr=Math.floor(diff/3600000)%24, day=Math.floor(diff/86400000);
  if(qs('#days .num')){ qs('#days .num').textContent=day; qs('#hours .num').textContent=pad(hr); qs('#minutes .num').textContent=pad(min); qs('#seconds .num').textContent=pad(sec); }
  if(!muted) audio.playTick();
  if(diff===0) clearInterval(timer);
}
let timer;
function start(){
  applyI18n(); setSoundMode('tick'); renderCountdown(); timer=setInterval(renderCountdown,1000);
  qsa('[data-lang]').forEach(b=>b.addEventListener('click',()=>switchLang(b.dataset.lang)));
  qsa('.sound-option').forEach(b=>b.addEventListener('click',()=>setSoundMode(b.dataset.mode)));
  const mute=qs('#mute-btn'); if(mute) mute.addEventListener('click',toggleMute);
  const copy=qs('#copy-embed'); if(copy) copy.addEventListener('click',()=>{
    const code=`<script src="${location.origin}/js/embed.js" data-lang="${lang}" data-theme="dark" async><\\/script>`;
    navigator.clipboard.writeText(code).then(()=>{ copy.textContent=t('copied'); setTimeout(()=>copy.textContent=t('copy'),1200); });
  });
}
document.addEventListener('DOMContentLoaded',start);
