// Renders the legal pages (legal/*.md) into dist/<slug>.html, served at
// https://fctl.sh/<slug>, using dist/legal.html (built by Vite) as the
// template. Each page starts with front matter:
//
//   ---
//   updated: 2026-10-17        shown as "Last updated October 17, 2026"
//   description: …             the meta description
//   ---

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { esc, frontMatter, markdown } from "./markdown.mjs";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(site, "dist");

const PAGES = [
  { slug: "privacy", file: "legal/privacy.md", nav: "Privacy policy" },
  { slug: "terms", file: "legal/terms.md", nav: "Terms of service" },
];

function longDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) throw new Error(`not a date: ${iso}`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

async function main() {
  const template = await readFile(join(dist, "legal.html"), "utf8");
  const render = await markdown();
  for (const page of PAGES) {
    const { meta, body } = frontMatter(await readFile(join(site, page.file), "utf8"));
    if (!meta.updated || !meta.description)
      throw new Error(`${page.file}: front matter needs updated and description`);
    const updated = `<p class="doc-meta">Last updated <time datetime="${esc(meta.updated)}">${longDate(meta.updated)}</time></p>\n`;
    const { title, html } = await render(body, { afterTitle: updated });
    const nav = PAGES.map((p) => {
      const current = p === page ? ' aria-current="page"' : "";
      return `<a href="/${p.slug}"${current}>${esc(p.nav)}</a>`;
    }).join("");
    const out = template
      .replace("<!--TITLE-->", esc(title || page.nav))
      .replace("<!--DESCRIPTION-->", esc(meta.description))
      .replace("<!--NAV-->", nav)
      .replace("<!--DOC-->", html);
    await mkdir(dist, { recursive: true });
    await writeFile(join(dist, `${page.slug}.html`), out);
  }
  await rm(join(dist, "legal.html"));
  console.log(`rendered ${PAGES.length} legal pages`);
}

await main();
