// seo.js v3 — локалізовані URL-и, canonical/hreflang, JSON-LD, надійний перемикач мов
(function () {
  const SITE = {
    name: "Presidency Clock",
    base: "https://presidencyclock.com",
    logo: "https://presidencyclock.com/og-image.jpg",
    langs: ["en","uk","es","fr","de","it","zh","ja"]
  };

  // ---------- helpers ----------
  const addHead = (el) => document.head.appendChild(el);
  const injectJSONLD = (obj) => { const s=document.createElement("script"); s.type="application/ld+json"; s.text=JSON.stringify(obj); addHead(s); };
  const ensureRobots = () => { if (!document.querySelector('meta[name="robots"]')) { const m=document.createElement("meta"); m.name="robots"; m.content="index,follow,max-image-preview:large"; addHead(m); } };
  const ensureCanonical = (url) => { let l=document.querySelector('link[rel="canonical"]'); if(!l){ l=document.createElement("link"); l.rel="canonical"; addHead(l);} l.href=url; };

  // поточний шлях і мовний префікс
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const parts = path.split("/").filter(Boolean); // ["uk","digest.html"] або []
  let langFromPath = "en";
  if (parts.length && SITE.langs.includes(parts[0]) && parts[0] !== "en") langFromPath = parts[0];

  // базовий шлях сторінки без мовного префікса
  const basePagePath = (langFromPath !== "en")
    ? (("/" + parts.slice(1).join("/")) || "/")
    : path;

  // нормалізація можливих значень із селекта
  function normalizeLang(v){
    v = String(v || "").toLowerCase();
    if (v === "ua") return "uk";            // часта помилка
    if (v === "us" || v === "en-us") return "en";
    return SITE.langs.includes(v) ? v : "en";
  }

  function urlForLang(lang, pth){
    if (lang === "en") return SITE.base + (pth === "/" ? "/" : pth);
    return SITE.base + (pth === "/" ? `/${lang}/` : `/${lang}${pth}`);
  }

  // <html lang> + збереження
  document.documentElement.setAttribute("lang", langFromPath);
  try { localStorage.setItem("lang", langFromPath); } catch {}

  // canonical + robots + hreflang
  ensureRobots();
  const canonical = urlForLang(langFromPath, basePagePath);
  ensureCanonical(canonical);

  (function injectHreflang(){
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(n=>n.remove());
    const xd=document.createElement("link"); xd.rel="alternate"; xd.hreflang="x-default"; xd.href=urlForLang("en", basePagePath); addHead(xd);
    SITE.langs.forEach(l=>{ const a=document.createElement("link"); a.rel="alternate"; a.hreflang=l; a.href=urlForLang(l, basePagePath); addHead(a); });
  })();

  // -------- JSON-LD (Organization/WebSite/WebPage + спеціальні типи) --------
  (function injectGlobal(){
    injectJSONLD({"@context":"https://schema.org","@type":"Organization","@id":SITE.base+"#org","name":SITE.name,"url":SITE.base,"logo":{"@type":"ImageObject","url":SITE.logo}});
    injectJSONLD({"@context":"https://schema.org","@type":"WebSite","@id":SITE.base+"#website","name":SITE.name,"url":SITE.base,"publisher":{"@id":SITE.base+"#org"},"inLanguage":langFromPath});
  })();

  function breadcrumbs(items){
    injectJSONLD({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":items.map((it,i)=>({"@type":"ListItem","position":i+1,"name":it.name,"item":it.url}))});
  }
  function webPage(name, description, url){
    injectJSONLD({"@context":"https://schema.org","@type":"WebPage","name":name,"description":description,"url":url,"isPartOf":{"@id":SITE.base+"#website"},"inLanguage":langFromPath});
  }

  if (basePagePath === "/") {
    webPage("Presidency Clock — Trump Countdown","How much time does Donald Trump have left as president? Live countdown with news digest and presidential data.", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")}]);
  } else if (basePagePath === "/trump-today.html") {
    webPage("Main about Trump today — Presidency Clock","AI-picked top Trump story of the day with short summary and archive.", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")},{name:"Trump today", url:canonical}]);
    fetch("/data/trump-today.json",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      const it=d?.latest||{}; const pub=it.date?new Date(it.date).toISOString():(d?.updatedAt||new Date().toISOString());
      injectJSONLD({"@context":"https://schema.org","@type":"NewsArticle","mainEntityOfPage":canonical,"headline":(it.title||"Top Trump story").slice(0,110),"description":it.summary||"","datePublished":pub,"dateModified":d?.updatedAt||pub,"isAccessibleForFree":"true","url":canonical,"image":SITE.logo,"author":{"@type":"Organization","name":SITE.name},"publisher":{"@id":SITE.base+"#org"},"citation":it.url||undefined,"inLanguage":langFromPath});
    }).catch(()=>{});
  } else if (basePagePath === "/digest.html") {
    webPage("News Digest — Presidency Clock","AI-updated digest with 4–5 sentence summaries and sources.", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")},{name:"Digest", url:canonical}]);
    fetch("/data/digest.json",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      const items=(d?.items||[]).slice(0,10).map((it,i)=>({"@type":"ListItem","position":i+1,"name":it.title,"url":it.url}));
      injectJSONLD({"@context":"https://schema.org","@type":"ItemList","name":"News Digest","itemListOrder":"http://schema.org/ItemListOrderAscending","itemListElement":items,"inLanguage":langFromPath});
    }).catch(()=>{});
  } else if (basePagePath === "/presidents.html") {
    webPage("Presidents by Time in Office — Presidency Clock","Explore presidents by time in office with country tabs and sorting.", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")},{name:"Presidents", url:canonical}]);
    injectJSONLD({"@context":"https://schema.org","@type":"Dataset","name":"Presidents by Time in Office","description":"Evergreen dataset of leaders with computed time in office.","url":canonical,"creator":{"@id":SITE.base+"#org"},"license":"https://creativecommons.org/licenses/by/4.0/","distribution":[{"@type":"DataDownload","contentUrl":SITE.base+"/data/presidents.json","encodingFormat":"application/json"}],"inLanguage":langFromPath});
  } else if (basePagePath === "/about.html") {
    webPage("About — Presidency Clock","Independent project with live presidency countdowns and AI digests.", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")},{name:"About", url:canonical}]);
  } else if (basePagePath === "/privacy.html") {
    webPage("Privacy Policy — Presidency Clock","How we use cookies, analytics and ads.", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")},{name:"Privacy", url:canonical}]);
  } else if (basePagePath === "/contact.html") {
    webPage("Contact — Presidency Clock","Reach us at presidencyclock@gmail.com", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")},{name:"Contact", url:canonical}]);
  }

  // -------- надійний перемикач мов --------
  function attachLangHandler(){
    const sel = document.getElementById("language-select");
    if (!sel) return;
    // вирівнюємо значення селекта під поточну мову
    try { sel.value = langFromPath; } catch {}
    // знімаємо можливі старі слухачі
    sel.onchange = null;
    sel.addEventListener("change", (e)=>{
      const l = normalizeLang(e.target.value);
      try { localStorage.setItem("lang", l); } catch {}
      const target = urlForLang(l, basePagePath);
      if (location.href !== target) location.href = target;
    }, { capture:false, passive:true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachLangHandler);
  } else {
    attachLangHandler();
  }
})();
