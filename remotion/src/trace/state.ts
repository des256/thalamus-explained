import { geometry, motion } from "../theme";
import type { RobotState } from "../vocabulary/Robot";
import type { HeardEvent, Keyframe, SayEvent, Trace, Vec } from "./schema";

// Resolve a trace at time t into what the Scene composition draws.

export type SceneState = {
  robot: { pos: Vec; heading: number; state: RobotState; gazeTarget?: Vec };
  people: { id: string; pos: Vec; heading?: number }[];
  beliefs: { id: string; pos: Vec; conf?: number; stale?: boolean; name?: string }[];
  group: string[];
  detached: string[];
  clock?: string;
  budget?: { label: string; remaining: number; total: number };
  highlight?: string;
  lights: number;
  bubbles: { event: SayEvent | HeardEvent; age: number; anchor: Vec; anchorRadius: number }[];
  pulses: { at: Vec; phase: number; color?: "lost" | "stale" }[];
  ticker: { t: number; text: string }[];
  narration?: string;
  title?: { text: string; subtitle?: string; age: number; remaining: number };
  fails: { anchor: Vec; index: number; age: number; persist: boolean; kind: "robot" | "person" | "fixed" }[];
};

type Sample<T> = { t: number; v: T };

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const lerpVec = (a: Vec, b: Vec, f: number): Vec => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
const lerpAngle = (a: number, b: number, f: number) => {
  let d = ((b - a + 540) % 360) - 180;
  return a + d * f;
};

// Linear interpolation over the samples that define a value; holds the first
// value before the first sample and the last value after the last one.
const sampleLerp = <T>(track: Sample<T>[], t: number, mix: (a: T, b: T, f: number) => T): T | undefined => {
  if (track.length === 0) return undefined;
  if (t <= track[0].t) return track[0].v;
  for (let i = 1; i < track.length; i++) {
    if (t <= track[i].t) {
      const a = track[i - 1];
      const b = track[i];
      const f = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
      return mix(a.v, b.v, f);
    }
  }
  return track[track.length - 1].v;
};

// Step function: the most recent sample at or before t.
const sampleStep = <T>(track: Sample<T>[], t: number): T | undefined => {
  let v: T | undefined;
  for (const s of track) {
    if (s.t <= t) v = s.v;
    else break;
  }
  return v;
};

const collect = <T>(keyframes: Keyframe[], pick: (k: Keyframe) => T | undefined): Sample<T>[] => {
  const out: Sample<T>[] = [];
  for (const k of keyframes) {
    const v = pick(k);
    if (v !== undefined) out.push({ t: k.t, v });
  }
  return out;
};

const parseClock = (s: string) => {
  const [h, m, sec] = s.split(":").map(Number);
  return h * 3600 + m * 60 + sec;
};
const formatClock = (secs: number) => {
  const s = Math.max(0, Math.floor(secs)) % 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = s % 60;
  return [h, m, x].map((n) => n.toString().padStart(2, "0")).join(":");
};

const ids = (keyframes: Keyframe[], field: "people" | "belief") => {
  const set = new Set<string>();
  for (const k of keyframes) for (const id of Object.keys(k[field] ?? {})) set.add(id);
  return [...set];
};

const robotPos = (kf: Keyframe[], t: number): Vec =>
  sampleLerp(collect(kf, (k) => k.robot?.pos), t, lerpVec) ?? [0, 0];

