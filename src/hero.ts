// The landing page's hero scene: fctl's mark taken apart and put back
// together by its agents. The mark is rounded squares turning inside each
// other; here they are rings with depth, five of them, each turning on an
// axis of its own like the rings of a gyroscope, while an agent runs round
// each one, a comet with a lit trail. Every cycle they come to rest one after
// another, outer first, as the mark (each ring turned 18° past the one
// outside it, as the mark's two are), hold it for a few seconds, and set off
// again.
//
// Dithered to the brand palette like the feature pages' scenes (src/scenes.ts),
// with their stars and grain: a face catches the light in its own color, the
// sides turned from it go sparse. With reduced motion it stands still as the
// mark. The page decides where it stands: main.ts measures .hero-stage and
// passes its middle and size (place()).

import { compile, FULLSCREEN_VS, prefersReducedMotion, type Scene } from "@hyperstructure/design/gl/core";
import { easedPointer, HEAD, MAIN, setUniforms, UNIFORMS } from "./scenes";

const RINGS = 5;
/** Each ring's half-width against the one outside it, as the mark's. */
const SHRINK = 0.74;
/** How far each ring turns past the one outside it when they make the mark: 18°. */
const TWIST = Math.PI / 10;
/** One cycle: the rings set off, turn, and come back as the mark, which holds for HOLD. */
const CYCLE = 15;
const HOLD = 3.4;
/** Where in the cycle the page opens: the mark, a moment before the rings set off. */
const OPEN = CYCLE - 1.2;
/** The still frame, where motion is reduced: the mark. */
const STILL = CYCLE - HOLD / 2;
/** How long after the ring outside it each ring sets off, and comes to rest. */
const STAGGER = 0.32;
/** Whole turns each ring makes a cycle, on an axis in its own plane. */
const TURNS = [1, -1, 1, -2, 2];
/** The angle of that axis in the ring's plane. */
const AXES = [0.35, 1.9, 0.9, 2.6, 1.4];
/** How fast each ring's agent goes round it, in rounds a second, and which way. */
const PACE = [0.07, -0.09, 0.11, -0.13, 0.16];

