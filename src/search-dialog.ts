// The search dialog, which src/search.ts loads and opens: from the header's
// Search link, the docs' sidebar field, "/" and ⌘K or Ctrl+K.
//
// As people type, it lists the pages and headings whose titles match, from
// titles.json, at once and for free (src/search-match.ts). Enter, or the row
// above them, searches every page (GET /api/search, worker/search.ts): AI
// Search matches what the words mean as well as the words, and bills by the
// search, so it runs only when asked. Every row is a link: Enter or a click
// follows it, and ⌘ or Ctrl with either opens it in a new tab.

import { matchTitles, type TitleEntry } from "./search-match";

interface Hit {
  url: string;
  page: string;
  trail: string[];
  title: string;
  /** Text and marked words, alternating: even indexes plain, odd ones the query's words. */
  snippet: string[];
}

interface Results {
  query: string;
  mode: "full" | "words";
  hits: Hit[];
  notice?: string;
  /** Why the results match words only, in a sentence. */
  message?: string;
}

/** A row that Enter, a click or the arrow keys reach. */
interface Option {
  el: HTMLElement;
  run(newTab: boolean): void;
}

const ICONS = {
  page: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5z"/><path d="M14 3.5V8h4M9 12.5h6M9 16h4"/></svg>',
  section:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 4 8 20M16 4l-1.5 16M4.5 9h15M4 15h15"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  glass:
    '<svg class="search-glass" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.25"/><path d="m15.2 15.2 4.8 4.8"/></svg>',
  spark:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.25"/><path d="m15.2 15.2 4.8 4.8M10.5 7.6v5.8M7.6 10.5h5.8"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/></svg>',
};

/** An element with a class, attributes and children (text is set as text, never as HTML). */
function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string | undefined)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const c of children) if (c !== undefined) el.append(c);
  return el;
}

/** Text with `[start, end)` ranges marked. */
function markRanges(text: string, ranges: [number, number][]): DocumentFragment {
  const f = document.createDocumentFragment();
  let at = 0;
  for (const [s, e] of ranges) {
    f.append(text.slice(at, s), h("mark", {}, text.slice(s, e)));
    at = e;
  }
  f.append(text.slice(at));
  return f;
}

/** A snippet's segments: even indexes plain, odd ones marked. */
function markSegments(segments: string[]): DocumentFragment {
  const f = document.createDocumentFragment();
  segments.forEach((s, i) => {
    f.append(i % 2 ? h("mark", {}, s) : s);
  });
  return f;
}

/** "1 result", "8 results". */
const count = (n: number) => `${n} ${n === 1 ? "result" : "results"}`;

/** A query as the Worker searches it (worker/search.ts's normalize). */
const normalize = (q: string) => q.replace(/\s+/g, " ").trim().slice(0, 200).trim();

let ui:
  | {
      dialog: HTMLDialogElement;
      input: HTMLInputElement;
      /** What isn't a row: why results match words only, no results, a hint. */
      msg: HTMLElement;
      list: HTMLElement;
      live: HTMLElement;
    }
  | undefined;
let options: Option[] = [];
let active = 0;
let entries: TitleEntry[] = [];
let titles: Promise<void> | undefined;
/**
 * The full search shown, for the query in the field. Results that match words only because of a
 * limit (`notice`) last only until the field changes or the dialog opens again, when the row that
 * runs a full search is back, so that Enter asks again.
 */
let shown: Results | undefined;
let pending: { query: string; controller: AbortController } | undefined;
/** A query whose full search couldn't reach fctl.sh. */
let failed: string | undefined;
const done = new Map<string, Results>();

function loadTitles() {
  titles ??= fetch("/docs/search/titles.json")
    .then((r) => {
      // Thrown, so that the next opening asks again (a 5xx during a deploy, say).
      if (!r.ok) throw new Error(`titles.json: ${r.status}`);
      return r.json() as Promise<TitleEntry[]>;
    })
    .then((list) => {
      entries = list;
      if (ui?.dialog.open) render();
    })
    .catch(() => {
      titles = undefined;
    });
  return titles;
}

function announce(text: string) {
  if (!ui) return;
  ui.live.textContent = "";
  // A change the next frame, so that screen readers read it even when it repeats.
  requestAnimationFrame(() => {
    if (ui) ui.live.textContent = text;
  });
}

function setActive(i: number, scroll = true) {
  if (!ui || !options.length) {
    ui?.input.removeAttribute("aria-activedescendant");
    return;
  }
  active = (i + options.length) % options.length;
  options.forEach((o, j) => {
    o.el.setAttribute("aria-selected", String(j === active));
  });
  const el = options[active]?.el;
  if (!el) return;
  ui.input.setAttribute("aria-activedescendant", el.id);
  if (scroll) el.scrollIntoView({ block: "nearest" });
}

