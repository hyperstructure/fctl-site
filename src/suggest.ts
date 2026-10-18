// "Did you mean …?" on the 404 page: the site's page whose address is closest
// to the one that wasn't found, if any is close.

export interface Page {
  href: string;
}

/** Levenshtein distance. */
export function distance(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    prev = row;
  }
  return prev[b.length] ?? 0;
}

/** An address as people mistype it: any case, with .html or .md, a trailing slash or index. */
function normalize(path: string): string {
  let p = path;
  try {
    p = decodeURIComponent(p);
  } catch {}
  return (
    p
      .toLowerCase()
      .split(/[?#]/)[0]
      ?.replace(/\/index(\.html?)?$/, "")
      .replace(/\.(html?|md)$/, "")
      .replace(/[_\s]+/g, "-")
      .replace(/\/+$/, "") ?? ""
  );
}

const last = (path: string) => path.slice(path.lastIndexOf("/") + 1);

/** The page in `pages` closest to `path`, or null when none is close enough to be what was meant. */
export function suggest<P extends Page>(path: string, pages: P[]): P | null {
  const want = normalize(path);
  const end = last(want);
  if (!end) return null;
  let best: P | null = null;
  let score = Number.POSITIVE_INFINITY;
  for (const page of pages) {
    const have = normalize(page.href);
    // The home page is never the suggestion: the page links to it anyway.
    if (!have) continue;
    const tail = last(have);
    let s = Math.min(distance(want, have), distance(end, tail) + 0.5);
    if (end.length >= 4 && tail.length >= 4 && (end.startsWith(tail) || tail.startsWith(end)))
      s = Math.min(s, 1);
    if (s < score) {
      score = s;
      best = page;
    }
  }
  return score <= Math.max(1.5, end.length / 4) ? best : null;
}