const FIELD = `
#define RINGS ${RINGS}
uniform vec3 uStage;        // the rings' middle on screen (x, y) and the outer ring's half-width, in heights
uniform mat3 uRing[RINGS];  // the world into each ring's own frame, in which it lies flat (z = 0)
uniform float uAgent[RINGS]; // how far round its ring each agent is, 0 to 1
uniform float uWay[RINGS];   // and which way it goes: 1 or -1

const float SHRINK = ${SHRINK.toFixed(4)};
const float BAND = 0.066;   // a ring's half-width across, as the mark's
const float DEPTH = 0.07;   // and half its depth
const float DIST = 6.0;     // the camera's distance, in the outer ring's half-width
const vec3 LIGHT = vec3(-0.45, 0.62, 0.64);

// Yellow, pink, blue, white, pink from the outside in: neighbours differ on light pages too,
// where yellow and white are both ink.
vec3 ringColor(int k) {
  return k == 0 ? uY : (k == 1 ? uP : (k == 2 ? uB : (k == 3 ? uInk : uP)));
}
vec3 agentColor(int k) {
  return k == 0 || k == 3 ? uP : uY;
}
float box(vec2 x, float s) {
  return sdRoundBox(x, vec2(s), s * 0.42);
}
// How far x, in a ring's plane, is outside the band of the ring of half-width s.
float band(vec2 x, float s) {
  return abs(box(x, s)) - BAND;
}

void field(vec2 p, inout vec3 col, inout float v) {
  vec2 sc = p - uStage.xy;
  float lens = uStage.z * DIST;
  vec3 ro = vec3(0.0, 0.0, DIST);
  vec3 rd = normalize(vec3(sc.x, sc.y, -lens));
  vec3 light = normalize(LIGHT);

  // Only rays that pass near the rings can meet one.
  float b = dot(ro, rd);
  if (b * b - dot(ro, ro) + 1.9 < 0.0) return;

  float best = 1e9;
  int hit = -1;
  vec2 at = vec2(0.0);
  vec3 nl = vec3(0.0);   // the normal where it meets, in the ring's frame
  float edge = 1e9;      // how far inside the face's edge, in pixels
  for (int k = 0; k < RINGS; k++) {
    mat3 m = uRing[k];
    vec3 o = m * ro;
    vec3 d = m * rd;
    float s = pow(SHRINK, float(k));
    // Where the ray is within the ring's depth: on a face, or along it to a side.
    float dz = abs(d.z) < 1e-5 ? 1e-5 : d.z;
    float t1 = (-DEPTH - o.z) / dz;
    float t2 = (DEPTH - o.z) / dz;
    float ta = min(t1, t2);
    float tb = max(t1, t2);
    if (tb < 0.0 || ta > best) continue;
    vec2 a = (o + d * ta).xy;
    vec2 e = (o + d * tb).xy;
    float fa = band(a, s);
    if (fa <= 0.0) {
      best = ta;
      hit = k;
      at = a;
      nl = vec3(0.0, 0.0, -sign(dz));
      // A pixel's footprint on the face, to draw its edge a pixel wide.
      edge = -fa / (ta * gPixel / lens / sqrt(max(abs(d.z), 0.05)));
      continue;
    }
    vec2 dir = e - a;
    float len = length(dir);
    dir /= max(len, 1e-6);
    float walked = fa;
    for (int i = 0; i < 10; i++) {
      if (walked >= len) break;
      vec2 x = a + dir * walked;
      float fx = band(x, s);
      if (fx < 0.0015) {
        float t = ta + (tb - ta) * walked / max(len, 1e-6);
        if (t < best) {
          best = t;
          hit = k;
          at = x;
          // The side's normal: away from the band, out or in.
          vec2 g = vec2(box(x + vec2(0.002, 0.0), s) - box(x - vec2(0.002, 0.0), s),
                        box(x + vec2(0.0, 0.002), s) - box(x - vec2(0.0, 0.002), s));
          nl = vec3(normalize(g) * sign(box(x, s)), 0.0);
          edge = 1e9;
        }
        break;
      }
      walked += fx;
    }
  }
  if (hit < 0) return;

  vec3 n = transpose(uRing[hit]) * nl;
  float diff = max(dot(n, light), 0.0);
  float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 18.0);
  vec3 c = ringColor(hit);
  take(col, v, c, (0.3 + 0.7 * diff) * 0.95 + spec * 0.6);
  // The face's edges, drawn as lines.
  take(col, v, c, exp(-edge * edge / 1.6) * (0.55 + 0.6 * diff));

  // The agent: a head across the band, and its trail down the band's middle, fading behind it.
  float u = atan(at.y, at.x) / 6.28318 + 0.5;
  float behind = fract((uAgent[hit] - u) * uWay[hit]);
  float s = pow(SHRINK, float(hit));
  float middle = step(abs(box(at, s)), BAND * 0.38) * step(DEPTH * 0.5, abs(nl.z));
  float trail = exp(-behind * 9.0) * step(behind, 0.5) * middle;
  float head = exp(-behind * behind * 3000.0);
  take(col, v, agentColor(hit), trail * 1.25 + head * 1.8);
}`;

type Vec3 = [number, number, number];
/** A 3×3 matrix, column-major (as WebGL takes them). */
type Mat3 = Float32Array;

function axisAngle([x, y, z]: Vec3, a: number): Mat3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const t = 1 - c;
  return new Float32Array([
    t * x * x + c,
    t * x * y + s * z,
    t * x * z - s * y,
    t * x * y - s * z,
    t * y * y + c,
    t * y * z + s * x,
    t * x * z + s * y,
    t * y * z - s * x,
    t * z * z + c,
  ]);
}

function mul(a: Mat3, b: Mat3): Mat3 {
  const r = new Float32Array(9);
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += (a[k * 3 + row] ?? 0) * (b[col * 3 + k] ?? 0);
      r[col * 3 + row] = sum;
    }
  }
  return r;
}

