// The header's Features menu is a <details>, which opens and closes without
// JavaScript. This closes it the way menus close: on Escape, on a click
// outside it, and when one of its links is followed.

export function menus() {
  const all = [...document.querySelectorAll<HTMLDetailsElement>("details.nav-menu")];
  if (all.length === 0) return;
  const close = (except?: HTMLDetailsElement) => {
    for (const d of all) if (d !== except) d.open = false;
  };
  document.addEventListener("click", (e) => {
    const inside = all.find((d) => d.contains(e.target as Node));
    close(inside);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = all.find((d) => d.open);
    if (!open) return;
    open.open = false;
    open.querySelector("summary")?.focus();
  });
  for (const d of all) {
    for (const a of d.querySelectorAll("a")) a.addEventListener("click", () => close());
  }
}
