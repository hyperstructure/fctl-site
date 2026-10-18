import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

const page = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const require = createRequire(import.meta.url);

/** The favicon (also the mark in the nav) and the home screen icon, and where they are in @hyperstructure/design. */
const BRAND_ASSETS: Record<string, string> = {
  "favicon.svg": "assets/favicon.svg",
  "apple-touch-icon.png": "assets/icons/apple-touch-icon.png",
};

/** Serves and emits the favicon and icons from @hyperstructure/design (one source for the mark). */
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

export default defineConfig({
  plugins: [tailwindcss(), brandAssets()],
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
      },
    },
  },
  server: { port: 5174 },
});
