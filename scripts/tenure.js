<script>
// =========================
// PresidencyClock — Tenure tables (Wikipedia-first, Wikidata fallback)
// Countries: UA, US, UK, ES, MX, FR, DE, IT, CN (PRC), JP
// Window: last 40 years from "today"
// =========================

(function(){
  const COUNTRIES = [
    // title: англомовна назва сторінки в enwiki з повним переліком
    { key:'UA', nameUk:'Україна',           nameEn:'Ukraine',         office:'head', wiki:{page:'List_of_presidents_of_Ukraine'} },
    { key:'US', nameUk:'США',               nameEn:'United States',   office:'head', wiki:{page:'List_of_presidents_of_the_United_States'} },
    { key:'GB', nameUk:'Велика Британія',   nameEn:'United Kingdom',  office:'head', wiki:{page:'List_of_prime_ministers_of_the_United_Kingdom'} },
    { key:'ES', nameUk:'Іспанія',           nameEn:'Spain',           office:'head', wiki:{page:'List_of_prime_ministers_of_Spain'} },
    { key:'MX', nameUk:'Мексика',           nameEn:'Mexico',          office:'head', wiki:{page:'List_of_presidents_of_Mexico'} },
    { key:'FR', nameUk:'Франція',           nameEn:'France',          office:'head', wiki:{page:'List_of_presidents_of_France'} },
    { key:'DE', nameUk:'Німеччина',         nameEn:'Germany',         office:'head', wiki:{page:'List_of_chancellors_of_Germany'} },
    { key:'IT', nameUk:'Італія',            nameEn:'Italy',           office:'head', wiki:{page:'List_of_prime_ministers_of_Italy'} },
    { key:'CN', nameUk:'КНР',               nameEn:'China (PRC)',     office:'head', wiki:{page:'President_of_the_People%27s_Republic_of_China'} }, // у цій статті є список у таблиці
    { key:'JP', nameUk:'Японія',            nameEn:'Japan',           office:'head', wiki:{page:'List_of_prime_ministers_of_Japan'} },
  ];

  // Wikidata fallback (посадові QIDs, якщо Wikipedia-таблиця раптом не розпарситься)
  const WD_POSITIONS = {
    'UA':'Q189117', // President of Ukraine
    'US':'Q11696',  // President of the US
    'GB':'Q14211',  // Prime Minister of the UK
    'ES':'Q192059', // PM of Spain (President of the Government)
    'MX':'Q191110', // President of Mexico
    'FR':'Q191954', // President of France
    'DE':'Q5677',   // Chancellor of Germany
    'IT':'Q193955', // PM of Italy (President of the Council of Ministers)
    'CN':'Q157631', // President of PRC
    'JP':'Q123239'  // Prime Minister of Japan
  };

  // ===== Helpers
  function getUiLang(){ const l=(document.documentElement.lang||'').toLowerCase(); return (l.split('-')[0]||'en'); }
  function getWindow(){ const end=new Date(); const start=new Date(end); start.setFullYear(end.getFullYear()-40); return {start,end}; }
  function pluralUk(n, one, few, many){const m10=n%10,m100=n%100;if(m10===1&&m100!==11)return one;if(m10>=2&&m10<=4&&(m100<10||m100>=20))return few;return many;}
  function humanizeDays(days, lang){
    const d=Math.round(days);
    const years=Math.floor(d/365.2425);
    const rem=Math.round(d - years*365.2425);
    if(lang==='uk'){
      if(years>0) return `${years} ${pluralUk(years,'рік','роки','років')} ${rem} ${pluralUk(rem,'день','дні','днів')}`;
      return `${d} ${pluralUk(d,'день','дні','днів')}`;
    } else {
      if(years>0) return `${years} yr ${rem} d`;
      return `${d} d`;
    }
  }
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function parseMaybeDate(s){
    if(!s) return null;
    let t = s.replace(/\[[^\]]*\]/g,'')      // прибрати примітки [1]
             .replace(/&nbsp;/g,' ')
             .replace(/\bto\b/ig,'–')
             .replace(/\s+present\b/i,' – present')
             .trim();
    // Витягти перший датний фрагмент у рядку
    // Підтримка форматів: "January 20, 2009 – January 20, 2017", "1994–1997", "2005–present"
    const dash = /–|—|-/;
    let from=null, to=null;
    if(dash.test(t)){
      const [a,b] = t.split(dash);
      from = Date.parse(a.trim());
      to   = /present|incumbent|current/i.test(b) ? Date.now() : Date.parse(b.trim());
    } else {
      // одинарна дата (старт); кінець невідомий -> поточна
      from = Date.parse(t.trim());
      to = Date.now();
    }
    if(isNaN(from)) return null;
    if(isNaN(to)) to = Date.now();
    return { from:new Date(from), to:new Date(to) };
  }
  function overlapDays(aStart, aEnd, bStart, bEnd){
    const s=Math.max(aStart.getTime(), bStart.getTime());
    const e=Math.min(aEnd.getTime(),   bEnd.getTime());
    const diff=e-s;
    return diff>0 ? diff/86400000 : 0;
  }

  // ===== Wikipedia API
  async function fetchWikipediaHtml(page){
    const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&formatversion=2&format=json&origin=*`;
    const r = await fetch(url, { headers:{'Accept':'application/json'} });
    if(!r.ok) throw new Error('Wikipedia '+r.status);
    const j = await r.json();
    if(!j.parse || !j.parse.text) throw new Error('Wikipedia: no parse text');
    return j.parse.text; // HTML string
  }

  // Витягнути рядки: name + [start–end] (може бути кілька сегментів)
  function extractLeadersFromWikiHTML(html){
    const dom = new DOMParser().parseFromString(html, 'text/html');
    const tables = Array.from(dom.querySelectorAll('.wikitable'));
    const rows = [];
    for(const table of tables){
      for(const tr of table.querySelectorAll('tr')){
        const cells = Array.from(tr.children).filter(x=>x.tagName==='TD'||x.tagName==='TH');
        if(cells.length<2) continue;
        // Знайти клітинки з датами (є тире/слово present)
        const dateCells = cells.filter(td => /present|incumbent|current|–|—|-|\d{4}/i.test(td.textContent||''));
        // Ім'я: шукаємо перше посилання в рядку, що веде на /wiki/
        let name = null, href=null;
        const a = tr.querySelector('a[href*="/wiki/"]');
        if(a && a.textContent) { name = a.textContent.trim(); href = a.href; }
        // Дата: пробуємо кожну dateCell розпарсити
        const segments = [];
        for(const dc of dateCells){
          const txt = dc.innerText || dc.textContent || '';
          // Розбити на частини, якщо у клітинці кілька термінів, розділених <br>
          const parts = txt.split(/\n|<br\s*\/?>/i);
          for(let p of parts){
            p = p.replace(/\s+/g,' ').trim();
            const parsed = parseMaybeDate(p);
            if(parsed) segments.push(parsed);
          }
        }
        if(name && segments.length){
          rows.push({ name, href, segments });
        }
      }
    }
    // Згрупувати по особі (іноді одна людина зустрічається кілька разів)
    const map = new Map();
    for(const r of rows){
      const key = (r.href||r.name);
      const cur = map.get(key) || { name:r.name, href:r.href, segments:[] };
      cur.segments.push(...r.segments);
      // обираємо найкоротше/найчистіше ім'я
      if(r.name && r.name.length < cur.name.length) cur.name = r.name;
      map.set(key, cur);
    }
    return Array.from(map.values());
  }

  function aggregateWithinWindow(items, win){
    return items.map(it=>{
      let days=0;
      const kept=[];
      for(const seg of it.segments){
        const d = overlapDays(seg.from, seg.to, win.start, win.end);
        if(d>0){ days+=d; kept.push({start:seg.from.toISOString(), end:seg.to.toISOString()}); }
      }
      return { name:it.name, href:it.href, days, stints:kept };
    }).filter(x=>x.days>0.0001);
  }

  // ===== Wikidata fallback
  async function fetchWikidata(positionQid, lang){
    const endpoint='https://query.wikidata.org/sparql';
    const query=`
SELECT ?person ?personLabel ?start ?end WHERE {
  ?person p:P39 ?st .
  ?st ps:P39 wd:${positionQid} .
  OPTIONAL { ?st pq:P580 ?start . }
  OPTIONAL { ?st pq:P582 ?end . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
}`;
    const res=await fetch(endpoint+'?format=json&query='+encodeURIComponent(query),{headers:{'Accept':'application/sparql-results+json'}});
    if(!res.ok) throw new Error('Wikidata '+res.status);
    const j=await res.json();
    // Якщо немає P580 — беремо кінець як start (нульова довжина не пройде фільтр)
    return j.results.bindings.map(b=>{
      const s = b.start?.value ? new Date(b.start.value) : (b.end?.value? new Date(b.end.value) : null);
      const e = b.end?.value ? new Date(b.end.value) : new Date();
      return { name:b.personLabel?.value||'', href:b.person?.value, segments: s ? [{from:s, to:e}] : [] };
    });
  }

  // ===== Render
  function renderCountry(container, country, people, lang, win, source){
    people.sort((a,b)=> a.days - b.days);
    const section=document.createElement('section');
    section.className='tenure-country';
    const title=(lang==='uk'?country.nameUk:country.nameEn);
    const h2=document.createElement('h2'); h2.textContent=title; section.appendChild(h2);

    const meta=document.createElement('div'); meta.className='tenure-source';
    const y1=win.start.toISOString().slice(0,10), y2=win.end.toISOString().slice(0,10);
    const srcLink = source==='wiki'
      ? `https://en.wikipedia.org/wiki/${country.wiki.page}`
      : `https://www.wikidata.org/wiki/${WD_POSITIONS[country.key]}`;
    meta.innerHTML = `${lang==='uk'?'Період':'Window'}: ${y1} — ${y2}. ${lang==='uk'?'Джерело':'Source'}: <a href="${srcLink}" target="_blank" rel="noopener">${source==='wiki'?'Wikipedia':'Wikidata'}</a>`;
    section.appendChild(meta);

    const table=document.createElement('table'); table.className='tenure-table';
    table.innerHTML=`
      <thead>
        <tr>
          <th style="width:3ch;">#</th>
          <th>${lang==='uk'?'Ім’я':'Name'}</th>
          <th>${lang==='uk'?'Сумарно у вікні (40 років)':'Total within window (40y)'}</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody=table.querySelector('tbody');
    people.forEach((p,i)=>{
      const tr=document.createElement('tr');
      const nameCell = p.href ? `<a href="${p.href}" target="_blank" rel="noopener">${escapeHtml(p.name)}</a>` : escapeHtml(p.name);
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${nameCell}</td>
        <td data-days="${p.days.toFixed(2)}">${humanizeDays(p.days, lang)}</td>
      `;
      tr.title = p.stints.map(s=>`${s.start.slice(0,10)} — ${s.end.slice(0,10)}`).join(' | ');
      tbody.appendChild(tr);
    });

    section.appendChild(table);
    container.appendChild(section);
  }

  // ===== Boot
  async function buildAll(){
    const mount=document.getElementById('tenure-tables'); if(!mount) return;
    const lang=getUiLang(), win=getWindow();

    // інфо-блок
    const info=document.createElement('p'); info.className='tenure-note';
    info.textContent = lang==='uk'
      ? 'Керівники країн за сумарною тривалістю в межах останніх 40 років (від найкоротшої до найдовшої). Дані тягнемо з Wikipedia; якщо таблиця нестандартна — підстраховує Wikidata.'
      : 'Leaders ranked by total time in office within the last 40 years (shortest → longest). Data from Wikipedia; Wikidata as fallback.';
    mount.appendChild(info);

    for(const c of COUNTRIES){
      try{
        // 1) Wikipedia-first
        const html = await fetchWikipediaHtml(c.wiki.page);
        let items = extractLeadersFromWikiHTML(html);
        items = aggregateWithinWindow(items, win);
        // Якщо підозріло мало (наприклад < 3), пробуємо fallback
        if(items.length < 3){
          const wdItems = await fetchWikidata(WD_POSITIONS[c.key], lang);
          const merged = aggregateWithinWindow(wdItems, win);
          if(merged.length > items.length) items = merged;
          renderCountry(mount, c, items, lang, win, merged.length>items.length ? 'wikidata':'wiki');
        } else {
          renderCountry(mount, c, items, lang, win, 'wiki');
        }
      }catch(e){
        // повний fallback на Wikidata
        try{
          const wd = await fetchWikidata(WD_POSITIONS[c.key], lang);
          const items = aggregateWithinWindow(wd, win);
          renderCountry(mount, c, items, lang, win, 'wikidata');
        }catch(err){
          const s=document.createElement('section'); s.className='tenure-country';
          s.innerHTML = `<h2>${lang==='uk'?c.nameUk:c.nameEn}</h2>
            <p style="color:#b00">Не вдалося завантажити дані (${escapeHtml(e.message||'')}).</p>`;
          mount.appendChild(s);
        }
      }
    }
  }

  document.addEventListener('DOMContentLoaded', buildAll);

  // ===== Inline styles (можеш перенести у style.css)
  const CSS = `
  .tenure-country { margin: 2rem 0; }
  .tenure-country h2 { margin: 0 0 .25rem 0; }
  .tenure-note { font-size:.95rem; opacity:.85; margin-bottom:.5rem; }
  .tenure-source { font-size:.85rem; margin:.25rem 0 1rem 0; opacity:.75; }
  .tenure-table { width:100%; border-collapse:collapse; }
  .tenure-table th,.tenure-table td { border-bottom:1px solid var(--border,#e5e5e5); padding:.6rem .5rem; text-align:left; }
  .tenure-table tbody tr:hover { background: rgba(0,0,0,.03); }
  .tenure-table td:nth-child(1){ text-align:right; opacity:.7; }
  .tenure-table td[data-days]{ white-space:nowrap; }
  @media (max-width:640px){ .tenure-table th:nth-child(1),.tenure-table td:nth-child(1){ width:2.5ch; } }
  `;
  const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
})();
</script>
