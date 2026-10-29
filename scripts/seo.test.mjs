// scripts/seo.mjs: descriptions, link previews' paths, breadcrumbs, and the
// build's check of every page's metadata and links.
import assert from "node:assert/strict";
import { test } from "node:test";
import { audit, breadcrumbs, cardPath, pngSize, summary } from "./seo.mjs";

test("a short description stays whole, on one line", () => {
  assert.equal(
    summary("This guide takes you\nfrom nothing to   an agent."),
    "This guide takes you from nothing to an agent.",
  );
});

test("a long description ends with the last sentence that fits", () => {
  const text = `${"One sentence that says something. ".repeat(4)}And a last one that goes on past the limit.`;
  const s = summary(text);
  assert.ok(s.length <= 160, s);
  assert.equal(s, "One sentence that says something. ".repeat(4).trim());
});

test("a long first sentence is cut at a word, with an ellipsis", () => {
  const s = summary(`fctl ${"runs agents and ".repeat(20)}more.`);
  assert.ok(s.length <= 160, s);
  assert.match(s, /and…$|agents…$|runs…$/);
});

test("link previews are at the page's path", () => {
  assert.equal(cardPath("/"), "/og/home.png");
  assert.equal(cardPath("/features/"), "/og/features.png");
  assert.equal(cardPath("/features/sessions/"), "/og/features/sessions.png");
  assert.equal(cardPath("/docs/cli/"), "/og/docs/cli.png");
});

test("breadcrumbs number their items and give whole addresses", () => {
  assert.deepEqual(
    JSON.parse(
      breadcrumbs([
        ["Docs", "/docs/"],
        ["The CLI", "/docs/cli/"],
      ]),
    ),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Docs", item: "https://fctl.sh/docs/" },
        { "@type": "ListItem", position: 2, name: "The CLI", item: "https://fctl.sh/docs/cli/" },
      ],
    },
  );
});

/** A PNG's first bytes, enough for its size. */
function png(width, height) {
  const b = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12);
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  return b;
}

test("a PNG's size comes from its header", () => {
  assert.deepEqual(pngSize(png(1200, 630)), { width: 1200, height: 630 });
  assert.equal(pngSize(Buffer.from("not a png at all, not at all")), undefined);
});

/** A page at `path` with everything it needs, or what `o` changes. */
function page(path, o = {}) {
  const url = `https://fctl.sh${path}`;
  const {
    title = `Page ${path}`,
    description = `What is at ${path}.`,
    canonical = url,
    image = "https://fctl.sh/og/home.png",
    favicon = '<link rel="icon" href="/icon-maskable-512.png" type="image/png" sizes="512x512" />',
    head = "",
    body = "<h1>A page</h1>",
  } = o;
  return `<!doctype html>
<html lang="en">
  <head>
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="fctl" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="The page's heading" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    ${favicon}
    ${head}
  </head>
  <body>${body}</body>
</html>`;
}

/** dist with a landing page, a feature page, a docs page, the landing page's image and the favicons. */
function dist(changes = {}) {
  return new Map(
    Object.entries({
      "index.html": page("/", { body: '<h1>Home</h1><a href="/features/sessions/">Sessions</a>' }),
      "features/sessions/index.html": page("/features/sessions/"),
      "docs/cli/index.html": page("/docs/cli/", { body: '<h1>The CLI</h1><h2 id="run">Run</h2>' }),
      "og/home.png": png(1200, 630),
      "favicon.svg": Buffer.from("<svg/>"),
      "icon-maskable-512.png": png(512, 512),
      ...changes,
    }),
  );
}

test("pages with everything they need pass", () => {
  assert.deepEqual(audit(dist()), { errors: [], warnings: [] });
});

test("a missing or wrong canonical link fails", () => {
  const { errors } = audit(
    dist({
      "index.html": page("/", { canonical: "https://fctl.sh/index.html" }),
      "features/sessions/index.html": page("/features/sessions/", { canonical: "" }),
    }),
  );
  assert.equal(errors.length, 2, errors.join("\n"));
  assert.match(errors[0], /^features\/sessions\/index.html: needs one canonical link/);
  assert.match(
    errors[1],
    /^index.html: needs one canonical link to https:\/\/fctl.sh\/, has https:\/\/fctl.sh\/index.html/,
  );
});

test("a link preview that isn't there, or isn't 1200 × 630, fails", () => {
  const { errors } = audit(
    dist({
      "features/sessions/index.html": page("/features/sessions/", { image: "https://fctl.sh/og/gone.png" }),
      "og/home.png": png(512, 512),
    }),
  );
  assert.ok(
    errors.some((e) => /sessions.*og\/gone.png is not in dist/.test(e)),
    errors.join("\n"),
  );
  assert.ok(
    errors.some((e) => /^index.html: og:image .* is not a 1200 × 630 PNG/.test(e)),
    errors.join("\n"),
  );
});

