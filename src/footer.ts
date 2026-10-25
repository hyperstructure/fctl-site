// The footer's wordmark melting into the end of the page, on the pages
// whose footer is src/partials/footer.html. Without WebGL it stays type.

import { mount } from "@hyperstructure/design/gl/core";
import { meltScene } from "./home-scenes";

export function footer() {
  const box = document.querySelector<HTMLElement>(".site-foot .foot-mark");
  const canvas = box?.querySelector<HTMLCanvasElement>(".foot-canvas");
  if (!box || !canvas) return;
  const melt = meltScene("fctl", (px) => `700 ${px}px "Inter Variable", Inter, system-ui, sans-serif`);
  mount(canvas, melt.scene, { pixel: 3 });
  if (canvas.dataset.webgl) return;
  box.classList.add("gl");
  const foot = box.closest<HTMLElement>(".site-foot") ?? box;
  foot.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    melt.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  foot.addEventListener("pointerleave", () => melt.pointerLeave());
}
