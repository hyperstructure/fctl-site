// The Autopilots page's hero scene: a heading indicator, as the app's autopilot mark draws one,
// holding its course. A comet runs round its ring, open below like a gauge; the heading bug (pink)
// is the course people set, and the arrow turns after it as an autopilot does, a moment later.
// Pointing into the hero moves the bug: you steer, and it follows. Its crew go out on orbits of
// their own, lit while they work, and send word back along their tethers as their turns end,
// which wakes the ring.
//
// Rendered as the other feature scenes are (src/scenes.ts): low resolution, dithered to the brand
// palette. Its own module, loaded by src/features.ts for this page alone, with three uniforms of
// its own that JavaScript eases: the bug, the arrow's heading and how much a pointer steers.

import { compile, FULLSCREEN_VS, type Scene } from "@hyperstructure/design/gl/core";
import { easedPointer, type FieldHandle, HEAD, MAIN, setUniforms, UNIFORMS } from "./scenes";

const FIELD = `
uniform float uHeading; // where the arrow points: radians clockwise from up
uniform float uBug;     // the course people set, likewise
uniform float uSteer;   // 1 while a pointer sets the course

float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
float cross2(vec2 a, vec2 b) {
  return a.x * b.y - a.y * b.x;
}
bool inTri(vec2 p, vec2 a, vec2 b, vec2 c) {
  float d1 = cross2(b - a, p - a);
  float d2 = cross2(c - b, p - b);
  float d3 = cross2(a - c, p - c);
  bool neg = d1 < 0.0 || d2 < 0.0 || d3 < 0.0;
  bool pos = d1 > 0.0 || d2 > 0.0 || d3 > 0.0;
  return !(neg && pos);
}
// A direction, clockwise from up.
vec2 dirOf(float a) {
  return vec2(sin(a), cos(a));
}

void field(vec2 p, inout vec3 col, inout float v) {
  vec2 c = anchor(0.765, 0.5);
  float R = mix(0.19, 0.205, uWide);
  vec2 q = p - c;
  float r = length(q);
  float th = atan(q.x, q.y);
  // The ring is open below, 30 degrees either side of straight down, as the mark's is.
  float open = smoothstep(0.50, 0.54, 3.14159 - abs(th));

  // The crew: sessions it started, each on an orbit of its own. A session goes out from the ring,
  // works (yellow), ends its turn (blue), sends word in along its tether, and is done.
  float wake = 0.0;
  for (int k = 0; k < 5; k++) {
    float fk = float(k);
    float P = 12.0 + fk * 1.9;
    float tt = (uTime + 4.0 + fk * 3.3) / P;
    float t = fract(tt);
    float cyc = floor(tt);
    float spin = (mod(fk, 2.0) < 0.5 ? 1.0 : -1.0) * (0.07 + 0.02 * fk);
    // Anywhere round it on a phone; beside the copy, on its right, where the copy sits on its left.
    float a0 = mix((hash12(vec2(cyc, fk + 1.0)) - 0.5) * 4.6, -0.5 + hash12(vec2(cyc, fk + 1.0)) * 2.9, uWide);
    float ang = a0 + t * P * spin;
    float Rk = R * (1.36 + 0.17 * fk);
    float rad = mix(R, Rk, smoothstep(0.0, 0.1, t));
    vec2 dir = dirOf(ang);
    vec2 sp = c + dir * rad;
    vec2 ra = c + dir * R;
    float working = step(0.08, t) * step(t, 0.76);
    float resting = step(0.76, t) * step(t, 0.92);
    float alive = 1.0 - smoothstep(0.9, 0.96, t);
    // Its orbit, faint, while it is out.
    take(col, v, uN, line(r - Rk, 0.6) * 0.14 * step(0.1, t) * alive);
    // Its tether to the ring, dotted, running out.
    float dt_ = sdSeg(p, ra, sp);
    float along = dot(p - ra, dir);
    float dots = step(0.5, fract(along * 70.0 - uTime * 1.4));
    take(col, v, uN, line(dt_, 0.7) * dots * 0.5 * (working + resting) * alive);
    // Its word, travelling in as its turn ends, and the ring answering when it lands.
    float msg = (t - 0.76) / 0.08;
    if (msg > 0.0 && msg < 1.0) {
      vec2 mp = mix(sp, ra, msg * msg);
      take(col, v, uB, smoothstep(0.013, 0.0, length(p - mp)) * 1.6);
    }
    float landed = (t - 0.84) / 0.1;
    if (landed > 0.0 && landed < 1.0) {
      wake = max(wake, 1.0 - landed);
      take(col, v, uB, line(r - R * (1.0 + landed * 0.42), 1.3) * (1.0 - landed) * 0.85 * open);
    }
    // The session: a dot, lit while it works, with a ring round it.
    float ds = length(p - sp);
    float pulse = 0.72 + 0.28 * sin(uTime * 3.1 + fk * 1.7);
    vec3 sc = resting > 0.5 ? uB : uY;
    take(col, v, sc, smoothstep(0.016, 0.0, ds) * (working * pulse + resting) * alive * 1.35);
    take(col, v, uInk, line(ds - 0.025, 0.8) * step(0.04, t) * alive * 0.75);
    // A spark as it leaves the ring.
    take(col, v, uY, smoothstep(0.02, 0.0, length(p - ra)) * (1.0 - smoothstep(0.0, 0.06, t)) * 1.2);
  }

  // The ring, brighter as word lands, and its ticks: every 10 degrees, longer every 30.
  take(col, v, uInk, line(r - R, 1.3) * open * (0.9 + 0.5 * wake));
  float st = 0.174533;
  float tk = th / st;
  float idx = floor(tk + 0.5);
  float arc = abs(tk - idx) * st * r;
  bool major = mod(idx, 3.0) < 0.5;
  float len = major ? 0.03 : 0.015;
  float band = step(R + 0.014, r) * step(r, R + 0.014 + len);
  take(col, v, uN, line(arc, 0.7) * band * open * (major ? 0.95 : 0.6));
  // A soft glow inside it.
  take(col, v, uB, exp(-r / R * 3.2) * 0.07);

  // The comet: round the ring from its lower left over the top to its lower right.
  float s = (th + 2.618) / 5.236;
  float head = fract(uTime * 0.13);
  float behind = head - s;
  float tail = behind > 0.0 && behind < 0.3 ? pow(1.0 - behind / 0.3, 1.7) : 0.0;
  take(col, v, uY, tail * line(r - R, 2.0) * open * 1.3);
  vec2 hp = c + dirOf(-2.618 + head * 5.236) * R;
  take(col, v, uY, smoothstep(0.016, 0.0, length(p - hp)) * 1.5);

  // The heading bug, the course people set: a pink notch outside the ring, and the course
  // beyond it, dashed, running out.
  vec2 b = rot(-uBug) * q;
  bool bugIn = inTri(b, vec2(0.0, R + 0.02), vec2(0.022, R + 0.062), vec2(-0.022, R + 0.062));
  take(col, v, uP, bugIn ? 1.2 : 0.0);
  float course = smoothstep(R * 2.2, R * 1.25, b.y) * step(R + 0.075, b.y);
  float dash = step(0.42, fract(b.y * 26.0 - uTime * 1.3));
  take(col, v, uP, line(abs(b.x), 0.8) * dash * course * (0.45 + 0.4 * uSteer));

  // The arrow, the mark's heading: it turns after the bug.
  float unit = R / 9.0;
  vec2 h = rot(-uHeading) * q / unit;
  vec2 T = vec2(0.0, 4.75);
  vec2 Rt = vec2(3.25, -3.5);
  vec2 N = vec2(0.0, -1.6);
  vec2 L = vec2(-3.25, -3.5);
  float de = min(min(sdSeg(h, T, Rt), sdSeg(h, Rt, N)), min(sdSeg(h, N, L), sdSeg(h, L, T))) * unit;
  take(col, v, uInk, line(de, 1.25) * 1.15);
  if (inTri(h, T, Rt, N) || inTri(h, T, N, L)) take(col, v, uInk, 0.28 + 0.2 * uSteer);
  // Where it heads, from its tip to the ring.
  vec2 hh = h * unit;
  take(col, v, uY, line(abs(hh.x), 0.7) * step(5.6 * unit, hh.y) * step(hh.y, R - 0.012) * 0.7);
}`;

