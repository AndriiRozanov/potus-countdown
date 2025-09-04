// ====== Переклади заголовку ======
const translations = {
  en: "How much time does Donald Trump have left as president?",
  uk: "Скільки Дональду Трампу залишилось часу на посту президента?",
  es: "¿Cuánto tiempo le queda a Donald Trump como presidente?",
  fr: "Combien de temps reste-t-il à Donald Trump en tant que président ?",
  de: "Wie viel Zeit bleibt Donald Trump noch als Präsident?",
  it: "Quanto tempo resta a Donald Trump come presidente?",
  zh: "唐纳德·特朗普还剩多少总统任期？",
  ja: "ドナルド・トランプが大統領として残された時間は？"
};

// ====== Перемикач теми ======
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// ====== Перемикач мов ======
const langSelect = document.getElementById("language-select");
const siteTitle = document.getElementById("site-title");

langSelect.addEventListener("change", (e) => {
  const lang = e.target.value;
  siteTitle.textContent = translations[lang] || translations.en;
});

// ====== Таймер ======
function updateCountdown() {
  const endDate = new Date("2029-01-20T12:00:00Z"); // дата кінця каденції Трампа
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
