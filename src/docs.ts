// Docs pages: styles, a copy button on every code block, and the table of
// contents beside the page marking the section being read.

import "./site.css";
import { menus } from "./nav";
import { searchTriggers } from "./search";

for (const pre of document.querySelectorAll<HTMLPreElement>(".doc pre")) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy doc-copy";
  button.textContent = "Copy";
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pre.innerText.replace(/^\$ /gm, ""));
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1500);
    } catch {
      button.textContent = "Select and copy";
    }
  });
  pre.classList.add("has-copy");
  pre.append(button);
}

const toc = document.querySelector<HTMLElement>(".docs-toc");
if (toc) {
  const links = new Map(
    [...toc.querySelectorAll<HTMLAnchorElement>("a")].map((a) => [decodeURIComponent(a.hash.slice(1)), a]),
  );
  const headings = [...document.querySelectorAll<HTMLElement>(".doc h2[id], .doc h3[id]")].filter((h) =>
    links.has(h.id),
  );
  let current: HTMLAnchorElement | undefined;
  let queued = false;
  const mark = () => {
    queued = false;
    // The last heading above the top of the window, below the sticky header.
    let reading: HTMLElement | undefined;
    for (const h of headings) {
      if (h.getBoundingClientRect().top > 120) break;
      reading = h;
    }
    // At the bottom, the last sections' headings can't scroll up that far:
    // the one a link led to if it is in the window, or else the last one.
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
      const target = headings.find((h) => `#${encodeURIComponent(h.id)}` === location.hash);
      const top = target?.getBoundingClientRect().top;
      reading = target && top !== undefined && top >= 0 && top < innerHeight ? target : headings.at(-1);
    }
    const link = reading && links.get(reading.id);
    if (link === current) return;
    current?.removeAttribute("aria-current");
    current = link;
    if (!link) return;
    link.setAttribute("aria-current", "location");
    // Keep it in view when the contents are taller than the window.
    const top = link.offsetTop;
    if (top < toc.scrollTop || top + link.offsetHeight > toc.scrollTop + toc.clientHeight) {
      toc.scrollTop = top - toc.clientHeight / 2;
    }
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(mark);
    }
  };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  addEventListener("hashchange", queue);
  mark();
}
menus();
searchTriggers();
