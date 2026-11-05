// Search over fctl's docs: GET /api/search?q= answers the search dialog
// (src/search-dialog.ts) with JSON, and /docs/search/?q= is the same search as
// a page, for browsers without JavaScript and for links.
//
// Full search asks AI Search (the DOCS_SEARCH binding), which matches meaning
// as well as words, and which Cloudflare bills by the search. So that nobody
// can run up that bill, a full search must pass, in order:
//
//   1. the cache: the same query (in any case) since the docs last changed is
//      answered from Cloudflare's cache, and costs nothing;
//   2. SEARCH_LIMITER: at most 10 a minute from one visitor (an IPv4 address,
//      or an IPv6 /64), counted in each Cloudflare location;
//   3. SearchBudget (worker/budget.ts): a day's searches, for everyone and for
//      each visitor, counted exactly, everywhere.
//
// When one of them says no, or AI Search fails or finds nothing, search
// matches the query's words in the sections itself (worker/words.ts), which
// is free, and says why its results match words only.
//
// What it searches is dist/docs/search/sections.json (scripts/search-index.mjs),
// whose sections scripts/search-sync.mjs uploads to AI Search after each deploy.

import { plainText, queryTerms, snippet } from "./text.ts";
import { type Section, searchWords, type WordIndex, wordIndex } from "./words.ts";

export interface SearchEnv {
  ASSETS: Fetcher;
  DOCS_SEARCH?: AiSearchInstance;
  SEARCH_LIMITER?: RateLimit;
  SEARCH_BUDGET?: DurableObjectNamespace;
}

/** One result: a section, where it is, and the part of it that matches. */
export interface Hit {
  url: string;
  page: string;
  trail: string[];
  title: string;
  /** Text and marked words, alternating: even indexes plain, odd ones the query's words. */
  snippet: string[];
}

/** Why results match words only: too many searches this minute, or today, from this visitor or from everyone, or AI Search failed. */
export type Notice = "minute" | "visitor" | "budget" | "unavailable";

export interface Results {
  query: string;
  /** "full": AI Search's, matching meaning too; "words": matching the query's words only. */
  mode: "full" | "words";
  hits: Hit[];
  notice?: Notice;
  /** The notice in a sentence, for people (`NOTICES`). */
  message?: string;
}

/** Longest query: longer ones are cut. */
export const MAX_QUERY = 200;
/** Results a search gives. */
export const MAX_HITS = 8;
/** How long a full search's results are cached, in seconds (until the docs change, anyway). */
const CACHE_TTL = 86_400;

/** A query as searched: on one line, at most `MAX_QUERY` characters. */
export const normalize = (q: string | null) =>
  (q ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY).trim();

/**
 * Who is searching, for the limits: their IPv4 address, or for IPv6 the /64 it is in, which
 * one machine or network is given whole (anyone can change addresses inside it).
 */
export function visitor(ip: string | null): string {
  if (!ip) return "unknown";
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped?.[1]) return mapped[1];
  if (!ip.includes(":")) return ip;
  const [head = "", tail] = ip.toLowerCase().split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups =
    tail === undefined ? left : [...left, ...Array(8 - left.length - right.length).fill("0"), ...right];
  const prefix = groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, ""));
  return `${prefix.join(":")}::/64`;
}

interface Index {
  version: string;
  byHash: Map<string, Section>;
  words: () => WordIndex;
}

let loaded: Promise<Index> | undefined;

/** sections.json, once per isolate (a deploy starts new ones). */
function load(env: SearchEnv): Promise<Index> {
  loaded ??= (async () => {
    const res = await env.ASSETS.fetch(new Request("https://fctl.sh/docs/search/sections.json"));
    if (!res.ok) throw new Error(`sections.json: ${res.status}`);
    const file = (await res.json()) as { version: string; sections: Section[] };
    const byHash = new Map<string, Section>();
    for (const s of file.sections) {
      const hash = /\.([0-9a-f]{12})\.md$/.exec(s.key)?.[1];
      if (hash) byHash.set(hash, s);
    }
    let words: WordIndex | undefined;
    return { version: file.version, byHash, words: () => (words ??= wordIndex(file.sections)) };
  })();
  loaded.catch(() => {
    loaded = undefined;
  });
  return loaded;
}

/** A result for a section, its snippet from `text` (the section's, or AI Search's chunk of it). */
function hit(s: Section, text: string, terms: string[]): Hit {
  // Prose reads better than a command flattened onto a line: code only when the prose has
  // none of the query's words, or there is no prose.
  let shown = snippet(plainText(text, false), terms);
  if (shown.length === 1) {
    const withCode = snippet(plainText(text), terms);
    if (withCode.length > 1 || !shown[0]?.replace("…", "")) shown = withCode;
  }
  return { url: s.url, page: s.page, trail: s.trail, title: s.title, snippet: shown };
}

