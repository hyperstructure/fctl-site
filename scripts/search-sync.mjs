// Brings the AI Search instance that fctl.sh searches (DOCS_SEARCH in
// wrangler.toml) up to date with the docs, in two steps around each deploy
// (.github/workflows/ci.yml):
//
//   before it, with --keep: uploads the sections of dist/docs/search/sections.json
//     the instance doesn't have, and deletes nothing, so that AI Search is
//     indexing them by the time the Worker that knows them goes live;
//   after it: uploads any still missing, then deletes the items the docs no
//     longer have, which the old Worker searched until then.
//
// The Worker skips results of sections it doesn't know, and caches no results
// that had any (worker/search.ts), so neither step leaves stale results behind.
//
// A section's key ends in a hash of what AI Search indexes for it
// (scripts/search-index.mjs), so the instance's own list of items is the
// record of what it has: an unchanged section is never uploaded, or indexed
// and billed, again. Run it again after a failure and it finishes the job.
//
//   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID   a token with AI Search Edit and Run
//   AI_SEARCH_INSTANCE                            the instance, fctl-docs unless set
//   node scripts/search-sync.mjs [--keep] [--dry-run]
//                                                --keep uploads only; --dry-run says what it would do

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { document } from "./search-document.mjs";

/** Requests at once: a few, well under the API's 1,200 per five minutes. */
const PARALLEL = 4;

/**
 * What to upload and what to delete: the sections the instance has no good copy of, and its
 * items that are no section's (or whose indexing failed, uploaded again).
 */
export function plan(items, sections) {
  const wanted = new Set(sections.map((s) => s.key));
  const good = new Set(items.filter((i) => i.status !== "error").map((i) => i.key));
  return {
    upload: sections.filter((s) => !good.has(s.key)),
    remove: items.filter((i) => !wanted.has(i.key) || i.status === "error"),
    kept: sections.length - sections.filter((s) => !good.has(s.key)).length,
  };
}

/** Runs `task` on each of `list`, `PARALLEL` at a time. */
async function each(list, task) {
  let next = 0;
  const worker = async () => {
    while (next < list.length) await task(list[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(PARALLEL, list.length) }, worker));
}

/** The Cloudflare API, retrying what it refuses for now (429, 5xx). */
function client({ token, account, instance, fetch: f = fetch }) {
  const base = `https://api.cloudflare.com/client/v4/accounts/${account}/ai-search/namespaces/default/instances/${instance}`;
  return async function call(path, init = {}) {
    for (let attempt = 1; ; attempt++) {
      const res = await f(`${base}${path}`, {
        ...init,
        headers: { authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
      });
      if ((res.status === 429 || res.status >= 500) && attempt < 4) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        const why = body.errors?.map((e) => e.message).join("; ") || res.statusText;
        throw new Error(`${init.method ?? "GET"} ${path}: ${res.status} ${why}`);
      }
      return body;
    }
  };
}

/** Every item the instance holds in its built-in storage. */
async function list(call) {
  const items = [];
  for (let page = 1; ; page++) {
    const body = await call(`/items?source=builtin&per_page=50&page=${page}`);
    const result = body.result ?? [];
    items.push(...result);
    const total = body.result_info?.total_count ?? items.length;
    if (!result.length || items.length >= total) return items;
  }
}

export async function sync({ sections, call, keep = false, dryRun = false, log = console.log }) {
  const items = await list(call);
  const planned = plan(items, sections);
  const { upload, kept } = planned;
  // With --keep, only broken copies go, to be uploaded again.
  const remove = keep ? planned.remove.filter((i) => i.status === "error") : planned.remove;
  log(
    `AI Search has ${items.length} items: ${kept} sections as they are, ${upload.length} to upload, ${remove.length} to delete`,
  );
  if (dryRun) {
    for (const s of upload) log(`  would upload ${s.key}`);
    for (const i of remove) log(`  would delete ${i.key}`);
    return { upload, remove };
  }
  // Errored copies go first, so that the new upload doesn't share a key with them.
  await each(
    remove.filter((i) => i.status === "error"),
    (i) => call(`/items/${encodeURIComponent(i.id)}`, { method: "DELETE" }),
  );
  await each(upload, async (s) => {
    const form = new FormData();
    form.append("file", new Blob([document(s)], { type: "text/markdown" }), s.key);
    await call("/items", { method: "POST", body: form });
  });
  // Then what the docs no longer have: until now, search could still find it.
  await each(
    remove.filter((i) => i.status !== "error"),
    (i) => call(`/items/${encodeURIComponent(i.id)}`, { method: "DELETE" }),
  );
  log(`uploaded ${upload.length}, deleted ${remove.length}`);
  return { upload, remove };
}

async function main() {
  const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account } = process.env;
  const instance = process.env.AI_SEARCH_INSTANCE || "fctl-docs";
  if (!token || !account) {
    console.error("scripts/search-sync.mjs needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID");
    process.exit(2);
  }
  const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
  const { sections } = JSON.parse(await readFile(join(dist, "docs/search/sections.json"), "utf8"));
  const call = client({ token, account, instance });
  const flags = process.argv.slice(2);
  await sync({ sections, call, keep: flags.includes("--keep"), dryRun: flags.includes("--dry-run") });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`scripts/search-sync.mjs: ${e.message}`);
    process.exit(1);
  });
}
