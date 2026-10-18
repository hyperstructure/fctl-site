---
name: screenshots
description: Show how a pull request in hyperstructure/fctl-site changes the way fctl.sh looks, with screenshots in its description. Covers which changes need them, before and after or only after, taking them with Playwright against `npm run dev` or `wrangler dev`, attaching them with `gh pr edit --attach` or, in an fctl session, publishing them with `fctl publish` (never committing them), and replacing them when a later commit changes what they show. Use when a change affects what people see on fctl.sh (a new `@hyperstructure/design` tag included), when opening its pull request, and whenever you push a commit that changes something its screenshots show.
---

# Screenshots in pull requests

A pull request that changes how fctl.sh looks shows it in its description,
so reviewers see the change without running the branch. The screenshots
show the pull request as it is now: when a later commit changes what one
shows, replace it. These are the same rules as in hyperstructure/fctl.

Never commit screenshots, to this or any repository. Keep them outside the
checkout, in `~/screenshots`.

## Which changes

Anything people see on fctl.sh: the landing page (`index.html`, `src/`),
how the docs and legal pages render (`docs.html`, `legal.html`,
`scripts/docs.mjs`, `scripts/legal.mjs`, `scripts/markdown.mjs`), the 404
page, and a new tag of `@hyperstructure/design`. Not changes nobody sees,
like the Worker or the installer, and not text alone in `legal/*.md`, which
the diff shows.

## Before and after, or after

- **Before and after** when the change alters something that exists: a
  restyle, a layout fix, new copy on the landing page. Take both at the same
  size and theme, so the change is the only difference.
- **After** alone when there is nothing to compare with: a new section or
  page.

Show the part that changed, with enough around it to place it. Show both
themes unless the change looks the same in each, and a phone width (390 px)
when it affects layout. A few screenshots that show the change beat a dozen
that repeat it.

Take the before screenshots before you change anything. Afterwards, run
`main` from a worktree beside your branch:

```sh
git worktree add ~/before origin/main && cd ~/before && npm ci
npx vite --port 5175   # main's landing page at http://localhost:5175
```

## Taking them

Once per sandbox, install Playwright and Chromium beside the screenshots:

```sh
mkdir -p ~/screenshots && cd ~/screenshots
npm init -y >/dev/null && npm install playwright
npx playwright install --with-deps chromium   # sudo installs its system libraries
```

`npm run dev` serves the landing page at http://localhost:5174. The docs and
legal pages exist only after a build: `npm run build && npx wrangler dev`
serves them at http://localhost:8787 (`/docs/`, `/privacy`).

Save this as `~/screenshots/shoot.mjs`. It asks for reduced motion and seeds
`Math.random`, so the foundry scene holds still and draws the same frame on
every load: before and after differ only where your change does. Without
reduced motion, the hero is still fading in when the screenshot is taken.

```js
// node shoot.mjs URL OUT.png [light|dark] [WIDTHxHEIGHT]
import { chromium } from "playwright";

const [url, out, colorScheme = "light", size = "1440x900"] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const browser = await chromium.launch();
const page = await browser.newPage({ colorScheme, reducedMotion: "reduce", viewport: { width, height } });
await page.addInitScript(() => {
  let seed = 42;
  Math.random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
});
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: out });
await browser.close();
```

```sh
cd ~/screenshots
node shoot.mjs http://localhost:5175/ before-light.png
node shoot.mjs http://localhost:5174/ after-light.png
node shoot.mjs http://localhost:5174/ after-dark-390.png dark 390x844
```

For a whole docs page, pass `fullPage: true` to `page.screenshot`; for one
element, use `page.locator(…).screenshot()`. When the change is motion,
record it (`recordVideo` in `newPage`) and attach the `.webm`.

Look at every screenshot before you use it. If `npm ci` couldn't fetch
`@hyperstructure/design`, the colors and fonts are a stand-in: say so under
them.

## Attaching them

`gh` 2.99 and newer uploads images and videos with `--attach`, as dragging
them into GitHub's editor does, and points references to those files in the
body at the uploads. Open the pull request, then add the screenshots from
`~/screenshots`:

```sh
cd ~/screenshots
gh pr view N -R hyperstructure/fctl-site --json body --jq .body > pr.md
# add the section below to pr.md
gh pr edit N -R hyperstructure/fctl-site --body-file pr.md \
  --attach before-light.png --attach after-light.png
```

Reference each file by name with Markdown image syntax (gh doesn't rewrite
`<img>` tags), and say which commit the screenshots show:

```markdown
## Screenshots

At abc1234: the landing page's hero in the light theme, 1440 px wide.

| Before | After |
|---|---|
| ![Before: the hero, light](before-light.png) | ![After: the hero, light](after-light.png) |
```

In an fctl session, `--attach` fails with "unsupported authentication type":
sessions have the GitHub App's token, and GitHub accepts uploads only with a
person's (hyperstructure/fctl#40). Publish them on fctl instead, if the
project publishes screenshots (`~/AGENTS.md` says so):

```sh
cd ~/screenshots
fctl publish before-light.png after-light.png
```

It prints Markdown for each, like
`![before-light.png](https://app.fctl.sh/api/v1/published/…/before-light.png)`.
Use the links in place of the file names in the section above, keep your own
alternative text, and edit the description without `--attach`:

```sh
gh pr edit N -R hyperstructure/fctl-site --body-file pr.md
```

Anyone who has a link can open it until it expires (after 30 days unless the
project chooses otherwise). If `fctl publish` says the project doesn't
publish screenshots, look at them anyway, describe what they show in the
description, and say that the session can't attach them. Don't commit them
instead.

## Keeping them current

The screenshots show the pull request's newest commit. When a later commit
changes what one shows (a review fix, a tweak, `main` merged in with changes
to the same page, a new design tag), take it again and replace it in the
same turn: nothing wakes the session afterwards.

```sh
git diff --stat abc1234 HEAD   # what changed since the screenshots
cd ~/screenshots
gh pr view N -R hyperstructure/fctl-site --json body --jq .body > pr.md
# point the changed image at its file again, ![After: …](after-light.png), and update "At abc1234"
gh pr edit N -R hyperstructure/fctl-site --body-file pr.md --attach after-light.png
```

In a session, publish the new screenshot and point the image at its link
instead. Replace the old image rather than adding the new one under it;
GitHub keeps earlier versions of the description in its edit history. Before
you end a turn that pushed commits, check that the screenshots still match.
