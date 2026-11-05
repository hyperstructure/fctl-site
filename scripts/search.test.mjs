// Search over the docs: the sections the build writes (scripts/search-index.mjs),
// words and snippets (worker/text.ts, worker/words.ts), the daily budget
// (worker/budget.ts), the Worker's answers (worker/search.ts) and the dialog's
// instant matches (src/search-match.ts).
import assert from "node:assert/strict";
import { test } from "node:test";
import { matchTitles } from "../src/search-match.ts";
import { take } from "../worker/budget.ts";
import worker from "../worker/index.ts";
import { normalize, visitor } from "../worker/search.ts";
import { plainText, queryTerms, snippet, stem } from "../worker/text.ts";
import { searchWords, wordIndex } from "../worker/words.ts";
import { markdown } from "./markdown.mjs";
import { document } from "./search-document.mjs";
import { clean, itemKey, keyHash, sections, sectionsFile, titlesFile } from "./search-index.mjs";
import { plan, sync } from "./search-sync.mjs";

// ───────────────────────────── the build ─────────────────────────────

const SOURCE = `# The CLI

\`fctl\` does everything the web app does. See [the API](api.md#tokens).

## Runners

Runners are machines that run sessions.

### Enrollment tokens

\`\`\`sh
fctl runners enrollment-tokens create "Build fleet"
\`\`\`

#### Expiry

Tokens expire after 30 days.

## Runners

A second heading with the same name.
`;

