// fctl's docs as fctl.sh serves them, for people and agents (scripts/pages.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import { slugify } from "./markdown.mjs";
import { asMarkdown, llmsFull, markdownUrl, PAGES, rewriteHref } from "./pages.mjs";

test("links between docs stay on the site, and others go to GitHub", () => {
  assert.equal(rewriteHref("cli.md", "docs/automation.md"), "/docs/cli/");
  assert.equal(rewriteHref("architecture.md#follow-ups", "docs/cli.md"), "/docs/architecture/#follow-ups");
  assert.equal(rewriteHref("README.md", "docs/cli.md"), "/docs/");
  assert.equal(rewriteHref("#hosts", "docs/cli.md"), "#hosts");
  assert.equal(
    rewriteHref("adr/0026-the-control-plane-runs-without-cloudflare-on-workerd.md", "docs/architecture.md"),
    "https://github.com/hyperstructure/fctl/blob/main/docs/adr/0026-the-control-plane-runs-without-cloudflare-on-workerd.md",
  );
  assert.equal(
    rewriteHref("../crates/fctl-proto/src/api.rs", "docs/api.md"),
    "https://github.com/hyperstructure/fctl/blob/main/crates/fctl-proto/src/api.rs",
  );
  assert.equal(rewriteHref("https://llmstxt.org", "docs/cli.md"), "https://llmstxt.org");
});

test("links in the Markdown pages work from anywhere", () => {
  const md = (href, from = "docs/cli.md") => rewriteHref(href, from, { markdown: true });
  assert.equal(md("automation.md"), "https://fctl.sh/docs/automation.md");
  assert.equal(md("README.md"), "https://fctl.sh/docs/index.md");
  assert.equal(md("#hosts"), "https://fctl.sh/docs/cli.md#hosts");
  assert.equal(
    md("#words-used-in-these-docs", "docs/README.md"),
    "https://fctl.sh/docs/index.md#words-used-in-these-docs",
  );
  assert.equal(
    md("../deploy/standalone/compose.yaml", "docs/self-hosting.md"),
    "https://github.com/hyperstructure/fctl/blob/main/deploy/standalone/compose.yaml",
  );
  assert.equal(md("/privacy"), "https://fctl.sh/privacy");
});

test("a page's Markdown rewrites its links and leaves code alone", () => {
  const source = [
    "# The CLI",
    "",
    "See [Automation](automation.md) and `[not a link](x.md)`, or `fctl",
    "run` with [the API](api.md#events).",
    "",
    "```sh",
    "echo '[nor](this.md)'",
    "```",
    "",
    "A stray ` ends with its paragraph.",
    "",
    "[Hosts](#hosts)",
  ].join("\n");
  assert.equal(
    asMarkdown(source, "docs/cli.md"),
    [
      "# The CLI",
      "",
      "See [Automation](https://fctl.sh/docs/automation.md) and `[not a link](x.md)`, or `fctl",
      "run` with [the API](https://fctl.sh/docs/api.md#events).",
      "",
      "```sh",
      "echo '[nor](this.md)'",
      "```",
      "",
      "A stray ` ends with its paragraph.",
      "",
      "[Hosts](https://fctl.sh/docs/cli.md#hosts)",
    ].join("\n"),
  );
});

test("every page has its Markdown, and llms-full.txt has them all after llms.txt", () => {
  assert.equal(new Set(PAGES.map(markdownUrl)).size, PAGES.length);
  assert.equal(markdownUrl(PAGES[0]), "/docs/index.md");
  const full = llmsFull("# fctl\n\n> A software factory.\n", [
    { page: PAGES[0], markdown: "# fctl documentation\n" },
    { page: PAGES[2], markdown: "# The CLI\n\nText.\n" },
  ]);
  assert.equal(
    full,
    "# fctl\n\n> A software factory.\n\n---\n\nSource: https://fctl.sh/docs/index.md\n\n# fctl documentation\n\n" +
      "---\n\nSource: https://fctl.sh/docs/cli.md\n\n# The CLI\n\nText.\n",
  );
});

test("heading ids are GitHub's, which the docs link to", () => {
  assert.equal(slugify("Confirming it&#39;s you"), "confirming-its-you");
  assert.equal(slugify("Inside a session’s sandbox"), "inside-a-sessions-sandbox");
  assert.equal(slugify("Connect GitHub (optional, recommended)"), "connect-github-optional-recommended");
  assert.equal(slugify("5. Bring a machine online"), "5-bring-a-machine-online");
  assert.equal(slugify("<code>fctl ticket</code> in a sandbox"), "fctl-ticket-in-a-sandbox");
});
