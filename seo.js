// seo.js — JSON-LD, canonical, hreflang, breadcrumbs для presidencyclock.com
(function () {
  const SITE = {
    name: "Presidency Clock",
    base: "https://presidencyclock.com",
    logo: "https://presidencyclock.com/og-image.jpg",
    langs: ["en","uk","es","fr","de","it","zh","ja"]
  };

  // ------------- helpers -------------
  function addHead(el){ document.head.appendChild(el); }
  function injectJSONLD(obj){ const s=document.createElement("script"); s.type="application/ld+json"; s.text=JSON.stringify(obj); addHead(s); }
  function ensureRobots(){
    if (!document.querySelector('meta[name="robots"]')) {
      const m=document.createElement("meta"); m.name="robots"; m.content="index,follow,max-image-preview:large"; addHead(m);
    }
  }
  function ensureCanonical(url){
    if (!document.querySelector('link[rel="canonical"]')) {
      const l=document.createElement("link"); l.rel="canonical"; l.href=url; addHead(l);
    }
  }
  function setHtmlLang(){
    try{
      const stored = localStorage.getItem("lang");
      const browser = (navigator.language||"en").slice(0,2);
      const lang = SITE.langs.includes(stored||"") ? stored : (SITE.langs.includes(browser)?browser:"en");
      document.documentElement.setAttribute("lang", lang);
    }catch{/* ignore */}
  }
  function currentPath(){
    const p = location.pathname.replace(/\/+$/, "");
    return p === "" ? "/" : p;
  }
  function canonicalUrlForPath(p){
    // канонікал без query (x-default англомовна версія)
    if (p === "/") return SITE.base + "/";
    return SITE.base + p;
  }
  function injectHreflang(p){
    const base = canonicalUrlForPath(p);
    // x-default (без параметрів)
    const xd = document.createElement("link"); xd.rel="alternate"; xd.hreflang="x-default"; xd.href=base; addHead(xd);
    // мовні варіанти як параметр (щоб не плодити дублікати шляхів)
    SITE.langs.forEach(l=>{
      const a=document.createElement("link");
      a.rel="alternate"; a.hreflang=l; a.href=base + (base.includes("?")?"&":"?") + "lang=" + l;
      addHead(a);
    });
  }
  function breadcrumbs(items){
    injectJSONLD({
      "@context":"https://schema.org",
      "@type":"BreadcrumbList",
      "itemListElement": items.map((it, i)=>({
        "@type":"ListItem",
        "position": i+1,
        "name": it.name,
        "item": it.url
      }))
    });
  }
  function globalJsonLd(){
    ensureRobots(); setHtmlLang();
    injectJSONLD({
      "@context":"https://schema.org",
      "@type":"Organization",
      "@id": SITE.base + "#org",
      "name": SITE.name,
      "url": SITE.base,
      "logo": {"@type":"ImageObject","url": SITE.logo}
    });
    injectJSONLD({
      "@context":"https://schema.org",
      "@type":"WebSite",
      "@id": SITE.base + "#website",
      "name": SITE.name,
      "url": SITE.base,
      "publisher": {"@id": SITE.base + "#org"},
      "inLanguage": "en"
    });
  }
  function webPage(name, description, url){
    injectJSONLD({
      "@context":"https://schema.org",
      "@type":"WebPage",
      "name": name,
      "description": description,
      "url": url,
      "isPartOf": {"@id": SITE.base + "#website"}
    });
  }

  // ------------- per page -------------
  const path = currentPath();
  const canon = canonicalUrlForPath(path);
  globalJsonLd();
  ensureCanonical(canon);
  injectHreflang(path);

  if (path === "/") {
    webPage(
      "Presidency Clock — Trump Countdown",
      "How much time does Donald Trump have left as president? Live countdown with news digest and presidential data.",
      canon
    );
    breadcrumbs([{name:"Home", url:SITE.base+"/"}]);
  }
  else if (path === "/trump-today.html") {
    webPage(
      "Main about Trump today — Presidency Clock",
      "AI-picked top Trump story of the day with short summary and archive.",
      canon
    );
    breadcrumbs([
      {name:"Home", url:SITE.base+"/"},
      {name:"Trump today", url: canon}
    ]);

    fetch("data/trump-today.json",{cache:"no-store"}).then(r=>r.json()).then(data=>{
      const item = data?.latest || {};
      const published = item.date ? new Date(item.date).toISOString() : (data?.updatedAt || new Date().toISOString());
      injectJSONLD({
        "@context":"https://schema.org",
        "@type":"NewsArticle",
        "mainEntityOfPage": canon,
        "headline": (item.title || "Top Trump story").slice(0,110),
        "description": item.summary || "",
        "datePublished": published,
        "dateModified": data?.updatedAt || published,
        "isAccessibleForFree": "true",
        "url": canon,
        "image": SITE.logo,
        "author": {"@type":"Organization","name": SITE.name},
        "publisher": {"@id": SITE.base + "#org"},
        "citation": item.url || undefined
      });
    }).catch(()=>{});
  }
  else if (path === "/digest.html") {
    webPage(
      "News Digest — Presidency Clock",
      "AI-updated digest with 4–5 sentence summaries and sources.",
      canon
    );
    breadcrumbs([{name:"Home", url:SITE.base+"/"},{name:"Digest", url:canon}]);

    fetch("data/digest.json",{cache:"no-store"}).then(r=>r.json()).then(data=>{
      const items=(data?.items||[]).slice(0,10).map((it,i)=>({"@type":"ListItem","position":i+1,"name":it.title,"url":it.url}));
      injectJSONLD({"@context":"https://schema.org","@type":"ItemList","name":"News Digest","itemListOrder":"http://schema.org/ItemListOrderAscending","itemListElement":items});
    }).catch(()=>{});
  }
  else if (path === "/presidents.html") {
    webPage(
      "Presidents by Time in Office — Presidency Clock",
      "Explore presidents by time in office with country tabs and sorting.",
      canon
    );
    breadcrumbs([{name:"Home", url:SITE.base+"/"},{name:"Presidents", url:canon}]);

    injectJSONLD({
      "@context":"https://schema.org",
      "@type":"Dataset",
      "name":"Presidents by Time in Office",
      "description":"Evergreen dataset of leaders with computed time in office.",
      "url": canon,
      "creator":{"@id": SITE.base + "#org"},
      "license":"https://creativecommons.org/licenses/by/4.0/",
      "distribution":[{"@type":"DataDownload","contentUrl": SITE.base + "/data/presidents.json","encodingFormat":"application/json"}]
    });
  }
  else if (path === "/about.html") {
    webPage("About — Presidency Clock","Independent project with live presidency countdowns and AI digests.", canon);
    breadcrumbs([{name:"Home", url:SITE.base+"/"},{name:"About", url:canon}]);
  }
  else if (path === "/privacy.html") {
    webPage("Privacy Policy — Presidency Clock","How we use cookies, analytics and ads.", canon);
    breadcrumbs([{name:"Home", url:SITE.base+"/"},{name:"Privacy", url:canon}]);
  }
  else if (path === "/contact.html") {
    webPage("Contact — Presidency Clock","Reach us at presidencyclock@gmail.com", canon);
    breadcrumbs([{name:"Home", url:SITE.base+"/"},{name:"Contact", url:canon}]);
  }
})();
