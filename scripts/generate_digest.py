#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os, re, json, hashlib, pathlib, datetime as dt
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

import feedparser
from jinja2 import Template
import requests

# ==== НАЛАШТУВАННЯ ============================================================
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT  # корінь сайту
LANGS = os.getenv("LANGS", "uk,de,es,en").split(",")  # які мови генерувати
TIMEZONE = os.getenv("TIMEZONE", "Europe/Kyiv")
TARGET_TIMES = os.getenv("TARGET_TIMES", "05:00,20:00").split(",")  # локальний час запусків
WINDOW_MIN = int(os.getenv("WINDOW_MIN", "7"))  # «вікно» у хв, щоб спіймати точний час
MIN_ITEMS = int(os.getenv("DIGEST_MIN_ITEMS", "12"))  # мін. кількість унікальних новин

# Джерела RSS (можеш додавати/видаляти рядки)
FEEDS = [
  "https://www.reuters.com/politics/rss",
  "https://feeds.bbci.co.uk/news/politics/rss.xml",
  "https://www.politico.eu/feed",
  "https://www.pravda.com.ua/rss/view_politics/",
  "https://www.eurointegration.com.ua/rss/",
  "https://www.tagesschau.de/xml",
  "https://www.zeit.de/politik/index.xml",
  "https://elpais.com/rss/politica.xml",
  "https://www.npr.org/rss/rss.php?id=1014",
  "https://www.cbc.ca/cmlink/rss-politics",
]

STRINGS = {
  "uk": {"title":"Політичні підсумки дня","readmore":"Джерело","updated":"Оновлено","home":"Головна","digest":"Дайджести"},
  "de": {"title":"Politische Tageszusammenfassung","readmore":"Quelle","updated":"Aktualisiert","home":"Startseite","digest":"Digest"},
  "es": {"title":"Resumen político del día","readmore":"Fuente","updated":"Actualizado","home":"Inicio","digest":"Digest"},
  "en": {"title":"Daily political roundup","readmore":"Source","updated":"Updated","home":"Home","digest":"Digests"},
}

