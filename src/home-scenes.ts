// Two scenes in the feature pages' manner (src/scenes.ts): the landing
// page's map of how fctl's pieces fit, and the footer's wordmark melting
// into the end of the page. Both are dithered to the brand palette.

import { compile, FULLSCREEN_VS, prefersReducedMotion, type Scene } from "@hyperstructure/design/gl/core";
import { easedPointer, HEAD, main, setUniforms, UNIFORMS } from "./scenes";

/** The most links the map draws. */
const MAX_LINKS = 16;

/**
 * The map's links, as curves from one node's edge to the next one's: wires,
 * and packets travelling along them both ways (requests going out, events
 * coming back). Behind the control plane, rings go out.
 */
const MAP = `
uniform vec4 uLink[${MAX_LINKS}];  // from (x, y) and to (x, y), in heights
uniform vec4 uKind[${MAX_LINKS}];  // color going out, color coming back, phase, both ways
uniform int uLinks;
uniform vec4 uCore;      // the control plane: its center and half its size, in heights
uniform float uPx;       // a CSS pixel, in heights
uniform float uDown;     // 1 when the columns are stacked and the links run down
uniform float uWave;     // 0 in a still frame (reduced motion), where a wave would be a stray line
vec3 palette(float k) {
  return k < 0.5 ? uY : (k < 1.5 ? uP : uB);
}
void field(vec2 p, inout vec3 col, inout float v) {
  // The board the parts sit on: a sparse grid of faint points, fading away
  // from the control plane.
  vec2 g = mod(floor(gl_FragCoord.xy), 9.0);
  float point = step(g.x, 0.5) * step(g.y, 0.5);
  float board = 0.35 + 0.65 * exp(-length(p - uCore.xy) / (520.0 * uPx));
  take(col, v, uN, point * 0.12 * board);
  if (uCore.z > 0.0) {
    float px = uPx;
    float away = sdRoundBox(p - uCore.xy, uCore.zw, 14.0 * px);
    if (away > 0.0) {
      // Rings close around the control plane, as events fan out to everyone.
      float ring = fract(away / (42.0 * px) - uTime * 0.18);
      float fade = exp(-away / (72.0 * px)) * (1.0 - smoothstep(120.0 * px, 230.0 * px, away));
      take(col, v, uY, smoothstep(0.88, 1.0, ring) * fade * 0.45);
      // And now and then a wave that drifts out to the window's edges, fading as it
      // goes and lighting the board's points as it passes them.
      vec2 b = uCore.zw;
      float r = 14.0 * px;
      float far = max(
        max(sdRoundBox(-uCore.xy, b, r), sdRoundBox(vec2(gAspect, 0.0) - uCore.xy, b, r)),
        max(sdRoundBox(vec2(0.0, 1.0) - uCore.xy, b, r), sdRoundBox(vec2(gAspect, 1.0) - uCore.xy, b, r))
      );
      float speed = 150.0 * px;
      float behind = mod(uTime, far / speed + 2.4) * speed - away;
      float reach = mix(0.3, 1.0, exp(-away / (420.0 * px))) * uWave;
      take(col, v, uY, line(behind, 1.2) * reach * 0.95);
      float wake = step(0.0, behind) * (1.0 - smoothstep(0.0, 80.0 * px, behind));
      take(col, v, uY, point * wake * reach * 0.9);
    }
  }
  for (int i = 0; i < ${MAX_LINKS}; i++) {
    if (i >= uLinks) break;
    vec4 L = uLink[i];
    vec4 K = uKind[i];
    // Along the link: across the map, or down it when the columns stack.
    vec2 q = p;
    if (uDown > 0.5) {
      q = p.yx;
      L = L.yxwz;
    }
    float w = L.z - L.x;
    float u = (q.x - L.x) / w;
    if (u < 0.0 || u > 1.0) continue;
    float s = u * u * (3.0 - 2.0 * u);
    float y = mix(L.y, L.w, s);
    float slope = (L.w - L.y) * 6.0 * u * (1.0 - u) / w;
    float d = abs(q.y - y) / sqrt(1.0 + slope * slope);
    take(col, v, uN, line(d, 1.0) * 0.75);
    // Packets: a bright head with a tail behind it, a few on each link.
    float n = max(1.0, floor(abs(w) / 0.16));
    float out_ = fract(u * n - uTime * 0.26 + K.z);
    float back = fract(-u * n - uTime * 0.19 + K.z + 0.5);
    float head = line(d, 1.9);
    take(col, v, palette(K.x), head * smoothstep(0.78, 0.97, out_) * step(out_, 0.985) * 1.4);
    take(col, v, palette(K.y), head * smoothstep(0.82, 0.97, back) * step(back, 0.985) * 1.2 * K.w);
  }
}`;

