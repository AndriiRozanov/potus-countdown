// lang-router.js — надійне перемикання мов через URL-префікс
(function () {
  const LANGS = ["en","uk","es","fr","de","it","zh","ja"];

  // нормалізація частої плутанини
  function normalizeLang(v){
    v = String(v || "").toLowerCase();
    if (v === "ua") return "uk";           // правильно "uk"
    if (v === "us" || v === "en-us") return "en";
    return LANGS.includes(v) ? v : "en";
  }

  // повертає { lang, basePath } де basePath — шлях без мовного префікса
  function detectFromPathname(pathname){
    const p = (pathname || "/").replace(/\/+$/, "") || "/";
    const parts = p.split("/").filter(Boolean);
    let lang = "en";
    if (parts.length && LANGS.includes(parts[0]) && parts[0] !== "en") lang = parts[0];
    const basePath = (lang !== "en") ? (("/" + parts.slice(1).join("/")) || "/") : p;
    return { lang, basePath };
  }

  function buildUrl(lang, basePath){
    if (lang === "en") return basePath;                  // англ. — без префікса
    return basePath === "/" ? `/${lang}/` : `/${lang}${basePath}`;
  }

  function bind(){
    const sel = document.getElementById("language-select");
    if (!sel) return;

    // Ставимо значення селекта згідно з URL
    const { lang, basePath } = detectFromPathname(location.pathname);
    sel.value = lang;

    // Прибираємо усі можливі старі обробники (клон-заміна)
    const clone = sel.cloneNode(true);
    sel.parentNode.replaceChild(clone, sel);

    // Новий надійний обробник
    clone.addEventListener("change", function(e){
      const targetLang = normalizeLang(e.target.value);
      const url = buildUrl(targetLang, detectFromPathname(location.pathname).basePath);
      if (location.pathname !== url) {
        // Навігація тільки якщо справді інший шлях
        location.assign(url);
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }

  // діагностика в консоль за запитом
  window.__LANG_DEBUG = function(){
    const d = detectFromPathname(location.pathname);
    console.log("lang-router:", d, "select.value=", document.getElementById("language-select")?.value);
  };
})();
