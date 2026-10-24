// fctl's docs as fctl.sh serves them: which file of hyperstructure/fctl each
// page is, where links between them go, and each page as Markdown for agents
// (https://llmstxt.org): /docs/<page>.md, whose links work from anywhere, and
// /llms-full.txt, fctl's llms.txt followed by every page.

export const SITE = "https://fctl.sh";
export const REPO = "https://github.com/hyperstructure/fctl";

/** The docs, in navigation order. `slug` "" is /docs/. */
export const PAGES = [
  { slug: "", file: "docs/README.md", nav: "Overview" },
  { slug: "getting-started", file: "docs/getting-started.md", nav: "Getting started" },
  { slug: "cli", file: "docs/cli.md", nav: "The CLI" },
  { slug: "agents", file: "docs/agents.md", nav: "For agents" },
  { slug: "api", file: "docs/api.md", nav: "HTTP API" },
  { slug: "automation", file: "docs/automation.md", nav: "Automation" },
  { slug: "self-hosting", file: "docs/self-hosting.md", nav: "Self-hosting" },
  { slug: "sandbox-images", file: "docs/sandbox-images.md", nav: "Sandbox images" },
  { slug: "architecture", file: "docs/architecture.md", nav: "Architecture" },
  { slug: "security", file: "docs/security.md", nav: "Security" },
  { slug: "development", file: "docs/development.md", nav: "Development" },
];

/** A page's address. */
export const pageUrl = (page) => `/docs/${page.slug ? `${page.slug}/` : ""}`;

/** Where a page's Markdown is: /docs/<slug>.md, and /docs/index.md for the overview. */
export const markdownUrl = (page) => `/docs/${page.slug || "index"}.md`;

/** `a/b/../c` → `a/c`, for paths inside the repository. */
function normalize(path) {
  const parts = [];
  for (const part of path.split("/")) {
    if (part === "..") parts.pop();
    else if (part && part !== ".") parts.push(part);
  }
  return parts.join("/");
}

/**
 * Where a link in `fromFile` goes: to another page of the site, or to the
 * file on GitHub. With `markdown`, to the page's Markdown, as an absolute
 * URL, so that it works wherever the Markdown is read.
 */
export function rewriteHref(href, fromFile, { markdown = false } = {}) {
  if (/^[a-z]+:/i.test(href)) return href;
  if (href.startsWith("/")) return markdown ? `${SITE}${href}` : href;
  const [path, hash] = href.split("#");
  const anchor = hash ? `#${hash}` : "";
  // A heading of the same page.
  if (!path && !markdown) return anchor;
  const dir = fromFile.split("/").slice(0, -1).join("/");
  const resolved = path ? normalize(`${dir}/${path}`) : fromFile;
  const page = PAGES.find((p) => p.file === resolved);
  if (page) return markdown ? `${SITE}${markdownUrl(page)}${anchor}` : `${pageUrl(page)}${anchor}`;
  return `${REPO}/blob/main/${resolved}${anchor}`;
}

/**
 * A page's Markdown with its links rewritten (`rewriteHref` with
 * `markdown`). Links in code, fenced or inline, stay as they are; inline
 * code can go on over a line break, but not past its paragraph.
 */
export function asMarkdown(source, file) {
  let fenced = false;
  let code = false;
  return source
    .split("\n")
    .map((line) => {
      if (line.trimStart().startsWith("```")) {
        fenced = !fenced;
        code = false;
        return line;
      }
      if (fenced) return line;
      if (!line.trim()) code = false;
      return line
        .split("`")
        .map((part, i) => {
          if (i > 0) code = !code;
          if (code) return part;
          return part.replace(
            /\]\(([^)\s]+)\)/g,
            (_, href) => `](${rewriteHref(href, file, { markdown: true })})`,
          );
        })
        .join("`");
    })
    .join("\n");
}

/** /llms-full.txt: fctl's llms.txt, then each page's Markdown with where it is. */
export function llmsFull(llms, pages) {
  const parts = [llms.trimEnd()];
  for (const { page, markdown } of pages) {
    parts.push(`---\n\nSource: ${SITE}${markdownUrl(page)}\n\n${markdown.trim()}`);
  }
  return `${parts.join("\n\n")}\n`;
}
