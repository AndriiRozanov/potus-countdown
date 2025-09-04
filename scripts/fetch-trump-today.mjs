// scripts/fetch-trump-today.mjs
import fs from "node:fs/promises";

/**
 * =========================
 * Config
 * =========================
 */
const FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  "https://feeds.reuters.com/reuters/worldNews",
  "https://www.politico.com/rss/politics-news.xml",
  "https://www.theguardian.com/us-news/rss",
  "https://apnews.com/hub/politics?output=rss"
];

// Optional LLM
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_BASE =
  (process.env.OPENAI_BASE && process.env.OPENAI_BASE.replace(/\/+$/, "")) ||
  "https://api.openai.com";

/**
 * =========================
 * Helpers
 * =========================
 */
async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "PresidencyClockBot/1.0 (+https://example.com)" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return await res.text();
}

function extractItemsFromFeed(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;

  const titleRegex = /<title(?:\s[^>]*)?>(<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i;
  const linkRegex =
    /<link(?:\s[^>]*?)?>([\s\S]*?)<\/link>|<link(?:\s[^>]*?)?href="([^"]+)"/i;
  const descRegex =
    /<description(?:\s[^>]*)?>(<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>|<summary(?:\s[^>]*)?>([\s\S]*?)<\/summary>/i;

  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = (titleRegex.exec(block)?.[2] || "").trim();
    const linkMatch = linkRegex.exec(block);
    const link = (linkMatch?.[1] || linkMatch?.[2] || "")
      .replace(/<!\[CDATA\[|\]\]>/g, "")
      .trim();
    const rawDesc = descRegex.exec(block);
    const summary = ((rawDesc?.[2] || rawDesc?.[3] || "") || "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (title && link) items.push({ title, url: link, summary });
  }

  while ((m = entryRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = (titleRegex.exec(block)?.[2] || "").trim();
    const linkMatch = linkRegex.exec(block);
    const link = (linkMatch?.[1] || linkMatch?.[2] || "")
      .replace(/<!\[CDATA\[|\]\]>/g, "")
      .trim();
    const rawDesc = descRegex.exec(block);
    const summary = ((rawDesc?.[2] || rawDesc?.[3] || "") || "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (title && link) items.push({ title, url: link, summary });
  }

  return items;
}

function filterTrump(items) {
  const re = /\btrump\b/i;
  return items.filter(
    (it) => re.test(it.title) || re.test(it.summary || "")
  );
}

function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = `${it.title}::${it.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function compressSummary(text, maxSentences = 3) {
  if (!text) return "";
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  return sentences.slice(0, maxSentences).join(" ");
}

/**
 * Ask LLM to pick the top story & summarize in 2–3 sentences.
 * If LLM unavailable or fails, fall back to first item.
 */
async function pickTopWithLLM(items) {
  if (!OPENAI_API_KEY || items.length === 0) {
    return {
      title: items[0]?.title || "Top Trump story",
      url: items[0]?.url || "",
      summary: compressSummary(items[0]?.summary || "", 3)
    };
  }

  const system =
    "You are a neutral news editor. From the provided Trump-related headlines, pick the SINGLE most important, widely-reported story for today. Then write a concise 2–3 sentence summary (factual, neutral, no opinions). Respond as strict JSON: {\"title\":\"...\",\"url\":\"...\",\"summary\":\"...\"}.";
  const list = items
    .slice(0, 15) // limit prompt size
    .map((it, i) => `${i + 1}. ${it.title}\n${it.url}`)
    .join("\n\n");

  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: list }
    ],
    temperature: 0.2,
    max_tokens: 400
  };

  try {
    const res = await fetch(`${OPENAI_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content?.trim() || "";
    // Try parse JSON block
    const match = content.match(/\{[\s\S]*\}$/);
    const parsed = match ? JSON.parse(match[0]) : JSON.parse(content);
    const title = parsed.title || items[0].title;
    const url = parsed.url || items[0].url;
    const summary = parsed.summary || compressSummary(items[0].summary || "", 3);
    return { title, url, summary };
  } catch (err) {
    console.error("LLM pick error:", err.message);
    return {
      title: items[0]?.title || "Top Trump story",
      url: items[0]?.url || "",
      summary: compressSummary(items[0]?.summary || "", 3)
    };
  }
}

async function main() {
  // collect
  const collected = [];
  for (const feed of FEEDS) {
    try {
      const xml = await fetchText(feed);
      collected.push(...extractItemsFromFeed(xml));
    } catch (e) {
      console.error("Feed error:", feed, e.message);
    }
  }

  // filter & dedupe
  const trumpItems = dedupe(filterTrump(collected));

  if (trumpItems.length === 0) {
    console.log("No Trump-related items found; keeping previous file unchanged.");
    return;
  }

  // choose top & summarize
  const top = await pickTopWithLLM(trumpItems);

  // read existing file
  await fs.mkdir("data", { recursive: true });
  let current = { updatedAt: null, latest: null, archive: [] };
  try {
    const raw = await fs.readFile("data/trump-today.json", "utf8");
    current = JSON.parse(raw);
  } catch {}

  // dedupe by URL in archive
  const archive = Array.isArray(current.archive) ? current.archive : [];
  const exists = (entry) => entry && top.url && entry.url === top.url;

  const newLatest = {
    date: new Date().toISOString().slice(0, 10),
    title: top.title,
    summary: top.summary,
    url: top.url
  };

  // Move previous latest to archive if it's different
  if (current.latest && !exists(current.latest)) {
    archive.unshift(current.latest);
  }

  // Push also if not present already
  const filteredArchive = archive.filter((a) => !exists(a));

  // Keep last ~30 entries
  const finalArchive = filteredArchive.slice(0, 30);

  const payload = {
    updatedAt: new Date().toISOString(),
    latest: newLatest,
    archive: finalArchive
  };

  await fs.writeFile("data/trump-today.json", JSON.stringify(payload, null, 2), "utf8");
  console.log("Updated data/trump-today.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
