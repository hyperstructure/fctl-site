// Search by words, in the Worker: what fctl.sh answers when full search (AI
// Search) can't be asked, because someone has searched a lot, the day's
// searches are spent or AI Search fails, and when it finds nothing. It costs
// nothing but the Worker's time. BM25 over each section's text, with its
// title and headings counting for more.

import { matches, queryTerms, words } from "./text.ts";

/** A section of the docs, as scripts/search-index.mjs writes it to sections.json. */
export interface Section {
  key: string;
  url: string;
  page: string;
  trail: string[];
  title: string;
  text: string;
}

interface Doc {
  section: Section;
  title: Set<string>;
  context: Set<string>;
  counts: Map<string, number>;
  length: number;
}

export interface WordIndex {
  docs: Doc[];
  /** How many sections each word is in. */
  df: Map<string, number>;
  /** Every word, for words that start like a query's (enroll → enrollment). */
  vocabulary: string[];
  average: number;
}

const K1 = 1.2;
const B = 0.75;
/** What a query's word in a section's title, or in its page's or h2's, adds to its score. */
const TITLE = 2.2;
const CONTEXT = 0.6;
/** How much a word that only starts like the query's counts. */
const PREFIX = 0.7;

export function wordIndex(sections: Section[]): WordIndex {
  const df = new Map<string, number>();
  const docs = sections.map((section) => {
    const counts = new Map<string, number>();
    const body = words(section.text);
    for (const w of body) counts.set(w, (counts.get(w) ?? 0) + 1);
    const title = new Set(words(section.title));
    const context = new Set(words([section.page, ...section.trail].join(" ")));
    for (const w of new Set([...counts.keys(), ...title, ...context])) df.set(w, (df.get(w) ?? 0) + 1);
    return { section, title, context, counts, length: body.length };
  });
  const average = docs.reduce((n, d) => n + d.length, 0) / Math.max(docs.length, 1);
  return { docs, df, vocabulary: [...df.keys()], average };
}

/** The sections that best match `query`'s words, best first, at most `limit`. */
export function searchWords(index: WordIndex, query: string, limit: number): Section[] {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const n = index.docs.length;
  // Each query word, with the words that start like it, and how much each counts.
  const expanded = terms.map((t) => {
    const forms = new Map([[t, 1]]);
    for (const w of index.vocabulary) if (w !== t && matches(w, [t])) forms.set(w, PREFIX);
    return forms;
  });
  const scored: { section: Section; score: number }[] = [];
  for (const doc of index.docs) {
    let score = 0;
    let found = 0;
    for (const forms of expanded) {
      let best = 0;
      for (const [w, weight] of forms) {
        const tf = doc.counts.get(w) ?? 0;
        const title = doc.title.has(w);
        const context = doc.context.has(w);
        if (!tf && !title && !context) continue;
        const df = index.df.get(w) ?? 0;
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
        const body = (tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * doc.length) / index.average));
        best = Math.max(best, weight * idf * (body + (title ? TITLE : 0) + (context ? CONTEXT : 0)));
      }
      if (best > 0) {
        score += best;
        found++;
      }
    }
    if (!found) continue;
    // Sections with every word of the query first: one with half of them counts a quarter.
    const coverage = found / expanded.length;
    scored.push({ section: doc.section, score: score * coverage * coverage });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.section);
}
