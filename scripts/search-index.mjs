// fctl's docs as fctl.sh's search reads them. scripts/docs.mjs splits each
// page at its h2s and h3s into sections and writes, under dist/docs/search/:
//
//   sections.json  every section with text: where it is, its headings and its
//                  Markdown, and the key it has in the AI Search instance. The
//                  Worker (worker/search.ts) turns AI Search's results back
//                  into sections with it, and searches it for words when AI
//                  Search can't be asked.
//   titles.json    every page and section's title and address, small enough
//                  for browsers: the search dialog (src/search-dialog.ts)
//                  matches titles in it as people type.
//
// scripts/search-sync.mjs uploads the sections to AI Search after each deploy.

import { createHash } from "node:crypto";
import { Marked } from "marked";
import { plain } from "./markdown.mjs";
import { pageUrl } from "./pages.mjs";
import { document } from "./search-document.mjs";
import { summary } from "./seo.mjs";

const marked = new Marked({ gfm: true });

/** Longest readable part of an item's key: AI Search takes file names of up to 128 characters. */
const KEY_NAME = 100;

/**
 * Links as their text, and no images or HTML comments: what a link points to is noise to search,
 * and the section's own address goes with it. Code, fenced or inline, stays as it is.
 */
export function clean(markdown) {
  let fenced = false;
  return markdown
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((line) => {
      if (line.trimStart().startsWith("```")) {
        fenced = !fenced;
        return line;
      }
      if (fenced) return line;
      return line
        .split("`")
        .map((part, i) =>
          i % 2 ? part : part.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)\s]*\)/g, "$1"),
        )
        .join("`");
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * A page's sections, in order: its text before the first h2 (the page itself), then one for each
 * h2 and h3, running to the next of either; h4s and below stay in theirs. `rendered` is what
 * scripts/markdown.mjs's render gave for the page: its title, and its headings with the ids their
 * links go to. A section is `{ url, page, trail, title, text }`: `page` is its page's name in the
 * docs' navigation, `trail` the h2 an h3 is under, and `text` its Markdown, cleaned (`clean`). The
 * page's own has its `description` too, from its first paragraph.
 */
export function sections(source, page, rendered) {
  const url = pageUrl(page);
  const headings = rendered.headings;
  let next = 0;
  let h2 = "";
  let current = {
    url,
    page: page.nav,
    trail: [],
    title: rendered.title || page.nav,
    description: summary(rendered.description ?? ""),
    parts: [],
  };
  const out = [];
  const flush = () => {
    const { parts, ...section } = current;
    out.push({ ...section, text: clean(parts.join("")) });
  };
  for (const token of marked.lexer(source)) {
    if (token.type === "heading" && token.depth === 1) continue;
    if (token.type === "heading") {
      // The renderer saw headings in the same order, and nested ones (in a list, say) too: the
      // next one at this depth is this one.
      while (next < headings.length && headings[next].depth !== token.depth) next++;
      const heading = headings[next++];
      if (heading && token.depth <= 3) {
        flush();
        const title = plain(heading.html.replace(/<\/?a\b[^>]*>/g, ""));
        if (token.depth === 2) h2 = title;
        const trail = token.depth === 3 && h2 ? [h2] : [];
        current = { url: `${url}#${heading.id}`, page: page.nav, trail, title, parts: [] };
        continue;
      }
    }
    current.parts.push(token.raw);
  }
  flush();
  return out;
}

/**
 * A section's key in AI Search: readable (`cli.runners.…`), and ending in a hash of what it
 * indexes, so that a section changes key when it changes, and scripts/search-sync.mjs needs no
 * other record of what it uploaded. The Worker finds the section by that hash.
 */
export function itemKey(section) {
  const hash = createHash("sha256")
    .update(`${section.url}\n${document(section)}`)
    .digest("hex")
    .slice(0, 12);
  const [path, anchor] = section.url.split("#");
  const slug = path.replace(/^\/docs\/|\/$/g, "") || "index";
  return `${`${slug}${anchor ? `.${anchor}` : ""}`.slice(0, KEY_NAME)}.${hash}.md`;
}

/** The hash an item's key ends in (`itemKey`), or undefined for a key that isn't one. */
export const keyHash = (key) => /\.([0-9a-f]{12})\.md$/.exec(key)?.[1];

/**
 * sections.json: the sections that have text, with their keys, and a version that changes when
 * any of them does (the Worker's cache of results goes with it).
 */
export function sectionsFile(all) {
  const indexed = all.filter((s) => s.text).map(({ description: _, ...s }) => ({ key: itemKey(s), ...s }));
  const version = createHash("sha256")
    .update(indexed.map((s) => s.key).join("\n"))
    .digest("hex")
    .slice(0, 12);
  return { version, sections: indexed };
}

/** titles.json: every page and section, text or not, as `{ url, page, trail, title }`, and pages' descriptions. */
export const titlesFile = (all) =>
  all.map(({ url, page, trail, title, description }) => ({
    url,
    page,
    trail,
    title,
    ...(description ? { description } : {}),
  }));
