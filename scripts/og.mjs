// Renders fctl.sh's link previews (og:image), the image that X, LinkedIn,
// Slack and the like show with a link: each page's hero at 1200 × 630, its
// scene and heading without the rest, as a PNG in public/og/ at the page's
// path (/ → og/home.png, /features/sessions/ → og/features/sessions.png,
// /docs/cli/ → og/docs/cli.png). The docs, which have no hero, get the
// features overview's with their own heading. Pages name theirs in
// <meta property="og:image">, and scripts/seo.mjs fails the build when one
// is missing. Render them again after changing a page's heading or scene, or
// adding a page, and look at each before you commit it.
//
//   npm run dev                                   # the site at http://localhost:5174
//   cd ~/screenshots                              # where Playwright is installed (the screenshots skill)
//   node <site>/scripts/og.mjs [--only home,features/sessions,docs/cli] [--base URL]

import { mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PAGES, pageUrl } from "./pages.mjs";
import { CARD, cardPath } from "./seo.mjs";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const base = opt("--base", "http://localhost:5174");
const only = opt("--only", "").split(",").filter(Boolean);

/**
 * The docs' headings: the word each leans on in the brand's yellow, as the
 * feature pages' headings have one.
 */
const DOCS = {
  "": ["fctl", "docs."],
  "getting-started": ["Getting", "started."],
  cli: ["The", "CLI."],
  agents: ["fctl", "for agents."],
  api: ["The", "HTTP API."],
  automation: ["", "Automation."],
  "self-hosting": ["", "Self-hosting."],
  "sandbox-images": ["Sandbox", "images."],
  architecture: ["", "Architecture."],
  security: ["", "Security."],
  development: ["", "Development."],
};

/** Every card: the page it shows, and for the docs, the heading and crumb it shows instead. */
function cards() {
  const features = readdirSync(join(site, "features"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ path: `/features/${d.name}/`, from: `/features/${d.name}/` }));
  const docs = PAGES.map((page) => {
    const words = DOCS[page.slug];
    if (!words) throw new Error(`scripts/og.mjs: no heading for the docs page ${pageUrl(page)} in DOCS`);
    return { path: pageUrl(page), from: "/features/", heading: words, crumb: page.slug ? page.nav : "" };
  });
  return [{ path: "/", from: "/" }, { path: "/features/", from: "/features/" }, ...features, ...docs];
}

/**
 * The hero alone, where the page puts it: no nav links, buttons, screenshots or anything below,
 * and of the landing page's lede only its first sentence, what fctl is. Headings wrap on the
 * left, clear of the scene, and the small type (the brand, the crumb, the address) is larger,
 * for a preview a third of the card's size.
 */
const CSS = `
  html, body { overflow: hidden !important; }
  .skip, .nav nav, .lede:not(.og-first), .install-block, .works, .f-lede, .f-actions, .f-stage,
  .f-all, main > :not(.hero):not(.f-hero), .site-foot { display: none !important; }
  .hero, .f-hero, main > section.f-hero { height: ${CARD.height}px; min-height: 0; }
  .f-canvas, .f-shade { height: ${CARD.height}px; }
  .rise, .reveal { opacity: 1 !important; transform: none !important; animation: none !important; }
  .nav { padding-top: 34px; }
  .nav .brand { gap: 12px; font-size: 24px; }
  .nav .brand img { width: 34px; height: 34px; }
  .f-title { max-width: 7.6em; }
  .lede.og-first { margin-top: 34px; max-width: none; font-size: 30px; }
  .f-crumb { gap: 12px; font-size: 18px; }
  .f-crumb svg { width: 24px; height: 24px; }
  .og-url {
    position: absolute; left: var(--og-left); bottom: 40px; z-index: 30;
    font-family: var(--font-mono); font-size: 21px; letter-spacing: 0.01em; color: var(--c-ink-3);
  }
  .og-url b { color: var(--c-ink); font-weight: 500; }
`;

/** The docs' book, for their crumb. */
const BOOK =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5c2.6-1.3 5.1-1.3 7.5 0v14c-2.4-1.3-4.9-1.3-7.5 0zM12 5.5c2.4-1.3 4.9-1.3 7.5 0v14c-2.6-1.3-5.1-1.3-7.5 0z" /></svg>';

async function render(page, card) {
  await page.goto(`${base}${card.from}`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: CSS });
  await page.evaluate(
    ({ heading, crumb, book, path }) => {
      const h1 = document.querySelector("h1");
      if (!h1) throw new Error("no h1");
      if (heading) {
        const [plain, hot] = heading;
        h1.innerHTML = `${plain ? `${plain} ` : ""}<span class="hot">${hot}</span>`;
        const p = document.createElement("p");
        p.className = "f-crumb";
        p.innerHTML = crumb
          ? `${book}<span>Docs</span><span aria-hidden="true">/</span><span>${crumb}</span>`
          : `${book}<span>Docs</span>`;
        h1.before(p);
        h1.style.marginTop = "22px";
      }
      const lede = document.querySelector(".hero .lede");
      if (lede) {
        let cut = false;
        for (const node of [...lede.childNodes]) {
          if (cut) node.remove();
          else if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(". ")) {
            node.textContent = node.textContent.slice(0, node.textContent.indexOf(". ") + 1);
            cut = true;
          }
        }
        lede.classList.add("og-first");
      }
      const url = document.createElement("p");
      url.className = "og-url";
      const rest = path === "/" ? "" : path.replace(/\/$/, "");
      url.innerHTML = `<b>fctl.sh</b>${rest}`;
      document.body.append(url);
      document.documentElement.style.setProperty("--og-left", `${h1.getBoundingClientRect().left}px`);
    },
    { heading: card.heading, crumb: card.crumb, book: BOOK, path: card.path },
  );
  await page.evaluate(() => document.fonts.ready);
  // Long enough for the scene to draw its frame.
  await page.waitForTimeout(1200);
  const file = join(site, "public", cardPath(card.path));
  mkdirSync(dirname(file), { recursive: true });
  await page.screenshot({ path: file, clip: { x: 0, y: 0, ...CARD } });
  return file;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Playwright comes from where the script runs, not from the repository.
  const { chromium } = createRequire(join(process.cwd(), "noop.js"))("playwright");
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({
    viewport: CARD,
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  // The same frame of each scene on every run.
  await page.addInitScript(() => {
    let seed = 42;
    Math.random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
  });
  for (const card of cards()) {
    const name = cardPath(card.path).slice(1);
    if (only.length && !only.some((o) => name === `og/${o}.png`)) continue;
    console.log(await render(page, card));
  }
  await browser.close();
}