HTML_TMPL = Template(r"""<!doctype html>
<html lang="{{ lang }}" data-theme="auto">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>{{ title }} — {{ date }}</title>
  <link rel="canonical" href="{{ canonical }}">
  <meta name="description" content="{{ meta_desc }}">
  <meta property="og:url" content="{{ canonical }}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{{ title }} — {{ date }}">
  <meta property="og:description" content="{{ meta_desc }}">
  <meta property="og:image" content="https://presidencyclock.com/og.jpg">
  <meta name="google-adsense-account" content="ca-pub-5023415479696725">
  <meta name="theme-color" content="#f6f8fd">
  <style>
    :root{ --bg:#f6f8fd; --surface:#fff; --line:rgba(13,17,23,.12); --text:#0c1220; --accent:#3d77ff; }
    body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
    .wrap{max-width:900px;margin:24px auto;padding:0 14px}
    .nav a{color:var(--accent);font-weight:700;text-decoration:none} .nav a:hover{text-decoration:underline}
    h1{font-weight:800;margin:10px 0 6px}
    .meta{opacity:.8;font-size:14px;margin-bottom:8px}
    .ad{display:flex;justify-content:center;align-items:center;margin:12px 0}
    .card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px;margin:10px 0}
    .card h3{margin:.2rem 0 .35rem;font-size:19px}
    .src{font-size:13px;opacity:.8}
    .footer{opacity:.75;font-size:13px;text-align:center;margin:16px 0}
  </style>
  {% for alt in alts %}<link rel="alternate" hreflang="{{ alt.code }}" href="{{ alt.href }}">{% endfor %}
</head>
<body>
  <div class="wrap">
    <div class="nav"><a href="/{{ lang }}/">{{ home }}</a> • <a href="/{{ lang }}/digest/">{{ digest }}</a></div>
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
      <div class="src"><a href="{{ it.url }}" rel="nofollow noopener" target="_blank">{{ readmore }}</a> — {{ it.source }}</div>
    </div>
    {% endfor %}

    <div class="ad ad--bottom">
      <ins class="adsbygoogle" style="display:block;min-height:90px"
           data-ad-client="ca-pub-5023415479696725"
           data-ad-slot="5432245255" data-ad-format="auto" data-full-width-responsive="true"></ins>
    </div>

    <div class="footer">© Presidency Clock</div>
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

def _norm(s): return re.sub(r"\s+"," ", (s or "").strip())

def now_local():
  return dt.datetime.now(ZoneInfo(TIMEZONE))

def is_within_target_window(now: dt.datetime) -> bool:
  local = now
  for t in TARGET_TIMES:
    hh, mm = t.split(":")
    target = local.replace(hour=int(hh), minute=int(mm), second=0, microsecond=0)
    delta = abs((local - target).total_seconds())/60.0
    if delta <= WINDOW_MIN:
      return True
  return False

def fetch_all():
  items = []
  for url in FEEDS:
    try:
      feed = feedparser.parse(url)
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
          "source": urlparse(url).netloc.replace("www.",""),
          "published": _norm(e.get("published") or e.get("updated") or "")
        })
    except Exception:
      continue
  return items

def dedupe(items):
  seen = set(); out=[]
  for it in items:
    key = hashlib.sha1((it["url"] or it["title"]).encode("utf-8")).hexdigest()
    if key in seen: continue
    seen.add(key); out.append(it)
  return out

def score_and_pick(items, limit=24):
  kw = re.compile(r"(election|parliament|cabinet|minister|president|policy|verkhovna rada|rada|bundestag|bundes|senate|congress|канцлер|уряд|вибор|президент|рада)", re.I)
  scored=[]
  for it in items:
    score = 0
    if it["published"]: score += 10
    if kw.search((it["title"]+" "+it["summary_raw"]).lower()): score += 20
    scored.append((score, it))
  scored.sort(key=lambda x: x[0], reverse=True)
  return [x[1] for x in scored[:limit]]

# ==== ШІ-підсумки (OpenAI) ===================================================
def llm_available() -> bool:
  return bool(os.getenv("OPENAI_API_KEY"))

def _openai_chat(messages, model="gpt-4o-mini", temperature=0.2, max_tokens=2000):
  api_key = os.getenv("OPENAI_API_KEY")
  if not api_key: return None
  url = "https://api.openai.com/v1/chat/completions"
  headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
  payload = {"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens, "response_format":{"type":"json_object"}}
  try:
    r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=60)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]
  except Exception as e:
    print("OpenAI error:", e)
    return None

def summarize_smart(lang: str, items):
  compact = [{"title": it["title"], "summary": it["summary_raw"], "url": it["url"], "source": it["source"]} for it in items]
  sys = ("You are a careful, factual news summarizer. Return ONLY valid JSON with field 'items' as an array. "
         "Each item must have keys: headline, summary, url, source. Language must be the requested target, neutral tone, 2–3 concise sentences. Do not invent facts.")
  res = _openai_chat(
    messages=[{"role":"system","content":sys},
              {"role":"user","content": json.dumps({"target_language": lang, "items": compact})}],
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    temperature=0.2, max_tokens=2000
  )
  if not res:
    return summarize_plain(items)
  try:
    data = json.loads(res)
    out=[]
    for it in data.get("items", []):
      headline = it.get("headline") or ""
      summary  = it.get("summary") or ""
      url      = it.get("url") or ""
      source   = it.get("source") or ""
      if not (headline and url and source): continue
      if len(summary) > 400: summary = summary[:397] + "…"
      out.append({"headline":headline, "summary":summary, "url":url, "source":source})
    return out if out else summarize_plain(items)
  except Exception as e:
    print("LLM parse error:", e)
    return summarize_plain(items)

def summarize_plain(items):
  out=[]
  for it in items:
    summ = it["summary_raw"] or it["title"]
    if len(summ) > 320: summ = summ[:317] + "…"
    out.append({"headline": it["title"], "summary": summ, "url": it["url"], "source": it["source"]})
  return out

def render_page(lang, date_str, items):
  strings = STRINGS.get(lang, STRINGS["en"])
  canonical = f"https://presidencyclock.com/{lang}/digest/{date_str}/"
  alts = [{"code": l, "href": f"https://presidencyclock.com/{l}/digest/{date_str}/"} for l in LANGS if l != lang]
  html = HTML_TMPL.render(
    lang=lang, title=strings["title"], date=date_str, time=now_local().strftime("%H:%M"),
    canonical=canonical, meta_desc=strings["title"],
    home=strings["home"], digest=strings["digest"],
    readmore=strings["readmore"], updated=strings["updated"],
    items=items, alts=alts
  )
  out_dir = OUT / lang / "digest" / date_str
  out_dir.mkdir(parents=True, exist_ok=True)
  (out_dir / "index.html").write_text(html, encoding="utf-8")

def render_index(lang):
  ddir = OUT / lang / "digest"
  ddir.mkdir(parents=True, exist_ok=True)
  dates = sorted([p.name for p in ddir.iterdir() if p.is_dir()], reverse=True)[:90]
  links = "\n".join([f'<li><a href="/{lang}/digest/{d}/">{d}</a></li>' for d in dates])
  html = f"""<!doctype html><html lang="{lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Digests — {lang}</title></head><body>
<div class="wrap" style="max-width:900px;margin:24px auto;padding:0 14px">
<h1>Digests</h1><ul>{links}</ul></div></body></html>"""
  (ddir / "index.html").write_text(html, encoding="utf-8")

def main():
  # публікуємо лише о 05:00 та 20:00 за Києвом (або якщо FORCE=true)
  if not is_within_target_window(now_local()) and os.getenv("FORCE","false").lower() != "true":
    print("Not target time — skip."); return

  raw = fetch_all()
  items = score_and_pick(dedupe(raw), limit=24)
  if len(items) < MIN_ITEMS:
    print("Below threshold — skip."); return

  if llm_available():
    multi = {lang: summarize_smart(lang=lang, items=items) for lang in LANGS}
  else:
    multi = {lang: summarize_plain(items) for lang in LANGS}

  date_str = now_local().date().isoformat()
  for lang in LANGS:
    render_page(lang, date_str, multi[lang])
    render_index(lang)
  print("Digest generated.")

if __name__ == "__main__":
  main()
