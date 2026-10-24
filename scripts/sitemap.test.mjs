// scripts/sitemap.mjs: which files are pages, and at which URLs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { pagePath, sitemap } from "./sitemap.mjs";

test("pages are at the URLs the Worker serves them at", () => {
  assert.equal(pagePath("index.html"), "/");
  assert.equal(pagePath("docs/index.html"), "/docs/");
  assert.equal(pagePath("docs/cli/index.html"), "/docs/cli/");
  assert.equal(pagePath("privacy.html"), "/privacy");
});

test("error pages, assets and other files are not pages", () => {
  assert.equal(pagePath("404.html"), undefined);
  assert.equal(pagePath("500.html"), undefined);
  assert.equal(pagePath("assets/site-abc123.css"), undefined);
  assert.equal(pagePath("install.sh"), undefined);
});

test("the sitemap lists the pages and llms.txt", () => {
  const xml = sitemap(["index.html", "404.html", "docs/cli/index.html", "terms.html", "favicon.svg"]);
  assert.equal(
    xml,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://fctl.sh/</loc></url>
  <url><loc>https://fctl.sh/docs/cli/</loc></url>
  <url><loc>https://fctl.sh/llms.txt</loc></url>
  <url><loc>https://fctl.sh/terms</loc></url>
</urlset>
`,
  );
});
