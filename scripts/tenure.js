<script>
// =========================
// PresidencyClock: Tenure tables (last 40 years)
// Дані з відкритого джерела: Wikidata SPARQL endpoint
// =========================

// Посада, яка в країні = головний керівник держави/уряду за практикою останніх 40 років
// (де-факто керівники: UK/DE/IT/ES/JP — прем'єри; FR/MX/US/UA/CN — президенти)
const POSITIONS = [
  { countryKey: 'UA', nameUk: 'Україна',            nameEn: 'Ukraine',          wd: 'Q189117' }, // President of Ukraine
  { countryKey: 'US', nameUk: 'США',                 nameEn: 'United States',    wd: 'Q11696'  }, // President of the US
  { countryKey: 'GB', nameUk: 'Велика Британія',     nameEn: 'United Kingdom',   wd: 'Q14211'  }, // Prime Minister of the UK
  { countryKey: 'ES', nameUk: 'Іспанія',             nameEn: 'Spain',            wd: 'Q192059' }, // President of the Government of Spain (PM)
  { countryKey: 'MX', nameUk: 'Мексика',             nameEn: 'Mexico',           wd: 'Q191110' }, // President of Mexico
  { countryKey: 'FR', nameUk: 'Франція',             nameEn: 'France',           wd: 'Q191954' }, // President of France
  { countryKey: 'DE', nameUk: 'Німеччина',           nameEn: 'Germany',          wd: 'Q5677'   }, // Chancellor of Germany
  { countryKey: 'IT', nameUk: 'Італія',              nameEn: 'Italy',            wd: 'Q193955' }, // President of the Council of Ministers of Italy (PM)
  { countryKey: 'CN', nameUk: 'КНР',                 nameEn: 'China (PRC)',      wd: 'Q157631' }, // President of the PRC
  { countryKey: 'JP', nameUk: 'Японія',              nameEn: 'Japan',            wd: 'Q123239' }  // Prime Minister of Japan
];

// Вікно — останні 40 років від сьогодні (враховує високосні автоматично API браузера)
function getWindow() {
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(end.getFullYear() - 40);
  return { start, end };
}

// Мова інтерфейсу
function getUiLang() {
  const l = (document.documentElement.lang || '').trim().toLowerCase();
  return (l && l.split('-')[0]) || 'en';
}

// SPARQL: беремо всі P39=посада з датами start(P580) і end(P582) якщо є
// Без додаткових фільтрів — фільтруємо на клієнті за "останні 40 років".
async function fetchHolders(positionQid, lang) {
  const endpoint = 'https://query.wikidata.org/sparql';
  const query = `
SELECT ?person ?personLabel ?start ?end WHERE {
  ?person p:P39 ?st .
  ?st ps:P39 wd:${positionQid} .
  ?st pq:P580 ?start .
  OPTIONAL { ?st pq:P582 ?end . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
}
`;
  const res = await fetch(endpoint + '?format=json&query=' + encodeURIComponent(query), {
    headers: { 'Accept': 'application/sparql-results+json' }
  });
  if (!res.ok) throw new Error('Wikidata ' + res.status);
  const data = await res.json();
  return data.results.bindings.map(b => ({
    id: b.person.value,               // full URI https://www.wikidata.org/entity/Q...
    label: b.personLabel?.value || '',
    start: b.start?.value || null,
    end: b.end?.value || null
  })).filter(r => r.start); // потрібен хоча б початок
}

// Перетин двох інтервалів дат у днях (>=0)
function overlapDays(aStart, aEnd, bStart, bEnd) {
  const s = Math.max(aStart.getTime(), bStart.getTime());
  const e = Math.min(aEnd.getTime(),   bEnd.getTime());
  const diff = e - s;
  return diff > 0 ? diff / 86400000 : 0;
}

// Групуємо по персоні і сумуємо тільки дні в межах [T-40y; T]
function aggregateLast40Y(rows, window) {
  const map = new Map();
  for (const r of rows) {
    const stintStart = new Date(r.start);
    const stintEnd   = r.end ? new Date(r.end) : window.end;
    const daysInWin  = overlapDays(stintStart, stintEnd, window.start, window.end);
    if (daysInWin <= 0) continue;

    const key = r.id;
    const cur = map.get(key) || { id: key, name: r.label, days: 0, stints: [] };
    cur.days += daysInWin;
    // зберігаємо обрізану до вікна каденцію для підказки (title)
    const segStart = new Date(Math.max(stintStart.getTime(), window.start.getTime()));
    const segEnd   = new Date(Math.min(stintEnd.getTime(),   window.end.getTime()));
    cur.stints.push({ start: segStart.toISOString(), end: segEnd.toISOString() });
    if (r.label && (!cur.name || r.label.length < cur.name.length)) cur.name = r.label;
    map.set(key, cur);
  }
  return Array.from(map.values());
}