test("a page without a square PNG favicon of 48 px or more, with its sizes, fails", () => {
  const svgOnly = audit(dist({ "index.html": page("/", { body: "<h1>Home</h1>", favicon: "" }) }));
  assert.deepEqual(svgOnly.errors, [
    "index.html: has no PNG favicon, which search results need (they take no SVG)",
  ]);
  const icon = (href, sizes) => `<link rel="icon" href="${href}" type="image/png" sizes="${sizes}" />`;
  const { errors } = audit(
    dist({
      "features/sessions/index.html": page("/features/sessions/", { favicon: icon("/icon-32.png", "32x32") }),
      "docs/cli/index.html": page("/docs/cli/", { favicon: icon("/favicon.svg", "any") }),
      "index.html": page("/", { body: "<h1>Home</h1>", favicon: icon("/icon-maskable-512.png", "192x192") }),
      "icon-32.png": png(32, 32),
    }),
  );
  assert.deepEqual(errors, [
    "docs/cli/index.html: favicon /favicon.svg is not a PNG in dist",
    "features/sessions/index.html: favicon /icon-32.png is 32 × 32, not a square of at least 48 px",
    'index.html: favicon /icon-maskable-512.png has sizes="192x192", not 512x512',
  ]);
});

test("two pages with one title fail", () => {
  const { errors } = audit(
    dist({ "features/sessions/index.html": page("/features/sessions/", { title: "Page /" }) }),
  );
  assert.deepEqual(errors, ["index.html: has the same title as features/sessions/index.html"]);
});

test("a title or description too long for search results fails, but only warns on the docs", () => {
  const long = "A title that goes on and on, well past what a search result shows";
  const { errors, warnings } = audit(
    dist({
      "features/sessions/index.html": page("/features/sessions/", { title: long }),
      "docs/cli/index.html": page("/docs/cli/", { title: `${long}, in the docs`, body: "<h1>The CLI</h1>" }),
    }),
  );
  assert.deepEqual(errors, ["features/sessions/index.html: title is 65 characters, over 60"]);
  assert.deepEqual(warnings, ["docs/cli/index.html: title is 78 characters, over 60"]);
});

test("structured data must parse, and breadcrumbs lead to pages", () => {
  const crumbs = (items) =>
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
    })}</script>`;
  const ok = audit(
    dist({
      "features/sessions/index.html": page("/features/sessions/", {
        head: crumbs([
          ["Home", "https://fctl.sh/"],
          ["Sessions", "https://fctl.sh/features/sessions/"],
        ]),
      }),
    }),
  );
  assert.deepEqual(ok.errors, []);
  const { errors } = audit(
    dist({
      "index.html": page("/", { head: '<script type="application/ld+json">{"@context": </script>' }),
      "features/sessions/index.html": page("/features/sessions/", {
        head: crumbs([
          ["Features", "https://fctl.sh/features/"],
          ["Sessions", "https://fctl.sh/features/sessions/"],
        ]),
      }),
    }),
  );
  assert.equal(errors.length, 2, errors.join("\n"));
  assert.match(errors[0], /sessions.*breadcrumb Features leads to https:\/\/fctl.sh\/features\/, not a page/);
  assert.match(errors[1], /^index.html: structured data doesn't parse/);
});

test("links lead to pages and files in dist, and headings that exist", () => {
  const body = `<h1>Home</h1>
    <a href="/features/sessions/">ok</a>
    <a href="/install">the Worker's</a>
    <a href="/docs/cli/#run">a heading</a>
    <a href="/features/sessions">no slash</a>
    <a href="/features/gone/">gone</a>
    <a href="/docs/cli/#walk">no such heading</a>
    <img src="/og/home.png" alt="" />
    <img src="/missing.webp" />`;
  const { errors, warnings } = audit(dist({ "index.html": page("/", { body }) }));
  assert.deepEqual(errors, [
    "index.html: image /missing.webp has no alt text",
    "index.html: links to /features/sessions, which redirects to /features/sessions/",
    "index.html: links to /features/gone/, which isn't in dist",
    "index.html: links to /missing.webp, which isn't in dist",
  ]);
  assert.deepEqual(warnings, ["index.html: links to /docs/cli/#walk, a heading /docs/cli/ doesn't have"]);
});

test("what the docs' Markdown decides only warns", () => {
  const { errors, warnings } = audit(
    dist({
      "docs/cli/index.html": page("/docs/cli/", {
        description: "",
        body: '<h1>The CLI</h1><h1>Again</h1><img src="/og/home.png" />',
      }),
    }),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, [
    "docs/cli/index.html: has no meta description",
    "docs/cli/index.html: has no og:description",
    "docs/cli/index.html: has 2 h1 headings, not one",
    "docs/cli/index.html: image /og/home.png has no alt text",
  ]);
});
