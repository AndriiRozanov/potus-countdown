<script>
(function(){
  const COUNTRIES = [
    { key:'UA', nameUk:'Україна',         nameEn:'Ukraine',        wiki:{page:'List_of_presidents_of_Ukraine'} },
    { key:'US', nameUk:'США',             nameEn:'United States',  wiki:{page:'List_of_presidents_of_the_United_States'} },
    { key:'GB', nameUk:'Велика Британія', nameEn:'United Kingdom', wiki:{page:'List_of_prime_ministers_of_the_United_Kingdom'} },
    { key:'ES', nameUk:'Іспанія',         nameEn:'Spain',          wiki:{page:'List_of_prime_ministers_of_Spain'} },
    { key:'MX', nameUk:'Мексика',         nameEn:'Mexico',         wiki:{page:'List_of_presidents_of_Mexico'} },
    { key:'FR', nameUk:'Франція',         nameEn:'France',         wiki:{page:'List_of_presidents_of_France'} },
    { key:'DE', nameUk:'Німеччина',       nameEn:'Germany',        wiki:{page:'List_of_chancellors_of_Germany'} },
    { key:'IT', nameUk:'Італія',          nameEn:'Italy',          wiki:{page:'List_of_prime_ministers_of_Italy'} },
    { key:'CN', nameUk:'КНР',             nameEn:'China (PRC)',    wiki:{page:"President_of_the_People%27s_Republic_of_China"} },
    { key:'JP', nameUk:'Японія',          nameEn:'Japan',          wiki:{page:'List_of_prime_ministers_of_Japan'} },
  ];
  const WD_POSITIONS = { UA:'Q189117', US:'Q11696', GB:'Q14211', ES:'Q192059', MX:'Q191110', FR:'Q191954', DE:'Q5677', IT:'Q193955', CN:'Q157631', JP:'Q123239' };

  function getUiLang(){ const l=(document.documentElement.lang||'').toLowerCase(); return (l.split('-')[0]||'en'); }
  function getWindow(){ const end=new Date(); const start=new Date(end); start.setFullYear(end.getFullYear()-40); return {start,end}; }
  function pluralUk(n, one, few, many){const m10=n%10,m100=n%100;if(m10===1&&m100!==11)return one;if(m10>=2&&m10<=4&&(m100<10||m100>=20))return few;return many;}
  function humanizeDays(days, lang){
    const d=Math.round(days), y=Math.floor(d/365.2425), r=Math.round(d-y*365.2425);
    if(lang==='uk'){ return y>0?`${y} ${pluralUk(y,'рік','роки','років')} ${r} ${pluralUk(r,'день','дні','днів')}`:`${d} ${pluralUk(d,'день','дні','днів')}`; }
    return y>0?`${y} yr ${r} d`:`${d} d`;
  }
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function overlapDays(aStart,aEnd,bStart,bEnd){const s=Math.max(aStart.getTime(),bStart.getTime()),e=Math.min(aEnd.getTime(),bEnd.getTime());return e>s?(e-s)/86400000:0;}
  function parseMaybeDate(s){
    if(!s) return null;
    let t = String(s).replace(/\[[^\]]*\]/g,'').replace(/&nbsp;/g,' ').trim();
    // normalize dash and keywords
    t=t.replace(/\bto\b/ig,'–').replace(/\bincumbent\b/ig,'present');
    const dash = /–|—|-/;
    let from=null,to=null;
    if(dash.test(t)){
      const idx = t.search(dash);
      const a=t.slice(0,idx).trim(), b=t.slice(idx+1).trim();
      from = Date.parse(a);
      to = /present|current/i.test(b) ? Date.now() : Date.parse(b);
    } else {
      from = Date.parse(t); to = Date.now();
    }
    if(isNaN(from)) return null;
    if(isNaN(to)) to = Date.now();
    return { from:new Date(from), to:new Date(to) };
  }

  async function fetchWikipediaHtml(page){
    const url=`https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&formatversion=2&format=json&origin=*`;
    const r=await fetch(url,{headers:{'Accept':'application/json'}});
    if(!r.ok) throw new Error('Wikipedia '+r.status);
    const j=await r.json();
    if(!j.parse||!j.parse.text) throw new Error('Wikipedia: no parse text');
    return j.parse.text;
  }

  // === Ключова різниця: визначаємо індекси колонок за заголовком
  function extractLeadersFromWikiHTML(html){
    const doc = new DOMParser().parseFromString(html,'text/html');
    const tables = Array.from(doc.querySelectorAll('.wikitable'));
    const out = [];

    const headerMatches = (txt, patterns) => patterns.some(p => p.test(txt));

    for(const table of tables){
      const trs = Array.from(table.querySelectorAll('tr'));
      if(!trs.length) continue;

      // знайти header row
      let header = null, headerIdx = {};
      for(const tr of trs){
        const ths = Array.from(tr.querySelectorAll('th')).map(th => th.textContent.trim());
        if(!ths.length) continue;
        const nameIdx = ths.findIndex(t => headerMatches(t, [/^name$/i, /^president$/i, /^prime\s*minister$/i]));
        const termIdx = ths.findIndex(t => headerMatches(t, [/^term/i, /^term\s*dates/i, /^tenure/i, /^in\s*office/i]));
        if(nameIdx !== -1 && termIdx !== -1){
          header = tr;
          headerIdx = { name:nameIdx, term:termIdx };
          break;
        }
      }
      if(!header) continue;

      // пройдемося по рядках після заголовка
      for(const tr of trs.slice(trs.indexOf(header)+1)){
        const cells = Array.from(tr.children).filter(el => el.tagName==='TD' || el.tagName==='TH');
        if(cells.length <= Math.max(headerIdx.name, headerIdx.term)) continue;

        // Ім'я з конкретної колонки
        let nameCell = cells[headerIdx.name];
        if(!nameCell) continue;
        let a = nameCell.querySelector('a[href*="/wiki/"]:not([href*="redlink="])');
        let name = (a?.textContent || nameCell.textContent || '').replace(/\[[^\]]*\]/g,'').trim();
        if(!name || /Vacan|Acting/i.test(name)) continue; // пропускаємо "Vacant"/"Acting" заголовки
        const href = a ? a.href : null;

        // Дати з конкретної колонки (може бути кілька через <br>)
        const termCell = cells[headerIdx.term];
        const raw = (termCell?.innerText || termCell?.textContent || '').split(/\n/).map(s=>s.trim()).filter(Boolean);
        const segments=[];
        for(const line of raw){
          const parsed = parseMaybeDate(line);
          if(parsed) segments.push(parsed);
        }
        if(!segments.length) continue;

        out.push({ name, href, segments });
      }
    }

    // Групування (на випадок повторів)
    const map = new Map();
    for(const r of out){
      const key = r.href || r.name;
      const cur = map.get(key) || { name:r.name, href:r.href, segments:[] };
      cur.segments.push(...r.segments);
      if(r.name && r.name.length < cur.name.length) cur.name = r.name;
      map.set(key, cur);
    }
    return Array.from(map.values());
  }

  function aggregateWithinWindow(items, win){
    return items.map(it=>{
      let days=0; const kept=[];
      for(const seg of it.segments){
        const d = overlapDays(seg.from, seg.to, win.start, win.end);
        if(d>0){ days+=d; kept.push({start:seg.from.toISOString(), end:seg.to.toISOString()}); }
      }
      return { name:it.name, href:it.href, days, stints:kept };
    }).filter(x=>x.days>0.0001);
  }

  // Wikidata fallback — тільки якщо з Вікі нічого не вийшло
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
    return j.results.bindings.map(b=>{
      const s = b.start?.value ? new Date(b.start.value) : (b.end?.value? new Date(b.end.value) : null);
      const e = b.end?.value ? new Date(b.end.value) : new Date();
      return { name:b.personLabel?.value||'', href:b.person?.value, segments: s ? [{from:s, to:e}] : [] };
    });
  }

  function renderCountry(container, country, people, lang, win, source){
    people.sort((a,b)=> a.days - b.days);
    const section=document.createElement('section'); section.className='tenure-country';
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
      <tbody></tbody>`;
    const tbody=table.querySelector('tbody');

    people.forEach((p,i)=>{
      const tr=document.createElement('tr');
      const nameCell = p.href ? `<a href="${p.href}" target="_blank" rel="noopener">${escapeHtml(p.name)}</a>` : escapeHtml(p.name);
      tr.innerHTML = `<td>${i+1}</td><td>${nameCell}</td><td data-days="${p.days.toFixed(2)}">${humanizeDays(p.days, lang)}</td>`;
      tr.title = p.stints.map(s=>`${s.start.slice(0,10)} — ${s.end.slice(0,10)}`).join(' | ');
      tbody.appendChild(tr);
    });

    section.appendChild(table);
    container.appendChild(section);
  }

  async function buildAll(){
    const mount=document.getElementById('tenure-tables'); if(!mount) return;
    const lang=getUiLang(), win=getWindow();

    const info=document.createElement('p'); info.className='tenure-note';
    info.textContent = lang==='uk'
      ? 'Керівники країн за сумарною тривалістю в межах останніх 40 років (коротші → довші). Дані — Wikipedia; якщо таблицю не розпізнано, fallback — Wikidata.'
      : 'Leaders ranked by total time in office within the last 40 years (shortest → longest). Source: Wikipedia; fallback: Wikidata.';
    mount.appendChild(info);

    for(const c of COUNTRIES){
      try{
        const html = await fetchWikipediaHtml(c.wiki.page);
        let items = extractLeadersFromWikiHTML(html);
        items = aggregateWithinWindow(items, win);
        if(items.length===0){
          const wd = await fetchWikidata(WD_POSITIONS[c.key], lang);
          const merged = aggregateWithinWindow(wd, win);
          renderCountry(mount, c, merged, lang, win, 'wikidata');
        } else {
          renderCountry(mount, c, items, lang, win, 'wiki');
        }
      }catch(e){
        try{
          const wd = await fetchWikidata(WD_POSITIONS[c.key], lang);
          const items = aggregateWithinWindow(wd, win);
          renderCountry(mount, c, items, lang, win, 'wikidata');
        }catch(err){
          const s=document.createElement('section'); s.className='tenure-country';
          s.innerHTML=`<h2>${lang==='uk'?c.nameUk:c.nameEn}</h2><p style="color:#b00">Помилка завантаження даних.</p>`;
          mount.appendChild(s);
        }
      }
    }
  }

  document.addEventListener('DOMContentLoaded', buildAll);

  // вмонтуємо легкі стилі (можеш перенести у style.css)
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
  `;
  const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
})();
</script>
