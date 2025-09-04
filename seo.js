// seo.js — інжектить JSON-LD та канонікал/роботс для presidencyclock.com
(function () {
  const SITE = {
    name: "Presidency Clock",
    url: "https://presidencyclock.com",
    logo: "https://presidencyclock.com/og-image.jpg" // заміниш на свій логотип за бажанням
  };

  function add(el) { document.head.appendChild(el); }
  function injectJSONLD(obj) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.text = JSON.stringify(obj);
    add(s);
  }
  function ensureCanonical(url) {
    if (!document.querySelector('link[rel="canonical"]')) {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = url;
      add(l);
    }
  }
  function ensureRobots() {
    if (!document.querySelector('meta[name="robots"]')) {
      const m = document.createElement("meta");
      m.name = "robots";
      m.content = "index,follow,max-image-preview:large";
      add(m);
    }
  }

  // --- Глобальні блоки (Organization + WebSite) ---
  function injectGlobal() {
    ensureRobots();
    injectJSONLD({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": SITE.url + "#org",
      "name": SITE.name,
      "url": SITE.url,
      "logo": { "@type": "ImageObject", "url": SITE.logo }
    });
    injectJSONLD({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": SITE.url + "#website",
      "name": SITE.name,
      "url": SITE.url,
      "publisher": { "@id": SITE.url + "#org" },
      "inLanguage": "en"
    });
  }

  function injectWebPage({name, description, url}) {
    injectJSONLD({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": name,
      "description": description,
      "url": url,
      "isPartOf": { "@id": SITE.url + "#website" }
    });
  }

  const PATH = (location.pathname === "/" ? "/index.html" : location.pathname).toLowerCase();

  // --- Домашня ---
  if (PATH.endsWith("/index.html")) {
    injectGlobal();
    ensureCanonical(SITE.url + "/");
    injectWebPage({
      name: "Presidency Clock — Trump Countdown",
      description: "How much time does Donald Trump have left as president? Live countdown with news digest and presidential data.",
      url: SITE.url + "/"
    });
  }

  // --- Trump Today: NewsArticle з даних ---
  if (PATH.endsWith("/trump-today.html")) {
    injectGlobal();
    ensureCanonical(SITE.url + "/trump-today.html");
    injectWebPage({
      name: "Main about Trump today — Presidency Clock",
      description: "AI-picked top Trump story of the day with short summary and archive.",
      url: SITE.url + "/trump-today.html"
    });

    // Динамічно підтягнемо останню новину для NewsArticle
    fetch("data/trump-today.json", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        const item = data?.latest || {};
        const published = item.date ? new Date(item.date).toISOString() : (data?.updatedAt || new Date().toISOString());
        injectJSONLD({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "mainEntityOfPage": SITE.url + "/trump-today.html",
          "headline": (item.title || "Top Trump story").slice(0, 110),
          "description": item.summary || "",
          "datePublished": published,
          "dateModified": data?.updatedAt || published,
          "isAccessibleForFree": "true",
          "url": SITE.url + "/trump-today.html",
          "image": SITE.logo,
          "author": { "@type": "Organization", "name": SITE.name },
          "publisher": { "@id": SITE.url + "#org" },
          "citation": item.url || undefined
        });
      }).catch(()=>{});
  }

  // --- Digest: ItemList (зовнішні матеріали) ---
  if (PATH.endsWith("/digest.html")) {
    injectGlobal();
    ensureCanonical(SITE.url + "/digest.html");
    injectWebPage({
      name: "News Digest — Presidency Clock",
      description: "AI-updated digest with 4–5 sentence summaries and sources.",
      url: SITE.url + "/digest.html"
    });

    fetch("data/digest.json", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        const items = (data?.items || []).slice(0, 10).map((it, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": it.title,
          "url": it.url
        }));
        injectJSONLD({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "News Digest",
          "itemListOrder": "http://schema.org/ItemListOrderAscending",
          "itemListElement": items
        });
      }).catch(()=>{});
  }

  // --- Presidents: Dataset (посилання на JSON) ---
  if (PATH.endsWith("/presidents.html")) {
    injectGlobal();
    ensureCanonical(SITE.url + "/presidents.html");
    injectWebPage({
      name: "Presidents by Time in Office — Presidency Clock",
      description: "Explore presidents by time in office with country tabs and sorting.",
      url: SITE.url + "/presidents.html"
    });

    injectJSONLD({
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": "Presidents by Time in Office",
      "description": "Evergreen dataset of leaders with computed time in office.",
      "url": SITE.url + "/presidents.html",
      "creator": { "@id": SITE.url + "#org" },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "distribution": [{
        "@type": "DataDownload",
        "contentUrl": SITE.url + "/data/presidents.json",
        "encodingFormat": "application/json"
      }]
    });
  }

  // --- Статичні сторінки ---
  if (PATH.endsWith("/about.html")) {
    injectGlobal();
    ensureCanonical(SITE.url + "/about.html");
    injectWebPage({
      name: "About — Presidency Clock",
      description: "Independent project with live presidency countdowns and AI digests.",
      url: SITE.url + "/about.html"
    });
  }
  if (PATH.endsWith("/privacy.html")) {
    injectGlobal();
    ensureCanonical(SITE.url + "/privacy.html");
    injectWebPage({
      name: "Privacy Policy — Presidency Clock",
      description: "How we use cookies, analytics and ads.",
      url: SITE.url + "/privacy.html"
    });
  }
  if (PATH.endsWith("/contact.html")) {
    injectGlobal();
    ensureCanonical(SITE.url + "/contact.html");
    injectWebPage({
      name: "Contact — Presidency Clock",
      description: "Reach us at presidencyclock@gmail.com",
      url: SITE.url + "/contact.html"
    });
  }
})();
