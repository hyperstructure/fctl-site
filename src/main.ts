// The landing page: the foundry scene as the hero, with a few imaginary
// sessions at work, the map of how the pieces fit, the footer's melting
// wordmark, plus copy buttons and scroll reveals.

import "./site.css";
import "./mocks.css";
import "./home.css";
import { mount, prefersReducedMotion } from "@hyperstructure/design/gl/core";
import { type FoundryLane, foundry, LANES } from "@hyperstructure/design/gl/foundry";
import { footer } from "./footer";
import { type MapLink, mapScene } from "./home-scenes";
import { menus } from "./nav";

document.documentElement.classList.add("js");

function hero() {
  const canvas = document.querySelector<HTMLCanvasElement>(".hero-canvas");
  const section = canvas?.closest<HTMLElement>(".hero");
  if (!canvas || !section) return;
  const scene = foundry({ planet: [1.02, -0.75, 1.15], density: 0.55 });
  mount(canvas, scene.scene, { pixel: 3 });

  // A dozen sessions: mostly working (yellow), some waiting for a reply
  // (blue), now and then one paused (pink). They come and go slowly.
  const lanes = new Map<number, FoundryLane>();
  const pick = () => Math.floor(Math.random() * LANES);
  const color = () => {
    const r = Math.random();
    return r < 0.7 ? 1 : r < 0.92 ? 2 : 3;
  };
  while (lanes.size < 9) lanes.set(pick(), { lit: 1, color: color(), energy: Math.random() * 0.6 });
  scene.setLanes(lanes);
  if (prefersReducedMotion()) return;

  setInterval(() => {
    const working = [...lanes.entries()].filter(([, l]) => l.color === 1);
    const [lane, l] = working[Math.floor(Math.random() * working.length)] ?? [];
    if (lane === undefined || !l) return;
    scene.pulse(lane, 40 + Math.random() * 900);
    l.energy = Math.min(1, l.energy + 0.25);
  }, 420);
  setInterval(() => {
    for (const l of lanes.values()) l.energy *= 0.8;
    // Now and then a session finishes and another starts elsewhere.
    if (Math.random() < 0.18) {
      const keys = [...lanes.keys()];
      const gone = keys[Math.floor(Math.random() * keys.length)];
      if (gone !== undefined) lanes.delete(gone);
      let next = pick();
      while (lanes.has(next)) next = pick();
      lanes.set(next, { lit: 1, color: color(), energy: 0.5 });
    }
    scene.setLanes(lanes);
  }, 1200);

  section.addEventListener("pointermove", (e) => {
    const r = section.getBoundingClientRect();
    scene.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  section.addEventListener("pointerleave", () => scene.pointerLeave());
}

function copyButtons() {
  for (const b of document.querySelectorAll<HTMLButtonElement>("button[data-copy]")) {
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy ?? "");
        b.textContent = "Copied";
        b.classList.add("done");
        setTimeout(() => {
          b.textContent = "Copy";
          b.classList.remove("done");
        }, 1600);
      } catch {
        b.textContent = "Select and copy";
      }
    });
  }
}

function reveals() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    for (const el of els) el.classList.add("seen");
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("seen");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  for (const el of els) io.observe(el);
}

/** A color of the map scene's palette for a status dot: 0 yellow, 1 pink, 2 blue. */
function dotColor(node: HTMLElement) {
  const dot = node.querySelector(".dot");
  return dot?.classList.contains("p") ? 1 : dot?.classList.contains("b") ? 2 : 0;
}

/**
 * The map of how the pieces fit: a scene behind the nodes draws the links
 * between them, from where the page lays them out. Pointing at a node
 * lights the way from it to you, or to its sandboxes, and dims the rest.
 */
function map() {
  const root = document.querySelector<HTMLElement>(".map");
  const canvas = root?.querySelector<HTMLCanvasElement>(".map-canvas");
  const cols = root?.querySelector<HTMLElement>(".map-cols");
  const core = root?.querySelector<HTMLElement>("[data-core]");
  if (!root || !canvas || !cols || !core) return;
  const scene = mapScene();
  mount(canvas, scene.scene, { pixel: 3 });
  if (canvas.dataset.webgl) return;
  root.classList.add("gl");

  // Requests go out pink; events come back yellow, or in a sandbox's color.
  const nodes = [...root.querySelectorAll<HTMLElement>(".map-node")];
  const hosts = nodes.filter((n) => n.dataset.host);
  const pairs = [
    ...nodes.filter((n) => n.dataset.from === "clients").map((a) => ({ a, b: core, back: 0 })),
    ...hosts.map((b) => ({ a: core, b, back: 0 })),
    ...nodes.flatMap((b) => {
      const a = hosts.find((h) => b.dataset.on && h.dataset.host === b.dataset.on);
      return a ? [{ a, b, back: dotColor(b) }] : [];
    }),
  ];

  const place = () => {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    // Side by side, the links run across; stacked, on phones, they run down.
    const down = getComputedStyle(cols).gridTemplateColumns.split(" ").length < 2;
    const at = (x: number, y: number): [number, number] => [
      (x - box.left) / box.width,
      (y - box.top) / box.height,
    ];
    const links: MapLink[] = pairs.map(({ a, b, back }) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return {
        from: down ? at(ra.left + ra.width / 2, ra.bottom) : at(ra.right, ra.top + ra.height / 2),
        to: down ? at(rb.left + rb.width / 2, rb.top) : at(rb.left, rb.top + rb.height / 2),
        out: 1,
        back,
        both: true,
      };
    });
    const rc = core.getBoundingClientRect();
    const [x, y] = at(rc.left + rc.width / 2, rc.top + rc.height / 2);
    const px = 1 / box.height;
    scene.set(links, { x, y, w: (rc.width / 2) * px, h: (rc.height / 2) * px, px }, down);
  };
  new ResizeObserver(place).observe(root);
  void document.fonts?.ready.then(place);
  place();

  // The parts a node leads to, both ways along the links.
  const path = (node: HTMLElement) => {
    const on = new Set([node]);
    for (const ahead of [true, false]) {
      const next = [node];
      for (let n = next.pop(); n; n = next.pop()) {
        for (const { a, b } of pairs) {
          const [from, to] = ahead ? [a, b] : [b, a];
          if (from === n && !on.has(to)) {
            on.add(to);
            next.push(to);
          }
        }
      }
    }
    return on;
  };
  const point = (node: HTMLElement | null) => {
    const on = node ? path(node) : null;
    scene.light(on ? pairs.map(({ a, b }) => on.has(a) && on.has(b)) : null);
    for (const n of nodes) n.classList.toggle("dim", !!on && !on.has(n));
  };
  for (const n of nodes) {
    n.addEventListener("pointerenter", () => point(n));
    n.addEventListener("pointerleave", () => point(null));
  }
  root.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    scene.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  root.addEventListener("pointerleave", () => scene.pointerLeave());
}

hero();
copyButtons();
reveals();
map();
footer();
menus();
