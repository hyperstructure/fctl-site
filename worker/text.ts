// Words and snippets for search (worker/search.ts): how a query and a section
// are split into words, and the part of a section a result shows, with the
// query's words marked.

/** Words too common to search for, unless a query has nothing else. */
const STOP = new Set(
  (
    "a an and are as at be by can do does for from has have how i if in into is it its me my of on or " +
    "so that the their them then there these this to use using was we what when where which who why " +
    "will with you your"
  ).split(" "),
);

/** A word's stem, enough that "runners" finds "runner" and "hosting" "host". */
export function stem(word: string): string {
  let w = word.toLowerCase();
  if (w.length > 4 && w.endsWith("ies")) return `${w.slice(0, -3)}y`;
  if (w.length > 4 && /(ss|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us")) w = w.slice(0, -1);
  for (const suffix of ["ing", "ed"]) {
    if (w.length >= suffix.length + 4 && w.endsWith(suffix)) {
      w = w.slice(0, -suffix.length);
      // running → runn → run, but not install → instal.
      if (/([^aeiouls])\1$/.test(w)) w = w.slice(0, -1);
      break;
    }
  }
  return w;
}

const WORD = /[\p{L}\p{N}]+/gu;

/** A text's words, stemmed, in order. */
export const words = (text: string): string[] => (text.match(WORD) ?? []).map(stem);

/** A query's words to look for: stemmed, once each, without the common ones unless that leaves none. */
export function queryTerms(query: string): string[] {
  const all = [...new Set(words(query))];
  const kept = all.filter((w) => !STOP.has(w));
  return kept.length ? kept : all;
}

/** How long a query's word must be to find the words it starts (enroll → enrollment, not cli → client). */
export const PREFIX_MIN = 4;

/** Whether a word of the text (stemmed) is one of the query's, or starts like it (enroll → enrollment). */
export const matches = (word: string, terms: readonly string[]): boolean =>
  terms.some((t) => word === t || (t.length >= PREFIX_MIN && word.startsWith(t)));

/**
 * Markdown as running text, for a snippet: no heading marks, list bullets, emphasis, backticks,
 * fences or table rules, and one space between words. A first line of `# ` (the headings
 * scripts/search-index.mjs puts at the top of what AI Search indexes) goes, and so do code
 * blocks, unless `code`.
 */
export function plainText(markdown: string, code = true): string {
  let fenced = false;
  return markdown
    .replace(/^# [^\n]*\n/, "")
    .split("\n")
    .filter((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return false;
      }
      return (code || !fenced) && !/^\s*\|?\s*:?-{3,}/.test(line);
    })
    .map((line) =>
      line
        .replace(/^\s*#{1,6}\s+/, "")
        .replace(/^\s*>\s?/, "")
        .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "")
        .replace(/^\s*\|/, "")
        .replace(/\|\s*$/, "")
        .replace(/\s\|\s/g, " · "),
    )
    .join(" ")
    .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, "$2")
    .replace(/(^|[\s(])[*_](?=\S)([^*_]+?)(?<=\S)[*_](?=[\s).,;:!?]|$)/g, "$1$2")
    .replace(/`/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** How much of a section a result shows, in characters. */
export const SNIPPET = 190;

/**
 * The part of `text` (plain, from `plainText`) that shows the most of the query's words, about
 * `SNIPPET` characters long, cut at words, with … where it is cut. As segments that alternate:
 * text, a marked word, text, … (even indexes plain, odd ones marked).
 */
export function snippet(text: string, terms: readonly string[], length = SNIPPET): string[] {
  const found: { start: number; end: number; term: string }[] = [];
  for (const m of text.matchAll(WORD)) {
    const word = stem(m[0]);
    if (!matches(word, terms)) continue;
    const term = terms.find((t) => matches(word, [t])) ?? word;
    found.push({ start: m.index, end: m.index + m[0].length, term });
  }
  // The window that holds the most different words of the query, then the most of them.
  let start = 0;
  let distinct = -1;
  let count = -1;
  for (const f of found) {
    const inside = found.filter((g) => g.start >= f.start && g.end <= f.start + length);
    const d = new Set(inside.map((g) => g.term)).size;
    if (d > distinct || (d === distinct && inside.length > count)) {
      distinct = d;
      count = inside.length;
      start = f.start;
    }
  }
  // Some words before the first match, for context, from the start of a word.
  if (start > 0) {
    start = Math.max(0, start - 36);
    if (start > 0) {
      const space = text.indexOf(" ", start);
      start = space === -1 ? start : space + 1;
    }
  }
  let end = Math.min(text.length, start + length);
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > start) end = space;
  }
  const segments: string[] = [];
  let at = start;
  let plain = start > 0 ? "…" : "";
  for (const f of found) {
    if (f.start < start || f.end > end) continue;
    plain += text.slice(at, f.start);
    segments.push(plain, text.slice(f.start, f.end));
    plain = "";
    at = f.end;
  }
  plain += text.slice(at, end).replace(/[\s,;:]+$/, "");
  // Cut after a sentence, it needs no …
  if (end < text.length && !/[.!?]$/.test(plain)) plain += "…";
  segments.push(plain);
  return segments;
}
