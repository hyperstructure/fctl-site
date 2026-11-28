// fctl's docs as fctl.sh serves them: which file of hyperstructure/fctl each
// page is, where links between them go, and each page as Markdown for agents
// (https://llmstxt.org): /docs/<page>.md, whose links work from anywhere, and
// /llms-full.txt, fctl's llms.txt followed by every page.

export const SITE = "https://fctl.sh";
export const REPO = "https://github.com/hyperstructure/fctl";

/**
 * The docs, in navigation order, in the groups the docs' sidebar shows them
 * in (scripts/docs-nav.mjs): the first two without a name, then using fctl,
 * running it, the guides that take a team through a whole setup, and how fctl
 * works inside. A group's pages come one after another. `slug` "" is /docs/.
 */
export const PAGES = [
  { slug: "", file: "docs/README.md", nav: "Overview" },
  { slug: "getting-started", file: "docs/getting-started.md", nav: "Getting started" },
  { slug: "cli", file: "docs/cli.md", nav: "The CLI", group: "Using fctl" },
  { slug: "agents", file: "docs/agents.md", nav: "For agents", group: "Using fctl" },
  { slug: "api", file: "docs/api.md", nav: "HTTP API", group: "Using fctl" },
  { slug: "automation", file: "docs/automation.md", nav: "Automation", group: "Using fctl" },
  { slug: "slack", file: "docs/slack.md", nav: "Agents from Slack", group: "Using fctl" },
  { slug: "identity-tokens", file: "docs/identity-tokens.md", nav: "Identity tokens", group: "Using fctl" },
  { slug: "sandbox-images", file: "docs/sandbox-images.md", nav: "Sandbox images", group: "Using fctl" },
  { slug: "self-hosting", file: "docs/self-hosting.md", nav: "Self-hosting", group: "Running fctl" },
  { slug: "organizations", file: "docs/organizations.md", nav: "For organizations", group: "Running fctl" },
  { slug: "security", file: "docs/security.md", nav: "Security", group: "Running fctl" },
  {
    slug: "runners-in-your-cloud",
    file: "docs/runners-in-your-cloud.md",
    nav: "Runners in your cloud",
    group: "Guides",
  },
  { slug: "chat-bot", file: "docs/chat-bot.md", nav: "A Slack bot", group: "Guides" },
  { slug: "data-warehouse", file: "docs/data-warehouse.md", nav: "Data warehouse", group: "Guides" },
  { slug: "architecture", file: "docs/architecture.md", nav: "Architecture", group: "Inside fctl" },
  { slug: "development", file: "docs/development.md", nav: "Development", group: "Inside fctl" },
];

/** The pages in their groups, in order: `{ name, pages }`, the first without a name. */
export function navGroups(pages = PAGES) {
  const groups = [];
  for (const page of pages) {
    const last = groups.at(-1);
    if (last && last.name === page.group) last.pages.push(page);
    else groups.push({ name: page.group, pages: [page] });
  }
  return groups;
}

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
