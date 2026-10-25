// The landing page: the foundry scene as the hero, with a few imaginary
// sessions at work, plus copy buttons and scroll reveals.

import "./site.css";
import { mount, prefersReducedMotion } from "@hyperstructure/design/gl/core";
import { type FoundryLane, foundry, LANES } from "@hyperstructure/design/gl/foundry";
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

/** Connects every node of the architecture strip to its neighbours. */
function wires() {
  const root = document.querySelector<HTMLElement>(".diagram");
  if (!root) return;
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.classList.add("links");
  svg.setAttribute("aria-hidden", "true");
  root.append(svg);
  const cols = [...root.querySelectorAll<HTMLElement>(":scope > .col")];
  let pulse = 0;
  const draw = () => {
    // Side by side only: on narrow screens the columns stack and the plain wires show.
    const wide = getComputedStyle(root).gridTemplateColumns.split(" ").length > 1;
    root.classList.toggle("linked", wide);
    svg.replaceChildren();
    if (!wide) return;
    const box = root.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    pulse = 0;
    for (let i = 0; i + 1 < cols.length; i++) {
      const from = [...(cols[i]?.children ?? [])];
      const to = [...(cols[i + 1]?.children ?? [])];
      for (const a of from) {
        for (const b of to) {
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          const x1 = ra.right - box.left;
          const y1 = ra.top + ra.height / 2 - box.top;
          const x2 = rb.left - box.left;
          const y2 = rb.top + rb.height / 2 - box.top;
          const mx = (x1 + x2) / 2;
          const d = `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
          for (const cls of ["", "pulse"]) {
            const path = document.createElementNS(NS, "path");
            path.setAttribute("d", d);
            path.setAttribute("pathLength", "600");
            if (cls) {
              path.classList.add(cls);
              path.style.animationDelay = `${(pulse++ * 0.43) % 3.2}s`;
            }
            svg.append(path);
          }
        }
      }
    }
  };
  new ResizeObserver(draw).observe(root);
  void document.fonts?.ready.then(draw);
  draw();
}

hero();
copyButtons();
reveals();
wires();
menus();
