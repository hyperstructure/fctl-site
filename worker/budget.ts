// SearchBudget: the cap on full searches, which AI Search bills one by one. A
// single Durable Object counts every full search fctl.sh asks for in a day
// (UTC), everywhere, exactly, and refuses one when the day has had its share
// (SEARCH_DAILY_BUDGET), or when that visitor has had theirs
// (SEARCH_DAILY_PER_VISITOR), so that one person can't spend everyone's.
// Search then matches words only until the next day (worker/search.ts).
//
// It keeps the day's counts and nothing older: a visitor's count under a hash
// of their address with a salt it draws each day and forgets with the counts,
// so that a count can't be traced back to an address.

export interface BudgetEnv {
  SEARCH_DAILY_BUDGET?: string;
  SEARCH_DAILY_PER_VISITOR?: string;
}

/** Full searches a day, by default: at most about $22 a month in AI Search queries. */
export const DAILY_BUDGET = 1000;
/** Full searches one visitor may make in a day, by default. */
export const DAILY_PER_VISITOR = 100;

/** "ok", or why not: the visitor's day ("visitor") or everyone's ("budget") is spent. */
export type Verdict = "ok" | "visitor" | "budget";

/** Storage as the budget uses it: Durable Object storage's key-value methods. */
export interface BudgetStorage {
  get<T>(keys: string[]): Promise<Map<string, T>>;
  put(entries: Record<string, unknown>): Promise<void>;
  deleteAll(): Promise<void>;
}

const limit = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

async function hash(salt: string, visitor: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}\n${visitor}`));
  return [...new Uint8Array(bytes).slice(0, 12)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Takes one full search from the day's budget for `visitor`, if there is one left. */
export async function take(
  storage: BudgetStorage,
  env: BudgetEnv,
  visitor: string,
  now = new Date(),
): Promise<Verdict> {
  const day = now.toISOString().slice(0, 10);
  const state = await storage.get<string | number>(["day", "salt"]);
  let salt = state.get("salt");
  if (state.get("day") !== day || typeof salt !== "string") {
    // A new day: yesterday's counts and salt go.
    await storage.deleteAll();
    salt = [...crypto.getRandomValues(new Uint8Array(16))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    await storage.put({ day, salt, total: 0 });
  }
  const key = `visitor:${await hash(salt, visitor)}`;
  // Reading and writing the counts with nothing else awaited in between: the object takes no
  // other request until it is done, so no two searches take the last one.
  const counts = await storage.get<number>(["total", key]);
  const total = counts.get("total") ?? 0;
  const mine = counts.get(key) ?? 0;
  if (total >= limit(env.SEARCH_DAILY_BUDGET, DAILY_BUDGET)) return "budget";
  if (mine >= limit(env.SEARCH_DAILY_PER_VISITOR, DAILY_PER_VISITOR)) return "visitor";
  await storage.put({ total: total + 1, [key]: mine + 1 });
  return "ok";
}

/** The Durable Object: POST a visitor's key, get `{ verdict }`. */
export class SearchBudget {
  private readonly state: DurableObjectState;
  private readonly env: BudgetEnv;

  constructor(state: DurableObjectState, env: BudgetEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(req: Request): Promise<Response> {
    if (req.method !== "POST") return new Response("Method not allowed\n", { status: 405 });
    const visitor = (await req.text()).slice(0, 200);
    const verdict = await take(this.state.storage, this.env, visitor);
    return Response.json({ verdict });
  }
}