/** The query's words matched in the sections. */
function byWords(index: Index, query: string, notice?: Notice): Results {
  const terms = queryTerms(query);
  const hits = searchWords(index.words(), query, MAX_HITS).map((s) => hit(s, s.text, terms));
  return { query, mode: "words", hits, ...(notice ? { notice, message: NOTICES[notice] } : {}) };
}

/** AI Search's results: its chunks' sections, each once, at its best chunk. */
async function full(env: SearchEnv, index: Index, query: string): Promise<Hit[]> {
  if (!env.DOCS_SEARCH) throw new Error("no DOCS_SEARCH binding");
  const res = await env.DOCS_SEARCH.search({
    query,
    ai_search_options: { retrieval: { max_num_results: 24 } },
  });
  const terms = queryTerms(query);
  const best = new Map<string, { section: Section; score: number; text: string }>();
  for (const chunk of res.chunks) {
    const hash = /\.([0-9a-f]{12})\.md$/.exec(chunk.item.key)?.[1];
    const section = hash ? index.byHash.get(hash) : undefined;
    // A section the docs no longer have (a deploy's sync hasn't removed it yet).
    if (!section) continue;
    const seen = best.get(section.url);
    if (!seen || chunk.score > seen.score)
      best.set(section.url, { section, score: chunk.score, text: chunk.text });
  }
  return [...best.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HITS)
    .map((b) => hit(b.section, b.text, terms));
}

/** Whether `visitor` may make a full search now: "ok", or the notice for why not. */
async function allowed(env: SearchEnv, who: string): Promise<"ok" | Notice> {
  if (!env.SEARCH_LIMITER || !env.SEARCH_BUDGET) return "unavailable";
  const { success } = await env.SEARCH_LIMITER.limit({ key: who });
  if (!success) return "minute";
  const budget = env.SEARCH_BUDGET.get(env.SEARCH_BUDGET.idFromName("fctl.sh"));
  const res = await budget.fetch("https://budget/take", { method: "POST", body: who });
  const { verdict } = (await res.json()) as { verdict?: string };
  if (verdict === "ok") return "ok";
  return verdict === "visitor" ? "visitor" : "budget";
}

const cacheKey = (version: string, query: string) =>
  new Request(`https://fctl.sh/api/search/cache?v=${version}&q=${encodeURIComponent(query.toLowerCase())}`);

/** Cloudflare's cache in this location, where there is one (not in tests). */
const cache = (): Cache | undefined => (globalThis as { caches?: { default?: Cache } }).caches?.default;

/** Searches the docs for `query`, as `who` (`visitor`). */
export async function search(
  env: SearchEnv,
  query: string,
  who: string,
  ctx?: { waitUntil(p: Promise<unknown>): void },
): Promise<Results> {
  if (query.length < 2) return { query, mode: "full", hits: [] };
  const index = await load(env);
  const key = cacheKey(index.version, query);
  const cached = await cache()?.match(key);
  if (cached) return { ...((await cached.json()) as Results), query };

  let verdict: "ok" | Notice;
  try {
    verdict = env.DOCS_SEARCH ? await allowed(env, who) : "unavailable";
  } catch (e) {
    console.error("search: the limits failed", e);
    verdict = "unavailable";
  }
  if (verdict !== "ok") return byWords(index, query, verdict);

  let hits: Hit[];
  try {
    hits = await full(env, index, query);
  } catch (e) {
    console.error("search: AI Search failed", e);
    return byWords(index, query, "unavailable");
  }
  // AI Search found nothing it was sure enough of: the words may still be there.
  const results: Results = hits.length ? { query, mode: "full", hits } : byWords(index, query);
  const stored = new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json", "cache-control": `public, max-age=${CACHE_TTL}` },
  });
  const put = cache()?.put(key, stored);
  if (put) ctx?.waitUntil(put.catch(() => {}));
  return results;
}

const SECURITY = {
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex",
};

/** GET /api/search?q=: `Results` as JSON. */
export async function searchApi(
  req: Request,
  env: SearchEnv,
  ctx?: { waitUntil(p: Promise<unknown>): void },
): Promise<Response> {
  if (req.method !== "GET") {
    return new Response("Method not allowed\n", { status: 405, headers: { allow: "GET" } });
  }
  const query = normalize(new URL(req.url).searchParams.get("q"));
  const results = await search(env, query, visitor(req.headers.get("cf-connecting-ip")), ctx);
  return new Response(JSON.stringify(results), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Results that match words only because of a limit shouldn't outlast it.
      "cache-control": results.notice ? "no-store" : "private, max-age=600",
      ...SECURITY,
    },
  });
}

