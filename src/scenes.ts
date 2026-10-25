// The feature pages' hero scenes: one dithered field each, in the foundry's
// manner (@hyperstructure/design/gl/foundry). Every scene renders at a low
// resolution and is quantized to the brand palette with an 8×8 ordered
// (Bayer) dither: each pixel is one exact brand color or nothing. On light
// pages yellow becomes ink, as the foundry's working threads do.
//
// A field is a GLSL function `void field(vec2 p, inout vec3 col, inout
// float v)`: p is the pixel in heights (y 0..1 up, x 0..aspect), and the
// layer with the highest value v wins, when v clears the dither threshold.

import {
  compile,
  cssColor,
  FULLSCREEN_VS,
  GLSL_NOISE,
  isDark,
  type Scene,
} from "@hyperstructure/design/gl/core";

export const HEAD = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;
uniform float uTime;
uniform float uDark;
uniform vec3 uInk;   // stars and edges: white on dark, ink on light
uniform vec3 uY;     // working: yellow on dark, ink on light
uniform vec3 uP;     // hot pink
uniform vec3 uB;     // blue
uniform vec3 uN;     // neutral: ink-3 on dark, ink-4 on light
uniform vec3 uMouse; // pointer (0..1, y up) and its strength
uniform float uWide; // 1 when the copy sits beside the scene, 0 on phones
float gAspect;
float gPixel;
${GLSL_NOISE}
float bayer8(vec2 p) {
  ivec2 q = ivec2(mod(p, 8.0));
  int a = q.x ^ q.y;
  int y = q.y;
  int v = ((a & 1) << 5) | ((y & 1) << 4) | ((a & 2) << 2) | ((y & 2) << 1) | ((a & 4) >> 1) | ((y & 4) >> 2);
  return (float(v) + 0.5) / 64.0;
}
// A hairline: 1 on the line, falling off over a pixel or two.
float line(float d, float w) {
  return exp(-pow(d / (gPixel * w), 2.0));
}
void take(inout vec3 col, inout float v, vec3 c, float x) {
  if (x > v) { v = x; col = c; }
}
float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}
// Where the scene's subject sits: beside the copy, or behind it on phones.
vec2 anchor(float x, float y) {
  return vec2(mix(gAspect * 0.5, gAspect * x, uWide), mix(0.66, y, uWide));
}
`;

/**
 * The scenes' main(): the field, then stars and film grain on the empty dark,
 * as the foundry has them, as much as sky (a GLSL expression of p) says.
 */
export const main = (sky = "1.0") => `
void main() {
  vec2 px = floor(gl_FragCoord.xy);
  gAspect = uRes.x / uRes.y;
  gPixel = 1.0 / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y;
  float th = bayer8(px);
  vec3 col = vec3(0.0);
  float v = 0.0;
  field(p, col, v);
  if (v > th) {
    outColor = vec4(col, 1.0);
    return;
  }
  float sky = ${sky};
  float h = hash12(px * 0.913 + 17.0);
  float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + h * 2.4) + h * 40.0);
  if (h > 0.9978) {
    outColor = vec4(uInk * twinkle, twinkle) * sky;
    return;
  }
  float g = hash12(px + floor(uTime * 10.0) * 13.17);
  float a = g > 0.94 ? (uDark > 0.5 ? 0.05 : 0.035) : 0.0;
  outColor = vec4(uInk * a, a) * sky;
}`;

export const MAIN = main();

/** Workspaces: rounded squares turning inside each other, hyperstructure's symbol, nested. */
const TWIST = `
void field(vec2 p, inout vec3 col, inout float v) {
  vec2 c = anchor(0.74, 0.5);
  vec2 q = p - c;
  float size = mix(0.3, 0.42, uWide);
  vec3 cols[4] = vec3[4](uP, uY, uB, uInk);
  for (int k = 0; k < 7; k++) {
    float fk = float(k);
    float s = size * pow(0.74, fk);
    float dir = mod(fk, 2.0) < 0.5 ? 1.0 : -1.0;
    float a = uTime * 0.07 * dir * (1.0 + fk * 0.18) + fk * 0.42;
    vec2 r = rot(a) * q;
    float d = sdRoundBox(r, vec2(s), s * 0.36);
    float lit = 0.55 + 0.45 * sin(uTime * 0.6 - fk * 0.9);
    take(col, v, cols[k % 4], line(d, 1.1) * (0.6 + 0.6 * lit));
    // A soft glow inside the innermost squares.
    if (k >= 5 && d < 0.0) take(col, v, cols[k % 4], exp(d / (s * 0.5)) * 0.32);
    // Projects: points travelling around each square.
    float ang = atan(r.y, r.x);
    float spot = fract(ang / 6.2831 - uTime * 0.03 * (1.0 + fk * 0.2) + fk * 0.37);
    float dot = smoothstep(0.985, 1.0, spot) * line(d, 2.4);
    take(col, v, uY, dot * 1.4);
  }
  // A ring of glow around the whole.
  take(col, v, uB, exp(-abs(length(q) - size * 1.25) * 16.0) * 0.09);
}`;

/** Sandboxes: a little city of boxes, a sandbox each; working ones light up and lift. */
const BOXES = `
// One isometric box at c, half-size h, lifted by z: which face p falls on (0 none, 1 top,
// 2 right, 3 left) and how close to an edge it is.
vec2 box(vec2 p, vec2 c, float h, float z) {
  vec2 s = (p - c - vec2(0.0, z)) / h;
  float u = s.x / 0.866;
  // Top face (z = 1).
  float tx = (u + 2.0 * (1.0 - s.y)) * 0.5;
  float ty = (2.0 * (1.0 - s.y) - u) * 0.5;
  if (abs(tx) <= 1.0 && abs(ty) <= 1.0) return vec2(1.0, 1.0 - max(abs(tx), abs(ty)));
  // Right face (x = 1).
  float ry = 1.0 - u;
  float rz = s.y + 0.5 * (1.0 + ry);
  if (abs(ry) <= 1.0 && abs(rz) <= 1.0) return vec2(2.0, 1.0 - max(abs(ry), abs(rz)));
  // Left face (y = 1).
  float lx = u + 1.0;
  float lz = s.y + 0.5 * (lx + 1.0);
  if (abs(lx) <= 1.0 && abs(lz) <= 1.0) return vec2(3.0, 1.0 - max(abs(lx), abs(lz)));
  return vec2(0.0);
}
void field(vec2 p, inout vec3 col, inout float v) {
  vec2 o = anchor(0.7, 0.4);
  float h = mix(0.036, 0.046, uWide);
  // Far to near, so nearer boxes cover the ones behind.
  for (int k = 0; k < 25; k++) {
    int i = k / 5;
    int j = k - i * 5;
    // Back rows first: boxes with larger i + j stand nearer.
    float fi = float(i), fj = float(j);
    vec2 c = o + vec2((fi - fj) * h * 0.866 * 2.3, -(fi + fj) * h * 0.5 * 2.3 + 0.24);
    float seed = hash12(vec2(fi, fj) * 7.13);
    float on = step(0.62, fract(seed + floor(uTime * 0.18 + seed * 3.0) * 0.37));
    float lift = on * (0.5 + 0.5 * sin(uTime * 1.3 + seed * 6.0)) * h * 0.55;
    vec2 f = box(p, c, h, lift);
    if (f.x < 0.5) continue;
    float shade = f.x < 1.5 ? 0.95 : (f.x < 2.5 ? 0.55 : 0.32);
    float edge = line(f.y * h, 0.9);
    vec3 face = on > 0.5 ? (seed > 0.9 ? uP : uY) : uN;
    vec3 c2 = edge > 0.5 ? uInk : face;
    // Nearer boxes overwrite: reset, then take this face.
    v = 0.0;
    take(col, v, c2, max(edge, shade * (on > 0.5 ? mix(0.62, 0.9, uDark) : 0.42)));
  }
  float floorGlow = exp(-abs(p.y - (o.y - 0.02)) * 30.0) * 0.07 * step(abs(p.x - o.x), 0.6);
  take(col, v, uB, floorGlow);
}`;

/** Linear: tickets travelling their lanes; the ones handed to fctl race along a lit one. */
const LANES = `
void field(vec2 p, inout vec3 col, inout float v) {
  float x0 = mix(0.0, gAspect * 0.42, uWide);
  for (int k = 0; k < 9; k++) {
    float fk = float(k);
    float y = 0.12 + fk * 0.095 + 0.012 * sin(p.x * 3.0 + uTime * 0.3 + fk);
    float d = abs(p.y - y);
    if (d > 0.05) continue;
    bool agent = k == 5;
    float fade = smoothstep(x0 - 0.05, x0 + 0.25, p.x);
    take(col, v, agent ? uY : uN, line(d, agent ? 1.2 : 0.8) * (agent ? 0.8 : 0.35) * fade);
    // Tickets: short capsules moving right.
    float speed = agent ? 0.16 : 0.035 + 0.02 * hash12(vec2(fk, 3.0));
    float cell = 0.34;
    float t = p.x / cell - uTime * speed / cell * 2.0 + hash12(vec2(fk, 9.0)) * 10.0;
    float id = floor(t);
    float u = fract(t);
    float show = step(0.35, hash12(vec2(id, fk)));
    float card = sdRoundBox(vec2((u - 0.5) * cell, p.y - y), vec2(cell * 0.12, 0.011), 0.008);
    vec3 cc = agent ? uY : (hash12(vec2(id, fk + 1.0)) > 0.86 ? uP : uInk);
    take(col, v, cc, (card < 0.0 ? 0.85 : line(card, 1.0)) * show * fade);
  }
}`;

/** Review agents: a lens drifting over the code, magnifying it, with a finding lit inside. */
const LENS = `
float gCodeX;
float code(vec2 q) {
  float row = floor(q.y / 0.024);
  float yy = fract(q.y / 0.024);
  float indent = floor(hash12(vec2(row, 1.0)) * 4.0) * 0.045;
  float len = 0.16 + hash12(vec2(row, 2.0)) * 0.55;
  float x = q.x - gCodeX - indent;
  float seg = step(0.0, x) * step(x, len);
  float gap = step(0.14, fract(x * 6.0 + hash12(vec2(row, 3.0))));
  float empty = step(0.86, hash12(vec2(row, 4.0)));
  return seg * gap * (1.0 - empty) * step(abs(yy - 0.5), 0.18);
}
void field(vec2 p, inout vec3 col, inout float v) {
  vec2 c = anchor(0.72, 0.5) + vec2(0.1 * sin(uTime * 0.21), 0.07 * sin(uTime * 0.17 + 1.0));
  float R = mix(0.2, 0.25, uWide);
  gCodeX = mix(0.08, gAspect * 0.46, uWide);
  vec2 q = p - c;
  float r = length(q);
  float x0 = mix(-1.0, gAspect * 0.38, uWide);
  float right = smoothstep(x0, x0 + 0.3, p.x);
  if (r < R) {
    // Inside the lens: the code, larger and brighter.
    vec2 m = c + q * 0.62;
    float k = code(m + vec2(0.0, uTime * 0.004));
    float row = floor((m.y + uTime * 0.004) / 0.022);
    bool finding = abs(row - floor((c.y + uTime * 0.004) / 0.022)) < 0.5;
    take(col, v, finding ? uY : uInk, k * (finding ? 1.0 : 0.75));
    if (finding) take(col, v, uY, 0.18 * smoothstep(R, 0.0, r));
  } else {
    float k = code(p + vec2(0.0, uTime * 0.004));
    take(col, v, uN, k * 0.55 * right * smoothstep(0.0, 0.12, p.y) * smoothstep(1.0, 0.88, p.y));
  }
  take(col, v, uP, line(r - R, 1.4) * 1.2);
  take(col, v, uP, line(r - R - 0.012, 0.7) * 0.4);
  // A comment, pinned at the lens's edge.
  vec2 pin = c + R * vec2(0.71, 0.71);
  take(col, v, uP, smoothstep(0.016, 0.0, length(p - pin)) * 1.3);
}`;

/** Memory: notes spiralling in and settling on a growing planet of what was learned. */
const ACCRETE = `
float noise3(vec3 p) {
  return vnoise(p.xy + p.z * 1.7) * 0.5 + vnoise(p.yz * 1.3 - p.x * 0.9) * 0.5;
}
void field(vec2 p, inout vec3 col, inout float v) {
  vec2 c = anchor(0.74, 0.46);
  float R = mix(0.16, 0.22, uWide);
  vec2 q = (p - c) / R;
  float r = length(q);
  if (r < 1.0) {
    vec3 n = vec3(q, sqrt(1.0 - r * r));
    float t = uTime * 0.12;
    float cs = cos(t), sn = sin(t);
    vec3 w = vec3(cs * n.x - sn * n.z, n.y, sn * n.x + cs * n.z);
    float bands = noise3(w * 3.4) * 0.7 + noise3(w * 7.0) * 0.4;
    float light = pow(max(dot(n, normalize(vec3(-0.5, 0.55, 0.65))), 0.0), 1.2);
    float rim = pow(1.0 - n.z, 3.0);
    take(col, v, bands > 0.62 ? uP : uB, (0.16 + 0.8 * light) * 0.95 + rim * 0.4);
  }
  take(col, v, uInk, line((r - 1.0) * R, 1.0) * 0.9);
  take(col, v, uB, (r > 1.0 ? exp(-(r - 1.0) * 5.0) : 0.0) * 0.22);
  // Notes: points spiralling in, each with a short trail.
  for (int k = 0; k < 14; k++) {
    float fk = float(k);
    float life = fract(uTime * 0.07 + hash12(vec2(fk, 1.0)));
    float rad = mix(3.6, 1.0, life * life);
    float ang = hash12(vec2(fk, 2.0)) * 6.2831 + life * 5.0;
    for (int s = 0; s < 6; s++) {
      float fs = float(s) * 0.012;
      float rr = mix(3.6, 1.0, (life - fs) * (life - fs));
      vec2 pos = vec2(cos(ang - fs * 5.0), sin(ang - fs * 5.0)) * rr;
      float d = length(q - pos) * R;
      take(col, v, s == 0 ? uY : uN, smoothstep(0.012, 0.0, d) * (1.2 - float(s) * 0.17) * step(fs, life));
    }
  }
}`;

/** Runners: machines around the control plane, packets travelling the links between them. */
const NETWORK = `
void field(vec2 p, inout vec3 col, inout float v) {
  vec2 c = anchor(0.72, 0.5);
  float S = mix(0.3, 0.38, uWide);
  // The control plane.
  float dc = length(p - c);
  take(col, v, uY, smoothstep(0.03, 0.0, dc) * 1.2);
  take(col, v, uInk, line(dc - 0.045, 1.0));
  take(col, v, uY, exp(-dc * 16.0) * 0.25);
  for (int k = 0; k < 7; k++) {
    float fk = float(k);
    float a = fk / 7.0 * 6.2831 + 0.4 + 0.05 * sin(uTime * 0.2 + fk);
    float rr = S * (0.78 + 0.22 * hash12(vec2(fk, 5.0)));
    vec2 m = c + vec2(cos(a) * 1.25, sin(a)) * rr;
    // Links: a bowed curve from each machine to the plane.
    vec2 mid = (m + c) * 0.5 + vec2(-(m - c).y, (m - c).x) * 0.18;
    float best = 1.0;
    float bestT = 0.0;
    for (int s = 0; s <= 24; s++) {
      float t = float(s) / 24.0;
      vec2 b = mix(mix(m, mid, t), mix(mid, c, t), t);
      float d = length(p - b);
      if (d < best) { best = d; bestT = t; }
    }
    bool off = k == 6;
    take(col, v, uN, line(best, 0.9) * (off ? 0.2 : 0.55));
    // Packets heading in and out.
    float pk = fract(uTime * (0.16 + 0.05 * fk) + hash12(vec2(fk, 7.0)));
    float hit = smoothstep(0.03, 0.0, abs(bestT - pk)) * line(best, 1.6);
    take(col, v, k == 3 ? uB : uP, off ? 0.0 : hit * 1.3);
    // The machine: a little dithered body, lit while it works.
    float dm = length(p - m);
    float work = off ? 0.15 : 0.6 + 0.4 * sin(uTime * 1.1 + fk * 2.0);
    take(col, v, off ? uN : (k == 3 ? uB : uY), smoothstep(0.03, 0.0, dm) * work * 1.2);
    take(col, v, uInk, line(dm - 0.038, 0.9) * (off ? 0.3 : 0.85));
  }
}`;

/** Schedules: a dial whose sweep wakes the work set for each hour. */
const DIAL = `
void field(vec2 p, inout vec3 col, inout float v) {
  vec2 c = anchor(0.74, 0.5);
  float R = mix(0.26, 0.36, uWide);
  vec2 q = p - c;
  float r = length(q);
  float a = atan(q.y, q.x);
  float sweep = mod(-uTime * 0.35, 6.2831);
  float behind = mod(sweep - a + 6.2831, 6.2831);
  // The sweep, fading behind it.
  if (r < R) take(col, v, uB, exp(-behind * 2.4) * 0.55 * smoothstep(0.0, R * 0.2, r));
  take(col, v, uInk, line(r - R, 1.1));
  take(col, v, uN, line(r - R * 0.66, 0.8) * 0.6);
  take(col, v, uN, line(r - R * 0.36, 0.8) * 0.5);
  // Ticks: every five minutes, every hour bolder.
  float tick = abs(fract(a / 6.2831 * 60.0 + 0.5) - 0.5);
  float hour = abs(fract(a / 6.2831 * 12.0 + 0.5) - 0.5);
  float ring = step(R * 0.9, r) * step(r, R * 0.98);
  take(col, v, uInk, ring * smoothstep(0.06, 0.0, tick) * 0.5);
  take(col, v, uInk, step(R * 0.84, r) * step(r, R * 0.98) * smoothstep(0.03, 0.0, hour) * 0.9);
  // Scheduled work: marks on the rings that flare as the sweep passes.
  for (int k = 0; k < 9; k++) {
    float fk = float(k);
    float ma = hash12(vec2(fk, 1.0)) * 6.2831;
    float mr = R * (k < 3 ? 0.36 : (k < 6 ? 0.66 : 1.0));
    vec2 m = c + vec2(cos(ma), sin(ma)) * mr;
    float since = mod(sweep - ma + 6.2831, 6.2831);
    float flare = exp(-since * 3.0);
    float d = length(p - m);
    take(col, v, flare > 0.2 ? uY : uP, smoothstep(0.014 + flare * 0.012, 0.0, d) * (0.8 + flare));
    take(col, v, uY, line(d - flare * 0.05, 1.0) * flare);
  }
  take(col, v, uY, line(abs(q.x * sin(sweep) - q.y * cos(sweep)), 0.9) * step(0.0, dot(q, vec2(cos(sweep), sin(sweep)))) * step(r, R));
}`;

/** Access tokens: rings of a lock turning until their gaps line up and a request gets through. */
const LOCK = `
void field(vec2 p, inout vec3 col, inout float v) {
  vec2 c = anchor(0.74, 0.5);
  float R = mix(0.24, 0.32, uWide);
  vec2 q = p - c;
  float r = length(q);
  float a = atan(q.y, q.x);
  // Every ring turns a whole number of times a cycle, some one way and some the other, so
  // their gaps all face the requests (angle pi) once a cycle.
  float cycle = 16.0;
  float ph = fract(uTime / cycle);
  float near = min(ph, 1.0 - ph) * cycle;
  float open = smoothstep(0.9, 0.2, near);
  for (int k = 0; k < 5; k++) {
    float fk = float(k);
    float rk = R * (0.4 + fk * 0.15);
    float turns = (mod(fk, 2.0) < 0.5 ? 1.0 : -1.0) * (1.0 + floor(fk * 0.5));
    float gapAt = 3.14159 + turns * 6.2831 * ph;
    float da = abs(mod(a - gapAt + 3.14159, 6.2831) - 3.14159);
    float gap = smoothstep(0.22, 0.3, da);
    take(col, v, k == 4 ? uP : uInk, line(r - rk, 1.2) * gap * (0.55 + fk * 0.1));
  }
  // Requests arriving from the left; when the gaps align, one goes through.
  float x0 = mix(0.0, gAspect * 0.4, uWide);
  float lane = line(abs(p.y - c.y), 1.0) * step(x0, p.x) * step(p.x, c.x);
  take(col, v, uN, lane * 0.4);
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float x = c.x - R * 1.1 - fract(uTime * 0.12 + fk * 0.25) * (c.x - x0);
    take(col, v, uB, smoothstep(0.012, 0.0, length(p - vec2(x, c.y))));
  }
  float shot = clamp((ph < 0.5 ? ph * cycle + 0.9 : (ph - 1.0) * cycle + 0.9) / 1.8, 0.0, 1.0);
  float bx = mix(c.x - R * 1.1, c.x + R * 0.1, shot);
  take(col, v, uY, open * smoothstep(0.02, 0.0, length(p - vec2(bx, c.y))) * 1.4);
  take(col, v, uY, open * exp(-r * 10.0) * 0.5);
}`;

/** Sign-in: the ridges of a fingerprint, read by a passing light. */
const PRINT = `
void field(vec2 p, inout vec3 col, inout float v) {
  vec2 c = anchor(0.74, 0.48);
  float S = mix(0.24, 0.3, uWide);
  vec2 q = (p - c) / S;
  q.y *= 0.82;
  float r = length(q);
  if (r > 1.15) return;
  float a = atan(q.y, q.x);
  float warp = 0.06 * sin(a * 3.0 + q.y * 4.0) + 0.04 * vnoise(q * 6.0);
  float ridges = abs(fract((r + warp) * 9.0) - 0.5);
  float edge = smoothstep(1.15, 0.85, r);
  float scan = c.y + S * 0.95 * sin(uTime * 0.5);
  float lit = exp(-pow((p.y - scan) / 0.03, 2.0));
  float k = smoothstep(0.12, 0.0, ridges) * edge;
  take(col, v, lit > 0.3 ? uY : uN, k * (0.62 + lit * 0.7));
  take(col, v, uP, line(p.y - scan, 1.0) * edge * 0.9);
  take(col, v, uP, exp(-abs(p.y - scan) * 40.0) * 0.12 * edge);
}`;

/** The CLI: output scrolling up in columns, with a prompt waiting at the bottom. */
const OUTPUT = `
void field(vec2 p, inout vec3 col, inout float v) {
  float x0 = mix(0.06, gAspect * 0.5, uWide);
  if (p.x < x0) return;
  float lh = 0.026;
  float scroll = uTime * 0.035;
  float y = p.y + scroll;
  float row = floor(y / lh);
  float yy = fract(y / lh);
  float cw = 0.0105;
  float cx = floor((p.x - x0) / cw);
  float xx = fract((p.x - x0) / cw);
  float len = 8.0 + floor(hash12(vec2(row, 1.0)) * 46.0);
  float indent = step(0.6, hash12(vec2(row, 2.0))) * 2.0;
  float on = step(indent, cx) * step(cx, indent + len) * step(0.14, hash12(vec2(row, cx)));
  float glyph = step(0.18, xx) * step(xx, 0.82) * step(0.22, yy) * step(yy, 0.78);
  float fade = smoothstep(1.0, 0.25, p.y) * smoothstep(0.0, 0.08, p.y);
  float kind = hash12(vec2(row, 3.0));
  vec3 c = kind > 0.9 ? uY : (kind > 0.8 ? uP : (kind > 0.7 ? uB : uN));
  if (cx < indent + 1.0 && kind > 0.62 && kind < 0.7) c = uP;
  take(col, v, c, on * glyph * fade * (kind > 0.7 ? 0.95 : 0.5));
  // The prompt and its cursor, at the bottom.
  float baseY = 0.1;
  if (abs(p.y - baseY) < lh * 0.5) {
    float bx = (p.x - x0) / cw;
    take(col, v, uP, step(0.0, bx) * step(bx, 1.0) * 0.9);
    float blink = step(0.5, fract(uTime * 0.9));
    take(col, v, uY, step(2.0, bx) * step(bx, 3.0) * blink);
  }
}`;

/**
 * Team management: five people, a strand each, braided into one rope that
 * ends in the project they share, the workspace's mark. Their work runs up
 * the strands into it.
 */
const BRAID = `
void field(vec2 p, inout vec3 col, inout float v) {
  // Where the strands meet: beside the copy, or behind it on phones.
  vec2 c = mix(vec2(gAspect * 0.62, 0.56), vec2(gAspect * 0.8, 0.51), uWide);
  vec2 dir = normalize(vec2(0.3, 1.0));
  vec2 nrm = vec2(dir.y, -dir.x);
  vec2 q = p - c;
  float along = dot(q, dir);
  float across = dot(q, nrm);
  float low = -0.17;   // the people
  float top = 0.3;     // the project
  vec2 m = vec2(uMouse.x * gAspect, uMouse.y);
  float near = uMouse.z * exp(-length(p - m) * 6.0);
  float R = 0.04 * (1.0 + 0.9 * near);
  float spin = uTime * 0.6;
  // The braid: nothing where the strands meet, widest in the middle, nothing at the project.
  float env = smoothstep(low * 0.4, 0.04, along) * (1.0 - smoothstep(top * 0.6, top, along));
  float inside = step(low, along) * step(along, top);
  vec3 cols[5] = vec3[5](uY, uP, uB, uInk, uP);
  for (int k = 0; k < 5; k++) {
    float fk = float(k);
    float spread = (fk - 2.0) * 0.072;
    float t = clamp(along / low, 0.0, 1.0);
    float fan = spread * t * t * (3.0 - 2.0 * t);
    float ph = 24.0 * along - spin + fk * 1.2566;
    float y = fan + R * env * sin(ph);
    float slope = spread * 6.0 * t * (1.0 - t) / low + R * env * 24.0 * cos(ph);
    float d = abs(across - y) / sqrt(1.0 + slope * slope);
    float front = mix(1.0, 0.5 + 0.5 * cos(ph), env);
    take(col, v, cols[k], line(d, 0.9 + 0.9 * front) * (0.3 + 0.65 * front) * inside);
    // Work running up the strand into the project.
    float b = along * 8.0 - uTime * (0.45 + 0.07 * fk) + hash12(vec2(fk, 2.0));
    float bead = fract(b);
    float lit = smoothstep(0.8, 0.96, bead) * step(bead, 0.99) * line(d, 2.6) * inside;
    take(col, v, cols[k], lit * (0.5 + 0.7 * front) * 1.3);
    // The person at the strand's end: a disc in its color, with a ring.
    vec2 at = c + dir * low + nrm * spread;
    float dp = length(p - at);
    take(col, v, cols[k], smoothstep(0.015, 0.0, dp) * (0.9 + 0.1 * sin(uTime * 1.3 + fk)));
    take(col, v, uInk, line(dp - 0.024, 0.9) * 0.7);
  }
  // The project they share: a rounded square in a rounded square, turning slowly.
  vec2 pc = c + dir * top;
  float s1 = sdRoundBox(rot(uTime * 0.15) * (p - pc), vec2(0.038), 0.012);
  float s2 = sdRoundBox(rot(-uTime * 0.25) * (p - pc), vec2(0.018), 0.006);
  take(col, v, uY, line(s1, 1.2) * 1.1);
  take(col, v, uP, line(s2, 1.0) * 0.95);
  take(col, v, uY, exp(-length(p - pc) * 40.0) * 0.5);
}`;

/**
 * Sessions: a session as a double helix, the agent's strand and yours,
 * turning out of its live end, where the agent works (blue while it waits for
 * you) and the people watching circle it. Its events stream back along the
 * strands into the past; now and then your reply runs up to the live end.
 */
const HELIX = `
void field(vec2 p, inout vec3 col, inout float v) {
  // The live end beside the copy, the past running out of it to the lower left.
  vec2 head = mix(vec2(gAspect * 0.8, 0.8), vec2(gAspect * 0.83, 0.5), uWide);
  vec2 dir = normalize(mix(vec2(0.62, 1.0), vec2(1.0, 0.26), uWide));
  vec2 nrm = vec2(-dir.y, dir.x);
  vec2 q = p - head;
  float along = dot(q, dir);
  float across = dot(q, nrm);
  vec2 m = vec2(uMouse.x * gAspect, uMouse.y);
  float near = uMouse.z * exp(-length(p - m) * 7.0);

  // Every twelve seconds the agent stops to ask you something, and your reply comes in.
  float cyc = mod(uTime, 12.0);
  float waiting = step(7.5, cyc) * step(cyc, 10.6);
  vec3 live = waiting > 0.5 ? uB : uY;
  // The agent's own clock, which stands still while it waits.
  float work = floor(uTime / 12.0) * 8.9 + min(cyc, 7.5) + max(cyc - 10.6, 0.0);

  float len = mix(1.3, 1.7, uWide);
  if (along < 0.01 && along > -len) {
    float A = mix(0.06, 0.08, uWide) * (1.0 + 0.8 * near);
    // The strands meet at the live end, and fade into the past.
    float amp = A * (1.0 - smoothstep(-0.32, 0.0, along));
    float past = smoothstep(-len, -len * 0.4, along);
    float k = 21.0;
    float spin = uTime * 0.7;
    for (int s = 0; s < 2; s++) {
      float fs = float(s);
      float ph = k * along - spin + fs * 3.14159;
      float y = amp * sin(ph);
      float front = 0.5 + 0.5 * cos(ph);
      float slope = amp * k * cos(ph);
      float d = abs(across - y) / sqrt(1.0 + slope * slope);
      // The agent's strand in yellow, yours in pink; the far side dimmer.
      vec3 c = s == 0 ? uY : uP;
      take(col, v, c, line(d, 1.0 + 1.0 * front) * (0.3 + 0.7 * front) * past);
      // Events: beads streaming back from the live end, many more of the agent's than yours.
      float n = s == 0 ? 15.0 : 4.0;
      float t = s == 0 ? work * 0.9 : uTime * 0.35;
      float b = along * n + t + fs * 0.37;
      float bead = fract(b);
      float h = hash12(vec2(floor(b), fs + 3.0));
      float lit = smoothstep(0.74, 0.94, bead) * step(bead, 0.99) * line(d, 3.0);
      vec3 bc = s == 0 ? (h > 0.88 ? uP : (h > 0.78 ? uB : uY)) : uP;
      float show = s == 0 ? 1.0 : step(0.45, h);
      take(col, v, bc, lit * show * (0.45 + 0.75 * front) * past * (1.3 + near));
      // Your reply, running up your strand to the live end.
      if (s == 1 && cyc > 9.4 && cyc < 10.6) {
        float at = mix(-0.8, 0.0, (cyc - 9.4) / 1.2);
        float r = smoothstep(0.035, 0.0, abs(along - at)) * line(d, 3.2);
        take(col, v, uP, r * 1.6);
      }
    }
    // Rungs: five a turn, holding the strands together.
    float R = 6.28318 / 5.0;
    float w = k * along / R;
    float ri = floor(w + 0.5);
    float da = abs(w - ri) * R / k;
    float half_ = abs(amp * sin(ri * R - spin));
    take(col, v, uN, step(abs(across), half_) * line(da, 0.8) * 0.5 * past);
  }

  // The live end: the agent at work, breathing.
  float dh = length(q);
  float breathe = 0.8 + 0.2 * sin(uTime * 2.6);
  take(col, v, live, smoothstep(0.02, 0.0, dh) * 1.3);
  take(col, v, live, exp(-dh * 48.0) * 0.7 * breathe);
  take(col, v, uInk, line(dh - 0.032, 0.9) * 0.8);
  // The people watching, circling it: three of them, in front and behind.
  vec2 axes = vec2(0.12, 0.05);
  vec2 e = vec2(along, across) / axes;
  float le = length(e);
  vec2 g = e / axes / max(le, 1e-4);
  float orbit = abs(le - 1.0) / max(length(g), 1e-4);
  take(col, v, uN, line(orbit, 0.8) * 0.35);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float a = uTime * 0.42 + fi * 2.094;
    vec2 o = dir * cos(a) * axes.x + nrm * sin(a) * axes.y;
    float dw = length(q - o);
    float fr = 0.5 + 0.5 * cos(a + 1.2);
    vec3 wc = i == 0 ? uP : (i == 1 ? uB : uInk);
    take(col, v, wc, smoothstep(0.016, 0.0, dw) * (0.55 + 0.7 * fr));
  }
}`;

const FIELDS = {
  sessions: HELIX,
  workspaces: TWIST,
  team: BRAID,
  sandboxes: BOXES,
  linear: LANES,
  "review-agents": LENS,
  memory: ACCRETE,
  runners: NETWORK,
  schedules: DIAL,
  "access-tokens": LOCK,
  "sign-in": PRINT,
  cli: OUTPUT,
} as const;

export type SceneName = keyof typeof FIELDS;

export const isSceneName = (s: string): s is SceneName => Object.hasOwn(FIELDS, s);

export interface FieldHandle {
  scene: Scene;
  pointer(x: number, y: number): void;
  pointerLeave(): void;
}

/** The uniforms every field has, from HEAD. */
export const UNIFORMS = ["uRes", "uTime", "uDark", "uInk", "uY", "uP", "uB", "uN", "uMouse", "uWide"];

/**
 * Sets HEAD's uniforms for a frame: the size, the time, the theme's palette
 * (yellow is ink on light pages) and the pointer.
 */
export function setUniforms(
  gl: WebGL2RenderingContext,
  u: Record<string, WebGLUniformLocation | null>,
  width: number,
  height: number,
  time: number,
  mouse: Float32Array,
) {
  const dark = isDark();
  const ink = dark ? cssColor("--c-ink", [0.98, 0.98, 0.98]) : cssColor("--c-ink", [0.09, 0.09, 0.09]);
  gl.uniform2f(u.uRes ?? null, width, height);
  gl.uniform1f(u.uTime ?? null, time);
  gl.uniform1f(u.uDark ?? null, dark ? 1 : 0);
  gl.uniform3fv(u.uInk ?? null, ink);
  gl.uniform3fv(u.uY ?? null, dark ? cssColor("--c-accent", [1, 1, 0.36]) : ink);
  gl.uniform3fv(u.uP ?? null, cssColor("--c-pink", [1, 0, 0.85]));
  gl.uniform3fv(u.uB ?? null, cssColor("--c-blue", [0, 0.49, 1]));
  gl.uniform3fv(
    u.uN ?? null,
    dark ? cssColor("--c-ink-3", [0.55, 0.55, 0.55]) : cssColor("--c-ink-4", [0.64, 0.64, 0.64]),
  );
  gl.uniform3fv(u.uMouse ?? null, mouse);
  gl.uniform1f(u.uWide ?? null, width / Math.max(1, height) > 1.15 ? 1 : 0);
}

/** A pointer that eases towards where it is, for a scene's uMouse. */
export function easedPointer() {
  const mouse = new Float32Array([0.5, 0.5, 0]);
  const target = new Float32Array([0.5, 0.5, 0]);
  return {
    mouse,
    step(dt: number) {
      const k = 1 - Math.exp(-dt * 6);
      for (let i = 0; i < 3; i++) mouse[i] = (mouse[i] ?? 0) + ((target[i] ?? 0) - (mouse[i] ?? 0)) * k;
    },
    pointer(x: number, y: number) {
      target[0] = x;
      target[1] = 1 - y;
      target[2] = 1;
    },
    pointerLeave() {
      target[2] = 0;
    },
  };
}

/** The scene for a feature page: its field, dithered to the brand palette. */
export function featureScene(name: SceneName): FieldHandle {
  let prog: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  const u: Record<string, WebGLUniformLocation | null> = {};
  const p = easedPointer();
  const scene: Scene = {
    init(gl) {
      prog = compile(gl, FULLSCREEN_VS, HEAD + FIELDS[name] + MAIN);
      vao = gl.createVertexArray();
      for (const n of UNIFORMS) u[n] = gl.getUniformLocation(prog, n);
    },
    frame({ gl, width, height, time, dt }) {
      if (!prog) return;
      p.step(dt);
      gl.disable(gl.BLEND);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      setUniforms(gl, u, width, height, time, p.mouse);
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
