#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
PresidencyClock — авто-дайджести (мультимовний + hreflang).
Мови за замовчуванням: uk,de,fr,es. (керується змінною оточення LANGS)
- Збирає політичні новини з RSS.
- Якщо є OPENAI_API_KEY — робить короткі підсумки МОВОЮ КОЖНОЇ СТОРІНКИ.
- Генерує: /{lang}/digest/YYYY-MM-DD/index.html (+ items.json)
- Оновлює: /{lang}/digest/index.html
- Додає <link rel="alternate" hreflang="..."> для SEO між мовами.
"""

import os, re, json, hashlib, pathlib, datetime as dt
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

import feedparser
from jinja2 import Template
import requests

# ========================= НАЛАШТУВАННЯ =========================
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.getenv("OUT_DIR", ROOT))
LANGS = [x.strip() for x in os.getenv("LANGS", "uk,de,fr,es").split(",") if x.strip()]
TIMEZONE = os.getenv("TIMEZONE", "Europe/Kyiv")
MIN_ITEMS = int(os.getenv("DIGEST_MIN_ITEMS", "8"))
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
SITE = os.getenv("SITE_ORIGIN", "https://presidencyclock.com")  # для canonical/hreflang

FEEDS = [
  # International (англомовні — як фід-джерела)
  "https://www.reuters.com/politics/rss",
  "https://feeds.bbci.co.uk/news/politics/rss.xml",
  "https://www.politico.eu/feed",
  # Ukraine
  "https://www.pravda.com.ua/rss/view_politics/",
  "https://www.eurointegration.com.ua/rss/",
  # Germany
  "https://www.tagesschau.de/xml",
  "https://www.zeit.de/politik/index.xml",
  # France
  "https://www.lemonde.fr/politique/rss_full.xml",
  "https://www.lefigaro.fr/rss/figaro_politique.xml",
  # Spain
  "https://elpais.com/rss/politica.xml",
  # USA/Canada
  "https://www.npr.org/rss/rss.php?id=1014",
  "https://www.cbc.ca/cmlink/rss-politics",
]

STRINGS = {
  "uk": {
    "title":"Політичні підсумки дня",
    "readmore":"Джерело",
    "updated":"Оновлено",
    "home":"Головна",
    "digest":"Дайджести",
    "desc":"Короткі AI-резюме політичних новин. Оновлюється двічі на день.",
    "latest":"Останній випуск",
    "see_full":"Переглянути повний випуск",
    "archive":"Архів",
    "digests_word":"Дайджести"
  },
  "de": {
    "title":"Politische Tageszusammenfassung",
    "readmore":"Quelle",
    "updated":"Aktualisiert",
    "home":"Startseite",
    "digest":"Digest",
    "desc":"Kurze KI-Zusammenfassungen politischer Nachrichten. Zweimal täglich aktualisiert.",
    "latest":"Neueste Ausgabe",
    "see_full":"Ganze Ausgabe ansehen",
    "archive":"Archiv",
    "digests_word":"Digests"
  },
  "fr": {
    "title":"Résumé politique du jour",
    "readmore":"Source",
    "updated":"Mis à jour",
    "home":"Accueil",
    "digest":"Synthèses",
    "desc":"Brefs résumés d’actualité politique générés par IA. Mise à jour deux fois par jour.",
    "latest":"Dernière édition",
    "see_full":"Voir l’édition complète",
    "archive":"Archive",
    "digests_word":"Synthèses"
  },
  "es": {
    "title":"Resumen político del día",
    "readmore":"Fuente",
    "updated":"Actualizado",
    "home":"Inicio",
    "digest":"Digest",
    "desc":"Breves resúmenes de noticias políticas con IA. Se actualiza dos veces al día.",
    "latest":"Última edición",
    "see_full":"Ver edición completa",
    "archive":"Archivo",
    "digests_word":"Digests"
  },
}

# ========================= ШАБЛОНИ ==============================
HTML_TMPL = Template(r"""<!doctype html>
<html lang="{{ lang }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{ title }} — {{ date }}</title>
  <link rel="canonical" href="{{ canonical }}">
  {% for alt in alternates %}
  <link rel="alternate" hreflang="{{ alt.hreflang }}" href="{{ alt.href }}">
  {% endfor %}
  <meta name="description" content="{{ meta_desc }}">
  <meta name="google-adsense-account" content="ca-pub-5023415479696725">
  <style>
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f6f8fd;color:#0c1220}
    .wrap{max-width:900px;margin:24px auto;padding:0 14px}
    h1{font-weight:800;margin:10px 0 6px}
    .meta{opacity:.8;font-size:14px;margin-bottom:8px}
    .card{background:#fff;border:1px solid rgba(13,17,23,.12);border-radius:14px;padding:12px;margin:10px 0}
    .card h3{margin:.2rem 0 .35rem;font-size:19px}
    .src{font-size:13px;opacity:.85}
    .ad{display:flex;justify-content:center;align-items:center;margin:12px 0}
    a{color:#3d77ff;text-decoration:none;font-weight:600} a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <div class="wrap">
    <div><a href="/{{ lang }}/">{{ home }}</a> • <a href="/{{ lang }}/digest/">{{ digest }}</a></div>
    <h1>{{ title }}</h1>
    <div class="meta">{{ date }} • {{ updated }} {{ time }}</div>

    <div class="ad ad--top">
      <ins class="adsbygoogle" style="display:block;min-height:90px"
           data-ad-client="ca-pub-5023415479696725"
           data-ad-slot="9877072514" data-ad-format="auto" data-full-width-responsive="true"></ins>
    </div>

    {% for it in items %}
    <div class="card">
      <h3>{{ it.headline }}</h3>
      <p>{{ it.summary }}</p>
      <div class="src"><a href="{{ it.url }}" target="_blank" rel="nofollow noopener">{{ readmore }}</a> — {{ it.source }}</div>
    </div>
    {% endfor %}

    <div class="ad ad--bottom">
      <ins class="adsbygoogle" style="display:block;min-height:90px"
           data-ad-client="ca-pub-5023415479696725"
           data-ad-slot="5432245255" data-ad-format="auto" data-full-width-responsive="true"></ins>
    </div>
  </div>

  <script>
    (function(){
      const s=document.createElement('script'); s.async=true;
      s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5023415479696725';
      s.crossOrigin='anonymous';
      s.onload=function(){ try{ const arr=(window.adsbygoogle=window.adsbygoogle||[]); document.querySelectorAll('ins.adsbygoogle').forEach(()=>arr.push({})); }catch(e){} };
      document.head.appendChild(s);
    })();
  </script>
</body>
</html>
""")

INDEX_TMPL = Template(r"""<!doctype html>
<html lang="{{ lang }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{ title }} — {{ digests_word }}</title>
  <link rel="canonical" href="{{ canonical }}">
  {% for alt in alternates %}
  <link rel="alternate" hreflang="{{ alt.hreflang }}" href="{{ alt.href }}">
  {% endfor %}
  <meta name="description" content="{{ desc }}">
  <style>
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f6f8fd;color:#0c1220}
    .wrap{max-width:900px;margin:24px auto;padding:0 14px}
    h1{font-weight:800;margin:10px 0 6px}
    .sub{opacity:.9;margin:0 0 14px}
    .grid{display:grid;grid-template-columns:1fr;gap:10px}
    .card{background:#fff;border:1px solid rgba(13,17,23,.12);border-radius:14px;padding:12px}
    .card h3{margin:.2rem 0 .35rem;font-size:18px}
    a{color:#3d77ff;text-decoration:none;font-weight:600} a:hover{text-decoration:underline}
    ul{padding-left:18px}
    .latest{margin:14px 0 10px}
    .latest h2{margin:.2rem 0 .6rem;font-size:20px}
    .dates{margin-top:14px}
  </style>
</head>
<body>
  <div class="wrap">
    <div><a href="/{{ lang }}/">{{ home }}</a></div>
    <h1>{{ title }}</h1>
    <p class="sub">{{ desc }}</p>

    {% if latest_date and preview and preview|length > 0 %}
    <div class="latest">
      <h2>{{ latest_label }} — {{ latest_date }}</h2>
      <div class="grid">
        {% for it in preview %}
        <div class="card">
          <h3>{{ it.headline }}</h3>
          <p>{{ it.summary }}</p>
          <div><a href="{{ it.url }}" target="_blank" rel="nofollow noopener">{{ readmore }}</a> — {{ it.source }}</div>
        </div>
        {% endfor %}
      </div>
      <p><a href="/{{ lang }}/digest/{{ latest_date }}/">{{ see_full }}</a></p>
    </div>
    {% endif %}

    <div class="dates">
      <h2>{{ archive }}</h2>
      <ul>
        {% for d in dates %}
        <li><a href="/{{ lang }}/digest/{{ d }}/">{{ d }}</a></li>
        {% endfor %}
      </ul>
    </div>
  </div>
</body>
</html>
""")

# ========================= УТИЛІТИ ===============================
def _norm(s): return re.sub(r"\s+"," ", (s or "").strip())
def now_local(): return dt.datetime.now(ZoneInfo(TIMEZONE))

def todays_digest_exists(lang: str, date_str: str) -> bool:
  ddir = OUT/lang/"digest"/date_str
  return (ddir/"items.json").exists() or (ddir/"index.html").exists()

def log(msg: str):
  ts = now_local().strftime("%Y-%m-%d %H:%M:%S")
  print(f"[{ts}] {msg}")

def make_alternates(date_str: str | None):
  # будуємо набір hreflang-посилань між мовами
  alts=[]
  for l in LANGS:
    href = f"{SITE}/{l}/digest/{date_str}/" if date_str else f"{SITE}/{l}/digest/"
    alts.append({"hreflang": l, "href": href})
  # x-default — на англомовний індекс дайджестів
  alts.append({"hreflang":"x-default", "href": f"{SITE}/en/digest/"})
  return alts

# ========================= FETCH + PICK ==========================
def fetch_all():
  items=[]
  headers={"User-Agent":"PresidencyClockBot/1.0 (+https://presidencyclock.com)"}
  for url in FEEDS:
    try:
      r = requests.get(url, headers=headers, timeout=20)
      r.raise_for_status()
      feed = feedparser.parse(r.content)
      got = 0
      for e in feed.entries:
        link = e.get("link") or ""
        title = _norm(e.get("title"))
        if not link or not title:
          continue
        summary = _norm(e.get("summary") or e.get("description") or "")
        items.append({
          "url": link,
          "title": title,
          "summary_raw": summary,
          "source": urlparse(url).netloc.replace("www.","")
        })
        got += 1
      log(f"OK {url} — {got} items")
    except Exception as ex:
      log(f"ERR {url}: {ex}")
  return items

def dedupe(items):
  seen=set(); out=[]
  for it in items:
    key=hashlib.sha1((it["url"] or it["title"]).encode()).hexdigest()
    if key in seen: continue
    seen.add(key); out.append(it)
  return out

def score_and_pick(items, limit=24):
  kw = re.compile(r"(election|parliament|cabinet|minister|president|policy|verkhovna rada|rada|bundestag|bundes|senate|congress|канцлер|уряд|вибор|президент|рада|assemblée|élysée|ministre|parlement)", re.I)
  scored=[]
  for it in items:
    score=0
    if kw.search((it["title"] + " " + it["summary_raw"]).lower()): score += 20
    scored.append((score,it))
  scored.sort(key=lambda x:x[0], reverse=True)
  return [x[1] for x in scored[:limit]]

# ========================= SUMMARIZE =============================
def llm_available(): return bool(os.getenv("OPENAI_API_KEY"))

def _openai_chat(messages, model="gpt-4o-mini", temperature=0.2, max_tokens=2000):
  api_key=os.getenv("OPENAI_API_KEY")
  if not api_key: return None
  try:
    r=requests.post(
      "https://api.openai.com/v1/chat/completions",
      headers={"Authorization":f"Bearer {api_key}","Content-Type":"application/json"},
      data=json.dumps({
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "response_format": {"type":"json_object"}
      }),
      timeout=60
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]
  except Exception as e:
    log(f"OpenAI error: {e}")
    return None

def summarize_smart(lang, items):
  compact=[{"title":it["title"],"summary":it["summary_raw"],"url":it["url"],"source":it["source"]} for it in items]
  sys=("You are a careful, factual news summarizer. "
       "Return ONLY valid JSON with field 'items' as an array of objects "
       "with keys: headline, summary, url, source. Language must be '"+lang+
       "'. Neutral tone, 2–3 concise sentences per item. Do not invent facts.")
  res=_openai_chat(
    messages=[{"role":"system","content":sys},{"role":"user","content":json.dumps({"items":compact})}],
    model=OPENAI_MODEL, temperature=0.2, max_tokens=2000
  )
  if not res: return summarize_plain(items, lang)
  try:
    data=json.loads(res)
    out=[]
    for i in data.get("items",[]):
      h=i.get("headline") or ""; s=i.get("summary") or ""; u=i.get("url") or ""; src=i.get("source") or ""
      if not (h and u and src): continue
      if len(s)>400: s=s[:397]+"…"
      out.append({"headline":h,"summary":s,"url":u,"source":src})
    return out if out else summarize_plain(items, lang)
  except Exception as e:
    log(f"LLM parse error: {e}")
    return summarize_plain(items, lang)

def summarize_plain(items, lang):
  # без LLM: копіюємо титли/описи як є (можуть бути англ/іншою мовою)
  out=[]
  for it in items:
    summ=it["summary_raw"] or it["title"]
    if len(summ)>320: summ=summ[:317]+"…"
    out.append({"headline":it["title"],"summary":summ,"url":it["url"],"source":it["source"]})
  return out

# ========================= RENDER ================================
def render_page(lang, date_str, items):
  strings=STRINGS.get(lang, STRINGS["uk"])
  canonical=f"{SITE}/{lang}/digest/{date_str}/"
  html=HTML_TMPL.render(
    lang=lang, title=strings["title"], date=date_str, time=now_local().strftime("%H:%M"),
    canonical=canonical, meta_desc=strings["title"],
    home=strings["home"], digest=strings["digest"],
    readmore=strings["readmore"], updated=strings["updated"],
    items=items, alternates=make_alternates(date_str)
  )
  out_dir=OUT/lang/"digest"/date_str
  out_dir.mkdir(parents=True, exist_ok=True)
  (out_dir/"index.html").write_text(html, encoding="utf-8")
  (out_dir/"items.json").write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")

def render_index(lang):
  strings=STRINGS.get(lang, STRINGS["uk"])
  ddir=OUT/lang/"digest"
  ddir.mkdir(parents=True, exist_ok=True)
  dates=sorted([p.name for p in ddir.iterdir() if p.is_dir()], reverse=True)
  latest_date = dates[0] if dates else None
  preview = []
  if latest_date:
    jpath = ddir/latest_date/"items.json"
    if jpath.exists():
      try:
        data=json.loads(jpath.read_text(encoding="utf-8"))
        preview=data[:3]
      except Exception:
        preview=[]
  html=INDEX_TMPL.render(
    lang=lang,
    title=strings["title"],
    digests_word=strings.get("digests_word", "Digests"),
    canonical=f"{SITE}/{lang}/digest/",
    alternates=make_alternates(None),
    desc=strings["desc"],
    dates=dates[:90],
    latest_date=latest_date,
    preview=preview,
    latest_label=strings.get("latest","Latest"),
    readmore=strings["readmore"],
    see_full=strings.get("see_full","View full"),
    home=strings["home"],
    archive=strings.get("archive","Archive")
  )
  (ddir/"index.html").write_text(html, encoding="utf-8")

# ========================= MAIN =================================
def main():
  date_str = now_local().date().isoformat()

  raw=fetch_all()
  items=score_and_pick(dedupe(raw), limit=24)
  if len(items) < MIN_ITEMS:
    log(f"Below threshold ({len(items)}<{MIN_ITEMS}) — skip.")
    return

  if llm_available():
    log("LLM available — generating smart summaries per language…")
    multi={lang: summarize_smart(lang, items) for lang in LANGS}
  else:
    log("No OPENAI_API_KEY — using plain (non-translated) summaries.")
    multi={lang: summarize_plain(items, lang) for lang in LANGS}

  for lang in LANGS:
    if todays_digest_exists(lang, date_str) and os.getenv("FORCE","false").lower()!="true":
      log(f"{lang}: digest for {date_str} already exists — skip.")
      continue
    render_page(lang, date_str, multi[lang])
    render_index(lang)
    log(f"{lang}: digest generated for {date_str}")

  log("Done.")

if __name__=="__main__":
  main()
