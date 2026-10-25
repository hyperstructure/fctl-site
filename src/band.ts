// The landing page's section divider: a halftone band the width of the
// window, a grid of dots that swell and shrink as a slow field drifts
// through it. Each dot is one brand color (yellow, ink on light pages, pink
// or blue), dithered between them where the field's colors meet, as the
// site's other scenes are. Without WebGL the band is a still dot pattern in
// CSS (src/home.css).

import {
  compile,
  cssColor,
  FULLSCREEN_VS,
  GLSL_NOISE,
  isDark,
  mount,
  type Scene,
} from "@hyperstructure/design/gl/core";
import { easedPointer } from "./scenes";

/** A dot's cell, in CSS pixels. */
const CELL = 14;

const BAND = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;    // device pixels
uniform float uTime;
uniform float uCell;  // a dot's cell, in device pixels
uniform vec3 uY;      // yellow, ink on light pages
uniform vec3 uP;      // hot pink
uniform vec3 uB;      // blue
uniform vec3 uN;      // the small dots between: ink-4
uniform vec3 uMouse;  // pointer (0..1, y up) and its strength
${GLSL_NOISE}
float flow(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) { v += a * vnoise(p); p = m * p; a *= 0.5; }
  return v / 0.875;
}
float bayer4(vec2 p) {
  ivec2 q = ivec2(mod(p, 4.0));
  int a = q.x ^ q.y;
  int v = ((a & 1) << 3) | ((q.y & 1) << 2) | ((a & 2)) | ((q.y & 2) >> 1);
  return (float(v) + 0.5) / 16.0;
}
void main() {
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 c = (cell + 0.5) * uCell;
  float aspect = uRes.x / uRes.y;
  vec2 uv = c / uRes.y;
  float t = uTime;
  // The field: noise drifting slowly to the right, folded over itself.
  vec2 q = vec2(uv.x * 0.42 - t * 0.03, uv.y * 0.85 + t * 0.01);
  float n = flow(q + vec2(1.3 * flow(q * 0.8 + vec2(t * 0.014, 3.1)), 0.0));
  float k = smoothstep(0.46, 0.82, n);
  // The band's shape: dots shrink towards its top and bottom, and at the
  // window's sides; they swell a little under the pointer.
  float y = c.y / uRes.y;
  float x = c.x / uRes.x;
  float env = pow(sin(3.14159 * y), 1.1) * smoothstep(0.0, 0.08, x) * smoothstep(0.0, 0.08, 1.0 - x);
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);
  float near = uMouse.z * exp(-length(uv - m) * 3.5);
  float r = (0.08 + 0.3 * k + 0.1 * near) * env;
  float d = length(gl_FragCoord.xy - c) / uCell;
  float aa = 1.2 / uCell;
  // Small dots dim, big ones bright.
  float a = (1.0 - smoothstep(r - aa, r + aa, d)) * step(0.04, r) * mix(0.4, 1.0, k) * mix(0.5, 1.0, env);
  // Each dot one color: a second, slower field picks yellow, pink or blue in
  // broad regions, dithered only along the seams between them; the small dots
  // between stay neutral.
  float th = bayer4(cell);
  float s = smoothstep(0.32, 0.68, vnoise(vec2(uv.x * 0.22 + t * 0.016, 5.0 + uv.y * 0.3 + t * 0.008)));
  float pick = floor(clamp(s * 3.0 + (th - 0.5) * 0.5, 0.0, 2.999));
  vec3 col = pick < 0.5 ? uB : (pick < 1.5 ? uP : uY);
  float lit = smoothstep(0.1, 0.55, k + 0.25 * near);
  if (lit < th) {
    col = uN;
    a *= 0.55;
  }
  outColor = vec4(col, 1.0) * a;
}`;

export interface BandHandle {
  scene: Scene;
  pointer(x: number, y: number): void;
  pointerLeave(): void;
}

export function bandScene(): BandHandle {
  let prog: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  const u: Record<string, WebGLUniformLocation | null> = {};
  const p = easedPointer();
  const scene: Scene = {
    init(gl) {
      prog = compile(gl, FULLSCREEN_VS, BAND);
      vao = gl.createVertexArray();
      for (const n of ["uRes", "uTime", "uCell", "uY", "uP", "uB", "uN", "uMouse"]) {
        u[n] = gl.getUniformLocation(prog, n);
      }
    },
    frame({ gl, width, height, time, dt, dpr }) {
      if (!prog) return;
      p.step(dt);
      const dark = isDark();
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform2f(u.uRes ?? null, width, height);
      gl.uniform1f(u.uTime ?? null, time);
      gl.uniform1f(u.uCell ?? null, CELL * dpr);
      gl.uniform3fv(
        u.uY ?? null,
        dark ? cssColor("--c-accent", [1, 1, 0.36]) : cssColor("--c-ink", [0.09, 0.09, 0.09]),
      );
      gl.uniform3fv(u.uP ?? null, cssColor("--c-pink", [1, 0, 0.85]));
      gl.uniform3fv(u.uB ?? null, cssColor("--c-blue", [0, 0.49, 1]));
      gl.uniform3fv(u.uN ?? null, cssColor("--c-ink-4", dark ? [0.37, 0.37, 0.37] : [0.64, 0.64, 0.64]));
      gl.uniform3fv(u.uMouse ?? null, p.mouse);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    },
    dispose(gl) {
      if (prog) gl.deleteProgram(prog);
      if (vao) gl.deleteVertexArray(vao);
    },
  };
  return { scene, pointer: p.pointer, pointerLeave: p.pointerLeave };
}

/** Mounts the band on the landing page, where WebGL runs. */
export function band() {
  const root = document.querySelector<HTMLElement>(".band");
  const canvas = root?.querySelector<HTMLCanvasElement>(".band-canvas");
  if (!root || !canvas) return;
  const b = bandScene();
  // Full resolution, for round dots; slow, so 30 frames a second are plenty.
  mount(canvas, b.scene, { scale: 1, maxDpr: 2, fps: 30 });
  if (canvas.dataset.webgl) return;
  root.classList.add("gl");
  root.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    b.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  root.addEventListener("pointerleave", () => b.pointerLeave());
}
