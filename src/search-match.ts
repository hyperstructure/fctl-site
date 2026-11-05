// The search dialog's instant matches (src/search-dialog.ts): the docs' pages
// and headings whose titles hold what is typed, from titles.json
// (scripts/search-index.mjs). In the browser, as people type: free, and with
// no wait. Full search, which reads every page, runs on Enter (worker/search.ts).

/** A page (`url` without a #) or one of its h2s or h3s. */
export interface TitleEntry {
  url: string;
  page: string;
  trail: string[];
  title: string;
  /** A page's, from its first paragraph. */
  description?: string;
}

export interface TitleMatch {
  entry: TitleEntry;
  /** Where the title holds what was typed: `[start, end)` pairs, in order, not overlapping. */
  ranges: [number, number][];
}

const isWordChar = (c: string | undefined) => !!c && /[\p{L}\p{N}]/u.test(c);

/** Where `token` is in `text` (both lower case): at the start of a word if it is anywhere there. */
function find(text: string, token: string): { at: number; start: boolean } | undefined {
  let first: number | undefined;
  for (let at = text.indexOf(token); at !== -1; at = text.indexOf(token, at + 1)) {
    if (!isWordChar(text[at - 1])) return { at, start: true };
    first ??= at;
  }
  return first === undefined ? undefined : { at: first, start: false };
}

/**
 * The entries whose title, page or h2 holds every word of `query`, best first, at most `limit`:
 * those that start like it, then those with its words at the start of the title's words, then
 * anywhere in it; then the shorter title, and a page before a heading.
 */
export function matchTitles(entries: readonly TitleEntry[], query: string, limit = 7): TitleMatch[] {
  const q = query.toLowerCase().replace(/\s+/g, " ").trim();
  const tokens = [...new Set(q.split(" ").filter(Boolean))];
  if (!tokens.length) return [];
  const scored: { match: TitleMatch; score: number; order: number }[] = [];
  entries.forEach((entry, order) => {
    const title = entry.title.toLowerCase();
    const context = [entry.page, ...entry.trail].join(" ").toLowerCase();
    let score = 0;
    const ranges: [number, number][] = [];
    for (const token of tokens) {
      const inTitle = find(title, token);
      if (inTitle) {
        score += inTitle.start ? 10 : 4;
        ranges.push([inTitle.at, inTitle.at + token.length]);
        continue;
      }
      const inContext = find(context, token);
      if (!inContext?.start) return;
      score += 2;
    }
    if (!ranges.length) return;
    if (title === q) score += 30;
    else if (title.startsWith(q)) score += 15;
    if (!entry.url.includes("#")) score += 3;
    score -= title.length / 40;
    scored.push({ match: { entry, ranges: merge(ranges) }, score, order });
  });
  return scored
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((s) => s.match);
}

/** Ranges in order, overlapping ones joined. */
function merge(ranges: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (const [s, e] of [...ranges].sort((a, b) => a[0] - b[0])) {
    const last = out.at(-1);
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else out.push([s, e]);
  }
  return out;
}
