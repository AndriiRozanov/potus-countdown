(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const params=new URLSearchParams(location.search);
  let lang=(params.get('lang')||localStorage.getItem('lang')||(navigator.language||'en')).slice(0,2).toLowerCase();
  if(!I18N[lang]) lang='en';
  const t=k=>I18N[lang][k]||k;

  function applyI18n(){
    $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    const box=$('#lang'); box.innerHTML='';
    ['en','uk','es','fr','de'].forEach(code=>{
      const b=document.createElement('button'); b.className='btn'; b.textContent=code.toUpperCase();
      b.onclick=()=>{ lang=code; localStorage.setItem('lang',lang); render(); };
      box.appendChild(b);
    });
  }

  async function load(){
    try{
      const res=await fetch(`/data/digest.json?cb=${Date.now()}`);
      if(!res.ok) return null;
      return await res.json();
    }catch(e){ return null; }
  }

  function formatDate(iso){
    try{ const d=new Date(iso); return d.toLocaleString(); }catch(e){ return iso||''; }
  }

  async function render(){
    applyI18n();
    const data=await load();
    const list=$('#list'), upd=$('#updated');
    if(!data || !data.items || !data.items.length){
      upd.textContent='';
      list.innerHTML=`<p>${t('dgEmpty')}</p>`;
      return;
    }
    upd.textContent=`${t('dgUpdated')}: ${formatDate(data.updated)}`;
    const items=(data.items||[]).filter(x=>!x.lang || x.lang===lang); // якщо lang не задано — показуємо для всіх
    list.innerHTML=items.map(x=>`
      <div class="item">
        <h2><a href="${x.url}" target="_blank" rel="noopener">${x.title}</a></h2>
        ${x.summary?`<p>${x.summary}</p>`:''}
        <div class="meta">${x.source?x.source:''}</div>
      </div>
    `).join('') || `<p>${t('dgEmpty')}</p>`;
  }

  document.addEventListener('DOMContentLoaded',render);
})();
