import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

const page = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const require = createRequire(import.meta.url);

/** Serves and emits /favicon.svg from @hyperstructure/design (one source for the mark). */
function brandAssets(): Plugin {
  const favicon = () => readFileSync(require.resolve("@hyperstructure/design/assets/favicon.svg"));
  return {
    name: "brand-assets",
    configureServer(server) {
      server.middlewares.use("/favicon.svg", (_req, res) => {
        res.setHeader("content-type", "image/svg+xml");
        res.end(favicon());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "favicon.svg", source: favicon() });
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
      },
    },
  },
  server: { port: 5174 },
});
