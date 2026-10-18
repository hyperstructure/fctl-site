// fctl.sh: static pages from the assets binding, plus two dynamic routes.
//
//   /install              the installer script (curl -fsSL https://fctl.sh/install | sh)
//   /releases/latest      the latest version, as text ("0.1.0")
//   /releases/v<x.y.z>/*  release archives and checksums, from the RELEASES KV namespace
//
// Unknown pages get 404.html (the assets' not_found_handling). When answering
// fails, a page request gets 500.html with status 500, anything else a line
// of text, instead of Cloudflare's error page.
//
// Releases are written by `cargo xtask publish` in hyperstructure/fctl, into
// the KV namespace bound here as RELEASES. They are immutable once published,
// so they cache for a year; `latest` for a minute.

interface Env {
  ASSETS: Fetcher;
  RELEASES: KVNamespace;
}

const RELEASE_KEY = /^(latest|v\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?\/[A-Za-z0-9][A-Za-z0-9._-]*)$/;

const TEXT_TYPES: Record<string, string> = {
  sha256: "text/plain; charset=utf-8",
  SHA256SUMS: "text/plain; charset=utf-8",
  json: "application/json; charset=utf-8",
};

function contentType(name: string): string {
  if (name.endsWith(".tar.gz")) return "application/gzip";
  const ext = name.includes(".") ? (name.split(".").pop() ?? "") : name;
  return TEXT_TYPES[ext] ?? "application/octet-stream";
}

async function release(req: Request, env: Env, path: string): Promise<Response> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed\n", { status: 405, headers: { allow: "GET, HEAD" } });
  }
  let key = "";
  try {
    key = decodeURIComponent(path.slice("/releases/".length));
  } catch {
    // A malformed escape (%E0%A4%A) names no release.
  }
  if (!RELEASE_KEY.test(key)) return new Response("Not found\n", { status: 404 });
  const latest = key === "latest";
  const value = await env.RELEASES.get(key, { type: "stream", cacheTtl: latest ? 60 : 86_400 });
  if (!value) return new Response("Not found\n", { status: 404 });
  const name = key.split("/").pop() ?? key;
  const type = latest ? "text/plain; charset=utf-8" : contentType(name);
  const headers = new Headers({
    "content-type": type,
    "cache-control": latest ? "public, max-age=60" : "public, max-age=31536000, immutable",
    "access-control-allow-origin": "*",
    "x-content-type-options": "nosniff",
  });
  if (type === "application/octet-stream" || type === "application/gzip") {
    headers.set("content-disposition", `attachment; filename="${name}"`);
  }
  if (req.method === "HEAD") {
    await value.cancel();
    return new Response(null, { headers });
  }
  return new Response(value, { headers });
}

/** What a failed request gets: the 5xx page for people's browsers, plain text for curl and scripts. */
async function failure(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const page =
    req.method === "GET" &&
    (req.headers.get("accept") ?? "").includes("text/html") &&
    !url.pathname.startsWith("/releases/") &&
    !url.pathname.startsWith("/install");
  if (page) {
    try {
      const asset = await env.ASSETS.fetch(new URL("/500", url));
      if (asset.ok) {
        const headers = new Headers(asset.headers);
        headers.set("cache-control", "no-store");
        return new Response(asset.body, { status: 500, headers });
      }
    } catch {
      // The assets failed too: plain text below.
    }
  }
  return new Response("fctl.sh couldn't answer this request. Try again in a minute.\n", {
    status: 500,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

async function handle(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4);
    return Response.redirect(url.toString(), 301);
  }
  if (url.pathname === "/install" || url.pathname === "/install.sh") {
    const script = await env.ASSETS.fetch(new URL("/install.sh", url));
    return new Response(script.body, {
      status: script.status,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
      },
    });
  }
  if (url.pathname.startsWith("/releases/")) return release(req, env, url.pathname);
  return env.ASSETS.fetch(req);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      return await handle(req, env);
    } catch (e) {
      console.error("fctl.sh: request failed", req.method, new URL(req.url).pathname, e);
      return failure(req, env);
    }
  },
} satisfies ExportedHandler<Env>;
