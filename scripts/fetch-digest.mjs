// scripts/fetch-digest.mjs
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

// How many items to keep finally
const MAX_ITEMS = 8;

// LLM (optional)
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
  // RSS <item>
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  // Atom <entry>
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

// Baseline: keep up to 4–5 sentences
function compressSummary(text, maxSentences = 5) {
  if (!text) return "";
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  return sentences.slice(0, maxSentences).join(" ");
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

/**
 * =========================
 * Optional LLM summarization
 * =========================
 * Uses OpenAI-compatible Chat Completions API if OPENAI_API_KEY is set.
 * Works with OpenAI or any provider exposing the same endpoint contract.
 */
async function llmSummarizeBatch(items) {
  if (!OPENAI_API_KEY) {
    // No key — fallback to baseline compression
    return items.map(it => ({
      ...it,
      summary: compressSummary(it.summary || "")
    }));
  }

  // Build a compact prompt asking for neutral 4–5 sentence summaries
  const system =
    "You are a concise news summarizer. Write neutral, factual summaries in 4–5 short sentences. Do not add opinions. Include only info present in the text or widely reported by major outlets. Output plain text without markdown.";
  const user = items
    .map(
      (it, idx) =>
        `#${idx + 1}\nTitle: ${it.title}\nURL: ${it.url}\nText: ${it.summary || "(no description)"}`
    )
    .join("\n\n");

  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content:
          "Summarize each news item below into a single paragraph of 4–5 sentences. Number your outputs to match the inputs (e.g., #1, #2, ...). Keep it neutral and crisp.\n\n" +
          user
      }
    ],
    temperature: 0.2,
    max_tokens: 1200
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

    if (!res.ok) {
      const t = await res.text();
      console.error("LLM HTTP error:", res.status, t);
      // Fallback
      return items.map(it => ({
        ...it,
        summary: compressSummary(it.summary || "")
      }));
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content || "";
    // Parse back lines split by markers #1, #2...
    const chunks = content
      .split(/\n\s*\#\d+\s*/g)
      .map(s => s.trim())
      .filter(Boolean);

    const out = items.map((it, idx) => {
      const s = chunks[idx] || "";
      return {
        ...it,
        summary: s ? s : compressSummary(it.summary || "")
      };
    });

    return out;
  } catch (err) {
    console.error("LLM error:", err.message);
    // Fallback
    return items.map(it => ({
      ...it,
      summary: compressSummary(it.summary || "")
    }));
  }
}

/**
 * =========================
 * Main
 * =========================
 */
async function main() {
  const collected = [];
  for (const feed of FEEDS) {
    try {
      const xml = await fetchText(feed);
      const items = extractItemsFromFeed(xml).slice(0, 6);
      collected.push(...items);
    } catch (e) {
      console.error("Feed error:", feed, e.message);
    }
  }

  const unique = dedupe(collected);

  // Pre-trim for token budget, but keep enough
  const shortlist = unique.slice(0, MAX_ITEMS * 2);

  // Try to LLM-summarize (or baseline compress)
  const summarized = await llmSummarizeBatch(shortlist);

  // Final selection
  const finalItems = summarized.slice(0, MAX_ITEMS).map(it => ({
    title: it.title,
    url: it.url,
    summary: it.summary ? compressSummary(it.summary, 5) : ""
  }));

  const payload = {
    updatedAt: new Date().toISOString(),
    items: finalItems
  };

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/digest.json", JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote data/digest.json with ${finalItems.length} items`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
