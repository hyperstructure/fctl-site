// The docs' search, as pages show it before any JavaScript runs: the field
// at the top of the docs' sidebar, and the search page (/docs/search/), which
// the Worker (worker/search.ts) fills with a query's results. Both are forms
// that work without JavaScript; with it, src/search.ts opens the search dialog
// from the field instead.

import { esc } from "./markdown.mjs";
import { PAGES, pageUrl, REPO, SITE } from "./pages.mjs";
import { cardPath } from "./seo.mjs";

/** The magnifying glass, as the nav, the field and the dialog draw it. */
export const GLASS =
  '<svg class="search-glass" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.25" /><path d="m15.2 15.2 4.8 4.8" /></svg>';

/** The search field at the top of the docs' sidebar. */
export const searchField = () =>
  `<form class="search-field" action="/docs/search/" method="get" role="search">${GLASS}<input type="search" name="q" placeholder="Search the docs" aria-label="Search the docs" maxlength="200" autocomplete="off" enterkeyhint="search" /><kbd hidden>/</kbd></form>`;

const BODY = `<h1>Search the docs</h1>
<form class="search-page" action="/docs/search/" method="get" role="search">
<div class="search-box">${GLASS}<input type="search" name="q" value="" placeholder="What do you want to do?" aria-label="Search the docs" maxlength="200" autocomplete="off" enterkeyhint="search" /><button type="submit">Search</button></div>
</form>
<div class="sr-results"><!--RESULTS--></div>`;

/**
 * The search page, from the docs' template (dist/docs.html): kept out of search engines, as its
 * results are other pages; the Worker puts a query in its field and the results at <!--RESULTS-->.
 */
export function searchPage(template) {
  const nav = PAGES.map((p) => `<a href="${pageUrl(p)}">${esc(p.nav)}</a>`).join("");
  const url = `${SITE}/docs/search/`;
  return template
    .replaceAll("<!--TITLE-->", "Search the docs · fctl docs")
    .replaceAll(
      "<!--DESCRIPTION-->",
      "Search every page of fctl's docs: installing it, running agents, the CLI, the HTTP API and self-hosting.",
    )
    .replaceAll("<!--URL-->", url)
    .replace("<!--IMAGE-->", `${SITE}${cardPath("/docs/")}`)
    .replace("<!--IMAGE_ALT-->", "fctl docs")
    .replace(
      '<meta name="robots" content="max-image-preview:large" />',
      '<meta name="robots" content="noindex" />',
    )
    .replace("<!--MARKDOWN-->", "")
    .replace("<!--BREADCRUMBS-->", "")
    .replace("<!--SIDE_SEARCH-->", "")
    .replace("<!--NAV-->", nav)
    .replace('<article id="doc" class="doc">', '<article id="doc" class="doc search-doc">')
    .replace("<!--DOC-->", BODY)
    .replace("<!--TOC-->", "")
    .replace("<!--WITH_TOC-->", "")
    .replace(
      '<a href="<!--SOURCE-->">Edit this page</a>',
      `<a href="${REPO}/tree/main/docs">The docs on GitHub</a>`,
    );
}
