/* ================== I18N ================== */
const translations = {
  en: {
    title: "How much time does Donald Trump have left as president?",
    timer: "Time left in office",
    embed: "Get Embed Code",
    "trump-today": "Main about Trump today",
    "trump-today-title": "Main about Trump today — Presidency Clock",
    digest: "News Digest",
    presidents: "Presidents by Time in Office",
    country: "Country",
    president: "President",
    time: "Time in office",
    about: "About Us",
    privacy: "Privacy Policy",
    contact: "Contact",
    home: "Home",
    "view-all": "View all",
    "read-more": "Read more",
    "archive-note": "Top daily headline picked by AI. Below is the recent archive.",
  },
  uk: {
    title: "Скільки Дональду Трампу залишилось часу на посту президента?",
    timer: "Залишилось часу на посаді",
    embed: "Отримати код для вставки",
    "trump-today": "Головне про Трампа сьогодні",
    "trump-today-title": "Головне про Трампа сьогодні — Presidency Clock",
    digest: "Дайджест новин",
    presidents: "Президенти за тривалістю правління",
    country: "Країна",
    president: "Президент",
    time: "Час на посаді",
    about: "Про нас",
    privacy: "Політика конфіденційності",
    contact: "Контакти",
    home: "Головна",
    "view-all": "Переглянути все",
    "read-more": "Детальніше",
    "archive-note": "Головний заголовок дня, обраний ШІ. Нижче — недавній архів.",
  },
  es: {
    title: "¿Cuánto tiempo le queda a Donald Trump como presidente?",
    timer: "Tiempo restante en el cargo",
    embed: "Obtener código de inserción",
    "trump-today": "Lo principal sobre Trump hoy",
    "trump-today-title": "Lo principal sobre Trump hoy — Presidency Clock",
    digest: "Resumen de noticias",
    presidents: "Presidentes por tiempo en el cargo",
    country: "País",
    president: "Presidente",
    time: "Tiempo en el cargo",
    about: "Sobre nosotros",
    privacy: "Política de privacidad",
    contact: "Contacto",
    home: "Inicio",
    "view-all": "Ver todo",
    "read-more": "Leer más",
    "archive-note": "Titular diario seleccionado por IA. Abajo el archivo reciente.",
  },
  fr: {
    title: "Combien de temps reste-t-il à Donald Trump en tant que président ?",
    timer: "Temps restant au pouvoir",
    embed: "Obtenir le code d'intégration",
    "trump-today": "L'essentiel sur Trump aujourd'hui",
    "trump-today-title": "L'essentiel sur Trump aujourd'hui — Presidency Clock",
    digest: "Digest des actualités",
    presidents: "Présidents par durée de mandat",
    country: "Pays",
    president: "Président",
    time: "Durée du mandat",
    about: "À propos",
    privacy: "Politique de confidentialité",
    contact: "Contact",
    home: "Accueil",
    "view-all": "Tout voir",
    "read-more": "En savoir plus",
    "archive-note": "Gros titre du jour choisi par l'IA. Ci-dessous, les archives récentes.",
  },
  de: {
    title: "Wie viel Zeit bleibt Donald Trump noch als Präsident?",
    timer: "Verbleibende Amtszeit",
    embed: "Embed-Code erhalten",
    "trump-today": "Das Wichtigste über Trump heute",
    "trump-today-title": "Das Wichtigste über Trump heute — Presidency Clock",
    digest: "Nachrichtenüberblick",
    presidents: "Präsidenten nach Amtszeit",
    country: "Land",
    president: "Präsident",
    time: "Amtszeit",
    about: "Über uns",
    privacy: "Datenschutzrichtlinie",
    contact: "Kontakt",
    home: "Startseite",
    "view-all": "Alle ansehen",
    "read-more": "Mehr lesen",
    "archive-note": "Tägliche Schlagzeile von KI ausgewählt. Unten das aktuelle Archiv.",
  },
  it: {
    title: "Quanto tempo resta a Donald Trump come presidente?",
    timer: "Tempo rimanente in carica",
    embed: "Ottieni codice di incorporamento",
    "trump-today": "Principale su Trump oggi",
    "trump-today-title": "Principale su Trump oggi — Presidency Clock",
    digest: "Riepilogo notizie",
    presidents: "Presidenti per tempo in carica",
    country: "Paese",
    president: "Presidente",
    time: "Tempo in carica",
    about: "Chi siamo",
    privacy: "Informativa sulla privacy",
    contact: "Contatti",
    home: "Home",
    "view-all": "Vedi tutto",
    "read-more": "Scopri di più",
    "archive-note": "Titolo del giorno scelto dall'IA. Sotto l'archivio recente.",
  },
  zh: {
    title: "唐纳德·特朗普还剩多少总统任期？",
    timer: "剩余任期",
    embed: "获取嵌入代码",
    "trump-today": "今日特朗普要闻",
    "trump-today-title": "今日特朗普要闻 — Presidency Clock",
    digest: "新闻摘要",
    presidents: "按任期排序的总统",
    country: "国家",
    president: "总统",
    time: "任期",
    about: "关于我们",
    privacy: "隐私政策",
    contact: "联系方式",
    home: "首页",
    "view-all": "查看全部",
    "read-more": "了解更多",
    "archive-note": "由 AI 选出的今日头条。以下为近期归档。",
  },
  ja: {
    title: "ドナルド・トランプが大統領として残された時間は？",
    timer: "残りの任期",
    embed: "埋め込みコードを取得",
    "trump-today": "今日のトランプの主なニュース",
    "trump-today-title": "今日のトランプの主なニュース — Presidency Clock",
    digest: "ニュースダイジェスト",
    presidents: "在任期間別の大統領",
    country: "国",
    president: "大統領",
    time: "在任期間",
    about: "私たちについて",
    privacy: "プライバシーポリシー",
    contact: "連絡先",
    home: "ホーム",
    "view-all": "すべて表示",
    "read-more": "詳しく見る",
    "archive-note": "AI が選んだ本日の見出し。以下は最近のアーカイブです。",
  }
};

