// seo.js — локалізовані URL-и з префіксами, canonical, hreflang, JSON-LD, breadcrumbs
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
  const ensureRobots = () => {
    if (!document.querySelector('meta[name="robots"]')) {
      const m=document.createElement("meta"); m.name="robots"; m.content="index,follow,max-image-preview:large"; addHead(m);
    }
  };
  const ensureCanonical = (url) => {
    let l = document.querySelector('link[rel="canonical"]');
    if (!l) { l = document.createElement("link"); l.rel = "canonical"; addHead(l); }
    l.href = url;
  };

  const path = location.pathname.replace(/\/+$/, "") || "/";
  const pathParts = path.split("/").filter(Boolean); // ["uk","trump-today.html"] or []

  // Detect language from prefix
  let langFromPath = "en";
  if (pathParts.length && SITE.langs.includes(pathParts[0]) && pathParts[0] !== "en") {
    langFromPath = pathParts[0];
  }

  // Base (language-agnostic) page path ("/", "/trump-today.html", etc.)
  const basePagePath = (() => {
    if (langFromPath !== "en") {
      const rest = "/" + pathParts.slice(1).join("/");
      return rest === "/" ? "/" : rest;
    }
    return path;
  })();

  // Build localized absolute URL for a given lang + base page path
  function urlForLang(lang, basePath) {
    if (lang === "en") return SITE.base + (basePath === "/" ? "/" : basePath);
    return SITE.base + (basePath === "/" ? `/${lang}/` : `/${lang}${basePath}`);
  }

  // set <html lang> and persist
  (function setHtmlLang(){
    document.documentElement.setAttribute("lang", langFromPath);
    try { localStorage.setItem("lang", langFromPath); } catch {}
  })();

  // canonical = current lang URL
  const canonical = urlForLang(langFromPath, basePagePath);
  ensureRobots();
  ensureCanonical(canonical);

  // hreflang alternates for all languages
  (function injectHreflang(){
    // clean previous alternates if any
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(n => n.remove());
    // x-default (англомовна версія без префікса)
    const xd = document.createElement("link"); xd.rel="alternate"; xd.hreflang="x-default"; xd.href=urlForLang("en", basePagePath); addHead(xd);
    SITE.langs.forEach(l=>{
      const a=document.createElement("link");
      a.rel="alternate"; a.hreflang=l; a.href=urlForLang(l, basePagePath);
      addHead(a);
    });
  })();

  // Global JSON-LD
  (function injectGlobal(){
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
      "inLanguage": langFromPath
    });
  })();

  // Breadcrumbs helper
  function breadcrumbs(items){
    injectJSONLD({
      "@context":"https://schema.org",
      "@type":"BreadcrumbList",
      "itemListElement": items.map((it,i)=>({
        "@type":"ListItem","position":i+1,"name":it.name,"item":it.url
      }))
    });
  }
  function webPage(name, description, url){
    injectJSONLD({
      "@context":"https://schema.org",
      "@type":"WebPage",
      "name": name,
      "description": description,
      "url": url,
      "isPartOf": {"@id": SITE.base + "#website"},
      "inLanguage": langFromPath
    });
  }

  // Per-page JSON-LD
  if (basePagePath === "/") {
    webPage(
      "Presidency Clock — Trump Countdown",
      "How much time does Donald Trump have left as president? Live countdown with news digest and presidential data.",
      canonical
    );
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")}]);
  } else if (basePagePath === "/trump-today.html") {
    webPage("Main about Trump today — Presidency Clock","AI-picked top Trump story of the day with short summary and archive.", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")},{name:"Trump today", url:canonical}]);
    fetch(urlForLang(langFromPath, "/data/trump-today.json").replace(SITE.base,""),{cache:"no-store"})
      .then(r=>r.json()).then(data=>{
        const item=data?.latest||{};
        const published=item.date?new Date(item.date).toISOString():(data?.updatedAt||new Date().toISOString());
        injectJSONLD({
          "@context":"https://schema.org",
          "@type":"NewsArticle",
          "mainEntityOfPage": canonical,
          "headline": (item.title || "Top Trump story").slice(0,110),
          "description": item.summary || "",
          "datePublished": published,
          "dateModified": data?.updatedAt || published,
          "isAccessibleForFree": "true",
          "url": canonical,
          "image": SITE.logo,
          "author": {"@type":"Organization","name": SITE.name},
          "publisher": {"@id": SITE.base + "#org"},
          "citation": item.url || undefined,
          "inLanguage": langFromPath
        });
      }).catch(()=>{});
  } else if (basePagePath === "/digest.html") {
    webPage("News Digest — Presidency Clock","AI-updated digest with 4–5 sentence summaries and sources.", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")},{name:"Digest", url:canonical}]);
    fetch(urlForLang(langFromPath, "/data/digest.json").replace(SITE.base,""),{cache:"no-store"})
      .then(r=>r.json()).then(data=>{
        const items=(data?.items||[]).slice(0,10).map((it,i)=>({"@type":"ListItem","position":i+1,"name":it.title,"url":it.url}));
        injectJSONLD({"@context":"https://schema.org","@type":"ItemList","name":"News Digest","itemListOrder":"http://schema.org/ItemListOrderAscending","itemListElement":items,"inLanguage":langFromPath});
      }).catch(()=>{});
  } else if (basePagePath === "/presidents.html") {
    webPage("Presidents by Time in Office — Presidency Clock","Explore presidents by time in office with country tabs and sorting.", canonical);
    breadcrumbs([{name:"Home", url:urlForLang(langFromPath,"/")},{name:"Presidents", url:canonical}]);
    injectJSONLD({
      "@context":"https://schema.org",
      "@type":"Dataset",
      "name":"Presidents by Time in Office",
      "description":"Evergreen dataset of leaders with computed time in office.",
      "url": canonical,
      "creator":{"@id": SITE.base + "#org"},
      "license":"https://creativecommons.org/licenses/by/4.0/",
      "distribution":[{"@type":"DataDownload","contentUrl": SITE.base + "/data/presidents.json","encodingFormat":"application/json"}],
      "inLanguage": langFromPath
    });
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

  // Language switch: navigate to localized URL (keeps same page)
  (function hookLangSelect(){
    const sel = document.getElementById("language-select");
    if (!sel) return;
    try { sel.value = langFromPath; } catch {}
    sel.addEventListener("change", (e)=>{
      const l = e.target.value;
      try { localStorage.setItem("lang", l); } catch {}
      const target = urlForLang(l, basePagePath);
      location.href = target;
    });
  })();
})();