/** The difference from angle `b` to angle `a`, the short way round: -π..π. */
function turn(a: number, b: number): number {
  return ((((a - b + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
}

/** The hero's heading indicator, with the pointer as the course it steers to. */
export function headingScene(): FieldHandle {
  let prog: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  const u: Record<string, WebGLUniformLocation | null> = {};
  const p = easedPointer();
  // The bug follows the pointer at once; the arrow turns after it, a critically damped spring.
  let bug = 0;
  let heading = 0;
  let speed = 0;
  const scene: Scene = {
    init(gl) {
      prog = compile(gl, FULLSCREEN_VS, HEAD + FIELD + MAIN);
      vao = gl.createVertexArray();
      for (const n of [...UNIFORMS, "uHeading", "uBug", "uSteer"]) u[n] = gl.getUniformLocation(prog, n);
    },
    frame({ gl, width, height, time, dt }) {
      if (!prog) return;
      p.step(dt);
      const aspect = width / Math.max(1, height);
      const wide = aspect > 1.15;
      const cx = wide ? aspect * 0.74 : aspect * 0.5;
      const cy = wide ? 0.5 : 0.66;
      const steer = p.mouse[2] ?? 0;
      // Left alone, the course drifts a little, as people change the direction now and then.
      let course = 0.22 * Math.sin(time * 0.11) + 0.08 * Math.sin(time * 0.37 + 1);
      if (steer > 0.05) {
        const at = Math.atan2((p.mouse[0] ?? 0.5) * aspect - cx, (p.mouse[1] ?? 0.5) - cy);
        // Clear of the gap below the ring.
        const clamped = Math.max(-2.45, Math.min(2.45, at));
        course = course + turn(clamped, course) * Math.min(1, steer * 1.2);
      }
      bug += turn(course, bug) * (1 - Math.exp(-dt * 12));
      const k = 3.2;
      speed += (k * k * turn(bug, heading) - 2 * k * speed) * dt;
      heading += speed * dt;
      gl.disable(gl.BLEND);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      setUniforms(gl, u, width, height, time, p.mouse);
      gl.uniform1f(u.uHeading ?? null, heading);
      gl.uniform1f(u.uBug ?? null, bug);
      gl.uniform1f(u.uSteer ?? null, steer);
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
