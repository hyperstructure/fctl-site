// The docs' sidebar, as every docs page and the search page show it: the
// pages in their groups (scripts/pages.mjs), each group but the first under
// its name, with the page being read marked. A group is a `role="group"`
// named by its heading, so that a screen reader says which one a link is in;
// the names are paragraphs rather than headings, which would come before the
// page's own in its outline, as the table of contents' "On this page" does.

import { esc, slugify } from "./markdown.mjs";
import { navGroups, pageUrl } from "./pages.mjs";

/** The docs' nav's contents, with `current` (one of PAGES, or none) marked. */
export function docsNav(current) {
  return navGroups()
    .map(({ name, pages }) => {
      const links = pages
        .map((p) => `<a href="${pageUrl(p)}"${p === current ? ' aria-current="page"' : ""}>${esc(p.nav)}</a>`)
        .join("");
      if (!name) return `<div class="docs-nav-group">${links}</div>`;
      const id = `docs-nav-${slugify(name)}`;
      return `<div class="docs-nav-group" role="group" aria-labelledby="${id}"><p class="docs-nav-name" id="${id}">${esc(name)}</p>${links}</div>`;
    })
    .join("");
}