export const stateAt = (trace: Trace, t: number, fps: number): SceneState => {
  const kf = trace.keyframes;

  // People, truth.
  const people: SceneState["people"] = [];
  const personPos = new Map<string, Vec>();
  for (const id of ids(kf, "people")) {
    const posTrack = collect(kf, (k) => k.people?.[id]?.pos);
    if (posTrack.length === 0 || t < posTrack[0].t) continue;
    const present = sampleStep(collect(kf, (k) => k.people?.[id]?.present), t) ?? true;
    if (!present) continue;
    const pos = sampleLerp(posTrack, t, lerpVec)!;
    const heading = sampleLerp(collect(kf, (k) => k.people?.[id]?.heading), t, lerpAngle);
    personPos.set(id, pos);
    people.push({ id, pos, heading });
  }

  // Beliefs.
  const beliefs: SceneState["beliefs"] = [];
  for (const id of ids(kf, "belief")) {
    const posTrack = collect(kf, (k) => k.belief?.[id]?.pos);
    if (posTrack.length === 0 || t < posTrack[0].t) continue;
    const present = sampleStep(collect(kf, (k) => k.belief?.[id]?.present), t) ?? true;
    if (!present) continue;
    beliefs.push({
      id,
      pos: sampleLerp(posTrack, t, lerpVec)!,
      conf: sampleLerp(collect(kf, (k) => k.belief?.[id]?.conf), t, lerp),
      stale: sampleStep(collect(kf, (k) => k.belief?.[id]?.stale), t),
      name: sampleStep(collect(kf, (k) => k.belief?.[id]?.name), t),
    });
  }

  // Robot.
  const pos = robotPos(kf, t);
  const heading = sampleLerp(collect(kf, (k) => k.robot?.heading), t, lerpAngle) ?? 0;
  const gazeId = sampleStep(collect(kf, (k) => k.robot?.gaze), t);
  const gazeTarget = gazeId ? personPos.get(gazeId) : undefined;
  const ahead = robotPos(kf, t + 1 / fps);
  const speed = Math.hypot(ahead[0] - pos[0], ahead[1] - pos[1]) * fps;

  // Timed events.
  const bubbles: SceneState["bubbles"] = [];
  let robotSpeaking = false;
  let someoneSpeaking = false;
  const pulses: SceneState["pulses"] = [];
  const ticker: SceneState["ticker"] = [];
  let title: SceneState["title"];
  for (const e of trace.events) {
    if (e.kind === "say" || e.kind === "heard") {
      const d = e.duration ?? 3;
      if (t >= e.t && t < e.t + d) {
        const robot = e.kind === "heard" || e.who === "robot";
        if (robot && e.kind === "say") robotSpeaking = true;
        if (!robot) someoneSpeaking = true;
        const anchor = robot ? pos : personPos.get(e.who);
        if (!anchor) continue;
        bubbles.push({ event: e, age: t - e.t, anchor, anchorRadius: robot ? geometry.robot / 2 : geometry.person / 2 });
      }
    } else if (e.kind === "pulse") {
      const d = motion.pop * 2.5;
      if (t >= e.t && t < e.t + d) {
        const at = e.at === "robot" ? pos : (personPos.get(e.at) ?? beliefs.find((b) => b.id === e.at)?.pos);
        if (at) pulses.push({ at, phase: (t - e.t) / d, color: e.color });
      }
    } else if (e.kind === "ticker") {
      if (e.t <= t) ticker.push({ t: e.t, text: e.text });
    } else if (e.kind === "title") {
      const d = e.duration ?? Infinity;
      if (t >= e.t && t < e.t + d) title = { text: e.text, subtitle: e.subtitle, age: t - e.t, remaining: e.t + d - t };
    }
  }
  ticker.sort((a, b) => b.t - a.t);

  // Failure crosses: one per event, stacked per anchor in time order, moving
  // with the entity they belong to.
  const fails: SceneState["fails"] = [];
  const failCount = new Map<string, number>();
  const failEvents = trace.events.filter((e): e is Extract<typeof e, { kind: "fail" }> => e.kind === "fail").sort((a, b) => a.t - b.t);
  for (const e of failEvents) {
    if (e.t > t) break;
    const key = typeof e.at === "string" ? e.at : e.at.join(",");
    const index = failCount.get(key) ?? 0;
    failCount.set(key, index + 1);
    const persist = e.persist ?? true;
    const age = t - e.t;
    if (!persist && age > motion.pop * 4) continue;
    if (typeof e.at === "string") {
      const anchor = e.at === "robot" ? pos : personPos.get(e.at);
      if (!anchor) continue;
      fails.push({ anchor, index, age, persist, kind: e.at === "robot" ? "robot" : "person" });
    } else {
      fails.push({ anchor: e.at, index, age, persist, kind: "fixed" });
    }
  }

  const state: RobotState = robotSpeaking ? "speaking" : someoneSpeaking ? "listening" : speed > 0.05 ? "moving" : "idle";

  // Clock: anchors interpolate, and time runs on after the last anchor.
  const clockTrack = collect(kf, (k) => k.clock).map((s) => ({ t: s.t, v: parseClock(s.v) }));
  let clock: string | undefined;
  if (clockTrack.length > 0) {
    const last = clockTrack[clockTrack.length - 1];
    const secs = t >= last.t ? last.v + (t - last.t) : sampleLerp(clockTrack, t, lerp)!;
    clock = formatClock(secs);
  }

  // Budget: the remaining time counts down from the keyframe that set it.
  const budgetSample = (() => {
    let s: Sample<NonNullable<Keyframe["budget"]>> | undefined;
    for (const k of kf) if (k.budget && k.t <= t) s = { t: k.t, v: k.budget };
    return s;
  })();
  const budget = budgetSample ? { ...budgetSample.v, remaining: budgetSample.v.remaining - (t - budgetSample.t) } : undefined;

  const narrationBeat = (() => {
    for (let i = trace.narration.length - 1; i >= 0; i--) {
      const b = trace.narration[i];
      if (t >= b.t) {
        const end = b.duration !== undefined ? b.t + b.duration : (trace.narration[i + 1]?.t ?? Infinity);
        return t < end ? b.text : undefined;
      }
    }
    return undefined;
  })();

  return {
    robot: { pos, heading, state, gazeTarget },
    people,
    beliefs,
    group: sampleStep(collect(kf, (k) => k.group), t) ?? [],
    detached: sampleStep(collect(kf, (k) => k.detached), t) ?? [],
    clock,
    budget,
    highlight: sampleStep(collect(kf, (k) => k.highlight), t) ?? undefined,
    lights: sampleLerp(collect(kf, (k) => k.lights), t, lerp) ?? 1,
    bubbles,
    pulses,
    ticker,
    narration: narrationBeat,
    title,
    fails,
  };
};
