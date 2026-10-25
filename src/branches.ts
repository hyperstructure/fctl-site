// The landing page's divider above the tour: a git graph that grows as you
// watch, the width of the window. Branches fork off main, gather commits
// and merge back, in the brand's colors, drifting slowly to the left past
// the present: each commit made there sends out a small ripple, and what
// isn't made yet is a faint dashed outline to its right. Without WebGL the
// graph is a still drawing (src/home.css).

import {
  compile,
  cssColor,
  FULLSCREEN_VS,
  GLSL_NOISE,
  isDark,
  mount,
  type Scene,
} from "@hyperstructure/design/gl/core";

/** Where the present is, as a fraction of the width. */
const NOW = 0.8;

const BRANCHES = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;    // device pixels
uniform float uTime;
uniform float uScale; // device pixels to a CSS pixel
uniform float uNow;   // where the present is, as a fraction of the width
uniform vec3 uY;      // yellow, ink on light pages
uniform vec3 uP;      // hot pink
uniform vec3 uB;      // blue
uniform vec3 uN;      // main's line, and what isn't made yet
${GLSL_NOISE}

// In CSS pixels and seconds.
const float SPEED = 12.0; // how fast the graph drifts left
const float C = 30.0;     // a fork's or a merge's length
const float D = 24.0;     // between commits
const float R = 2.8;      // a commit's radius

vec4 acc = vec4(0.0);
// Paints c over what is there, by coverage a.
void paint(vec3 c, float a) {
  acc = vec4(c, 1.0) * a + acc * (1.0 - a);
}
// How much of a device pixel a shape covers, from its signed distance.
float cover(float d) {
  return clamp(0.5 - d * uScale, 0.0, 1.0);
}
vec3 tint(float h) {
  return h < 0.45 ? uY : (h < 0.75 ? uP : uB);
}

// A lane: its index, its height above main, the width of the slots that
// hold at most one branch each, how likely a slot holds one, and its phase.
struct Lane {
  float j, y, w, p, phase;
};

// The lane's branch in the slot that holds graph position u: whether there
// is one, and where it forks (xs) and merges (xe), in graph positions.
bool branch(Lane l, float u, out float xs, out float xe, out float h) {
  float s = floor((u + l.phase) / l.w);
  vec2 id = vec2(s, l.j * 13.7);
  h = hash12(id + 4.19);
  float base = s * l.w - l.phase;
  xs = base + mix(0.08, 0.3, hash12(id + 1.31)) * l.w;
  xe = min(xs + mix(0.4, 0.66, hash12(id + 2.77)) * l.w, base + l.w - 14.0);
  return hash12(id) < l.p;
}
// Whether the lane's branch is anywhere in [a, b].
bool busy(Lane l, float a, float b) {
  float xs, xe, h;
  if (branch(l, a, xs, xe, h) && b > xs - 8.0 && a < xe + 8.0) return true;
  if (branch(l, b, xs, xe, h) && b > xs - 8.0 && a < xe + 8.0) return true;
  return false;
}

void lane(vec2 p, float u, float nowX, Lane l, bool outer, Lane inner) {
  float xs, xe, h;
  if (!branch(l, u, xs, xe, h)) return;
  float Y = l.y;
  // An outer lane forks and merges only where the inner lane on its side is
  // free, so that no lines cross.
  if (outer && (busy(inner, xs, xs + C) || busy(inner, xe - C, xe))) return;
  vec3 c = tint(h);
  float left = p.x - u;  // where graph position 0 is on screen
  // The branch: off main and back, a smooth S each way.
  if (u > xs - 2.0 && u < xe + 2.0) {
    float t1 = clamp((u - xs) / C, 0.0, 1.0);
    float t2 = clamp((u - (xe - C)) / C, 0.0, 1.0);
    float s1 = t1 * t1 * (3.0 - 2.0 * t1);
    float s2 = t2 * t2 * (3.0 - 2.0 * t2);
    float dk = 6.0 * t1 * (1.0 - t1) / C * (1.0 - s2) - s1 * 6.0 * t2 * (1.0 - t2) / C;
    float d = abs(p.y - Y * s1 * (1.0 - s2)) / sqrt(1.0 + Y * Y * dk * dk);
    float made = smoothstep(nowX + 1.5, nowX - 1.5, p.x);
    float dash = step(0.45, fract(u / 7.0));
    paint(c, cover(d - 0.7) * mix(0.22 * dash, 0.6, made));
  }
  // Its commits, along the run.
  float x0 = xs + C + 6.0;
  float x1 = xe - C - 6.0;
  if (x1 > x0) {
    float k = clamp(floor((u - x0) / D + 0.5), 0.0, floor((x1 - x0) / D));
    float cx = x0 + k * D;
    float dc = length(vec2(u - cx, p.y - Y));
    float at = left + cx;
    if (at < nowX) {
      // Made: a dot, and a ripple as it was made.
      float age = (nowX - at) / SPEED;
      float rr = R + 8.5 * (1.0 - exp(-age * 1.6));
      paint(c, cover(abs(dc - rr) - 0.55) * exp(-age * 1.1) * 0.55);
      paint(c, cover(dc - R));
    } else {
      paint(uN, cover(abs(dc - R) - 0.5) * 0.5);
    }
  }
  // Its merge into main: a ring, with main showing through it.
  float dm = length(vec2(u - xe, p.y));
  float mx = left + xe;
  if (mx < nowX) {
    float age = (nowX - mx) / SPEED;
    float rr = 4.4 + 9.0 * (1.0 - exp(-age * 1.6));
    paint(c, cover(abs(dm - rr) - 0.55) * exp(-age * 1.1) * 0.55);
    acc *= 1.0 - cover(dm - 3.6);
    paint(c, cover(abs(dm - 4.4) - 0.8));
  } else {
    acc *= 1.0 - cover(dm - 3.6);
    paint(uN, cover(abs(dm - 4.4) - 0.55) * 0.5);
  }
}

