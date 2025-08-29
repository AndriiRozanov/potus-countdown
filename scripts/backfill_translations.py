#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backfill перекладів для вже згенерованих дайджестів.
- Читає існуючі items.json для кожної мови і дати
- Перекладає headline+summary у цільову мову через OpenAI (якщо є ключ)
- Перезаписує items.json і рендерить сторінку /{lang}/digest/{date}/ та індекс /{lang}/digest/
"""

import os, json, re, pathlib, datetime as dt
from zoneinfo import ZoneInfo
from jinja2 import Template
import requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT
TIMEZONE = os.getenv("TIMEZONE", "Europe/Kyiv")
SITE = os.getenv("SITE_ORIGIN", "https://presidencyclock.com")
LANGS = [x.strip() for x in os.getenv("LANGS", "uk,de,fr,es").split(",") if x.strip()]
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

STRINGS = {
  "uk": {"title":"Політичні підсумки дня","readmore":"Джерело","updated":"Оновлено","home":"Головна","digest":"Дайджести","desc":"Короткі AI-резюме політичних новин. Оновлюється двічі на день.","latest":"Останній випуск","see_full":"Переглянути повний випуск","archive":"Архів","digests_word":"Дайджести"},
  "de": {"title":"Politische Tageszusammenfassung","readmore":"Quelle","updated":"Aktualisiert","home":"Startseite","digest":"Digest","desc":"Kurze KI-Zusammenfassungen politischer Nachrichten. Zweimal täglich aktualisiert.","latest":"Neueste Ausgabe","see_full":"Ganze Ausgabe ansehen","archive":"Archiv","digests_word":"Digests"},
  "fr": {"title":"Résumé politique du jour","readmore":"Source","updated":"Mis à jour","home":"Accueil","digest":"Synthèses","desc":"Brefs résumés d’actualité politique générés par IA. Mise à jour deux fois par jour.","latest":"Dernière édition","see_full":"Voir l’édition complète","archive":"Archive","digests_word":"Synthèses"},
  "es": {"title":"Resumen político del día","readmore":"Fuente","updated":"Actualizado","home":"Inicio","digest":"Digest","desc":"Breves resúmenes de noticias políticas con IA. Se actualiza dos veces al día.","latest":"Última edición","see_full":"Ver edición completa","archive":"Archivo","digests_word":"Digests"},
}

HTML_TMPL = Template(r"""<!doctype html><html lang="{{ lang }}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{ title }} — {{ date }}</title>
<link rel="canonical" href="{{ canonical }}">
{% for alt in alternates %}<link rel="alternate" hreflang="{{ alt.hreflang }}" href="{{ alt.href }}">{% endfor %}
<meta name="description" content="{{ meta_desc }}">
<meta name="google-adsense-account" content="ca-pub-5023415479696725">
<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f6f8fd;color:#0c1220}.wrap{max-width:900px;margin:24px auto;padding:0 14px}h1{font-weight:800;margin:10px 0 6px}.meta{opacity:.8;font-size:14px;margin-bottom:8px}.card{background:#fff;border:1px solid rgba(13,17,23,.12);border-radius:14px;padding:12px;margin:10px 0}.card h3{margin:.2rem 0 .35rem;font-size:19px}.src{font-size:13px;opacity:.85}.ad{display:flex;justify-content:center;align-items:center;margin:12px 0}a{color:#3d77ff;text-decoration:none;font-weight:600} a:hover{text-decoration:underline}</style>
</head><body><div class="wrap">
<div><a href="/{{ lang }}/">{{ home }}</a> • <a href="/{{ lang }}/digest/">{{ digest }}</a></div>
<h1>{{ title }}</h1><div class="meta">{{ date }} • {{ updated }} {{ time }}</div>
<div class="ad ad--top"><ins class="adsbygoogle" style="display:block;min-height:90px" data-ad-client="ca-pub-5023415479696725" data-ad-slot="9877072514" data-ad-format="auto" data-full-width-responsive="true"></ins></div>
{% for it in items %}<div class="card"><h3>{{ it.headline }}</h3><p>{{ it.summary }}</p><div class="src"><a href="{{ it.url }}" target="_blank" rel="nofollow noopener">{{ readmore }}</a> — {{ it.source }}</div></div>{% endfor %}
<div class="ad ad--bottom"><ins class="adsbygoogle" style="display:block;min-height:90px" data-ad-client="ca-pub-5023415479696725" data-ad-slot="5432245255" data-ad-format="auto" data-full-width-responsive="true"></ins></div>
</div></body></html>""")

INDEX_TMPL = Template(r"""<!doctype html><html lang="{{ lang }}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{ title }} — {{ digests_word }}</title>
<link rel="canonical" href="{{ canonical }}">
{% for alt in alternates %}<link rel="alternate" hreflang="{{ alt.hreflang }}" href="{{ alt.href }}">{% endfor %}
<meta name="description" content="{{ desc }}">
<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f6f8fd;color:#0c1220}.wrap{max-width:900px;margin:24px auto;padding:0 14px}h1{font-weight:800;margin:10px 0 6px}.sub{opacity:.9;margin:0 0 14px}.grid{display:grid;grid-template-columns:1fr;gap:10px}.card{background:#fff;border:1px solid rgba(13,17,23,.12);border-radius:14px;padding:12px}.card h3{margin:.2rem 0 .35rem;font-size:18px}a{color:#3d77ff;text-decoration:none;font-weight:600} a:hover{text-decoration:underline}ul{padding-left:18px}.latest{margin:14px 0 10px}.latest h2{margin:.2rem 0 .6rem;font-size:20px}.dates{margin-top:14px}</style>
</head><body><div class="wrap">
<div><a href="/{{ lang }}/">{{ home }}</a></div>
<h1>{{ title }}</h1><p class="sub">{{ desc }}</p>
{% if latest_date and preview and preview|length > 0 %}<div class="latest"><h2>{{ latest_label }} — {{ latest_date }}</h2><div class="grid">{% for it in preview %}<div class="card"><h3>{{ it.headline }}</h3><p>{{ it.summary }}</p><div><a href="{{ it.url }}" target="_blank" rel="nofollow noopener">{{ readmore }}</a> — {{ it.source }}</div></div>{% endfor %}</div><p><a href="/{{ lang }}/digest/{{ latest_date }}/">{{ see_full }}</a></p></div>{% endif %}
<div class="dates"><h2>{{ archive }}</h2><ul>{% for d in dates %}<li><a href="/{{ lang }}/digest/{{ d }}/">{{ d }}</a></li>{% endfor %}</ul></div>
</div></body></html>""")

def now_local():
  return dt.datetime.now(ZoneInfo(TIMEZONE))

def alternates_for(date_str: str | None):
  arr=[{"hreflang": l, "href": f"{SITE}/{l}/digest/{date_str}/" if date_str else f"{SITE}/{l}/digest/"} for l in LANGS]
  arr.append({"hreflang":"x-default","href": f"{SITE}/en/digest/"})
  return arr

def _openai_translate(lang: str, items: list):
  api_key=os.getenv("OPENAI_API_KEY")
  if not api_key:  # якщо ключа немає — повертаємо як є
    return items
  try:
    payload={
      "model": OPENAI_MODEL,
      "messages": [
        {"role":"system","content":(
          "You are a precise translator/editor. "
          "Return ONLY valid JSON with field 'items' as an array of objects "
          "with keys: headline, summary, url, source. "
          f"Language must be '{lang}'. Keep urls and source unchanged. "
          "Do not invent facts; keep meaning. 2–3 concise sentences for summary."
        )},
        {"role":"user","content":json.dumps({"items": items}, ensure_ascii=False)}
      ],
      "temperature":0.2,
      "max_tokens":2000,
      "response_format":{"type":"json_object"}
    }
    r=requests.post("https://api.openai.com/v1/chat/completions",
      headers={"Authorization":f"Bearer {api_key}","Content-Type":"application/json"},
      data=json.dumps(payload), timeout=60)
    r.raise_for_status()
    data=r.json()["choices"][0]["message"]["content"]
    data=json.loads(data)
    out=[]
    for i in data.get("items",[]):
      h=i.get("headline") or ""; s=i.get("summary") or ""; u=i.get("url") or ""; src=i.get("source") or ""
      if not (h and u and src): continue
      if len(s)>400: s=s[:397]+"…"
      out.append({"headline":h,"summary":s,"url":u,"source":src})
    return out if out else items
  except Exception as e:
    print("OpenAI error:", e)
    return items

def render_date_page(lang, date_str, items):
  s=STRINGS.get(lang, STRINGS["uk"])
  html=HTML_TMPL.render(
    lang=lang, title=s["title"], date=date_str, time=now_local().strftime("%H:%M"),
    canonical=f"{SITE}/{lang}/digest/{date_str}/",
    meta_desc=s["title"],
    home=s["home"], digest=s["digest"], readmore=s["readmore"], updated=s["updated"],
    items=items, alternates=alternates_for(date_str)
  )
  out_dir=OUT/lang/"digest"/date_str
  out_dir.mkdir(parents=True, exist_ok=True)
  (out_dir/"index.html").write_text(html, encoding="utf-8")
  (out_dir/"items.json").write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")

def render_index(lang):
  s=STRINGS.get(lang, STRINGS["uk"])
  ddir=OUT/lang/"digest"; ddir.mkdir(parents=True, exist_ok=True)
  dates=sorted([p.name for p in ddir.iterdir() if p.is_dir()], reverse=True)
  latest_date=dates[0] if dates else None
  preview=[]
  if latest_date:
    j=ddir/latest_date/"items.json"
    if j.exists():
      try: preview=json.loads(j.read_text(encoding="utf-8"))[:3]
      except Exception: preview=[]
  html=INDEX_TMPL.render(
    lang=lang, title=s["title"], digests_word=s.get("digests_word","Digests"),
    canonical=f"{SITE}/{lang}/digest/", alternates=alternates_for(None),
    desc=s["desc"], dates=dates[:90], latest_date=latest_date, preview=preview,
    latest_label=s.get("latest","Latest"), readmore=s["readmore"],
    see_full=s.get("see_full","View full"), home=s["home"], archive=s.get("archive","Archive")
  )
  (ddir/"index.html").write_text(html, encoding="utf-8")

def main():
  total=0
  for lang in LANGS:
    ddir=OUT/lang/"digest"
    if not ddir.exists(): continue
    for date_dir in sorted([p for p in ddir.iterdir() if p.is_dir()]):
      jpath=date_dir/"items.json"
      if not jpath.exists(): continue
      try:
        items=json.loads(jpath.read_text(encoding="utf-8"))
      except Exception:
        continue
      # переклад існуючих item-ів у мову lang
      translated=_openai_translate(lang, items)
      render_date_page(lang, date_dir.name, translated)
      total+=1
    render_index(lang)
  print(f"Backfill done. Updated {total} date pages across languages.")

if __name__=="__main__":
  main()
