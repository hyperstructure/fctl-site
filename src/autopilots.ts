// The Autopilots page's own motion, on top of src/features.ts: Jonas's note typed into the tab's
// Steer it, added and seen, then what the autopilot did with it; and the long weekend's strip
// filling in from Friday to Tuesday. Each plays once, as it comes into view. Without JavaScript,
// or where motion is reduced, both show as they end.

import "./autopilots.css";
import { prefersReducedMotion } from "@hyperstructure/design/gl/core";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Runs `play` once each element is well into view. */
function once(els: Iterable<Element>, play: (el: HTMLElement) => void, threshold = 0.4) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        play(e.target as HTMLElement);
      }
    },
    { threshold },
  );
  for (const el of els) io.observe(el);
}

/** The note: typed, added, seen, and what it led to, a line at a time. */
async function steer(fig: HTMLElement) {
  const box = fig.querySelector<HTMLElement>(".ap-type");
  const note = fig.querySelector<HTMLElement>(".ap-new");
  const seen = note?.querySelector<HTMLElement>(".ap-seen");
  const button = fig.querySelector<HTMLElement>(".ap-button");
  const after = [...fig.querySelectorAll<HTMLElement>(".ap-after li")];
  if (!box || !note || !seen || !button) return;
  const placeholder = box.innerHTML;
  const text = box.dataset.text ?? "";
  await sleep(500);
  box.classList.add("typing");
  const caret = document.createElement("span");
  caret.className = "caret";
  for (let i = 1; i <= text.length; i++) {
    box.textContent = text.slice(0, i);
    box.append(caret);
    await sleep(text[i - 1] === " " ? 26 : 12 + Math.random() * 22);
  }
  await sleep(450);
  button.classList.add("pressed");
  await sleep(160);
  button.classList.remove("pressed");
  box.classList.remove("typing");
  box.innerHTML = placeholder;
  note.classList.remove("later");
  note.classList.add("fresh");
  await sleep(1100);
  seen.innerHTML = seen.dataset.seen ?? seen.innerHTML;
  seen.classList.remove("not");
  for (const li of after) {
    await sleep(520);
    li.classList.remove("later");
  }
  await sleep(1400);
  note.classList.remove("fresh");
}

function steerNotes() {
  const figs = [...document.querySelectorAll<HTMLElement>(".ap-steer[data-play]")];
  if (figs.length === 0 || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
  for (const fig of figs) {
    // Until it plays: the note not added yet, nor seen, nor anything done with it.
    const note = fig.querySelector<HTMLElement>(".ap-new");
    const seen = note?.querySelector<HTMLElement>(".ap-seen");
    if (!note || !seen) continue;
    note.classList.add("later");
    seen.dataset.seen = seen.innerHTML;
    seen.textContent = "Not seen yet";
    seen.classList.add("not");
    for (const li of fig.querySelectorAll(".ap-after li")) li.classList.add("later");
  }
  once(figs, (fig) => void steer(fig));
}

/**
 * The weekend's strip, from Friday to Tuesday: its progress (--p, registered in autopilots.css)
 * runs from 0 to 100 once it shows. Browsers that can't animate a registered property show it
 * whole.
 */
function weekend() {
  const logs = [...document.querySelectorAll<HTMLElement>(".ap-log[data-play]")];
  const animatable = typeof CSS !== "undefined" && "registerProperty" in CSS;
  if (logs.length === 0 || !animatable || prefersReducedMotion() || !("IntersectionObserver" in window))
    return;
  for (const log of logs) log.style.setProperty("--p", "0");
  once(
    logs,
    (log) => {
      log.style.removeProperty("--p");
      log.classList.add("play");
    },
    0.3,
  );
}

steerNotes();
weekend();
