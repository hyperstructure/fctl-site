// What search engines and link previews read in every page, and the build's
// last step, which checks it in dist. Each page in the sitemap needs:
//
//   - a title and a description of its own, at most 60 and 160 characters
//     (longer ones are cut off in search results);
//   - a canonical link to its own address, and og:url the same;
//   - og:title, og:description, og:image and twitter:card summary_large_image,
//     with an image 1200 × 630 in dist (scripts/og.mjs renders them);
//   - a PNG favicon, square, at least 48 px and with sizes that say so: Google
//     Search takes no SVG one;
//   - structured data (JSON-LD) that parses, with breadcrumbs that lead to
//     pages of the site;
//   - one h1, and alternative text on every image.
//
// Links and images on the pages written here (the landing page and the
// feature pages; fctl checks its docs' own) must lead to something in dist,
// and links to a heading of a page to a heading it has.
//
// Problems that the docs' Markdown decides (their titles, descriptions,
// headings and images), which comes from fctl, are warnings: fctl's CI pins
// the docs on main, where a failed build would hold back the deploy.
// Everything else fails the build.

import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SITE } from "./pages.mjs";
import { pagePath } from "./sitemap.mjs";

/** Link previews' size: what X, LinkedIn, Slack and Facebook show large. */
export const CARD = { width: 1200, height: 630 };

/** The link preview image of the page at `path`, as a path on the site (scripts/og.mjs renders it). */
export const cardPath = (path) => `/og/${path === "/" ? "home" : path.replace(/^\/|\/$/g, "")}.png`;

/** Search results show about this much of a title and of a description. */
export const LIMITS = { title: 60, description: 160 };

/** The smallest favicon side, in pixels, that looks sharp in search results (Google's advice). */
export const FAVICON = 48;

/** Paths the Worker answers itself, not files in dist. */
const WORKER_PATHS = ["/install", "/releases/"];

/** A sentence long enough to describe a page on its own. */
const SENTENCE = 50;

/**
 * A description for search results from a page's first paragraph: on one line, and cut after
 * the last sentence that ends within `max` characters, or, when that would leave too little
 * (`SENTENCE`), at a word, with an ellipsis.
 */
export function summary(text, max = LIMITS.description) {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  let end = -1;
  for (const m of s.slice(0, max + 1).matchAll(/[.!?](?=\s)/g)) end = m.index;
  if (end + 1 >= SENTENCE) return s.slice(0, end + 1);
  const word = s.lastIndexOf(" ", max - 1);
  return `${s.slice(0, word > 0 ? word : max - 1).replace(/[\s,;:–—-]+$/, "")}…`;
}

