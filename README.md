# fctl-site

[fctl.sh](https://fctl.sh): the landing page, [fctl](https://github.com/hyperstructure/fctl)'s
docs, the privacy policy and terms, the installer and the release downloads.
One Cloudflare Worker with static assets.

| Path | What |
|---|---|
| `index.html`, `src/main.ts`, `src/site.css` | The landing page (the foundry scene as the hero) |
| `docs.html`, `scripts/docs.mjs` | fctl's `docs/*.md`, rendered at build time with Shiki (`scripts/markdown.mjs`) |
| `scripts/pages.mjs` | Which file each docs page is, and the pages as Markdown for agents: `/docs/<page>.md`, fctl's `docs/llms.txt` at `/llms.txt`, and both in `/llms-full.txt` |
| `legal.html`, `legal/*.md`, `scripts/legal.mjs` | The privacy policy and terms of service, at `/privacy` and `/terms` |
| `fctl-docs.ref` | Which fctl commit the docs come from (`main`, or a commit fctl's CI pins) |
| `scripts/sitemap.mjs` | `/sitemap.xml`, of every page the build writes (and `/llms.txt`); `public/robots.txt` names it |
| `scripts/seo.mjs` | The build's last step: checks every page's title, description, canonical link, link preview, structured data and links |
| `public/og/`, `scripts/og.mjs` | Each page's link preview (`og:image`): its hero at 1200 × 630, rendered with Playwright |
| `public/install.sh` | `curl -fsSL https://fctl.sh/install \| sh` |
| `worker/index.ts` | `/install`, `/releases/*` (from the `fctl-releases` KV namespace), the redirects to `https://fctl.sh` (from plain HTTP and www), and the 5xx page when answering fails |
| `worker/search.ts`, `worker/budget.ts`, `src/search*.ts`, `scripts/search-*.mjs` | Search over the docs: `/api/search` and the page `/docs/search/`, with Cloudflare AI Search, its limits, and the search dialog (below) |
| `404.html`, `500.html`, `src/error.ts` | Not found and something broke: the status code in `@hyperstructure/design`'s stream, with "Did you mean …?" and "Try again" |
| `wrangler.toml` | The `fctl-site` Worker on fctl.sh and www.fctl.sh |

Styles, fonts, the WebGL scene and the mark come from
[@hyperstructure/design](https://github.com/hyperstructure/design).

## Developing

```sh
npm install
npm run dev                          # the landing page at http://localhost:5174
FCTL_DOCS_DIR=../fctl npm run build  # docs from a local fctl checkout
npm run build                        # docs from fctl at the ref in fctl-docs.ref
npm run check                        # Biome and TypeScript
npx wrangler dev --local             # the Worker with the built site (search matches words only)
```

## Search

The docs' search is a dialog on every page (the header's Search, the docs'
sidebar field, `/` and ⌘K or Ctrl+K) and a page, `/docs/search/`, which
works without JavaScript.

- **As you type**, the dialog matches page and heading titles in the
  browser, from `/docs/search/titles.json`. Free and instant.
- **On Enter**, `/api/search` searches every section of the docs with
  [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/) (the
  `fctl-docs` instance), which matches meaning as well as words.
- **The build** (`scripts/docs.mjs`) splits each page at its h2s and h3s
  into sections (`scripts/search-index.mjs`): `sections.json`, which the
  Worker searches, and `titles.json`.
- **Around each deploy**, CI uploads new and changed sections to AI Search
  before it, and deletes the ones the docs no longer have after it
  (`scripts/search-sync.mjs`). A section's key ends in a hash of its text,
  so unchanged ones are never indexed again.

AI Search bills by the search (1,000 a month are included, then $0.75 per
1,000), so a full search must get past, in order: Cloudflare's cache (the
same query within the hour costs nothing), 10 a minute from one
visitor (`SEARCH_LIMITER`), and a day's budget, 1,000 for everyone and 100
for each visitor (`SearchBudget`, a Durable Object; `SEARCH_DAILY_BUDGET`
and `SEARCH_DAILY_PER_VISITOR` in `wrangler.toml`). That caps AI Search's
queries at about $22 a month. When one of them says no, or AI Search fails
or finds nothing, the Worker matches the query's words in `sections.json`
itself, for free, and says why.

`npx wrangler dev` without `--local` asks the real instance, which needs
Cloudflare credentials and counts towards the bill.

## Deploying

`main` deploys from CI. fctl's CI pins `fctl-docs.ref` to a new commit when
its docs change, which deploys the site with them. Release archives are
published to the `fctl-releases` KV namespace by `cargo xtask publish` in
fctl; this Worker only reads them.

## License

[MIT](LICENSE)
