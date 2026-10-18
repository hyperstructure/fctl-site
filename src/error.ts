// The 404 and 5xx pages (404.html, 500.html): the status code as glyphs in
// the stream, @hyperstructure/design's scene in which the foundry's threads
// flow around them. People can stir the threads, throw the numbers and tap
// for a burst. On the 5xx page the power is out and the numbers fall;
// "Try again" turns it back on and loads the page again.

import "./site.css";
import { mount } from "@hyperstructure/design/gl/core";
import { play, type StreamHandle, stream } from "@hyperstructure/design/gl/stream";
import { suggest } from "./suggest";

const main = document.querySelector<HTMLElement>(".err");

function scene(): StreamHandle | null {
  const canvas = main?.querySelector<HTMLCanvasElement>(".err-canvas");
  const code = main?.querySelector<HTMLElement>(".err-code");
  if (!main || !canvas || !code) return null;
  const s = stream({ text: main.dataset.code ?? "404" });
  mount(canvas, s.scene, { pixel: 3 });
  if (canvas.dataset.webgl) {
    // No WebGL: the code shows as text.
    main.classList.add("nogl");
    return null;
  }
  const place = () => {
    const c = canvas.getBoundingClientRect();
    const d = code.getBoundingClientRect();
    if (!c.width || !c.height) return;
    s.place({
      x: (d.left - c.left) / c.width,
      y: (d.top - c.top) / c.height,
      width: d.width / c.width,
      height: d.height / c.height,
    });
  };
  const ro = new ResizeObserver(place);
  ro.observe(main);
  ro.observe(code);
  place();
  play(main, canvas, s);
  void s.ready.then(() => {
    main.classList.add("live");
    // The power goes out once people have seen the numbers stand.
    if (main.hasAttribute("data-down")) setTimeout(() => s.power(false), 700);
  });
  return s;
}

/** 404: says which address has no page and suggests the page that was probably meant. */
async function notFound() {
  const path = main?.querySelector(".err-path");
  if (path) {
    let shown = location.pathname;
    try {
      shown = decodeURI(shown);
    } catch {}
    path.textContent = shown;
  }
  const box = main?.querySelector<HTMLElement>(".err-suggest");
  const link = box?.querySelector("a");
  if (!box || !link) return;
  try {
    // The docs list every page in their navigation and footer.
    const res = await fetch("/docs/", { headers: { accept: "text/html" } });
    if (!res.ok) return;
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    const hrefs = new Set<string>();
    for (const a of doc.querySelectorAll("a[href^='/']")) hrefs.add(a.getAttribute("href") ?? "/");
    const best = suggest(
      location.pathname,
      [...hrefs].map((href) => ({ href })),
    );
    if (!best) return;
    link.href = best.href;
    link.textContent = best.href;
    box.hidden = false;
  } catch {}
}

const STILL = [
  "Still down. It isn’t you: the server keeps failing.",
  "Still down. Give it a minute, then try again.",
  "Still down. We’re on it.",
];

/** 5xx: "Try again" turns the power back on and asks for the page; if it loads, it shows. */
function retry(s: StreamHandle | null) {
  const button = main?.querySelector<HTMLAnchorElement>("[data-retry]");
  const status = main?.querySelector<HTMLElement>(".err-status");
  if (!button) return;
  let tries = 0;
  let busy = false;
  const say = (text: string) => {
    if (status) status.textContent = text;
  };
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    button.setAttribute("aria-disabled", "true");
    s?.power(true);
    say("Turning it back on…");
    const started = performance.now();
    let ok = false;
    try {
      const res = await fetch(location.href, { cache: "no-store", headers: { accept: "text/html" } });
      ok = res.ok;
    } catch {}
    // Let the lights come back before the verdict.
    await new Promise((r) => setTimeout(r, Math.max(0, 1500 - (performance.now() - started))));
    if (ok) {
      say("It’s back. Loading the page…");
      location.reload();
      return;
    }
    s?.power(false);
    say(STILL[Math.min(tries++, STILL.length - 1)] ?? "");
    button.removeAttribute("aria-disabled");
    busy = false;
  });
}

const s = scene();
if (main?.dataset.code === "404") void notFound();
else retry(s);
