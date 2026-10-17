# AGENTS.md

This is **fctl-site**, https://fctl.sh: a static landing page and fctl's
docs, served by one Cloudflare Worker that also answers `/install` and
`/releases/*`.

## Commands

```sh
npm install
npm run dev                          # landing page with hot reload
FCTL_DOCS_DIR=../fctl npm run build  # build with docs from a local fctl checkout
npm run check                        # Biome + TypeScript (src, vite config, worker); CI runs this
npx wrangler dev                     # the Worker with the built assets (after a build)
```

## Where things come from

- **Design**: tokens, fonts, the foundry scene and the mark are in
  `@hyperstructure/design` (pinned to a tag in package.json). Change them
  there, tag a release, then bump the tag here. The inline SVG marks in
  `index.html` and `docs.html` must match `brand.ts` in that package.
- **Docs**: the Markdown lives in hyperstructure/fctl under `docs/`. Edit it
  there. `scripts/docs.mjs` maps files to URLs (`PAGES`), rewrites links
  between docs, and links other repository files to GitHub. Adding a doc
  page means adding it to `PAGES`.
- **Legal pages**: `legal/privacy.md` and `legal/terms.md`, rendered by
  `scripts/legal.mjs` to `/privacy` and `/terms` (Google sign-in's consent
  screen links them). They state what app.fctl.sh stores, who receives it
  and how long it is kept: when fctl changes any of that, update them too
  and bump `updated` in their front matter.
- **Releases**: `cargo xtask publish` in fctl writes them to the
  `fctl-releases` KV namespace; the Worker only reads. Keys are
  `latest` and `v<version>/<file>`.

## Commits and pull requests

- Changes reach `main` as squash-merged pull requests. The title becomes
  the commit, so it is a
  [Conventional Commit](https://www.conventionalcommits.org):
  `feat(landing): wire the diagram`. CI checks it
  (`node scripts/lint-commit.mjs "<title>"`). Types, scopes and the flow:
  [.claude/skills/commit/SKILL.md](.claude/skills/commit/SKILL.md).
- A person merges agents' pull requests unless they ask the agent to.
  Never push to `main` directly: it deploys fctl.sh. The one exception is
  fctl's CI pinning `fctl-docs.ref` (`docs: pin hyperstructure/fctl@…`).
- `scripts/commits.mjs` is a copy of hyperstructure/design's; keep the two
  in step with fctl's `xtask/src/release.rs`.

## Rules

- Never commit or print secrets (Cloudflare tokens, deploy keys). CI has
  them as secrets.
- `/install` and `/releases/*` are depended on by every fctl installation:
  keep their URLs and content types stable, and test `install.sh` with
  `shellcheck -s sh`.
- The page must work without JavaScript (everything visible), respect
  `prefers-reduced-motion`, and keep the strict CSP in `public/_headers`
  (no inline scripts, no third-party origins).
- Look at changes in both themes and at a phone width.
