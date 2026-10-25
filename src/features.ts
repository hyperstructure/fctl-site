// The feature pages: the hero's scene, scroll reveals, copy buttons, and
// terminals that type their commands out once they come into view. Without
// JavaScript everything shows as written.

import "./site.css";
import "./features.css";
import "./mocks.css";
import { mount, prefersReducedMotion } from "@hyperstructure/design/gl/core";
import { type FoundryLane, foundry, LANES } from "@hyperstructure/design/gl/foundry";
import { footer } from "./footer";
import { menus } from "./nav";
import { featureScene, isSceneName } from "./scenes";

document.documentElement.classList.add("js");

/** The hero's scene: the page's own field, or the foundry for sessions and the overview. */
function hero() {
  const canvas = document.querySelector<HTMLCanvasElement>(".f-canvas");
  const section = canvas?.closest<HTMLElement>(".f-hero");
  if (!canvas || !section) return;
  const name = canvas.dataset.scene ?? "";
  if (isSceneName(name)) {
    const s = featureScene(name);
    mount(canvas, s.scene, { pixel: 3 });
    section.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      s.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    });
    section.addEventListener("pointerleave", () => s.pointerLeave());
    return;
  }
  // The foundry, busier than the landing page's: many sessions at work.
  const scene = foundry({ planet: [1.04, -0.62, 1.05], density: 0.7 });
  mount(canvas, scene.scene, { pixel: 3 });
  const lanes = new Map<number, FoundryLane>();
  const pick = () => Math.floor(Math.random() * LANES);
  while (lanes.size < 16) {
    const r = Math.random();
    lanes.set(pick(), { lit: 1, color: r < 0.75 ? 1 : r < 0.93 ? 2 : 3, energy: Math.random() * 0.7 });
  }
  scene.setLanes(lanes);
  if (prefersReducedMotion()) return;
  setInterval(() => {
    const working = [...lanes.entries()].filter(([, l]) => l.color === 1);
    const [lane, l] = working[Math.floor(Math.random() * working.length)] ?? [];
    if (lane === undefined || !l) return;
    scene.pulse(lane, 40 + Math.random() * 900);
    l.energy = Math.min(1, l.energy + 0.25);
  }, 300);
  setInterval(() => {
    for (const l of lanes.values()) l.energy *= 0.8;
    scene.setLanes(lanes);
  }, 1200);
  section.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    scene.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  section.addEventListener("pointerleave", () => scene.pointerLeave());
}

function reveals() {
  const els = document.querySelectorAll(".reveal, .f-stage");
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Types a terminal's commands out, a character at a time, and shows each
 * command's output a line at a time after it, as if someone ran them now.
 */
async function play(term: HTMLElement) {
  const lines = [...term.querySelectorAll<HTMLElement>(".term-body > p")];
  for (const p of lines) {
    if (p.classList.contains("cmd") && p.textContent?.trim()) {
      const html = p.innerHTML;
      const text = p.textContent ?? "";
      p.textContent = "";
      p.classList.remove("later");
      const caret = document.createElement("span");
      caret.className = "caret";
      for (let i = 1; i <= text.length; i++) {
        p.textContent = text.slice(0, i);
        p.append(caret);
        await sleep(text[i - 1] === " " ? 38 : 16 + Math.random() * 34);
      }
      await sleep(320);
      p.innerHTML = html;
    } else {
      p.classList.remove("later");
      await sleep(p.dataset.wait ? Number(p.dataset.wait) : 70);
    }
  }
  term.classList.remove("typing");
}

function terminals() {
  const terms = [...document.querySelectorAll<HTMLElement>(".term[data-type]")];
  if (terms.length === 0 || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        void play(e.target as HTMLElement);
      }
    },
    { threshold: 0.35 },
  );
  for (const t of terms) {
    // Hidden from the start (the lines keep their room), until it types them.
    t.classList.add("typing");
    for (const p of t.querySelectorAll(".term-body > p")) p.classList.add("later");
    io.observe(t);
  }
}

hero();
reveals();
copyButtons();
terminals();
footer();
menus();