// Людинозрозуміла тривалість
function humanizeDays(days) {
  const d = Math.round(days);
  const years = Math.floor(d / 365.2425);
  const rem = Math.round(d - years * 365.2425);
  if (years > 0) return `${years} ${pluralUk(years,'рік','роки','років')} ${rem} ${pluralUk(rem,'день','дні','днів')}`;
  return `${d} ${pluralUk(d,'день','дні','днів')}`;
}
function pluralUk(n, one, few, many){const m10=n%10,m100=n%100;if(m10===1&&m100!==11)return one;if(m10>=2&&m10<=4&&(m100<10||m100>=20))return few;return many;}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

// Рендер секції країни
function renderCountryTable(container, country, people, lang, window) {
  people.sort((a,b)=> a.days - b.days); // коротші → довші

  const section = document.createElement('section');
  section.className = 'tenure-country';

  const title = (lang==='uk' ? country.nameUk : country.nameEn);
  const h2 = document.createElement('h2');
  h2.textContent = title;
  section.appendChild(h2);

  const note = document.createElement('div');
  const yStart = window.start.toISOString().slice(0,10);
  const yEnd   = window.end.toISOString().slice(0,10);
  note.className = 'tenure-source';
  note.innerHTML = `Період: ${yStart} — ${yEnd}. Джерело: <a href="https://www.wikidata.org/wiki/${country.wd}" target="_blank" rel="noopener">Wikidata</a>`;
  section.appendChild(note);

  const table = document.createElement('table');
  table.className = 'tenure-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:3ch;">#</th>
        <th>${lang==='uk'?'Ім’я':'Name'}</th>
        <th>${lang==='uk'?'Сумарно у вікні (40 років)':'Total within window (40y)'}</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  people.forEach((p,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td><a href="${p.id}" target="_blank" rel="noopener">${escapeHtml(p.name)}</a></td>
      <td data-days="${p.days.toFixed(2)}">${humanizeDays(p.days)}</td>
    `;
    tr.title = p.stints.map(s=>{
      const a = s.start.slice(0,10), b = s.end.slice(0,10);
      return `${a} — ${b}`;
    }).join(' | ');
    tbody.appendChild(tr);
  });

  section.appendChild(table);
  container.appendChild(section);
}

async function buildAll() {
  const holder = document.getElementById('tenure-tables');
  if (!holder) return;
  const lang = getUiLang();
  const window = getWindow();

  // Інфо-блок
  const info = document.createElement('p');
  info.className = 'tenure-note';
  info.textContent = lang==='uk'
    ? 'Нижче — керівники країн за сумарною тривалістю на посаді в межах останніх 40 років (від найкоротшої до найдовшої).'
    : 'Leaders ranked by total time in office within the last 40 years (shortest → longest).';
  holder.appendChild(info);

  for (const country of POSITIONS) {
    try {
      const raw = await fetchHolders(country.wd, lang);
      const people = aggregateLast40Y(raw, window);
      // Якщо хтось у країні не має жодного дня у вікні — таблиця все одно показується (може бути порожня)
      renderCountryTable(holder, country, people, lang, window);
    } catch (e) {
      const s = document.createElement('section');
      s.className = 'tenure-country';
      s.innerHTML = `<h2>${lang==='uk'?country.nameUk:country.nameEn}</h2>
        <p style="color:#b00">Не вдалося завантажити дані (${escapeHtml(e.message)}).</p>`;
      holder.appendChild(s);
    }
  }
}

document.addEventListener('DOMContentLoaded', buildAll);

// (стилі — можна покласти у style.css)
const CSS = `
.tenure-country { margin: 2rem 0; }
.tenure-country h2 { margin: 0 0 .25rem 0; }
.tenure-note { font-size:.95rem; opacity:.85; margin-bottom:.5rem; }
.tenure-source { font-size:.85rem; margin:.25rem 0 1rem 0; opacity:.75; }
.tenure-table { width:100%; border-collapse:collapse; }
.tenure-table th,.tenure-table td { border-bottom:1px solid #e5e5e5; padding:.6rem .5rem; text-align:left; }
.tenure-table tbody tr:hover { background: rgba(0,0,0,.03); }
.tenure-table td:nth-child(1){ text-align:right; opacity:.7; }
.tenure-table td[data-days]{ white-space:nowrap; }
@media (max-width:640px){ .tenure-table th:nth-child(1),.tenure-table td:nth-child(1){ width:2.5ch; } }
`;
const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
</script>
