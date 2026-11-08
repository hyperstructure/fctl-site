// The landing page: the mark's rings, which agents take apart and put back
// together, as the hero (src/hero.ts), the map of how the pieces fit, the
// footer's melting wordmark, plus copy buttons and scroll reveals.

import "./site.css";
import "./mocks.css";
import "./frames.css";
import "./home.css";
import { mount } from "@hyperstructure/design/gl/core";
import { band } from "./band";
import { branches } from "./branches";
import { footer } from "./footer";
import { heroScene } from "./hero";
import { type MapLink, mapScene } from "./home-scenes";
import { menus } from "./nav";
import { searchTriggers } from "./search";

document.documentElement.classList.add("js");

function hero() {
  const canvas = document.querySelector<HTMLCanvasElement>(".hero-canvas");
  const section = canvas?.closest<HTMLElement>(".hero");
  const stage = section?.querySelector<HTMLElement>(".hero-stage");
  if (!canvas || !section || !stage) return;
  const rings = heroScene();
  mount(canvas, rings.scene, { pixel: 3 });

  // The rings stand in .hero-stage, wherever the layout puts it: beside the
  // copy on wide screens, above it on phones.
  const place = () => {
    const box = canvas.getBoundingClientRect();
    const at = stage.getBoundingClientRect();
    if (!box.height || !at.width) return;
    rings.place(
      (at.left + at.width / 2 - box.left) / box.height,
      1 - (at.top + at.height / 2 - box.top) / box.height,
      Math.min(at.width * 0.31, at.height * 0.31) / box.height,
    );
  };
  const sizes = new ResizeObserver(place);
  sizes.observe(canvas);
  sizes.observe(stage);
  place();

  section.addEventListener("pointermove", (e) => {
    const r = section.getBoundingClientRect();
    rings.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  section.addEventListener("pointerleave", () => rings.pointerLeave());
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
  const dot = node.querySelector(".status-dot");
  return dot?.classList.contains("p") ? 1 : dot?.classList.contains("b") ? 2 : 0;
}

/**
 * The map of how the pieces fit: a scene behind the nodes draws the links
 * between them, from where the page lays them out.
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
  const sizes = new ResizeObserver(place);
  sizes.observe(root);
  sizes.observe(canvas);
  void document.fonts?.ready.then(place);
  place();
}

hero();
copyButtons();
reveals();
branches();
band();
map();
footer();
menus();
searchTriggers();
