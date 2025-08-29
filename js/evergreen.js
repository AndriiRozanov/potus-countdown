(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  // активна мова
  const params=new URLSearchParams(location.search);
  let lang=(params.get('lang')||localStorage.getItem('lang')||(navigator.language||'en')).slice(0,2).toLowerCase();
  if(!I18N[lang]) lang='en';
  const t=k=>I18N[lang][k]||k;

  // i18n
  function applyI18n(){
    $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    const langBox=$('#lang'); langBox.innerHTML='';
    ['en','uk','es','fr','de'].forEach(code=>{
      const b=document.createElement('button');
      b.className='btn'; b.textContent=code.toUpperCase();
      b.onclick=()=>{ lang=code; localStorage.setItem('lang',lang); applyI18n(); render(active); };
      langBox.appendChild(b);
    });
  }

  const countries=['us','ua','ca','mx','es','fr','de'];
  let active='us';

  // таби
  function buildTabs(){
    const tabs=$('#tabs'); tabs.innerHTML='';
    countries.forEach(code=>{
      const b=document.createElement('button');
      b.className='btn'; b.textContent=I18N[lang].country[code] || code.toUpperCase();
      b.setAttribute('aria-pressed', String(code===active));
      b.onclick=()=>{ active=code; render(code); };
      tabs.appendChild(b);
    });
  }

  async function load(code){
    try{
      const res=await fetch(`/data/evergreen/${code}.json?cb=${Date.now()}`);
      if(!res.ok) return [];
      const arr=await res.json();
      // Обчислюємо дні та сортуємо (від найменшого до найбільшого)
      return arr.map(x=>{
        const start=new Date(x.start), end=new Date(x.end);
        const days=Math.round((end-start)/86400000);
        return {...x, days};
      }).sort((a,b)=>a.days-b.days);
    }catch(e){ return []; }
  }

  async function render(code){
    buildTabs();
    const data=await load(code);
    const wrap=$('#table-wrap'), note=$('#note');
    if(!data.length){
      wrap.innerHTML=`<p>${t('noData')}</p>`;
      note.textContent='';
      // показуємо підказку як назвати файл
      note.textContent=`/data/evergreen/${code}.json`;
      return;
    }
    const head=`<tr>
      <th>${t('col').name}</th>
      <th>${t('col').office}</th>
      <th>${t('col').start}</th>
      <th>${t('col').end}</th>
      <th>${t('col').days}</th>
    </tr>`;
    const rows=data.map(r=>`<tr>
      <td>${r.name}</td><td>${r.office||''}</td>
      <td>${r.start}</td><td>${r.end}</td><td>${r.days}</td>
    </tr>`).join('');
    wrap.innerHTML=`<table>${head}${rows}</table>`;
    note.textContent='';
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    applyI18n(); buildTabs(); render(active);
  });
})();
