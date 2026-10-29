import { random } from "remotion";
import cast from "../../../data/cast.json";
import type { FloorplanData, Keyframe, Trace, TraceEvent } from "./schema";

// Seeded throwaway scenes for the string of failures. Deterministic per seed,
// so every render is identical. Nothing here is meant to be read; the tiles
// only have to look like more of the same idiom.

const LINES = [
  "Excellent question, Nile.",
  "What is your name?",
  "Excuse me, Nile.",
  "Let's move on, everyone.",
  "Hey!",
  "Where did Ben go?",
  "I didn't catch that.",
  "Follow me.",
  "Who said that?",
  "One: it is a dog.",
  "Welcome to the tour!",
  "Is this the original?",
  "The gallery closes in five minutes.",
  "We have plenty of time.",
  "Could you repeat that?",
  "Your room is ready, Nile.",
  "Time for your medication, Nile.",
  "Any questions?",
];

export type Generated = { trace: Trace; floorplan: FloorplanData };

const cache = new Map<number, Generated>();

export const generateScene = (seed: number): Generated => {
  const hit = cache.get(seed);
  if (hit) return hit;

  const r = (k: string) => random(`${seed}:${k}`);
  const rf = (k: string, a: number, b: number) => a + r(k) * (b - a);
  const ri = (k: string, a: number, b: number) => a + Math.floor(r(k) * (b - a + 1));
  const pick = <T,>(k: string, xs: readonly T[]) => xs[Math.min(xs.length - 1, Math.floor(r(k) * xs.length))];

  const W = rf("w", 10, 18);
  const H = rf("h", 6, 9);
  const doorX = rf("door", 2, W - 4);
  const features: FloorplanData["features"] = [
    { kind: "wall", points: [[0, 0], [W, 0], [W, H], [doorX + 2, H]] },
    { kind: "wall", points: [[doorX, H], [0, H], [0, 0]] },
  ];
  const nExhibits = ri("ne", 2, 4);
  for (let i = 0; i < nExhibits; i++) {
    const w = rf(`ew${i}`, 1.5, 3.5);
    const x = ((i + 0.5) / nExhibits) * W - w / 2;
    features.push({ kind: "exhibit", x, y: 0.15, width: w, height: 0.5 });
  }
  const nFurniture = ri("nf", 0, 2);
  for (let i = 0; i < nFurniture; i++) {
    features.push({ kind: "furniture", x: rf(`fx${i}`, 1, W - 3.5), y: rf(`fy${i}`, 3, H - 1.5), width: rf(`fw${i}`, 1.5, 2.5), height: 0.6 });
  }

  const ids = [...cast.people.map((p) => p.id)].sort((a, b) => r(`shuffle-${a}`) - r(`shuffle-${b}`)).slice(0, ri("np", 3, 8));
  const inside = (k: string): [number, number] => [rf(`${k}x`, 1, W - 1), rf(`${k}y`, 1.2, H - 1)];
  const nudge = (p: [number, number], k: string): [number, number] => [
    Math.min(W - 1, Math.max(1, p[0] + rf(`${k}dx`, -3, 3))),
    Math.min(H - 1, Math.max(1.2, p[1] + rf(`${k}dy`, -2, 2))),
  ];

  const start: Keyframe = { t: 0, robot: { pos: inside("robot"), heading: rf("rh", 0, 360) }, people: {}, belief: {}, clock: `${ri("ch", 9, 17).toString().padStart(2, "0")}:${ri("cm", 0, 59).toString().padStart(2, "0")}:${ri("cs", 0, 59).toString().padStart(2, "0")}` };
  const end: Keyframe = { t: 10, robot: { pos: nudge(start.robot!.pos!, "robot2") }, people: {}, belief: {} };
  for (const id of ids) {
    const p0 = inside(`p-${id}`);
    start.people![id] = { pos: p0 };
    end.people![id] = { pos: r(`walk-${id}`) > 0.4 ? nudge(p0, `p2-${id}`) : p0 };
  }
  const ghosts = ids.slice(0, ri("nb", 0, 2));
  for (const id of ghosts) {
    const p0 = start.people![id].pos!;
    const g = nudge(p0, `g-${id}`);
    start.belief![id] = { pos: g, conf: rf(`gc-${id}`, 0.2, 0.9), stale: r(`gs-${id}`) > 0.5 };
    end.belief![id] = { pos: g };
  }
  const hull = r("hull") > 0.5;
  if (hull) {
    start.group = ids.slice(1);
    start.detached = r("det") > 0.5 ? [ids[0]] : [];
  }
  if (r("budget") > 0.5) start.budget = { label: `Stop ${ri("stop", 1, 9)}`, remaining: rf("rem", -40, 90), total: 180 };
  if (r("gaze") > 0.5) start.robot!.gaze = pick("gazeid", ids);

  const events: TraceEvent[] = [];
  const nSay = ri("ns", 1, 3);
  for (let i = 0; i < nSay; i++) {
    const who = r(`sw${i}`) > 0.5 ? "robot" : pick(`sp${i}`, ids);
    events.push({ kind: "say", t: rf(`st${i}`, 0, 7), who, text: pick(`sl${i}`, LINES), duration: 2.5, lift: who === "robot" ? 12 : undefined });
  }
  for (const id of ghosts) events.push({ kind: "pulse", t: rf(`pt-${id}`, 0, 9), at: id });
  const nFail = ri("nfail", 1, 3);
  for (let i = 0; i < nFail; i++) {
    events.push({ kind: "fail", t: rf(`ft${i}`, 0.5, 9), at: r(`fw${i}`) > 0.5 ? "robot" : pick(`fp${i}`, ids) });
  }

  const trace: Trace = {
    id: `gen-${seed}`,
    floorplan: `gen-${seed}`,
    duration: 10,
    view: "overlay",
    layers: { names: false, ticker: false, narration: false, headings: false, hull, confidence: r("conf") > 0.5 },
    principals: ids.slice(0, ri("npr", 0, 3)),
    keyframes: [start, end],
    events,
    narration: [],
  };
  const floorplan: FloorplanData = { id: `gen-${seed}`, meters: { width: W, height: H }, features };
  const out = { trace, floorplan };
  cache.set(seed, out);
  return out;
};