/** JSON-LD breadcrumbs: `[name, path]` from the top. */
export function breadcrumbs(items) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE}${path}`,
    })),
  });
}

const decode = (s) =>
  s
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

/** The attributes of each `<tag …>` in `html`. */
function tags(html, tag) {
  const found = [];
  for (const m of html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, "gi"))) {
    const attrs = {};
    for (const a of m[1].matchAll(/([a-z:-]+)(?:\s*=\s*"([^"]*)")?/gi)) {
      attrs[a[1].toLowerCase()] = decode(a[2] ?? "");
    }
    found.push(attrs);
  }
  return found;
}

/** `<meta>` content by name or property. */
function metas(html) {
  const out = new Map();
  for (const m of tags(html, "meta")) {
    const key = m.name ?? m.property;
    if (key) out.set(key, m.content);
  }
  return out;
}

/** A PNG's size, from its header. */
export function pngSize(bytes) {
  const png = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (!png || bytes.length < 24) return undefined;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/** The file in dist that serves `path`, or undefined. */
function served(path, files) {
  if (path.endsWith("/"))
    return files.has(`${path.slice(1)}index.html`) ? `${path.slice(1)}index.html` : undefined;
  const p = path.slice(1);
  if (files.has(p)) return p;
  if (files.has(`${p}.html`)) return `${p}.html`;
  return undefined;
}

/**
 * Problems with the pages in dist. `files` maps each file in dist (relative path) to its
 * contents: a string for HTML, a Buffer for the rest. Returns `{ errors, warnings }`, each a list
 * of `file: problem` lines.
 */
export function audit(files) {
  const errors = [];
  const warnings = [];
  const pages = [...files.keys()].filter((f) => pagePath(f)).sort();
  const urls = new Set(pages.map(pagePath));
  const seen = { title: new Map(), description: new Map() };
  const ids = (file) => new Set([...files.get(file).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

  for (const file of pages) {
    const html = files.get(file);
    const path = pagePath(file);
    const docs = path.startsWith("/docs/");
    const problem = (message, soft = false) => (soft ? warnings : errors).push(`${file}: ${message}`);
    const meta = metas(html);

    const titles = [...html.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => decode(m[1]).trim());
    const title = titles[0] ?? "";
    const description = meta.get("description") ?? "";
    if (titles.length !== 1 || !title) problem(`needs one <title>, has ${titles.length}`);
    if (!description) problem("has no meta description", docs);
    if (title.length > LIMITS.title)
      problem(`title is ${title.length} characters, over ${LIMITS.title}`, docs);
    if (description.length > LIMITS.description) {
      problem(`description is ${description.length} characters, over ${LIMITS.description}`, docs);
    }
    for (const [key, value] of [
      ["title", title],
      ["description", description],
    ]) {
      if (!value) continue;
      const other = seen[key].get(value);
      if (other) problem(`has the same ${key} as ${other}`, docs);
      else seen[key].set(value, file);
    }

    const url = `${SITE}${path}`;
    const canonical = tags(html, "link").filter((l) => l.rel === "canonical");
    if (canonical.length !== 1 || canonical[0]?.href !== url) {
      problem(`needs one canonical link to ${url}, has ${canonical.map((l) => l.href).join(", ") || "none"}`);
    }
    if (meta.get("og:url") !== url) problem(`og:url is ${meta.get("og:url") ?? "missing"}, not ${url}`);
    for (const key of ["og:title", "og:description", "og:type", "og:site_name", "og:image:alt"]) {
      if (!meta.get(key)) problem(`has no ${key}`, docs && key === "og:description");
    }
    if (meta.get("twitter:card") !== "summary_large_image") problem("needs twitter:card summary_large_image");
    if ((meta.get("robots") ?? "").includes("noindex")) problem("is in the sitemap but noindex");

    const image = meta.get("og:image") ?? "";
    if (!image.startsWith(`${SITE}/`)) problem(`og:image ${image || "(none)"} is not an image on ${SITE}`);
    else {
      const bytes = files.get(image.slice(SITE.length + 1));
      const size = bytes instanceof Buffer ? pngSize(bytes) : undefined;
      if (!bytes) problem(`og:image ${image} is not in dist (render it with scripts/og.mjs)`);
      else if (size?.width !== CARD.width || size?.height !== CARD.height) {
        problem(`og:image ${image} is not a ${CARD.width} × ${CARD.height} PNG`);
      }
      const w = Number(meta.get("og:image:width"));
      const h = Number(meta.get("og:image:height"));
      if (w !== CARD.width || h !== CARD.height) problem(`og:image:width and height say ${w} × ${h}`);
    }

    const favicons = tags(html, "link").filter((l) => l.rel === "icon" && l.type === "image/png");
    if (!favicons.length) problem("has no PNG favicon, which search results need (they take no SVG)");
    for (const { href, sizes } of favicons) {
      const bytes = files.get(href?.slice(1) ?? "");
      const size = bytes instanceof Buffer ? pngSize(bytes) : undefined;
      if (!size) problem(`favicon ${href} is not a PNG in dist`);
      else if (size.width !== size.height || size.width < FAVICON) {
        problem(`favicon ${href} is ${size.width} × ${size.height}, not a square of at least ${FAVICON} px`);
      } else if (sizes !== `${size.width}x${size.height}`) {
        problem(`favicon ${href} has sizes="${sizes ?? ""}", not ${size.width}x${size.height}`);
      }
    }

    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      let data;
      try {
        data = JSON.parse(m[1]);
      } catch (e) {
        problem(`structured data doesn't parse: ${e.message}`);
        continue;
      }
      const nodes = data["@graph"] ?? [data];
      for (const node of nodes) {
        if (node["@context"] !== "https://schema.org" && data["@context"] !== "https://schema.org") {
          problem(`structured data ${node["@type"]} has no schema.org context`);
        }
        if (node["@type"] !== "BreadcrumbList") continue;
        const items = node.itemListElement ?? [];
        items.forEach((item, i) => {
          const to = (item.item ?? "").startsWith(SITE) ? item.item.slice(SITE.length) : undefined;
          if (item.position !== i + 1 || !item.name)
            problem(`breadcrumb ${i + 1} needs a position and a name`);
          if (!to || !urls.has(to)) problem(`breadcrumb ${item.name} leads to ${item.item}, not a page`);
        });
        if (items.at(-1)?.item !== url) problem("the last breadcrumb isn't the page itself");
      }
    }

    if (!html.includes('<html lang="en"')) problem("has no lang on <html>");
    const h1s = (html.match(/<h1\b/g) ?? []).length;
    if (h1s !== 1) problem(`has ${h1s} h1 headings, not one`, docs);
    for (const img of tags(html, "img")) {
      if (!("alt" in img)) problem(`image ${img.src} has no alt text`, docs);
    }

    // Links on the pages written here; fctl checks its docs' links itself.
    if (docs) continue;
    const targets = [
      ...tags(html, "a").map((a) => a.href),
      ...tags(html, "img").map((i) => i.src),
      ...tags(html, "link").map((l) => l.href),
      ...tags(html, "script").map((s) => s.src),
    ];
    for (const target of new Set(targets)) {
      if (!target?.startsWith("/") || target.startsWith("//")) continue;
      const [rest, hash] = target.split("#");
      const to = rest.split("?")[0] || path;
      if (WORKER_PATHS.some((w) => to === w || (w.endsWith("/") && to.startsWith(w)))) continue;
      const file = served(to, files);
      if (!file) {
        const page = urls.has(`${to}/`) ? `, which redirects to ${to}/` : "";
        problem(`links to ${target}${page || ", which isn't in dist"}`);
      } else if (hash && file.endsWith(".html") && !ids(file).has(hash)) {
        problem(`links to ${target}, a heading ${to} doesn't have`, served(to, files)?.startsWith("docs/"));
      }
    }
  }
  return { errors, warnings };
}

async function main() {
  const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
  const entries = await readdir(dist, { recursive: true, withFileTypes: true });
  const files = new Map();
  for (const e of entries.filter((e) => e.isFile())) {
    const file = relative(dist, join(e.parentPath, e.name)).replaceAll("\\", "/");
    const bytes = await readFile(join(dist, file));
    files.set(file, file.endsWith(".html") ? bytes.toString("utf8") : bytes);
  }
  const { errors, warnings } = audit(files);
  for (const w of warnings) console.warn(`warning: ${w}`);
  for (const e of errors) console.error(`error: ${e}`);
  if (errors.length) {
    console.error(`scripts/seo.mjs: ${errors.length} problems with the pages' metadata or links (above)`);
    process.exit(1);
  }
  const count = [...files.keys()].filter((f) => pagePath(f)).length;
  console.log(
    `checked ${count} pages' metadata and links${warnings.length ? `, ${warnings.length} warnings` : ""}`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
