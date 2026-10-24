// Writes dist/sitemap.xml, for Google Search Console and the like: every
// page in dist (the landing page, the docs, the legal pages), as the Worker
// serves them (html_handling "auto-trailing-slash": docs/x/index.html at
// /docs/x/, privacy.html at /privacy), and /llms.txt. Runs after
// scripts/docs.mjs and scripts/legal.mjs, which write their pages there.
// public/robots.txt names it.

import { readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ORIGIN = "https://fctl.sh";

/** Not pages people search for: the error pages. */
const SKIP = new Set(["404.html", "500.html"]);

/** Files that aren't HTML but belong in the sitemap. */
const EXTRA = ["/llms.txt"];

/** The URL path a file in dist is served at, or undefined if it isn't a page. */
export function pagePath(file) {
  const f = file.replaceAll("\\", "/");
  if (!f.endsWith(".html") || SKIP.has(f)) return undefined;
  if (f === "index.html") return "/";
  if (f.endsWith("/index.html")) return `/${f.slice(0, -"index.html".length)}`;
  return `/${f.slice(0, -".html".length)}`;
}

const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** sitemap.xml for the files in dist (paths relative to it). */
export function sitemap(files) {
  const paths = [...new Set([...files.map(pagePath).filter(Boolean), ...EXTRA])].sort();
  const urls = paths.map((p) => `  <url><loc>${esc(`${ORIGIN}${p}`)}</loc></url>\n`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>\n`;
}

async function main() {
  const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
  const entries = await readdir(dist, { recursive: true, withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => relative(dist, join(e.parentPath, e.name)));
  const xml = sitemap(files);
  await writeFile(join(dist, "sitemap.xml"), xml);
  console.log(`wrote sitemap.xml (${xml.split("<url>").length - 1} URLs)`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