function setLanguage(lang) {
  // Elements with data-i18n (innerText)
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations?.[lang]?.[key]) el.textContent = translations[lang][key];
    else if (translations?.en?.[key]) el.textContent = translations.en[key];
  });
  // <title> on secondary pages
  document.querySelectorAll("[data-i18n-head]").forEach((el) => {
    const key = el.getAttribute("data-i18n-head");
    if (translations?.[lang]?.[key]) el.textContent = translations[lang][key];
    else if (translations?.en?.[key]) el.textContent = translations.en[key];
  });
}

/* ================== Theme Toggle ================== */
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
}

/* ================== Language Select ================== */
const langSelect = document.getElementById("language-select");
const userLang =
  (typeof localStorage !== "undefined" && localStorage.getItem("lang")) ||
  (navigator.language || "en").slice(0, 2);
const initialLang = translations[userLang] ? userLang : "en";

if (langSelect) {
  langSelect.value = initialLang;
  langSelect.addEventListener("change", (e) => {
    const lang = e.target.value;
    try { localStorage.setItem("lang", lang); } catch {}
    setLanguage(lang);
    // also update dynamic labels (buttons) if any generated later
    hydrateDynamicLabels(lang);
  });
}

setLanguage(initialLang);

/* ================== Countdown ================== */
function updateCountdown() {
  const endDate = new Date("2029-01-20T12:00:00Z");
  const now = new Date();
  const diff = endDate - now;

  const el = document.getElementById("countdown");
  if (!el) return;

  if (diff <= 0) {
    el.textContent = "Term ended";
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* ================== Embed Modal ================== */
const embedBtn = document.getElementById("embed-button");
const modal = document.getElementById("embed-modal");
const closeModal = document.getElementById("close-modal");
const embedCodeTextarea = document.getElementById("embed-code");
const copyBtn = document.getElementById("copy-button");

if (embedBtn && modal && closeModal && embedCodeTextarea && copyBtn) {
  embedBtn.addEventListener("click", () => {
    const origin = window.location.origin || "";
    const src = origin.endsWith("/") ? origin : origin + "/";
    const embedCode = `<iframe src="${src}" width="420" height="220" style="border:none;overflow:hidden;border-radius:12px" title="Presidency Clock"></iframe>`;
    embedCodeTextarea.value = embedCode;
    modal.style.display = "flex";
  });
  closeModal.addEventListener("click", () => (modal.style.display = "none"));
  copyBtn.addEventListener("click", () => {
    embedCodeTextarea.select();
    document.execCommand("copy");
    const prev = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = prev), 1800);
  });
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

/* ================== Demo Data (placeholder) ==================
   Поки що використовуємо заглушки. Далі підключимо AI + RSS.
   trumpToday: одна головна новина за день + невеликий архів.
   digestItems: 3–5 коротких новин.
*/
const demoData = {
  trumpToday: [
    {
      date: "2025-09-04",
      title: "Sample headline about Trump (demo)",
      summary:
        "Short 2–3 sentence teaser generated by AI. This is a placeholder to show layout on the site and archive page.",
      url: "https://example.com/source",
    },
    {
      date: "2025-09-03",
      title: "Yesterday's top story (demo)",
      summary:
        "Another short description to demonstrate recent archive items. Replace with AI-updated content.",
      url: "https://example.com/source-2",
    }
  ],
  digestItems: [
    {
      title: "Digest item #1 (demo)",
      summary:
        "4–5 sentences summary for the news digest card. Brief context and the most important points to click.",
      url: "https://example.com/digest-1",
    },
    {
      title: "Digest item #2 (demo)",
      summary:
        "Another compact summary to illustrate the digest flow. To be replaced by AI later.",
      url: "https://example.com/digest-2",
    },
    {
      title: "Digest item #3 (demo)",
      summary:
        "Keep it concise and informative. We will automate updates 3x/day with AI.",
      url: "https://example.com/digest-3",
    }
  ]
};

/* ================== Render Helpers ================== */
function createNewsCard(item, { withSummary = true, lang = initialLang } = {}) {
  const wrapper = document.createElement("article");
  wrapper.className = "card";
  const title = document.createElement("h3");
  title.style.marginTop = "0";
  const link = document.createElement("a");
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = item.title;
  title.appendChild(link);
  wrapper.appendChild(title);

  if (withSummary && item.summary) {
    const p = document.createElement("p");
    p.textContent = item.summary;
    wrapper.appendChild(p);
  }

  const actions = document.createElement("div");
  const a = document.createElement("a");
  a.href = item.url;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = translations[lang]["read-more"] || translations.en["read-more"];
  actions.appendChild(a);
  wrapper.appendChild(actions);
  return wrapper;
}

function hydrateDynamicLabels(lang) {
  // Update “View all” buttons if present
  const va1 = document.getElementById("view-all-trump");
  const va2 = document.getElementById("view-all-digest");
  if (va1) va1.textContent = translations[lang]["view-all"] || translations.en["view-all"];
  if (va2) va2.textContent = translations[lang]["view-all"] || translations.en["view-all"];
}

/* ================== Mount on Home ================== */
(function mountHome() {
  const trumpNewsEl = document.getElementById("trump-news");
  const newsDigestEl = document.getElementById("news-container");
  if (!trumpNewsEl && !newsDigestEl) return; // not on home

  const lang = (langSelect && langSelect.value) || initialLang;
  hydrateDynamicLabels(lang);

  // Show only the latest “Main about Trump today”
  if (trumpNewsEl) {
    trumpNewsEl.innerHTML = "";
    const latest = demoData.trumpToday[0];
    trumpNewsEl.appendChild(createNewsCard(latest, { withSummary: true, lang }));
  }

  // Show a short digest (first 3 items)
  if (newsDigestEl) {
    newsDigestEl.innerHTML = "";
    demoData.digestItems.slice(0, 3).forEach(item => {
      newsDigestEl.appendChild(createNewsCard(item, { withSummary: true, lang }));
    });
  }
})();

/* ================== Mount on trump-today.html (archive) ================== */
(function mountTrumpTodayPage() {
  const latestWrap = document.getElementById("trump-today-latest");
  const archiveWrap = document.getElementById("trump-today-archive");
  if (!latestWrap || !archiveWrap) return; // not on trump-today page

  const lang = (langSelect && langSelect.value) || initialLang;

  // Latest card (top)
  latestWrap.innerHTML = "";
  const latest = demoData.trumpToday[0];
  latestWrap.appendChild(createNewsCard(latest, { withSummary: true, lang }));

  // Archive list (excluding latest)
  archiveWrap.innerHTML = "";
  demoData.trumpToday.slice(1).forEach(item => {
    archiveWrap.appendChild(createNewsCard(item, { withSummary: true, lang }));
  });
})();
/* ========= 3.1: Helper createNewsCard (safe define) ========= */
if (typeof window.createNewsCard !== "function") {
  window.createNewsCard = function createNewsCard(item, { withSummary = true, lang = "en" } = {}) {
    const wrapper = document.createElement("article");
    wrapper.className = "card";
    const title = document.createElement("h3");
    title.style.marginTop = "0";

    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = item.title || "(untitled)";
    title.appendChild(link);
    wrapper.appendChild(title);

    if (withSummary && item.summary) {
      const p = document.createElement("p");
      p.textContent = item.summary;
      wrapper.appendChild(p);
    }

    const actions = document.createElement("div");
    const a = document.createElement("a");
    a.href = item.url;
    a.target = "_blank";
    a.rel = "noopener";
    const t = (window.translations?.[lang]?.["read-more"]) || (window.translations?.en?.["read-more"]) || "Read more";
    a.textContent = t;
    actions.appendChild(a);
    wrapper.appendChild(actions);

    return wrapper;
  };
}

/* ========= 3.2: Mount on digest.html (full) ========= */
(async function mountDigestPage() {
  const list = document.getElementById("digest-list");
  if (!list) return; // not on digest page

  // figure out current UI language
  const langSelect = document.getElementById("language-select");
  const lang = (langSelect && langSelect.value) ||
               (typeof localStorage !== "undefined" && localStorage.getItem("lang")) ||
               (navigator.language || "en").slice(0, 2);
  const uiLang = (window.translations && window.translations[lang]) ? lang : "en";

  // Try loading digest data file (no-cache)
  try {
    const res = await fetch("data/digest.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    list.innerHTML = "";
    (data.items || []).forEach(item => {
      list.appendChild(window.createNewsCard(item, { withSummary: true, lang: uiLang }));
    });

    // Add "(updated ...)" suffix with local time
    const note = document.getElementById("digest-note");
    if (note && data.updatedAt) {
      const dt = new Date(data.updatedAt);
      const updatedLabel = ` (updated ${dt.toLocaleString()})`;
      if (!note.textContent.includes("(updated")) {
        note.textContent = note.textContent + updatedLabel;
      } else {
        // replace existing updated timestamp
        note.textContent = note.textContent.replace(/\(updated[^\)]*\)/, updatedLabel);
      }
    }
  } catch (e) {
    console.error("Failed to load digest:", e);
    list.innerHTML = `<p class="muted">Failed to load digest.</p>`;
  }

  // Re-render list on language change so buttons/text update
  if (langSelect) {
    langSelect.addEventListener("change", async () => {
      try {
        const res = await fetch("data/digest.json", { cache: "no-store" });
        const data = await res.json();
        const newLang = langSelect.value;
        const safeLang = (window.translations && window.translations[newLang]) ? newLang : "en";
        list.innerHTML = "";
        (data.items || []).forEach(item => {
          list.appendChild(window.createNewsCard(item, { withSummary: true, lang: safeLang }));
        });
      } catch (err) {
        console.error(err);
      }
    });
  }
})();