void main() {
  // CSS pixels, from the band's left edge and its middle, up.
  vec2 p = vec2(gl_FragCoord.x, gl_FragCoord.y - uRes.y * 0.5) / uScale;
  float w = uRes.x / uScale;
  float half_ = uRes.y * 0.5 / uScale;
  float nowX = uNow * w;
  float u = p.x + uTime * SPEED;
  // Main: solid up to the present, a faint dashed line after it.
  float made = smoothstep(nowX + 1.5, nowX - 1.5, p.x);
  float dash = step(0.45, fract(u / 7.0));
  paint(uN, cover(abs(p.y) - 0.6) * mix(0.3 * dash, 0.7, made));
  // The present: a hairline across the band, fading out at its ends.
  paint(uN, cover(abs(p.x - nowX) - 0.5) * 0.22 * smoothstep(half_, half_ * 0.35, abs(p.y)));
  // The lanes, outer ones first: two above main, two below.
  Lane above = Lane(0.0, 22.0, 290.0, 0.8, 0.0);
  Lane below = Lane(1.0, -22.0, 340.0, 0.75, 41.0);
  lane(p, u, nowX, Lane(2.0, 44.0, 470.0, 0.55, 211.0), true, above);
  lane(p, u, nowX, Lane(3.0, -44.0, 530.0, 0.5, 97.0), true, below);
  lane(p, u, nowX, above, false, above);
  lane(p, u, nowX, below, false, below);
  // HEAD, where main is now, breathing slowly.
  float dh = length(vec2(p.x - nowX, p.y));
  float beat = fract(uTime / 3.4);
  paint(uY, cover(abs(dh - (4.0 + 10.0 * beat)) - 0.6) * (1.0 - beat) * 0.45);
  paint(uY, cover(dh - 4.0));
  outColor = acc;
}`;

export function branchesScene(): Scene {
  let prog: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  const u: Record<string, WebGLUniformLocation | null> = {};
  return {
    init(gl) {
      prog = compile(gl, FULLSCREEN_VS, BRANCHES);
      vao = gl.createVertexArray();
      for (const n of ["uRes", "uTime", "uScale", "uNow", "uY", "uP", "uB", "uN"]) {
        u[n] = gl.getUniformLocation(prog, n);
      }
    },
    frame({ gl, width, height, time, dpr }) {
      if (!prog) return;
      const dark = isDark();
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform2f(u.uRes ?? null, width, height);
      gl.uniform1f(u.uTime ?? null, time);
      gl.uniform1f(u.uScale ?? null, dpr);
      gl.uniform1f(u.uNow ?? null, NOW);
      gl.uniform3fv(
        u.uY ?? null,
        dark ? cssColor("--c-accent", [1, 1, 0.36]) : cssColor("--c-ink", [0.09, 0.09, 0.09]),
      );
      gl.uniform3fv(u.uP ?? null, cssColor("--c-pink", [1, 0, 0.85]));
      gl.uniform3fv(u.uB ?? null, cssColor("--c-blue", [0, 0.49, 1]));
      gl.uniform3fv(u.uN ?? null, cssColor("--c-ink-3", dark ? [0.55, 0.55, 0.55] : [0.42, 0.42, 0.42]));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    },
    dispose(gl) {
      if (prog) gl.deleteProgram(prog);
      if (vao) gl.deleteVertexArray(vao);
    },
  };
}

/** Mounts the graph on the landing page, where WebGL runs. */
export function branches() {
  const root = document.querySelector<HTMLElement>(".branches");
  const canvas = root?.querySelector<HTMLCanvasElement>(".branches-canvas");
  if (!root || !canvas) return;
  // Full resolution, for hairlines; slow, so 30 frames a second are plenty.
  mount(canvas, branchesScene(), { scale: 1, maxDpr: 2, fps: 30 });
  if (!canvas.dataset.webgl) root.classList.add("gl");
}
