// The Worker's answers (worker/index.ts): redirects to a page's one address,
// and what it answers when something fails.
import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "../worker/index.ts";

const PAGE = "<!doctype html><title>Something broke · fctl</title>";

/** Assets that serve only the 5xx page (unless `broken`), and releases that always fail. */
function env({ broken = false } = {}) {
  return {
    ASSETS: {
      async fetch(input) {
        const url = new URL(input instanceof Request ? input.url : input);
        if (url.pathname === "/500" && !broken) {
          return new Response(PAGE, {
            headers: {
              "content-type": "text/html; charset=utf-8",
              "content-security-policy": "default-src 'self'",
            },
          });
        }
        throw new Error("assets unavailable");
      },
    },
    RELEASES: {
      async get() {
        throw new Error("KV unavailable");
      },
    },
  };
}
const browser = { accept: "text/html,application/xhtml+xml,*/*;q=0.8" };
const get = (path, headers = {}, e = env()) =>
  worker.fetch(new Request(`https://fctl.sh${path}`, { headers }), e);

test("a page that fails shows the 5xx page with status 500", async () => {
  const res = await get("/docs/", browser);
  assert.equal(res.status, 500);
  assert.equal(await res.text(), PAGE);
  assert.equal(res.headers.get("content-security-policy"), "default-src 'self'");
  assert.equal(res.headers.get("cache-control"), "no-store");
});

test("curl and scripts get text", async () => {
  const res = await get("/docs/", { accept: "*/*" });
  assert.equal(res.status, 500);
  assert.match(res.headers.get("content-type") ?? "", /^text\/plain/);
});

test("releases and the installer never get the page", async () => {
  for (const path of ["/releases/latest", "/install"]) {
    const res = await get(path, browser);
    assert.equal(res.status, 500, path);
    assert.match(res.headers.get("content-type") ?? "", /^text\/plain/, path);
  }
});

test("without the 5xx page, text", async () => {
  const res = await get("/", browser, env({ broken: true }));
  assert.equal(res.status, 500);
  assert.match(await res.text(), /couldn't answer/);
});

test("a malformed escape in a release address is not found, not an error", async () => {
  const res = await get("/releases/v1.0.0/%E0%A4%A", { accept: "*/*" });
  assert.equal(res.status, 404);
});

/** Assets that redirect /docs to /docs/, as html_handling "auto-trailing-slash" does, and serve the rest. */
const site = {
  ASSETS: {
    async fetch(input) {
      const url = new URL(input instanceof Request ? input.url : input);
      if (url.pathname === "/docs") {
        return new Response(null, {
          status: 307,
          headers: { location: "/docs/", "strict-transport-security": "max-age=63072000" },
        });
      }
      if (url.pathname === "/install.sh") return new Response("#!/bin/sh\n");
      return new Response(`page ${url.pathname}`, { headers: { "content-type": "text/html" } });
    },
  },
  RELEASES: { get: async () => null },
};
const at = (url) => worker.fetch(new Request(url), site);

test("plain HTTP redirects to HTTPS, permanently, keeping the path and query", async () => {
  for (const path of ["/", "/docs/getting-started/?from=x", "/install", "/releases/latest"]) {
    const res = await at(`http://fctl.sh${path}`);
    assert.equal(res.status, 301, path);
    assert.equal(res.headers.get("location"), `https://fctl.sh${path}`, path);
  }
});

test("www.fctl.sh redirects to https://fctl.sh in one step, from HTTP too", async () => {
  for (const origin of ["https://www.fctl.sh", "http://www.fctl.sh"]) {
    const res = await at(`${origin}/features/`);
    assert.equal(res.status, 301, origin);
    assert.equal(res.headers.get("location"), "https://fctl.sh/features/", origin);
  }
});

test("the assets' redirects to a page's address are permanent, and kept for a day", async () => {
  const res = await at("https://fctl.sh/docs");
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "/docs/");
  assert.equal(res.headers.get("cache-control"), "public, max-age=86400");
  assert.equal(res.headers.get("strict-transport-security"), "max-age=63072000");
  const page = await at("https://fctl.sh/docs/");
  assert.equal(page.status, 200);
});
