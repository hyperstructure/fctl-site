// Search from every page. Without JavaScript, the header's Search link and the
// docs' sidebar field lead to the search page (/docs/search/). With it, they
// open the search dialog (src/search-dialog.ts) instead, and so do "/" and
// ⌘K or Ctrl+K. The dialog's code loads the first time a pointer comes near
// one of them, or when one is used.

const mac = /Mac|iPhone|iPad/.test(navigator.userAgent);

let dialog: Promise<typeof import("./search-dialog")> | undefined;
const load = () => {
  dialog ??= import("./search-dialog");
  dialog.catch(() => {
    dialog = undefined;
  });
  return dialog;
};

/** Opens the dialog, or, if its code can't load (offline, a deploy since), goes to the search page. */
function open(query?: string) {
  load()
    .then((m) => m.openSearch(query))
    .catch(() => {
      location.assign(`/docs/search/${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    });
}

/** Whether a key press goes into a field, where "/" is just a slash. */
const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));

function shortcut(kbd: HTMLElement) {
  kbd.textContent = mac ? "⌘K" : "Ctrl K";
  kbd.hidden = false;
}

export function searchTriggers() {
  // On the search page, its own field is where a search goes.
  const pageField = document.querySelector<HTMLInputElement>(".search-page input[name=q]");

  for (const a of document.querySelectorAll<HTMLAnchorElement>("a.nav-search")) {
    a.setAttribute("role", "button");
    a.setAttribute("aria-haspopup", "dialog");
    a.addEventListener("pointerenter", load, { once: true });
    a.addEventListener("focus", load, { once: true });
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open();
    });
    const kbd = a.querySelector<HTMLElement>("kbd");
    if (kbd) shortcut(kbd);
  }

  // The sidebar's form becomes a button that looks the same and opens the dialog.
  for (const form of document.querySelectorAll<HTMLFormElement>("form.search-field")) {
    const glass = form.querySelector("svg")?.cloneNode(true);
    const kbd = document.createElement("kbd");
    shortcut(kbd);
    const label = document.createElement("span");
    label.textContent = "Search the docs";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-field";
    button.setAttribute("aria-haspopup", "dialog");
    if (glass) button.append(glass);
    button.append(label, kbd);
    button.addEventListener("pointerenter", load, { once: true });
    button.addEventListener("click", () => open());
    form.replaceWith(button);
  }

  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.isComposing) return;
    const k = e.key.toLowerCase();
    const combo = k === "k" && (mac ? e.metaKey : e.ctrlKey) && !e.altKey && !e.shiftKey;
    const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(e.target);
    if (!combo && !slash) return;
    e.preventDefault();
    if (pageField) {
      pageField.focus();
      pageField.select();
    } else open();
  });
}