// ───────────────────────────── the page ─────────────────────────────

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

/** Why results match words only, in a sentence (`Results.message`, which the dialog shows too). */
export const NOTICES: Record<Notice, string> = {
  minute:
    "You've searched a lot in the last minute, so these results match words only. Full search is back within a minute.",
  visitor: "You've used today's full searches, so these results match words only until midnight UTC.",
  budget: "fctl.sh has used today's full searches, so these results match words only until midnight UTC.",
  unavailable: "Full search isn't answering right now, so these results match words only.",
};

/** Searches to try, on the page before a search. */
export const SUGGESTIONS = [
  "Run agents on my own machine",
  "Start a session from the CLI",
  "Review pull requests",
  "Host the control plane myself",
  "Access tokens for scripts",
];

const ICON_PAGE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5z"/><path d="M14 3.5V8h4M9 12.5h6M9 16h4"/></svg>';
const ICON_SECTION =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 4 8 20M16 4l-1.5 16M4.5 9h15M4 15h15"/></svg>';
const ICON_INFO =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/></svg>';
const ICON_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';

const marked = (segments: string[]) =>
  segments.map((s, i) => (i % 2 ? `<mark>${esc(s)}</mark>` : esc(s))).join("");

/** A result as the page lists it (the dialog builds the same, src/search-dialog.ts). */
export function hitHtml(h: Hit): string {
  const where = [h.page, ...h.trail].filter((p) => p !== h.title).join(" › ");
  const icon = h.url.includes("#") ? ICON_SECTION : ICON_PAGE;
  return `<li><a class="sr-hit" href="${esc(h.url)}"><span class="sr-icon">${icon}</span><span class="sr-body"><span class="sr-title">${esc(h.title)}</span>${where ? `<span class="sr-where">${esc(where)}</span>` : ""}<span class="sr-snippet">${marked(h.snippet)}</span></span><span class="sr-go">${ICON_ARROW}</span></a></li>`;
}

/** What goes under the page's search field. */
export function resultsHtml(r: Results): string {
  if (!r.query) {
    const tries = SUGGESTIONS.map(
      (s) => `<li><a href="/docs/search/?q=${encodeURIComponent(s)}">${esc(s)}</a></li>`,
    ).join("");
    return `<div class="sr-start"><p>Search every page of fctl's docs. Describe what you want to do, or type a command, a setting or an error.</p><p class="sr-try-label">Try</p><ul class="sr-try">${tries}</ul></div>`;
  }
  const notice = r.notice
    ? `<p class="sr-notice" role="status">${ICON_INFO}${esc(NOTICES[r.notice])}</p>`
    : "";
  if (!r.hits.length) {
    return `${notice}<div class="sr-empty"><p class="sr-empty-title">No results for “${esc(r.query)}”</p><p>Try other words, or fewer of them. You can also <a href="/docs/">browse the docs</a>.</p></div>`;
  }
  const count = `${r.hits.length} ${r.hits.length === 1 ? "result" : "results"}`;
  const how = r.mode === "full" ? "matching meaning and words" : "matching words";
  return `${notice}<p class="sr-count">${count}, ${how}</p><ol class="sr-list">${r.hits.map(hitHtml).join("")}</ol>`;
}

/** /docs/search/?q=: the search page (dist/docs/search/index.html) with the results in it. */
export async function searchPage(
  req: Request,
  env: SearchEnv,
  ctx?: { waitUntil(p: Promise<unknown>): void },
): Promise<Response> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed\n", { status: 405, headers: { allow: "GET, HEAD" } });
  }
  const url = new URL(req.url);
  const query = normalize(url.searchParams.get("q"));
  const template = await env.ASSETS.fetch(new Request(new URL("/docs/search/", url)));
  if (!template.ok) return template;
  // A HEAD asks for no results, so it gets the page without searching.
  const results =
    query && req.method === "GET"
      ? await search(env, query, visitor(req.headers.get("cf-connecting-ip")), ctx)
      : ({ query, mode: "full", hits: [] } satisfies Results);
  const page = (await template.text())
    .replace(/<title>[^<]*<\/title>/, (t) =>
      query ? `<title>${esc(query)} · Search the docs · fctl</title>` : t,
    )
    .replace('name="q" value=""', () => `name="q" value="${esc(query)}"`)
    .replace("<!--RESULTS-->", () => resultsHtml(results));
  const headers = new Headers(template.headers);
  headers.set("cache-control", query ? "private, no-store" : "public, max-age=300");
  for (const [k, v] of Object.entries(SECURITY)) headers.set(k, v);
  headers.delete("content-length");
  headers.delete("etag");
  return new Response(req.method === "HEAD" ? null : page, { status: 200, headers });
}
