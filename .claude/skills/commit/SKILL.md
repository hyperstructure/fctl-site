---
name: commit
description: Commit and open pull requests in hyperstructure/fctl-site (fctl.sh). Covers Conventional Commit titles, the description, branch names and how a change reaches main, which deploys fctl.sh. Use when committing, naming a branch, writing a pull request title or description, or getting work merged.
---

# Commits and pull requests

Every change reaches `main`, which deploys https://fctl.sh, as one
squash-merged pull request: its **title becomes the commit subject** and
its description the commit body. Titles follow
[Conventional Commits](https://www.conventionalcommits.org), with the same
rules as hyperstructure/fctl and hyperstructure/design.

## The title

`type(scope): what changed`, at most 72 characters, no full stop. Types:
`feat` (something new on the site), `fix`, `perf`, `docs`, `refactor`,
`test`, `build`, `ci`, `chore`, `revert`. Scopes (optional): `landing`,
`docs`, `legal`, `install`, `releases`, `worker`, `deps`.

- `feat(landing): wire every diagram node`
- `fix(install): skip completions for versions without them`
- `docs(legal): describe account deletion`

Check one: `node scripts/lint-commit.mjs "fix(install): …"`. CI checks
every pull request title.

The docs pages come from hyperstructure/fctl's `docs/`: change them there,
not here. The legal pages (`legal/`) must stay true to what app.fctl.sh
does (AGENTS.md).

## The description

What changed and why, and how you checked it: `npm run check`,
`npm run build`, the page in both themes and at a phone width, and
`shellcheck -s sh public/install.sh` for the installer. Screenshots for
visual changes. End with the attribution lines your environment asks for.

## The flow

1. Branch from an up-to-date `main`: `<type>/<topic>`.
2. Run `npm run check && npm test && npm run build` before you push.
3. Open the pull request: a conventional title, a description, one change.
4. A person merges it (squash) when CI is green, unless they asked you to.
   Merging deploys fctl.sh.

Never push to `main` directly.
