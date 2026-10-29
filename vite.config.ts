import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

const page = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const require = createRequire(import.meta.url);

/**
 * The favicon (also the mark in the nav, and fctl-sh's avatar in the pages' GitHub threads), the home
 * screen icon, the mark at 512 px (app.fctl.sh's link preview image) and fctl-review's avatar (the
 * app review agents post as, in those threads), and where they are in @hyperstructure/design.
 * fctl.sh's own link previews are in public/og (scripts/og.mjs).
 */
const BRAND_ASSETS: Record<string, string> = {
  "favicon.svg": "assets/favicon.svg",
  "apple-touch-icon.png": "assets/icons/apple-touch-icon.png",
  "icon-512.png": "assets/icons/icon-512.png",
  "fctl-review.svg": "assets/fctl-review/avatar.svg",
};

/** Serves and emits the favicon, icons and avatars from @hyperstructure/design (one source for the marks). */
function brandAssets(): Plugin {
  const read = (file: string) =>
    readFileSync(require.resolve(`@hyperstructure/design/${BRAND_ASSETS[file]}`));
  return {
    name: "brand-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = req.url?.split("?")[0]?.slice(1) ?? "";
        if (!Object.hasOwn(BRAND_ASSETS, file)) return next();
        res.setHeader("content-type", file.endsWith(".svg") ? "image/svg+xml" : "image/png");
        res.end(read(file));
      });
    },
    generateBundle() {
      for (const file of Object.keys(BRAND_ASSETS)) {
        this.emitFile({ type: "asset", fileName: file, source: read(file) });
      }
    },
  };
}

/**
 * The parts pages share, from src/partials: `<!--site:nav-->` (`<!--site:nav solid-->` for a
 * header that sticks to the top, as on the docs), `<!--site:footer-->`, and the feature pages'
 * `<!--site:feature-end-->`.
 */
function partials(): Plugin {
  const read = (name: string) => readFileSync(page(`./src/partials/${name}.html`), "utf8").trimEnd();
  return {
    name: "partials",
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replace(/<!--site:(nav|footer|feature-end)( solid)?-->/g, (_, name: string, solid?: string) =>
          read(name).replace("{{solid}}", solid ? " solid" : ""),
        ),
    },
    configureServer(server) {
      server.watcher.add(page("./src/partials"));
      server.watcher.on("change", (file) => {
        if (file.includes("/src/partials/")) server.ws.send({ type: "full-reload" });
      });
    },
  };
}

/**
 * Preloads the fonts of each page's first screen, Inter's and JetBrains Mono's Latin files and,
 * under the feature pages' headings, Instrument Serif's, so that they arrive with the stylesheet
 * rather than once the page has been laid out, and text doesn't jump as they replace the fallback
 * it was drawn in. Not on the landing page: its first paint waits for more stylesheets and
 * scripts, and in Lighthouse's mobile runs any of the fonts held it back by about half a second.
 */
function preloadFonts(): Plugin {
  const fonts = [/^inter-latin-opsz-normal-/, /^jetbrains-mono-latin-wght-normal-/];
  const serif = [/^instrument-serif-latin-400-normal-/, /^instrument-serif-latin-400-italic-/];
  return {
    name: "preload-fonts",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (ctx.path === "/index.html") return [];
        const wanted = html.includes('class="f-title') ? [...fonts, ...serif] : fonts;
        const files = Object.keys(ctx.bundle ?? {}).filter((f) => {
          const name = f.split("/").pop() ?? "";
          return name.endsWith(".woff2") && wanted.some((re) => re.test(name));
        });
        return files.map((f) => ({
          tag: "link",
          attrs: { rel: "preload", href: `/${f}`, as: "font", type: "font/woff2", crossorigin: "" },
          injectTo: "head" as const,
        }));
      },
    },
  };
}

/** The feature pages: features/index.html and features/<slug>/index.html, served at /features/<slug>/. */
function featurePages(): Record<string, string> {
  const dir = page("./features");
  const entries: Record<string, string> = { features: `${dir}/index.html` };
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory()) entries[`feature-${d.name}`] = `${dir}/${d.name}/index.html`;
  }
  return entries;
}

export default defineConfig({
  plugins: [tailwindcss(), brandAssets(), partials(), preloadFonts()],
  build: {
    target: "es2023",
    // Fonts and images come from 'self' only (see public/_headers).
    assetsInlineLimit: 0,
    rollupOptions: {
      // docs.html and legal.html are the templates scripts/docs.mjs and
      // scripts/legal.mjs fill for every page of fctl's docs and legal/*.md.
      input: {
        index: page("./index.html"),
        docs: page("./docs.html"),
        legal: page("./legal.html"),
        notFound: page("./404.html"),
        serverError: page("./500.html"),
        ...featurePages(),
      },
    },
  },
  server: { port: 5174 },
});
