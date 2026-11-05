// Markdown rendering for the docs and legal pages (scripts/markdown.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import { contents, markdown } from "./markdown.mjs";

test("a page's contents nest its h3s under their h2s", async () => {
  const render = await markdown();
  const { headings } = await render(
    "# Title\n\n## One\n\n### One `a`\n\n### One b\n\n#### Deep\n\n## Two\n\n## [Three](x.md)\n\n### Three a\n",
  );
  assert.equal(
    contents(headings),
    '<ol><li><a href="#one">One</a><ol><li><a href="#one-a">One <code>a</code></a></li><li><a href="#one-b">One b</a></li></ol></li>' +
      '<li><a href="#two">Two</a></li>' +
      '<li><a href="#three">Three</a><ol><li><a href="#three-a">Three a</a></li></ol></li></ol>',
  );
});

test("an h3 before the first h2 stands at the top level", () => {
  const h = (depth, id) => ({ depth, id, html: id });
  assert.equal(
    contents([h(3, "a"), h(2, "b"), h(3, "c")]),
    '<ol><li><a href="#a">a</a></li><li><a href="#b">b</a><ol><li><a href="#c">c</a></li></ol></li></ol>',
  );
});

test("a page with fewer than two sections has no contents", () => {
  assert.equal(contents([]), "");
  assert.equal(contents([{ depth: 2, id: "a", html: "a" }]), "");
  assert.equal(
    contents([
      { depth: 4, id: "a", html: "a" },
      { depth: 2, id: "b", html: "b" },
    ]),
    "",
  );
});

test("headings with the same text get numbered ids, as on GitHub", async () => {
  const render = await markdown();
  const { html, headings } = await render("## A\n\n### Run\n\n## B\n\n### Run\n\n### Run\n");
  assert.deepEqual(
    headings.map((h) => h.id),
    ["a", "run", "b", "run-1", "run-2"],
  );
  assert.match(html, /<h3 id="run-1">/);
});
