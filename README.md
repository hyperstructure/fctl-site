# fctl-site

[fctl.sh](https://fctl.sh): the landing page, [fctl](https://github.com/hyperstructure/fctl)'s
docs, the privacy policy and terms, the installer and the release downloads.
One Cloudflare Worker with static assets.

| Path | What |
|---|---|
| `index.html`, `src/main.ts`, `src/site.css` | The landing page (the foundry scene as the hero) |
| `docs.html`, `scripts/docs.mjs` | fctl's `docs/*.md`, rendered at build time with Shiki (`scripts/markdown.mjs`) |
| `legal.html`, `legal/*.md`, `scripts/legal.mjs` | The privacy policy and terms of service, at `/privacy` and `/terms` |
| `fctl-docs.ref` | Which fctl commit the docs come from (`main`, or a commit fctl's CI pins) |
| `public/install.sh` | `curl -fsSL https://fctl.sh/install \| sh` |
| `worker/index.ts` | `/install`, `/releases/*` (from the `fctl-releases` KV namespace), the www redirect, and the 5xx page when answering fails |
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
```

## Deploying

`main` deploys from CI. fctl's CI pins `fctl-docs.ref` to a new commit when
its docs change, which deploys the site with them. Release archives are
published to the `fctl-releases` KV namespace by `cargo xtask publish` in
fctl; this Worker only reads them.

## License

[MIT](LICENSE)
