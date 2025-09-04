// lang-router.js — надійне перемикання мов через URL-префікс
(function () {
  const LANGS = ["en","uk","es","fr","de","it","zh","ja"];

  function normalizeLang(v){
    v = String(v || "").toLowerCase();
    if (v === "ua") return "uk";
    if (v === "us" || v === "en-us") return "en";
    return LANGS.includes(v) ? v : "en";
  }

  function detectFromPathname(pathname){
    const p = (pathname || "/").replace(/\/+$/, "") || "/";
    const parts = p.split("/").filter(Boolean);
    let lang = "en";
    if (parts.length && LANGS.includes(parts[0]) && parts[0] !== "en") lang = parts[0];
    const basePath = (lang !== "en") ? (("/" + parts.slice(1).join("/")) || "/") : p;
    return { lang, basePath };
  }

  function buildUrl(lang, basePath){
    if (lang === "en") return basePath;
    return basePath === "/" ? `/${lang}/` : `/${lang}${basePath}`;
  }

  function bind(){
    const sel = document.getElementById("language-select");
    if (!sel) return;

    const { lang, basePath } = detectFromPathname(location.pathname);
    sel.value = lang;

    // прибираємо можливі старі обробники
    const clone = sel.cloneNode(true);
    sel.parentNode.replaceChild(clone, sel);

    clone.addEventListener("change", function(e){
      const targetLang = normalizeLang(e.target.value);
      const url = buildUrl(targetLang, detectFromPathname(location.pathname).basePath);
      if (location.pathname !== url) location.assign(url);
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }

  // діагностика за бажанням
  window.__LANG_DEBUG = function(){
    const d = detectFromPathname(location.pathname);
    console.log("lang-router:", d, "select.value=", document.getElementById("language-select")?.value);
  };
})();
