// ====== Переклади ======
const translations = {
  en: {
    title: "How much time does Donald Trump have left as president?",
    timer: "Time left in office",
    embed: "Get Embed Code",
    "trump-today": "Main about Trump today",
    digest: "News Digest",
    presidents: "Presidents by Time in Office",
    country: "Country",
    president: "President",
    time: "Time in office",
    about: "About Us",
    privacy: "Privacy Policy",
    contact: "Contact"
  },
  uk: {
    title: "Скільки Дональду Трампу залишилось часу на посту президента?",
    timer: "Залишилось часу на посаді",
    embed: "Отримати код для вставки",
    "trump-today": "Головне про Трампа сьогодні",
    digest: "Дайджест новин",
    presidents: "Президенти за тривалістю правління",
    country: "Країна",
    president: "Президент",
    time: "Час на посаді",
    about: "Про нас",
    privacy: "Політика конфіденційності",
    contact: "Контакти"
  },
  es: {
    title: "¿Cuánto tiempo le queda a Donald Trump como presidente?",
    timer: "Tiempo restante en el cargo",
    embed: "Obtener código de inserción",
    "trump-today": "Lo principal sobre Trump hoy",
    digest: "Resumen de noticias",
    presidents: "Presidentes por tiempo en el cargo",
    country: "País",
    president: "Presidente",
    time: "Tiempo en el cargo",
    about: "Sobre nosotros",
    privacy: "Política de privacidad",
    contact: "Contacto"
  },
  fr: {
    title: "Combien de temps reste-t-il à Donald Trump en tant que président ?",
    timer: "Temps restant au pouvoir",
    embed: "Obtenir le code d'intégration",
    "trump-today": "L'essentiel sur Trump aujourd'hui",
    digest: "Digest des actualités",
    presidents: "Présidents par durée de mandat",
    country: "Pays",
    president: "Président",
    time: "Durée du mandat",
    about: "À propos",
    privacy: "Politique de confidentialité",
    contact: "Contact"
  },
  de: {
    title: "Wie viel Zeit bleibt Donald Trump noch als Präsident?",
    timer: "Verbleibende Amtszeit",
    embed: "Embed-Code erhalten",
    "trump-today": "Das Wichtigste über Trump heute",
    digest: "Nachrichtenüberblick",
    presidents: "Präsidenten nach Amtszeit",
    country: "Land",
    president: "Präsident",
    time: "Amtszeit",
    about: "Über uns",
    privacy: "Datenschutzrichtlinie",
    contact: "Kontakt"
  },
  it: {
    title: "Quanto tempo resta a Donald Trump come presidente?",
    timer: "Tempo rimanente in carica",
    embed: "Ottieni codice di incorporamento",
    "trump-today": "Principale su Trump oggi",
    digest: "Riepilogo notizie",
    presidents: "Presidenti per tempo in carica",
    country: "Paese",
    president: "Presidente",
    time: "Tempo in carica",
    about: "Chi siamo",
    privacy: "Informativa sulla privacy",
    contact: "Contatti"
  },
  zh: {
    title: "唐纳德·特朗普还剩多少总统任期？",
    timer: "剩余任期",
    embed: "获取嵌入代码",
    "trump-today": "今日特朗普要闻",
    digest: "新闻摘要",
    presidents: "按任期排序的总统",
    country: "国家",
    president: "总统",
    time: "任期",
    about: "关于我们",
    privacy: "隐私政策",
    contact: "联系方式"
  },
  ja: {
    title: "ドナルド・トランプが大統領として残された時間は？",
    timer: "残りの任期",
    embed: "埋め込みコードを取得",
    "trump-today": "今日のトランプの主なニュース",
    digest: "ニュースダイジェスト",
    presidents: "在任期間別の大統領",
    country: "国",
    president: "大統領",
    time: "在任期間",
    about: "私たちについて",
    privacy: "プライバシーポリシー",
    contact: "連絡先"
  }
};

// ====== Функція зміни мови ======
function setLanguage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translations[lang][key] || translations["en"][key];
  });
}

// ====== Перемикач теми ======
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// ====== Перемикач мов ======
const langSelect = document.getElementById("language-select");
langSelect.addEventListener("change", (e) => {
  setLanguage(e.target.value);
});

// За замовчуванням англійська
setLanguage("en");

// ====== Таймер ======
function updateCountdown() {
  const endDate = new Date("2029-01-20T12:00:00Z");
  const now = new Date();
  const diff = endDate - now;

  if (diff <= 0) {
    document.getElementById("countdown").textContent = "Term ended";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("countdown").textContent =
    `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();