/** What had focus before the dialog opened. */
let opener: HTMLElement | undefined;

/**
 * Closes the dialog, lets the page scroll again and gives focus back, at once: its close event
 * comes later, and a key pressed before then would go to the closed dialog's field.
 */
function shut() {
  document.documentElement.classList.remove("sd-open");
  if (!ui) return;
  ui.dialog.close();
  if (ui.dialog.contains(document.activeElement)) {
    ui.input.blur();
    opener?.focus({ preventScroll: true });
  }
}

function follow(url: string, newTab: boolean) {
  if (newTab) {
    window.open(url, "_blank", "noopener");
    return;
  }
  shut();
  location.assign(url);
}

/** A row: a link to a page or heading, or a result with its snippet. */
function row(
  list: HTMLElement,
  item: { url: string; page: string; trail: string[]; title: Node; plainTitle: string; note?: string },
  snippet?: string[],
) {
  const where = item.note ?? [item.page, ...item.trail].filter((p) => p !== item.plainTitle).join(" › ");
  const id = `sd-opt-${options.length}`;
  const a = h(
    "a",
    {
      class: `sr-hit${snippet ? "" : " is-title"}`,
      href: item.url,
      id,
      role: "option",
      "aria-selected": "false",
    },
    h("span", { class: "sr-icon", html: item.url.includes("#") ? ICONS.section : ICONS.page }),
    h(
      "span",
      { class: "sr-body" },
      h("span", { class: "sr-title" }, item.title),
      where ? h("span", { class: "sr-where" }, where) : undefined,
      snippet ? h("span", { class: "sr-snippet" }, markSegments(snippet)) : undefined,
    ),
    h("span", { class: "sr-go", html: ICONS.arrow }),
  );
  const index = options.length;
  a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    follow(item.url, false);
  });
  a.addEventListener("pointermove", () => {
    if (active !== index) setActive(index, false);
  });
  options.push({ el: a, run: (newTab) => follow(item.url, newTab) });
  list.append(a);
}

function group(label: string): HTMLElement {
  const id = `sd-group-${ui?.list.childElementCount ?? 0}`;
  const g = h(
    "div",
    { role: "group", "aria-labelledby": id, class: "sd-group" },
    h("p", { class: "sd-label", id, role: "presentation" }, label),
  );
  ui?.list.append(g);
  return g;
}

/** The row that runs a full search: first, and active, until there are results. */
function actionRow(q: string) {
  const loading = pending?.query === q;
  const error = failed === q;
  const title = h(
    "span",
    { class: "sr-title" },
    loading ? "Searching the docs for " : "Search the docs for ",
    h("q", {}, q),
    loading ? "…" : "",
  );
  const sub = error
    ? "Couldn't reach fctl.sh. Press ↵ to try again."
    : loading
      ? "Reading every page"
      : "Finds pages by what you mean, not only by your words";
  const id = `sd-opt-${options.length}`;
  const el = h(
    "div",
    {
      class: `sd-action${loading ? " is-loading" : ""}${error ? " is-error" : ""}`,
      id,
      role: "option",
      "aria-selected": "false",
    },
    h("span", { class: "sr-icon", html: ICONS.spark }),
    h("span", { class: "sr-body" }, title, h("span", { class: "sr-where" }, sub)),
    h("kbd", { "aria-hidden": "true" }, "↵"),
  );
  const index = options.length;
  el.addEventListener("click", () => fullSearch(q));
  el.addEventListener("pointermove", () => {
    if (active !== index) setActive(index, false);
  });
  options.push({ el, run: () => fullSearch(q) });
  ui?.list.append(el);
}

function headings(q: string, label = "Headings") {
  const matches = matchTitles(entries, q);
  if (!matches.length) return;
  const g = group(label);
  for (const m of matches) {
    row(g, { ...m.entry, title: markRanges(m.entry.title, m.ranges), plainTitle: m.entry.title });
  }
}

function render() {
  if (!ui) return;
  const { list, input, msg } = ui;
  const q = normalize(input.value);
  list.replaceChildren();
  msg.replaceChildren();
  options = [];
  if (!q) {
    const g = group("Pages");
    for (const e of entries.filter((e) => !e.url.includes("#"))) {
      row(g, { ...e, title: document.createTextNode(e.page), plainTitle: e.page, note: e.description });
    }
    if (!entries.length) {
      msg.append(h("p", { class: "sd-hint" }, "Type what you want to do, and press ↵ to search every page."));
    }
  } else if (shown && shown.query === q) {
    results(shown);
  } else {
    actionRow(q);
    headings(q);
  }
  // A new list starts at its first row: the full search while typing, the best result after it.
  setActive(0, false);
}

