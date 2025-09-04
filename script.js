/* ========== Presidents module (safe append) ========== */
(function() {
  const VIEW_ALL_BTN_ID = "view-all-presidents";
  const HOME_TBODY_ID = "presidents-data";
  const PAGE_TBODY_ID = "presidents-table-body";
  const TABS_WRAP_SELECTOR = "#country-tabs > div";

  const state = {
    data: null,
    sortAsc: true,         // shortest -> longest за замовчуванням
    activeCountry: "ALL"   // "ALL" або назва країни
  };

  function daysBetween(start, end) {
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    const ms = Math.max(0, e - s);
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  function formatDate(d) {
    if (!d) return "—";
    try { return new Date(d).toISOString().slice(0,10); } catch { return d; }
  }

  function humanizeDays(days) {
    // груба оцінка у роки/місяці/дні
    const y = Math.floor(days / 365);
    const m = Math.floor((days % 365) / 30);
    const d = days % 30;
    const parts = [];
    if (y) parts.push(`${y}y`);
    if (m) parts.push(`${m}m`);
    if (!y && !m) parts.push(`${d}d`);
    return `${days}d (${parts.join(" ")})`;
  }

  function normalizeEntries(raw) {
    return (raw.entries || []).map(it => ({
      country: it.country,
      name: it.name,
      start: it.start,
      end: it.end,
      days: daysBetween(it.start, it.end)
    }));
  }

  function sortByDays(arr, asc = true) {
    return arr.slice().sort((a, b) => asc ? a.days - b.days : b.days - a.days);
  }

  function renderHomePreview(entries) {
    const tbody = document.getElementById(HOME_TBODY_ID);
    if (!tbody) return;
    tbody.innerHTML = "";
    // Топ-5 найкоротших (в межах усіх країн)
    sortByDays(entries, true).slice(0, 5).forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.country}</td>
        <td>${row.name}</td>
        <td>${humanizeDays(row.days)}</td>
      `;
      tbody.appendChild(tr);
    });

    // локалізуємо кнопку "View all" якщо є i18n
    const langSelect = document.getElementById("language-select");
    const btn = document.getElementById(VIEW_ALL_BTN_ID);
    const t = (window.translations || {});
    if (btn && t) {
      const lang = (langSelect && langSelect.value) || "en";
      btn.textContent = (t[lang]?.["view-all"]) || (t.en?.["view-all"]) || "View all";
    }
  }

  function renderTabs(countries) {
    const wrap = document.querySelector(TABS_WRAP_SELECTOR);
    if (!wrap) return;
    wrap.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.className = "secondary-btn";
    allBtn.textContent = "All";
    allBtn.addEventListener("click", () => {
      state.activeCountry = "ALL";
      mountPresidentsPage();
    });
    wrap.appendChild(allBtn);

    countries.forEach(c => {
      const btn = document.createElement("button");
      btn.className = "secondary-btn";
      btn.textContent = c;
      btn.addEventListener("click", () => {
        state.activeCountry = c;
        mountPresidentsPage();
      });
      wrap.appendChild(btn);
    });
  }

  function renderPageTable(entries) {
    const tbody = document.getElementById(PAGE_TBODY_ID);
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = state.activeCountry === "ALL"
      ? entries
      : entries.filter(e => e.country === state.activeCountry);

    const sorted = sortByDays(filtered, state.sortAsc);

    // Підпис активної країни
    const label = document.getElementById("active-country-label");
    if (label) {
      label.textContent = state.activeCountry === "ALL" ? "All Countries" : state.activeCountry;
    }

    sorted.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.country}</td>
        <td>${row.name}</td>
        <td>${formatDate(row.start)}</td>
        <td>${formatDate(row.end)}</td>
        <td>${humanizeDays(row.days)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function loadData() {
    if (state.data) return state.data;
    const res = await fetch("data/presidents.json", { cache: "no-store" });
    const json = await res.json();
    state.data = {
      countries: json.countries || [],
      entries: normalizeEntries(json)
    };
    return state.data;
  }

  async function mountHome() {
    const el = document.getElementById(HOME_TBODY_ID);
    if (!el) return; // не на головній
    try {
      const data = await loadData();
      renderHomePreview(data.entries);
    } catch (e) {
      console.error("Presidents (home) load error:", e);
      el.innerHTML = `<tr><td colspan="3" class="muted">Failed to load data.</td></tr>`;
    }
  }

  async function mountPresidentsPage() {
    const el = document.getElementById(PAGE_TBODY_ID);
    if (!el) return; // не на сторінці presidents.html
    try {
      const data = await loadData();
      // відмальовуємо вкладки (раз)
      if (!document.querySelector(TABS_WRAP_SELECTOR).children.length) {
        renderTabs(data.countries);
      }
      renderPageTable(data.entries);
    } catch (e) {
      console.error("Presidents (page) load error:", e);
      el.innerHTML = `<tr><td colspan="5" class="muted">Failed to load data.</td></tr>`;
    }
  }

  // Кнопка сортування на сторінці presidents.html
  (function bindSortToggle() {
    const btn = document.getElementById("sort-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      state.sortAsc = !state.sortAsc;
      btn.textContent = state.sortAsc
        ? "Sort: shortest → longest"
        : "Sort: longest → shortest";
      mountPresidentsPage();
    });
  })();

  // Реакція на зміну мови (перемальовує лише те, що залежить від перекладів)
  (function bindLangRepaint() {
    const langSelect = document.getElementById("language-select");
    if (!langSelect) return;
    langSelect.addEventListener("change", () => {
      // тільки підлаштуємо кнопку на головній; таблиця не залежить від i18n (імена/дати)
      const btn = document.getElementById(VIEW_ALL_BTN_ID);
      const t = (window.translations || {});
      const lang = langSelect.value;
      if (btn && t) {
        btn.textContent = (t[lang]?.["view-all"]) || (t.en?.["view-all"]) || "View all";
      }
    });
  })();

  // Монтування
  mountHome();
  mountPresidentsPage();
})();
