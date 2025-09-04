<script>
// =========================
// PresidencyClock: tenure tables (Wikidata -> HTML)
// =========================

// Мапа посад (Wikidata item IDs) для кожної країни.
// Ми рахуємо фактичний час перебування на посаді (сума всіх окремих строк / каденцій).
// Якщо кінець відсутній (чинний лідер) — рахуємо до "сьогодні".
const POSITIONS = [
  { countryKey: 'UA', nameUk: 'Україна', nameEn: 'Ukraine',          wd: 'Q189117' }, // President of Ukraine
  { countryKey: 'US', nameUk: 'США',      nameEn: 'United States',   wd: 'Q11696'  }, // President of the United States
  { countryKey: 'GB', nameUk: 'Велика Британія', nameEn: 'United Kingdom', wd: 'Q14211' }, // Prime Minister of the UK
  { countryKey: 'ES', nameUk: 'Іспанія',  nameEn: 'Spain',           wd: 'Q192059' }, // President of the Government of Spain (Prime Minister)
  { countryKey: 'MX', nameUk: 'Мексика',  nameEn: 'Mexico',          wd: 'Q191110' }, // President of Mexico
  { countryKey: 'FR', nameUk: 'Франція',  nameEn: 'France',          wd: 'Q191954' }, // President of France
  { countryKey: 'DE', nameUk: 'Німеччина',nameEn: 'Germany',         wd: 'Q5677'   }, // Chancellor of Germany (Federal Chancellor)
  { countryKey: 'IT', nameUk: 'Італія',   nameEn: 'Italy',           wd: 'Q193955' }, // President of the Council of Ministers of Italy (Prime Minister)
  { countryKey: 'CN', nameUk: 'КНР',      nameEn: 'China',           wd: 'Q157631' }, // President of the PRC
  { countryKey: 'JP', nameUk: 'Японія',   nameEn: 'Japan',           wd: 'Q123239' }  // Prime Minister of Japan
];

// Визначаємо мову інтерфейсу із <html lang="...">, fallback — en.
function getUiLang() {
  const l = (document.documentElement.lang || '').trim().toLowerCase();
  if (!l) return 'en';
  // зводимо варіанти типу uk-UA до 'uk'
  return l.split('-')[0];
}

// Формуємо текстовий ряд для тривалості.
function humanizeDays(days) {
  const d = Math.max(0, Math.round(days));
  const years = Math.floor(d / 365.2425);
  const remDays = Math.round(d - years * 365.2425);
  if (years > 0) {
    return `${years} ${plural(years, 'рік','роки','років')} ${remDays} ${plural(remDays,'день','дні','днів')}`;
  }
  return `${d} ${plural(d,'день','дні','днів')}`;
}

// Прості українські множини; для інших мов можна розширити за потреби.
function plural(n, one, few, many) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

// Виконуємо SPARQL запит до Wikidata.
// Беремо всіх осіб, які мали позицію (P39 = wd:<POSITION>), з датами початку (P580) та кінця (P582).
async function fetchHolders(positionQid, lang) {
  const endpoint = 'https://query.wikidata.org/sparql';
  const query = `
SELECT ?person ?personLabel ?start ?end WHERE {
  ?person p:P39 ?statement .
  ?statement ps:P39 wd:${positionQid} .
  ?statement pq:P580 ?start .
  OPTIONAL { ?statement pq:P582 ?end . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
}
`;
  const url = endpoint + '?format=json&query=' + encodeURIComponent(query);
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/sparql-results+json'
    }
  });
  if (!res.ok) throw new Error('Wikidata error ' + res.status);
  const data = await res.json();
  return data.results.bindings.map(b => ({
    id: b.person.value, // full URI
    label: b.personLabel?.value || '',
    start: b.start?.value,
    end: b.end?.value || null
  }));
}

// Групуємо по персоні, сумуємо тривалість (у днях) за всі каденції.
function aggregateByPerson(rows) {
  const now = new Date();
  const map = new Map();
  for (const r of rows) {
    const key = r.id;
    const start = new Date(r.start);
    const end = r.end ? new Date(r.end) : now;
    const days = (end - start) / (1000*60*60*24);
    const cur = map.get(key) || { id: key, name: r.label, days: 0, stints: [] };
    cur.days += days;
    cur.stints.push({ start: r.start, end: r.end });
    // беремо найкоротше ім’я з наявних (іноді приходять варіанти з дужками)
    if (r.label && (!cur.name || r.label.length < cur.name.length)) cur.name = r.label;
    map.set(key, cur);
  }
  return Array.from(map.values());
}

// Рендеримо таблицю країни.
function renderCountryTable(container, country, people, lang) {
  // сортуємо від найменшого до найбільшого
  people.sort((a,b)=> a.days - b.days);

  const section = document.createElement('section');
  section.className = 'tenure-country';

  const h2 = document.createElement('h2');
  h2.textContent = (lang === 'uk' ? country.nameUk : country.nameEn);
  section.appendChild(h2);

  const src = document.createElement('div');
  src.className = 'tenure-source';
  src.innerHTML = `Джерело: <a href="https://www.wikidata.org/wiki/${country.wd}" target="_blank" rel="noopener">Wikidata</a>`;
  section.appendChild(src);

  const table = document.createElement('table');
  table.className = 'tenure-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:3ch;">#</th>
        <th>Ім’я</th>
        <th>Загальна тривалість</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  people.forEach((p, i) => {
    const tr = document.createElement('tr');
    const days = p.days;
    tr.innerHTML = `
      <td>${i+1}</td>
      <td><a href="${p.id}" target="_blank" rel="noopener">${escapeHtml(p.name)}</a></td>
      <td data-days="${days.toFixed(2)}">${humanizeDays(days)}</td>
    `;
    // Tooltip зі строками каденцій
    tr.title = p.stints.map(s => {
      const end = s.end ? new Date(s.end).toISOString().slice(0,10) : '…';
      return `${new Date(s.start).toISOString().slice(0,10)} — ${end}`;
    }).join(' | ');
    tbody.appendChild(tr);
  });

  section.appendChild(table);
  container.appendChild(section);
}

function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

async function buildAll() {
  const holder = document.getElementById('tenure-tables');
  if (!holder) return;
  const lang = getUiLang();

  // Інфо-блок (коротко що це і як ранжується)
  const info = document.createElement('p');
  info.className = 'tenure-note';
  info.textContent = 'Список лідерів за сумарною тривалістю перебування на посаді (від найкоротшої до найдовшої). Дані автоматично підтягуються з відкритого джерела Wikidata.';
  holder.appendChild(info);

  for (const country of POSITIONS) {
    try {
      const raw = await fetchHolders(country.wd, lang);
      const people = aggregateByPerson(raw);
      renderCountryTable(holder, country, people, lang);
    } catch (e) {
      const s = document.createElement('section');
      s.className = 'tenure-country';
      s.innerHTML = `<h2>${lang==='uk'?country.nameUk:country.nameEn}</h2>
      <p style="color:#b00">Не вдалося завантажити дані (${e.message}).</p>`;
      holder.appendChild(s);
    }
  }
}

document.addEventListener('DOMContentLoaded', buildAll);
</script>