test("a page splits at its h2s and h3s, with the ids its headings have", async () => {
  const render = await markdown();
  const page = { slug: "cli", file: "docs/cli.md", nav: "The CLI" };
  const rendered = await render(SOURCE);
  const found = sections(SOURCE, page, rendered);
  assert.deepEqual(
    found.map((s) => [s.url, s.trail, s.title]),
    [
      ["/docs/cli/", [], "The CLI"],
      ["/docs/cli/#runners", [], "Runners"],
      ["/docs/cli/#enrollment-tokens", ["Runners"], "Enrollment tokens"],
      ["/docs/cli/#runners-1", [], "Runners"],
    ],
  );
  assert.equal(found[0].text, "`fctl` does everything the web app does. See the API.");
  assert.equal(found[0].description, "fctl does everything the web app does. See the API.");
  // An h4 stays in its h3's section.
  assert.match(found[2].text, /#### Expiry\n\nTokens expire after 30 days\.$/);
  assert.match(found[2].text, /^```sh\nfctl runners enrollment-tokens create "Build fleet"\n```/);
});

test("links become their text, but not in code", () => {
  assert.equal(clean("See [the API](api.md) and ![x](a.png)."), "See the API and .");
  assert.equal(clean("`[a](b)` and [c](d)"), "`[a](b)` and c");
  assert.equal(clean("```\n[a](b)\n```"), "```\n[a](b)\n```");
  assert.equal(clean("a<!-- hidden -->b"), "ab");
});

test("a section's key is readable, short enough, and changes when it does", () => {
  const s = { url: "/docs/cli/#runners", page: "The CLI", trail: [], title: "Runners", text: "Machines." };
  const key = itemKey(s);
  assert.match(key, /^cli\.runners\.[0-9a-f]{12}\.md$/);
  assert.equal(keyHash(key), key.split(".")[2]);
  assert.notEqual(itemKey({ ...s, text: "Other machines." }), key);
  assert.match(itemKey({ ...s, url: "/docs/" }), /^index\.[0-9a-f]{12}\.md$/);
  const long = itemKey({ ...s, url: `/docs/cli/#${"a".repeat(300)}` });
  assert.ok(long.length <= 128, `${long.length} characters`);
  assert.equal(keyHash("notes.md"), undefined);
  assert.equal(document({ ...s, trail: ["Hosts"] }), "# The CLI › Hosts › Runners\n\nMachines.\n");
  assert.equal(document({ ...s, page: "Runners" }), "# Runners\n\nMachines.\n");
});

test("sections.json has the sections with text; titles.json all of them", () => {
  const all = [
    { url: "/docs/", page: "Overview", trail: [], title: "fctl", description: "It is.", text: "Intro." },
    { url: "/docs/#a", page: "Overview", trail: [], title: "A", text: "" },
    { url: "/docs/#b", page: "Overview", trail: ["A"], title: "B", text: "Bee." },
  ];
  const file = sectionsFile(all);
  assert.deepEqual(
    file.sections.map((s) => s.url),
    ["/docs/", "/docs/#b"],
  );
  assert.equal(file.sections[0].description, undefined);
  assert.match(file.version, /^[0-9a-f]{12}$/);
  assert.notEqual(sectionsFile([all[0]]).version, file.version);
  assert.deepEqual(titlesFile(all), [
    { url: "/docs/", page: "Overview", trail: [], title: "fctl", description: "It is." },
    { url: "/docs/#a", page: "Overview", trail: [], title: "A" },
    { url: "/docs/#b", page: "Overview", trail: ["A"], title: "B" },
  ]);
});

test("syncing uploads only new sections, then deletes what the docs no longer have", async () => {
  const sectionsNow = [
    { key: "a.111111111111.md" },
    { key: "b.222222222222.md" },
    { key: "c.333333333333.md" },
  ];
  const items = [
    { id: "1", key: "a.111111111111.md", status: "completed" },
    { id: "2", key: "b.000000000000.md", status: "completed" },
    { id: "3", key: "c.333333333333.md", status: "error" },
  ];
  const p = plan(items, sectionsNow);
  assert.deepEqual(
    p.upload.map((s) => s.key),
    ["b.222222222222.md", "c.333333333333.md"],
  );
  assert.deepEqual(
    p.remove.map((i) => i.id),
    ["2", "3"],
  );
  assert.equal(p.kept, 1);

  const full = [
    { key: "a.111111111111.md", url: "/docs/#a", page: "Overview", trail: [], title: "A", text: "Aa." },
    { key: "b.222222222222.md", url: "/docs/#b", page: "Overview", trail: [], title: "B", text: "Bb." },
    { key: "c.333333333333.md", url: "/docs/#c", page: "Overview", trail: [], title: "C", text: "Cc." },
  ];
  const calls = [];
  const call = async (path, init = {}) => {
    const method = init.method ?? "GET";
    if (method === "POST") {
      const file = init.body.get("file");
      calls.push(`POST ${file.name} ${await file.text()}`);
      return { success: true };
    }
    calls.push(`${method} ${path}`);
    if (path.includes("page=1")) {
      return { success: true, result: items.slice(0, 2), result_info: { total_count: 3 } };
    }
    if (path.includes("page=2"))
      return { success: true, result: items.slice(2), result_info: { total_count: 3 } };
    return { success: true };
  };
  await sync({ sections: full, call, log: () => {} });
  assert.deepEqual(calls, [
    "GET /items?source=builtin&per_page=50&page=1",
    "GET /items?source=builtin&per_page=50&page=2",
    "DELETE /items/3",
    "POST b.222222222222.md # Overview › B\n\nBb.\n",
    "POST c.333333333333.md # Overview › C\n\nCc.\n",
    "DELETE /items/2",
  ]);
  calls.length = 0;
  await sync({ sections: full, call, dryRun: true, log: () => {} });
  assert.deepEqual(calls, [
    "GET /items?source=builtin&per_page=50&page=1",
    "GET /items?source=builtin&per_page=50&page=2",
  ]);
});

// ───────────────────────────── words and snippets ─────────────────────────────

test("stems find plurals and -ing forms, the same way in queries and text", () => {
  assert.equal(stem("Runners"), "runner");
  assert.equal(stem("policies"), "policy");
  assert.equal(stem("processes"), "process");
  assert.equal(stem("uses"), "use");
  assert.equal(stem("access"), "access");
  assert.equal(stem("status"), "status");
  assert.equal(stem("running"), "run");
  assert.equal(stem("hosting"), "host");
  assert.equal(stem("installed"), "install");
  assert.deepEqual(queryTerms("How do I add my own runners?"), ["add", "own", "runner"]);
  assert.deepEqual(queryTerms("how to"), ["how", "to"]);
});

test("plain text drops Markdown, the indexed heading, and code unless asked", () => {
  const md =
    "# The CLI › Runners\n\n## Hosts\n\n- **Bold** and `code`\n\n```sh\nfctl runners\n```\n| a | b |\n|---|---|\n| 1 | 2 |";
  assert.equal(plainText(md, false), "Hosts Bold and code a · b 1 · 2");
  assert.equal(plainText(md), "Hosts Bold and code fctl runners a · b 1 · 2");
  assert.equal(plainText("snake_case and _emphasis_"), "snake_case and emphasis");
});

test("a snippet shows the part with the most of the query's words, marked", () => {
  const text = `${"Lorem ipsum dolor sit amet. ".repeat(12)}Runners join a workspace with an enrollment token, ${"and more words here ".repeat(12)}`;
  const parts = snippet(text, queryTerms("enrollment runners"));
  assert.equal(parts[0]?.startsWith("…"), true);
  assert.equal(parts.at(-1)?.endsWith("…"), true);
  assert.deepEqual(
    parts.filter((_, i) => i % 2),
    ["Runners", "enrollment"],
  );
  assert.ok(parts.join("").length <= 200);
  assert.deepEqual(snippet("Short text.", ["missing"]), ["Short text."]);
  // Cut after a sentence, it needs no ….
  assert.deepEqual(snippet(`Runners run. ${"Then more. ".repeat(30)}`, ["runner"], 24), [
    "",
    "Runners",
    " run. Then more.",
  ]);
  assert.deepEqual(snippet(`Runners run. ${"Then more. ".repeat(30)}`, ["runner"], 30), [
    "",
    "Runners",
    " run. Then more. Then…",
  ]);
});

const SECTIONS = sectionsFile([
  {
    url: "/docs/cli/#runners",
    page: "The CLI",
    trail: [],
    title: "Runners",
    text: "fctl runners lists the machines that run sessions.",
  },
  {
    url: "/docs/architecture/#draining",
    page: "Architecture",
    trail: ["Runners"],
    title: "Draining a host",
    text: "A draining runner takes no new sessions, and its sessions finish.",
  },
  {
    url: "/docs/self-hosting/",
    page: "Self-hosting",
    trail: [],
    title: "Self-hosting",
    text: "Host the control plane yourself, with Docker or on Cloudflare.",
  },
  {
    url: "/docs/security/#tokens",
    page: "Security",
    trail: [],
    title: "Access tokens",
    text: "Personal access tokens are for scripts. Enrollment tokens enroll runners.",
  },
]);

test("word search ranks a title above a mention, and every word above some", () => {
  const index = wordIndex(SECTIONS.sections);
  assert.deepEqual(
    searchWords(index, "runners", 4).map((s) => s.url),
    ["/docs/cli/#runners", "/docs/architecture/#draining", "/docs/security/#tokens"],
  );
  assert.equal(searchWords(index, "enroll runners", 1)[0]?.url, "/docs/security/#tokens");
  assert.equal(searchWords(index, "docker", 4)[0]?.url, "/docs/self-hosting/");
  assert.deepEqual(searchWords(index, "zebra", 4), []);
});

test("the dialog's instant matches put titles that start like the query first", () => {
  const entries = [
    { url: "/docs/architecture/#a", page: "Architecture", trail: ["Sessions"], title: "Draining a runner" },
    { url: "/docs/cli/#runners", page: "The CLI", trail: [], title: "Runners" },
    { url: "/docs/cli/", page: "The CLI", trail: [], title: "The CLI" },
    { url: "/docs/cli/#tokens", page: "The CLI", trail: ["Runners"], title: "Enrollment tokens" },
  ];
  const found = matchTitles(entries, "runner");
  assert.deepEqual(
    found.map((m) => m.entry.title),
    ["Runners", "Draining a runner"],
  );
  assert.deepEqual(found[0]?.ranges, [[0, 6]]);
  assert.deepEqual(found[1]?.ranges, [[11, 17]]);
  // Words in the page's or h2's name count when the title has the others.
  assert.deepEqual(
    matchTitles(entries, "runners tokens").map((m) => m.entry.title),
    ["Enrollment tokens"],
  );
  assert.deepEqual(matchTitles(entries, "  "), []);
});

// ───────────────────────────── the budget ─────────────────────────────

function memory() {
  const store = new Map();
  return {
    store,
    async get(keys) {
      return new Map(keys.filter((k) => store.has(k)).map((k) => [k, store.get(k)]));
    },
    async put(entries) {
      for (const [k, v] of Object.entries(entries)) store.set(k, v);
    },
    async deleteAll() {
      store.clear();
    },
  };
}

test("the budget caps a day's full searches, for everyone and for each visitor", async () => {
  const storage = memory();
  const env = { SEARCH_DAILY_BUDGET: "3", SEARCH_DAILY_PER_VISITOR: "2" };
  const day = new Date("2026-11-05T12:00:00Z");
  assert.equal(await take(storage, env, "198.51.100.1", day), "ok");
  assert.equal(await take(storage, env, "198.51.100.1", day), "ok");
  assert.equal(await take(storage, env, "198.51.100.1", day), "visitor");
  assert.equal(await take(storage, env, "198.51.100.2", day), "ok");
  assert.equal(await take(storage, env, "198.51.100.3", day), "budget");
  // Addresses aren't kept, only salted hashes of them.
  assert.ok(![...storage.store.keys()].some((k) => k.includes("198.51")));
  assert.equal(storage.store.get("total"), 3);
  // The next day starts over, with a new salt.
  const salt = storage.store.get("salt");
  assert.equal(await take(storage, env, "198.51.100.1", new Date("2026-11-06T00:00:01Z")), "ok");
  assert.equal(storage.store.get("total"), 1);
  assert.notEqual(storage.store.get("salt"), salt);
  assert.equal(storage.store.size, 4);
});

test("the budget's limits fall back to the defaults when unset or not numbers", async () => {
  const storage = memory();
  assert.equal(await take(storage, { SEARCH_DAILY_BUDGET: "lots" }, "a"), "ok");
  assert.equal(await take(memory(), { SEARCH_DAILY_BUDGET: "0" }, "a"), "budget");
});

// ───────────────────────────── the Worker ─────────────────────────────

test("visitors are IPv4 addresses, or IPv6 /64s", () => {
  assert.equal(visitor("203.0.113.9"), "203.0.113.9");
  assert.equal(visitor("::ffff:203.0.113.9"), "203.0.113.9");
  assert.equal(visitor("2001:db8:0:1:2:3:4:5"), "2001:db8:0:1::/64");
  assert.equal(visitor("2001:DB8::1"), "2001:db8:0:0::/64");
  assert.equal(visitor("2001:db8:aa:bb::"), "2001:db8:aa:bb::/64");
  assert.equal(visitor("::1"), "0:0:0:0::/64");
  assert.equal(visitor(null), "unknown");
  assert.equal(normalize("  a \n b  "), "a b");
  assert.equal(normalize("x".repeat(300)).length, 200);
  assert.equal(normalize(null), "");
});

const TEMPLATE = `<!doctype html><html lang="en"><head><title>Search the docs · fctl docs</title></head><body><form><input type="search" name="q" value="" /></form><div class="sr-results"><!--RESULTS--></div></body></html>`;

/** The Worker's bindings, recording what each was asked. */
function env({ limited = false, verdict = "ok", chunks, fail = false } = {}) {
  const calls = { ai: [], limit: [], budget: [] };
  return {
    calls,
    ASSETS: {
      async fetch(input) {
        const url = new URL(input instanceof Request ? input.url : input);
        if (url.pathname === "/docs/search/sections.json") return Response.json(SECTIONS);
        if (url.pathname === "/docs/search/") {
          return new Response(TEMPLATE, {
            headers: {
              "content-type": "text/html; charset=utf-8",
              "content-security-policy": "default-src 'self'",
            },
          });
        }
        return new Response("Not found", { status: 404 });
      },
    },
    RELEASES: { get: async () => null },
    DOCS_SEARCH: {
      async search(req) {
        calls.ai.push(req);
        if (fail) throw new Error("AI Search is down");
        const found = chunks ?? [
          {
            key: SECTIONS.sections[1].key,
            score: 0.81,
            text: "# Architecture › Draining\n\nA draining runner.",
          },
          { key: SECTIONS.sections[0].key, score: 0.74, text: "fctl runners lists the machines." },
          { key: SECTIONS.sections[1].key, score: 0.6, text: "Its sessions finish." },
          { key: "gone.000000000000.md", score: 0.99, text: "A section the docs no longer have." },
        ];
        return {
          search_query: req.query,
          chunks: found.map((c, i) => ({
            id: String(i),
            type: "text",
            score: c.score,
            text: c.text,
            item: { key: c.key },
          })),
        };
      },
    },
    SEARCH_LIMITER: {
      async limit({ key }) {
        calls.limit.push(key);
        return { success: !limited };
      },
    },
    SEARCH_BUDGET: {
      idFromName: (name) => name,
      get: () => ({
        async fetch(_url, init) {
          calls.budget.push(init.body);
          return Response.json({ verdict });
        },
      }),
    },
  };
}

const api = async (q, e, ip = "203.0.113.9") => {
  const res = await worker.fetch(
    new Request(`https://fctl.sh/api/search?q=${encodeURIComponent(q)}`, {
      headers: { "cf-connecting-ip": ip },
    }),
    e,
  );
  return { res, body: await res.json() };
};

test("a full search asks AI Search, and lists each section once, at its best chunk", async () => {
  const e = env();
  const { res, body } = await api("  how do runners   drain ", e);
  assert.equal(res.status, 200);
  assert.equal(body.mode, "full");
  assert.equal(body.query, "how do runners drain");
  assert.equal(body.notice, undefined);
  assert.deepEqual(
    body.hits.map((h) => h.url),
    ["/docs/architecture/#draining", "/docs/cli/#runners"],
  );
  assert.deepEqual(body.hits[0].trail, ["Runners"]);
  // The indexed heading isn't in the snippet; the query's words are marked.
  assert.deepEqual(body.hits[0].snippet, ["A ", "draining", " ", "runner", "."]);
  assert.deepEqual(e.calls.ai, [
    { query: "how do runners drain", ai_search_options: { retrieval: { max_num_results: 24 } } },
  ]);
  assert.deepEqual(e.calls.limit, ["203.0.113.9"]);
  assert.deepEqual(e.calls.budget, ["203.0.113.9"]);
  assert.equal(res.headers.get("cache-control"), "private, max-age=600");
  assert.equal(res.headers.get("x-robots-tag"), "noindex");
});

test("over the minute's limit, search matches words and doesn't ask the budget or AI Search", async () => {
  const e = env({ limited: true });
  const { res, body } = await api("runners", e, "2001:db8:0:7::42");
  assert.equal(body.mode, "words");
  assert.equal(body.notice, "minute");
  assert.match(body.message, /within a minute/);
  assert.equal(body.hits[0]?.url, "/docs/cli/#runners");
  assert.deepEqual(e.calls.limit, ["2001:db8:0:7::/64"]);
  assert.deepEqual(e.calls.budget, []);
  assert.deepEqual(e.calls.ai, []);
  assert.equal(res.headers.get("cache-control"), "no-store");
});

test("when the day's searches are spent, search matches words and says whose", async () => {
  for (const verdict of ["visitor", "budget"]) {
    const e = env({ verdict });
    const { body } = await api("runners", e);
    assert.equal(body.mode, "words");
    assert.equal(body.notice, verdict);
    assert.match(body.message, /midnight UTC/);
    assert.deepEqual(e.calls.ai, []);
  }
});

test("when AI Search fails, search matches words; when it finds nothing, too, without a notice", async () => {
  const failed = await api("docker", env({ fail: true }));
  assert.equal(failed.body.mode, "words");
  assert.equal(failed.body.notice, "unavailable");
  assert.equal(failed.body.hits[0]?.url, "/docs/self-hosting/");
  const nothing = await api("docker", env({ chunks: [] }));
  assert.equal(nothing.body.mode, "words");
  assert.equal(nothing.body.notice, undefined);
  assert.equal(nothing.body.hits[0]?.url, "/docs/self-hosting/");
});

test("a query under two characters searches nothing", async () => {
  const e = env();
  const { body } = await api(" r ", e);
  assert.deepEqual(body, { query: "r", mode: "full", hits: [] });
  assert.deepEqual(e.calls.limit, []);
  assert.deepEqual(e.calls.ai, []);
});

test("the same query, in any case, comes from the cache: no limits, no AI Search", async () => {
  const stored = new Map();
  globalThis.caches = {
    default: {
      async match(req) {
        return stored.get(req.url)?.clone();
      },
      async put(req, res) {
        stored.set(req.url, res);
      },
    },
  };
  try {
    const e = env();
    await api("Draining runners", e);
    await new Promise((r) => setTimeout(r, 0));
    const { body } = await api("draining RUNNERS", e);
    assert.equal(body.mode, "full");
    assert.equal(body.query, "draining RUNNERS");
    assert.equal(body.hits.length, 2);
    assert.equal(e.calls.ai.length, 1);
    assert.equal(e.calls.limit.length, 1);
    // Results that match words because of a limit aren't cached.
    const limited = env({ limited: true });
    await api("sessions finish", limited);
    await api("sessions finish", env());
    assert.equal([...stored.keys()].filter((k) => k.includes("sessions")).length, 1);
  } finally {
    delete globalThis.caches;
  }
});

test("the API takes GET only", async () => {
  const res = await worker.fetch(new Request("https://fctl.sh/api/search?q=x", { method: "POST" }), env());
  assert.equal(res.status, 405);
});

test("the search page shows results in the page, with the query escaped", async () => {
  const e = env();
  const res = await worker.fetch(
    new Request(`https://fctl.sh/docs/search/?q=${encodeURIComponent('<b>"runners"')}`),
    e,
  );
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<title>&lt;b&gt;&quot;runners&quot; · Search the docs · fctl<\/title>/);
  assert.match(html, /name="q" value="&lt;b&gt;&quot;runners&quot;"/);
  assert.match(html, /2 results, matching meaning and words/);
  assert.match(html, /<a class="sr-hit" href="\/docs\/architecture\/#draining">/);
  assert.match(html, /<mark>runner<\/mark>/);
  assert.equal(res.headers.get("content-security-policy"), "default-src 'self'");
  assert.equal(res.headers.get("cache-control"), "private, no-store");
});

test("the search page without a query suggests searches, and HEAD searches nothing", async () => {
  const e = env();
  const empty = await (await worker.fetch(new Request("https://fctl.sh/docs/search/"), e)).text();
  assert.match(empty, /<ul class="sr-try"><li><a href="\/docs\/search\/\?q=Run%20agents/);
  const head = await worker.fetch(
    new Request("https://fctl.sh/docs/search/?q=runners", { method: "HEAD" }),
    e,
  );
  assert.equal(head.status, 200);
  assert.deepEqual(e.calls.ai, []);
  const notice = await (
    await worker.fetch(new Request("https://fctl.sh/docs/search/?q=runners"), env({ limited: true }))
  ).text();
  assert.match(notice, /<p class="sr-notice" role="status"><svg[\s\S]*?<\/svg>You've searched a lot/);
  const none = await (
    await worker.fetch(new Request("https://fctl.sh/docs/search/?q=zebra"), env({ chunks: [] }))
  ).text();
  assert.match(none, /No results for “zebra”/);
});

test("/docs/search goes to /docs/search/, keeping the query", async () => {
  const res = await worker.fetch(new Request("https://fctl.sh/docs/search?q=a%20b"), env());
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "https://fctl.sh/docs/search/?q=a%20b");
});