/** A link of the map, in fractions of the canvas, y down, as the page has it. */
export interface MapLink {
  from: [number, number];
  to: [number, number];
  /** The packets' colors, going out (right, or down) and coming back: 0 yellow, 1 pink, 2 blue. */
  out: number;
  back: number;
  /** Whether packets come back along it too. */
  both: boolean;
}

/** The control plane: its center and half its size, in fractions of the canvas's height. */
export interface MapCore {
  x: number;
  y: number;
  w: number;
  h: number;
  /** A CSS pixel, in the same units, for the rings' spacing. */
  px: number;
}

export interface MapHandle {
  scene: Scene;
  /**
   * Where the links and the control plane are now (after a resize, say),
   * and whether the links run down the map rather than across it.
   */
  set(links: MapLink[], core: MapCore | null, down: boolean): void;
}

/** The map follows no pointer. */
const NO_POINTER = new Float32Array([0.5, 0.5, 0]);

export function mapScene(): MapHandle {
  let prog: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  const u: Record<string, WebGLUniformLocation | null> = {};
  const still = prefersReducedMotion();
  let links: MapLink[] = [];
  let core: MapCore | null = null;
  let down = false;
  const linkData = new Float32Array(MAX_LINKS * 4);
  const kindData = new Float32Array(MAX_LINKS * 4);
  const scene: Scene = {
    init(gl) {
      // A calm sky: a few slow stars and no grain, across the whole window.
      prog = compile(gl, FULLSCREEN_VS, HEAD + MAP + main({ stars: 0.0006, twinkle: 0.3, grain: false }));
      vao = gl.createVertexArray();
      for (const n of [...UNIFORMS, "uLink", "uKind", "uLinks", "uCore", "uPx", "uDown", "uWave"]) {
        u[n] = gl.getUniformLocation(prog, n);
      }
    },
    frame({ gl, width, height, time }) {
      if (!prog) return;
      const aspect = width / Math.max(1, height);
      const shown = links.slice(0, MAX_LINKS);
      shown.forEach((l, i) => {
        linkData.set([l.from[0] * aspect, 1 - l.from[1], l.to[0] * aspect, 1 - l.to[1]], i * 4);
        kindData.set([l.out, l.back, (i * 0.37) % 1, l.both ? 1 : 0], i * 4);
      });
      gl.disable(gl.BLEND);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      setUniforms(gl, u, width, height, time, NO_POINTER);
      gl.uniform4fv(u.uLink ?? null, linkData);
      gl.uniform4fv(u.uKind ?? null, kindData);
      gl.uniform1i(u.uLinks ?? null, shown.length);
      gl.uniform4f(
        u.uCore ?? null,
        core ? core.x * aspect : 0,
        core ? 1 - core.y : 0,
        core ? core.w : 0,
        core ? core.h : 0,
      );
      gl.uniform1f(u.uPx ?? null, core ? core.px : 0);
      gl.uniform1f(u.uDown ?? null, down ? 1 : 0);
      gl.uniform1f(u.uWave ?? null, still ? 0 : 1);
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
    set(next, nextCore, nextDown) {
      links = next;
      core = nextCore;
      down = nextDown;
      scene.invalidate?.();
    },
  };
}

/**
 * The footer's wordmark, melting: each column of pixels runs down from the
 * letters above it, by a length of its own that grows and shrinks slowly,
 * and more where the pointer is. Yellow letters (ink on light pages) run
 * pink, then blue, and fade out towards the end of the page.
 */
const MELT = `
uniform sampler2D uMask;
float glyph(vec2 uv) {
  return texture(uMask, uv).r;
}
void field(vec2 p, inout vec3 col, inout float v) {
  vec2 uv = vec2(p.x / gAspect, p.y);
  float body = glyph(uv);
  float x = floor(gl_FragCoord.x);
  float wobble = vnoise(vec2(x * 0.09, uTime * 0.12));
  float len = (0.05 + 0.42 * pow(hash12(vec2(x, 7.0)), 2.6)) * (0.45 + 0.75 * wobble);
  len *= 1.0 + 1.4 * uMouse.z * exp(-abs(p.x - uMouse.x * gAspect) * 9.0);
  float drip = 0.0;
  float far = 1.0;
  for (int i = 1; i <= 28; i++) {
    float k = float(i) / 28.0;
    float g = glyph(uv + vec2(0.0, k * len));
    float d = g * (1.0 - k);
    if (d > drip) {
      drip = d;
      far = k;
    }
  }
  // Fades out towards the end of the page.
  float fade = smoothstep(0.02, 0.5, p.y);
  if (body > 0.5) {
    // Solid at the top, coming apart lower down, where it melts.
    float solid = mix(0.6, 1.3, smoothstep(0.34, 0.72, p.y));
    float shade = 0.92 + 0.08 * vnoise(p * 40.0 + uTime * 0.2);
    take(col, v, uY, body * shade * solid);
  } else {
    take(col, v, far < 0.45 ? uP : uB, drip * 1.05 * fade);
  }
}`;

export interface MeltHandle {
  scene: Scene;
  pointer(x: number, y: number): void;
  pointerLeave(): void;
}

/** `text` in `font`, white on black, as large as fits the top of a canvas of this size. */
function wordmark(text: string, font: (px: number) => string, width: number, height: number) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  // Set tight, as the brand's wordmark is, where canvases can.
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "-0.05em";
  // As large as fits the width, and the top two thirds of the height.
  let size = height * 0.8;
  ctx.font = font(size);
  const w = ctx.measureText(text).width;
  if (w > width * 0.96) size *= (width * 0.96) / w;
  ctx.font = font(size);
  const m = ctx.measureText(text);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  const top = m.actualBoundingBoxAscent;
  const y = Math.max(top + height * 0.04, height * 0.66);
  ctx.fillText(text, (width - m.width) / 2, y);
  return c;
}

