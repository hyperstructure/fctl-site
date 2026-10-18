// The 404 page's "Did you mean …?" (src/suggest.ts).
import assert from "node:assert/strict";
import { test } from "node:test";
import { distance, suggest } from "../src/suggest.ts";

const pages = [
  "/",
  "/docs/",
  "/docs/getting-started/",
  "/docs/cli/",
  "/docs/self-hosting/",
  "/docs/sandbox-images/",
  "/docs/architecture/",
  "/docs/security/",
  "/docs/development/",
  "/privacy",
  "/terms",
].map((href) => ({ href }));
const meant = (path) => suggest(path, pages)?.href ?? null;

test("distance counts edits", () => {
  assert.equal(distance("kitten", "sitting"), 3);
  assert.equal(distance("", "abc"), 3);
  assert.equal(distance("docs", "docs"), 0);
});

test("typos and missing hyphens find the page", () => {
  assert.equal(meant("/docs/selfhosting"), "/docs/self-hosting/");
  assert.equal(meant("/docs/getting-startd/"), "/docs/getting-started/");
  assert.equal(meant("/doc"), "/docs/");
  assert.equal(meant("/docs/Architecture"), "/docs/architecture/");
});

test("file names and missing prefixes find the page", () => {
  assert.equal(meant("/docs/cli.md"), "/docs/cli/");
  assert.equal(meant("/docs/security.html"), "/docs/security/");
  assert.equal(meant("/getting-started"), "/docs/getting-started/");
  assert.equal(meant("/privacy-policy"), "/privacy");
  assert.equal(meant("/terms-of-service"), "/terms");
  assert.equal(meant("/docs/sandbox_images"), "/docs/sandbox-images/");
});

test("addresses like no page suggest nothing", () => {
  assert.equal(meant("/blog"), null);
  assert.equal(meant("/pricing-for-cats"), null);
  assert.equal(meant("/"), null);
  assert.equal(meant("/%E0%A4%A"), null);
});
