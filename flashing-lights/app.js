import { createSketch, LED_PINS } from "./sketch.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const leds = $$("[data-led]");
const notes = $$("[data-note]");
const beatSteps = $$("#beat li");
const runButton = $("#run");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const HOW = {
  flashing:
    "At startup, setup() gives each LED a random interval from 100 to 1000 ms. Every pass through loop(), each LED checks whether its interval has passed since it last toggled, and flips if so. Because every interval is different, the four lights drift in and out of sync. Press Reset to roll new intervals, like powering the board back on.",
  metronome:
    "The pin 3 LED is the beat: it toggles every 300 ms, and each toggle adds one to count. count = 1 lights pins 5 and 7 (plus pin 9 on every other cycle), count = 2 turns them off, count = 5 and 6 flash pin 5 again, and count = 8 starts the cycle over and flips doubleCount.",
};

let mode = "flashing";
let sketch = createSketch(false);
let running = !reduceMotion;
let speed = 1;
let simTime = 0; // whole simulated milliseconds, i.e. millis()
let simRemainder = 0; // fractional milliseconds carried between frames
let lastFrame = null;
let rendered = null;

// Re-create the sketch, like uploading it to the board again.
function upload() {
  sketch = createSketch(mode === "metronome");
  simTime = 0;
  simRemainder = 0;
  rendered = null;
  render();
}

function tick(now) {
  if (running && lastFrame !== null) {
    // Cap a long gap (like a hidden tab) so we never run millions of loops at once.
    const elapsed = Math.min(now - lastFrame, 250) * speed + simRemainder;
    const steps = Math.floor(elapsed);
    simRemainder = elapsed - steps;
    for (let i = 0; i < steps; i++) {
      simTime++;
      sketch.loop(simTime);
    }
    render();
  }
  lastFrame = now;
  requestAnimationFrame(tick);
}

function render() {
  const { pins, ledIntervals, count, doubleCount } = sketch.state();
  const key = `${pins}|${count}|${doubleCount}|${mode}`;

  $("#millis").textContent = simTime.toLocaleString();
  if (key === rendered) return;
  rendered = key;

  leds.forEach((led, i) => led.classList.toggle("on", pins[i]));
  notes.forEach((note, i) => {
    note.textContent =
      mode === "metronome"
        ? ["beat · every 300 ms", "counts 1 and 5", "count 1", "count 1, every other bar"][i]
        : `every ${ledIntervals[i]} ms`;
  });

  $("#count").textContent = count;
  $("#on-count").textContent = `${pins.filter(Boolean).length} / 4`;
  $("#mode-name").textContent = mode === "metronome" ? "Metronome" : "Flashing";
  $("#beat").hidden = mode !== "metronome";
  beatSteps.forEach((step, i) => step.classList.toggle("active", i === count));
  $("#double-count").textContent = `doubleCount = ${doubleCount}`;
}

function setRunning(value) {
  running = value;
  lastFrame = null;
  runButton.textContent = running ? "Pause" : simTime === 0 ? "Run" : "Resume";
  $("#board-status").textContent = running ? "Running" : simTime === 0 ? "Ready" : "Paused";
  document.body.classList.toggle("paused", !running);
}

function setMode(value) {
  mode = value;
  $$("[data-mode]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === mode)));
  $("#how-text").textContent = HOW[mode];
  upload();
  highlightCode();
  setRunning(running);
}

function reset() {
  upload();
  setRunning(false);
}

$$("[data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
runButton.addEventListener("click", () => setRunning(!running));
$("#reset").addEventListener("click", reset);

$$("[data-speed]").forEach((b) =>
  b.addEventListener("click", () => {
    speed = Number(b.dataset.speed);
    $$("[data-speed]").forEach((other) => other.classList.toggle("active", other === b));
  })
);

document.addEventListener("keydown", (e) => {
  const onControl = e.target instanceof Element && e.target.closest("button, a, input, select, textarea");
  if (onControl || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === " ") {
    e.preventDefault();
    setRunning(!running);
  } else if (e.key.toLowerCase() === "r") {
    reset();
  } else if (e.key.toLowerCase() === "m") {
    setMode(mode === "metronome" ? "flashing" : "metronome");
  }
});

// Theme toggle, shared with the main site through localStorage.
$(".theme-btn").addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try {
    localStorage.setItem("theme", root.dataset.theme);
  } catch (e) {
    // Ignore blocked storage.
  }
});

// Show the original sketch, with the inactive branch of loop() dimmed.
let sketchLines = [];

const escapeHTML = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function highlightCode() {
  if (!sketchLines.length) return;
  const lines = sketchLines.map((line) =>
    line.includes("bool metronome =") ? `bool metronome = ${mode === "metronome"};` : line
  );
  const start = lines.findIndex((l) => l.includes("if (metronome)"));
  const elseLine = lines.findIndex((l, i) => i > start && l.trim().startsWith("else"));
  let end = elseLine;
  for (let depth = 0, i = elseLine; i < lines.length; i++) {
    depth += (lines[i].match(/{/g) || []).length - (lines[i].match(/}/g) || []).length;
    if (depth === 0 && lines[i].includes("}")) {
      end = i;
      break;
    }
  }

  $("#code").innerHTML = lines
    .map((line, i) => {
      const inMetronome = i > start && i < elseLine;
      const inElse = i > elseLine && i < end;
      const dim = (mode === "metronome" && inElse) || (mode === "flashing" && inMetronome);
      const flag = line.includes("bool metronome =") ? " flag" : "";
      return `<span class="line${dim ? " dim" : ""}${flag}"><span class="ln">${i + 1}</span>${escapeHTML(line) || " "}</span>`;
    })
    .join("");
}

fetch("Flashing-Lights_Metronome.ino")
  .then((response) => response.text())
  .then((text) => {
    sketchLines = text.replace(/\r/g, "").replace(/\n+$/, "").split("\n");
    highlightCode();
  })
  .catch(() => {
    $("#code").textContent = "Couldn't load the sketch.";
  });

// Expose a small hook so the page can be tested without waiting in real time.
window.simulator = {
  advance(ms) {
    for (let i = 0; i < ms; i++) {
      simTime++;
      sketch.loop(simTime);
    }
    render();
    return { millis: simTime, ...sketch.state(), pins: LED_PINS.map((pin, i) => [pin, sketch.state().pins[i]]) };
  },
};

setMode(mode);
requestAnimationFrame(tick);
