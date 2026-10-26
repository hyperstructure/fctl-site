// Renders fctl's docs (docs/*.md in hyperstructure/fctl) into
// dist/docs/<slug>/index.html, using dist/docs.html (built by Vite, so it
// links the hashed CSS and JS) as the template. Code is highlighted at build
// time; pages ship no Markdown parser. For agents (https://llmstxt.org), it
// also writes each page's Markdown to dist/docs/<slug>.md, fctl's
// docs/llms.txt to dist/llms.txt, and both together to dist/llms-full.txt
// (scripts/pages.mjs).
//
// Where the docs come from:
//   FCTL_DOCS_DIR=<path to a checkout of fctl>   use it as is (local work, CI)
//   otherwise                                     fetch fctl at the ref in fctl-docs.ref
//                                                 (or FCTL_DOCS_REF) into .cache/fctl

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { esc, markdown } from "./markdown.mjs";
import { asMarkdown, llmsFull, markdownUrl, PAGES, pageUrl, REPO, rewriteHref, SITE } from "./pages.mjs";
import { breadcrumbs, cardPath, summary } from "./seo.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "..");
const dist = join(site, "dist");

/** A checkout of fctl (its root, which contains docs/). */
async function fctlRoot() {
  if (process.env.FCTL_DOCS_DIR) return resolve(process.env.FCTL_DOCS_DIR);
  const ref = (process.env.FCTL_DOCS_REF ?? (await readFile(join(site, "fctl-docs.ref"), "utf8"))).trim();
  const cache = join(site, ".cache", "fctl");
  const git = (...args) =>
    execFileSync("git", ["-C", cache, ...args], { stdio: ["ignore", "ignore", "inherit"] });
  if (!existsSync(join(cache, ".git"))) {
    await mkdir(cache, { recursive: true });
    git("init", "--quiet");
  }
  git("fetch", "--quiet", "--depth", "1", process.env.FCTL_REPO ?? `${REPO}.git`, ref);
  await rm(join(cache, "docs"), { recursive: true, force: true });
  git("checkout", "--quiet", "FETCH_HEAD", "--", "docs");
  const sha = execFileSync("git", ["-C", cache, "rev-parse", "FETCH_HEAD"], { encoding: "utf8" }).trim();
  console.log(`fctl docs at ${ref} (${sha.slice(0, 12)})`);
  return cache;
}

async function main() {
  const root = await fctlRoot();
  const template = await readFile(join(dist, "docs.html"), "utf8");
  const render = await markdown();

  const pages = [];
  for (const page of PAGES) {
    const source = await readFile(join(root, page.file), "utf8");
    const {
      title,
      description,
      html: body,
    } = await render(source, {
      href: (href) => rewriteHref(href, page.file),
    });
    const nav = PAGES.map((p) => {
      const current = p === page ? ' aria-current="page"' : "";
      return `<a href="${pageUrl(p)}"${current}>${esc(p.nav)}</a>`;
    }).join("");
    const heading = title || page.nav;
    // A page fctl added since scripts/og.mjs last ran shows the docs' own image until it does.
    let card = cardPath(pageUrl(page));
    if (!existsSync(join(dist, card))) {
      console.warn(
        `no ${card} for ${pageUrl(page)} yet: it shows /og/docs.png (render it with scripts/og.mjs)`,
      );
      card = cardPath("/docs/");
    }
    const crumbs = page.slug
      ? `<script type="application/ld+json">${breadcrumbs([
          ["Docs", "/docs/"],
          [page.nav, pageUrl(page)],
        ])}</script>`
      : "";
    // Functions, so that a `$&` or `$'` in a page isn't read as a replacement pattern.
    const html = template
      .replaceAll("<!--TITLE-->", () => esc(page.slug ? `${heading} · fctl docs` : heading))
      .replaceAll("<!--DESCRIPTION-->", () => esc(summary(description)))
      .replaceAll("<!--URL-->", () => `${SITE}${pageUrl(page)}`)
      .replace("<!--IMAGE-->", () => `${SITE}${card}`)
      .replace("<!--IMAGE_ALT-->", () => esc(page.slug ? `fctl docs: ${page.nav}` : "fctl docs"))
      .replace(
        "<!--MARKDOWN-->",
        () => `<link rel="alternate" type="text/markdown" href="${markdownUrl(page)}" />`,
      )
      .replace("<!--BREADCRUMBS-->", () => crumbs)
      .replace("<!--NAV-->", () => nav)
      .replace("<!--DOC-->", () => body)
      .replace("<!--SOURCE-->", () => `${REPO}/edit/main/${page.file}`);
    const dir = join(dist, "docs", page.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), html);
    const md = asMarkdown(source, page.file);
    await writeFile(join(dist, markdownUrl(page)), md);
    pages.push({ page, markdown: md });
  }
  await rm(join(dist, "docs.html"));
  const llms = await readFile(join(root, "docs/llms.txt"), "utf8");
  await writeFile(join(dist, "llms.txt"), llms);
  await writeFile(join(dist, "llms-full.txt"), llmsFull(llms, pages));
  console.log(`rendered ${PAGES.length} docs pages, their Markdown, llms.txt and llms-full.txt`);
}

await main();