function results(r: Results) {
  if (!ui) return;
  if (r.message) {
    const notice = h("p", { class: "sr-notice", html: ICONS.info });
    notice.append(r.message);
    ui.msg.append(notice);
  }
  if (!r.hits.length) {
    ui.msg.append(
      h(
        "div",
        { class: "sd-empty" },
        h("p", { class: "sd-empty-title" }, "No results for ", h("q", {}, r.query)),
        h("p", {}, "Try other words, or fewer of them."),
      ),
    );
    headings(r.query, "Headings that match");
    return;
  }
  const how = r.mode === "full" ? "matching meaning and words" : "matching words";
  const g = group("Results");
  const label = g.querySelector(".sd-label");
  if (label) label.textContent = `${count(r.hits.length)}, ${how}`;
  for (const hit of r.hits) {
    row(g, { ...hit, title: document.createTextNode(hit.title), plainTitle: hit.title }, hit.snippet);
  }
}

async function fullSearch(q: string) {
  const key = q.toLowerCase();
  const known = done.get(key);
  if (known) {
    shown = { ...known, query: q };
    render();
    announce(shown.hits.length ? count(shown.hits.length) : "No results");
    return;
  }
  if (pending?.query === q) return;
  pending?.controller.abort();
  const controller = new AbortController();
  pending = { query: q, controller };
  failed = undefined;
  render();
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`search: ${res.status}`);
    const r = (await res.json()) as Results;
    // Results that match words only because of a limit are asked for again next time.
    if (!r.notice) done.set(key, r);
    if (pending?.controller !== controller) return;
    pending = undefined;
    shown = { ...r, query: q };
    render();
    announce(r.hits.length ? `${count(r.hits.length)}${r.message ? `. ${r.message}` : ""}` : "No results");
  } catch {
    if (controller.signal.aborted) return;
    pending = undefined;
    failed = q;
    render();
    announce("Search couldn't reach fctl.sh.");
  }
}

function build() {
  const input = h("input", {
    class: "sd-input",
    type: "search",
    role: "combobox",
    "aria-label": "Search the docs",
    "aria-expanded": "true",
    "aria-controls": "sd-list",
    "aria-autocomplete": "list",
    placeholder: "Search the docs",
    maxlength: "200",
    autocomplete: "off",
    autocapitalize: "off",
    spellcheck: "false",
    enterkeyhint: "search",
  });
  const close = h(
    "button",
    { class: "sd-close", type: "button", "aria-label": "Close search" },
    h("kbd", { class: "sd-esc" }, "esc"),
    h("span", { class: "sd-cancel" }, "Cancel"),
  );
  const list = h("div", { class: "sd-list", id: "sd-list", role: "listbox", "aria-label": "Search results" });
  const msg = h("div", { class: "sd-msg" });
  const live = h("p", { class: "sd-live", "aria-live": "polite" });
  const foot = h(
    "div",
    { class: "sd-foot", "aria-hidden": "true" },
    h("span", {}, h("kbd", {}, "↑"), h("kbd", {}, "↓"), " to move"),
    h("span", {}, h("kbd", {}, "↵"), " to open"),
    h("span", {}, h("kbd", {}, "esc"), " to close"),
  );
  const dialog = h(
    "dialog",
    { class: "sd", "aria-label": "Search the docs" },
    h(
      "div",
      { class: "sd-panel" },
      h("div", { class: "sd-head", html: ICONS.glass }, input, close),
      h("div", { class: "sd-body" }, msg, list),
      foot,
      live,
    ),
  );

  input.addEventListener("input", () => {
    if (shown?.notice) shown = undefined;
    const q = normalize(input.value);
    if (pending && pending.query !== q) {
      pending.controller.abort();
      pending = undefined;
    }
    render();
  });
  input.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    if (e.key === "Escape") {
      // A search field would clear itself first: Escape closes the dialog at once.
      e.preventDefault();
      shut();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive(active + (e.key === "ArrowDown" ? 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const q = normalize(input.value);
      const option = options[active];
      if (option) option.run(e.metaKey || e.ctrlKey);
      else if (q) fullSearch(q);
    }
  });
  close.addEventListener("click", shut);
  // A click on the backdrop, outside the panel, closes it.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) shut();
  });
  dialog.addEventListener("close", () => {
    pending?.controller.abort();
    pending = undefined;
    document.documentElement.classList.remove("sd-open");
  });
  document.body.append(dialog);
  return { dialog, input, msg, list, live };
}

/** Opens the dialog, with `query` in its field, or the last one, selected. */
export function openSearch(query?: string) {
  ui ??= build();
  const { dialog, input } = ui;
  if (query !== undefined) input.value = query;
  if (shown?.notice) shown = undefined;
  loadTitles();
  render();
  if (!dialog.open) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    document.documentElement.classList.add("sd-open");
    dialog.showModal();
  }
  input.focus();
  input.select();
}
