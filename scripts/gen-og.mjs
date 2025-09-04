// scripts/gen-og.mjs
// Генерує og-image.jpg (1200x630) із актуальним залишком терміну.
// Працює без зайвих залежностей окрім puppeteer (встановимо у воркфлоу).

import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

// Кінець терміну (UTC). Можеш перевизначити через env TERM_END_ISO.
const TERM_END_ISO = process.env.TERM_END_ISO || "2029-01-20T17:00:00Z";

// Брендинг
const BRAND = {
  name: "Presidency Clock",
  url: "https://presidencyclock.com",
  bgDark: "#0b0f18",
  accent: "#84a9ff"
};

function diffParts(endIso) {
  const now = new Date();
  const end = new Date(endIso);
  let ms = Math.max(0, end - now);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  ms -= days * 24 * 60 * 60 * 1000;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  ms -= hours * 60 * 60 * 1000;
  const mins = Math.floor(ms / (1000 * 60));
  return { days, hours, mins };
}

function htmlTemplate({ days, hours, mins }) {
  // простий мінімалістичний макет у стилі нашого сайту
  const updated = new Date().toISOString().slice(0, 10);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face { font-family: Inter; src: local("Inter"), local("Segoe UI"), local("Roboto"); }
      html,body{ margin:0; padding:0; width:1200px; height:630px; }
      body{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, sans-serif;
        background:
          radial-gradient(1200px 630px at 1200px 0, rgba(132,169,255,.20), transparent 55%),
          radial-gradient(800px 600px at -100px 630px, rgba(132,169,255,.12), transparent 60%),
          ${BRAND.bgDark};
        color: #e8ecff;
        display:flex; align-items:center; justify-content:center;
      }
      .card{
        width: 1080px; height: 510px;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px; padding: 40px 48px;
        box-shadow: 0 20px 50px rgba(0,0,0,.35), inset 0 0 80px rgba(132,169,255,.06);
        display:flex; flex-direction:column; justify-content:space-between;
      }
      .brand{ display:flex; align-items:center; gap:16px; letter-spacing:.4px; font-weight:600; color:#bfcfff; }
      .dot{ width:10px; height:10px; border-radius:50%; background:${BRAND.accent}; box-shadow:0 0 16px ${BRAND.accent}; }
      h1{ margin:0; font-size:72px; line-height:1.1; letter-spacing:-.5px; }
      .row{ display:flex; gap:18px; align-items:baseline; flex-wrap:wrap; }
      .pill{
        background: rgba(132,169,255,.14);
        color:#e8ecff; border:1px solid rgba(132,169,255,.28);
        border-radius:16px; padding:10px 16px; font-size:28px; font-weight:700;
        min-width: 170px; text-align:center;
      }
      .label{ font-size:20px; color:#a9b8e8; }
      .footer{ display:flex; justify-content:space-between; align-items:center; color:#9fb2ef; }
      .url{ color:#9bc0ff; }
      .updated{ font-size:18px; color:#7e8dbd; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="brand"><span class="dot"></span> ${BRAND.name}</div>
      <div>
        <h1>Trump Presidency Countdown</h1>
        <div class="row">
          <div class="pill">${days} <span class="label">days</span></div>
          <div class="pill">${String(hours).padStart(2,"0")} <span class="label">hours</span></div>
          <div class="pill">${String(mins).padStart(2,"0")} <span class="label">minutes</span></div>
        </div>
      </div>
      <div class="footer">
        <div class="url">${BRAND.url.replace(/^https?:\/\//,'')}</div>
        <div class="updated">Updated ${updated}</div>
      </div>
    </div>
  </body>
</html>`;
}

async function main() {
  const parts = diffParts(TERM_END_ISO);
  const html = htmlTemplate(parts);

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });

  // Збережемо JPEG високої якості
  const outPath = path.resolve("og-image.jpg");
  const buf = await page.screenshot({ type: "jpeg", quality: 90 });
  await fs.writeFile(outPath, buf);

  await browser.close();
  console.log("✓ og-image.jpg generated:", outPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
