// The Worker's answers when something fails (worker/index.ts).
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