function transpose(m: Mat3): Mat3 {
  return new Float32Array([
    m[0] ?? 0,
    m[3] ?? 0,
    m[6] ?? 0,
    m[1] ?? 0,
    m[4] ?? 0,
    m[7] ?? 0,
    m[2] ?? 0,
    m[5] ?? 0,
    m[8] ?? 0,
  ]);
}

/** 0 to 1 with no speed at either end. */
const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/** How far round its axis ring k has turned at the time, in radians: none while the rings hold the mark. */
export function turned(k: number, time: number): number {
  const at = ((time % CYCLE) + CYCLE) % CYCLE;
  const start = k * STAGGER;
  const end = CYCLE - HOLD - (RINGS - 1 - k) * STAGGER;
  return 2 * Math.PI * (TURNS[k] ?? 1) * ease((at - start) / (end - start));
}

export interface HeroHandle {
  scene: Scene;
  pointer(x: number, y: number): void;
  pointerLeave(): void;
  /** Where the rings stand: their middle at (x, y) and the outer one's half-width, in the canvas's heights, y up. */
  place(x: number, y: number, size: number): void;
}

/** The hero's rings, dithered to the brand palette. */
export function heroScene(): HeroHandle {
  let prog: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  const u: Record<string, WebGLUniformLocation | null> = {};
  const p = easedPointer();
  const stage = new Float32Array([1.2, 0.5, 0.3]);
  const rings = new Float32Array(9 * RINGS);
  const agents = new Float32Array(RINGS);
  const ways = new Float32Array(PACE.map(Math.sign));
  const still = prefersReducedMotion();

  const pose = (clock: number) => {
    const time = still ? STILL : clock + OPEN;
    const [mx = 0.5, my = 0.5, mz = 0] = p.mouse;
    // The whole sways a little, and leans towards the pointer.
    const lean = mul(
      axisAngle([0, 1, 0], -0.42 + 0.16 * Math.sin(time * 0.19) + (mx - 0.5) * 0.5 * mz),
      axisAngle([1, 0, 0], -0.5 + 0.07 * Math.sin(time * 0.23) - (my - 0.5) * 0.4 * mz),
    );
    for (let k = 0; k < RINGS; k++) {
      const axis: Vec3 = [Math.cos(AXES[k] ?? 0), Math.sin(AXES[k] ?? 0), 0];
      const local = mul(axisAngle([0, 0, 1], TWIST * (k + 1)), axisAngle(axis, turned(k, time)));
      const world = mul(lean, local);
      rings.set(transpose(world), k * 9);
      agents[k] = (((time * (PACE[k] ?? 0.1) + k * 0.37) % 1) + 1) % 1;
    }
  };

  const scene: Scene = {
    init(gl) {
      prog = compile(gl, FULLSCREEN_VS, HEAD + FIELD + MAIN);
      vao = gl.createVertexArray();
      for (const n of [...UNIFORMS, "uStage", "uRing", "uAgent", "uWay"])
        u[n] = gl.getUniformLocation(prog, n);
    },
    frame({ gl, width, height, time, dt }) {
      if (!prog) return;
      p.step(dt);
      pose(time);
      gl.disable(gl.BLEND);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      setUniforms(gl, u, width, height, time, p.mouse);
      gl.uniform3fv(u.uStage ?? null, stage);
      gl.uniformMatrix3fv(u.uRing ?? null, false, rings);
      gl.uniform1fv(u.uAgent ?? null, agents);
      gl.uniform1fv(u.uWay ?? null, ways);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    },
    dispose(gl) {
      if (prog) gl.deleteProgram(prog);
      if (vao) gl.deleteVertexArray(vao);
    },
  };
  return {
    scene,
    pointer: p.pointer,
    pointerLeave: p.pointerLeave,
    place(x, y, size) {
      stage[0] = x;
      stage[1] = y;
      stage[2] = size;
      scene.invalidate?.();
    },
  };
}