export function meltScene(text: string, font: (px: number) => string): MeltHandle {
  let prog: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  let tex: WebGLTexture | null = null;
  let size = "";
  const u: Record<string, WebGLUniformLocation | null> = {};
  const p = easedPointer();
  // The font may still be on its way: the mask is drawn again once it is here.
  let fonts = document.fonts?.status === "loaded";
  void document.fonts?.ready.then(() => {
    fonts = true;
    size = "";
    scene.invalidate?.();
  });
  const scene: Scene = {
    init(gl) {
      // No stars at the top, where the footer's links are: they come out further down.
      prog = compile(gl, FULLSCREEN_VS, HEAD + MELT + main({ show: "1.0 - smoothstep(0.35, 0.95, p.y)" }));
      vao = gl.createVertexArray();
      tex = gl.createTexture();
      size = "";
      for (const n of [...UNIFORMS, "uMask"]) u[n] = gl.getUniformLocation(prog, n);
    },
    frame({ gl, width, height, time, dt }) {
      if (!prog || !tex) return;
      p.step(dt);
      const now = `${width}x${height}:${fonts}`;
      if (now !== size) {
        size = now;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          wordmark(text, font, width, height),
        );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      gl.disable(gl.BLEND);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(u.uMask ?? null, 0);
      setUniforms(gl, u, width, height, time, p.mouse);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    },
    dispose(gl) {
      if (prog) gl.deleteProgram(prog);
      if (vao) gl.deleteVertexArray(vao);
      if (tex) gl.deleteTexture(tex);
    },
  };
  return { scene, pointer: p.pointer, pointerLeave: p.pointerLeave };
}
