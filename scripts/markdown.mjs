// Markdown → HTML for the pages that scripts/docs.mjs and scripts/legal.mjs
// render into Vite-built templates. Code is highlighted at build time, so
// pages ship no Markdown parser or highlighter.

import { Marked } from "marked";
import { createHighlighter } from "shiki";

const LANGS = ["sh", "bash", "toml", "json", "rust", "ts", "tsx", "sql", "yaml", "text"];

/** A heading's id: as GitHub makes it for these headings, so that links to them work on both. */
export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&#39;|&apos;|['’]/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** HTML's text as plain text: tags dropped, and the entities marked writes decoded. */
export const plain = (html) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[e]);

/**
 * A renderer. `render(source, { href, afterTitle })` returns the page's title
 * (its h1) and first paragraph as plain text, for its head, and its HTML.
 * `href` maps link targets; `afterTitle` is HTML placed right after the h1.
 */
export async function markdown() {
  const highlighter = await createHighlighter({
    themes: ["github-dark-default", "github-light-default"],
    langs: LANGS,
  });
  return async function render(source, { href = (h) => h, afterTitle = "" } = {}) {
    let title = "";
    let description = "";
    const marked = new Marked({
      gfm: true,
      renderer: {
        heading({ tokens, depth }) {
          const text = this.parser.parseInline(tokens);
          if (depth === 1) {
            title = plain(text);
            return `<h1>${text}</h1>\n${afterTitle}`;
          }
          const id = slugify(text);
          return `<h${depth} id="${id}"><a href="#${id}" style="color:inherit;text-decoration:none">${text}</a></h${depth}>\n`;
        },
        paragraph({ tokens }) {
          const html = this.parser.parseInline(tokens);
          if (!description) description = plain(html);
          return `<p>${html}</p>\n`;
        },
        link({ href: target, title: t, tokens }) {
          const text = this.parser.parseInline(tokens);
          const url = href(target);
          const external = /^https?:/.test(url) && !url.startsWith("https://fctl.sh");
          return `<a href="${esc(url)}"${t ? ` title="${esc(t)}"` : ""}${external ? ' rel="noreferrer"' : ""}>${text}</a>`;
        },
        code({ text, lang }) {
          const l = (lang ?? "").split(/\s/)[0] || "text";
          const language = LANGS.includes(l) ? l : l === "console" || l === "shell" ? "sh" : "text";
          return highlighter.codeToHtml(text, {
            lang: language,
            themes: { dark: "github-dark-default", light: "github-light-default" },
            defaultColor: false,
          });
        },
      },
    });
    const html = await marked.parse(source);
    return { title, description, html };
  };
}

/** Splits `---`-fenced `key: value` front matter from a Markdown source. */
export function frontMatter(source) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!m) return { meta: {}, body: source };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: source.slice(m[0].length) };
}
