import { z } from "zod";

// ---------------------------------------------------------------------------
// The trace: the shared contract between authored scenes, the future
// simulator and exported pipeline logs. Keyframes carry world state and are
// interpolated; events are instantaneous or timed; narration beats drive the
// subtitle band and the scratch voice-over timing.
// ---------------------------------------------------------------------------

const Vec = z.tuple([z.number(), z.number()]);
export type Vec = z.infer<typeof Vec>;

export const LAYER_NAMES = ["clock", "budget", "ticker", "narration", "hull", "belief", "gaze", "headings", "confidence", "names", "fails"] as const;
export type LayerName = (typeof LAYER_NAMES)[number];
export type Layers = Record<LayerName, boolean>;
export const DEFAULT_LAYERS: Layers = {
  clock: true,
  budget: true,
  ticker: true,
  narration: true,
  hull: true,
  belief: true,
  gaze: true,
  headings: true,
  confidence: true,
  names: true,
  fails: true,
};

const PersonKF = z.object({
  pos: Vec.optional(),
  heading: z.number().optional(),
  present: z.boolean().optional(),
});

const BeliefKF = z.object({
  pos: Vec.optional(),
  conf: z.number().min(0).max(1).optional(),
  stale: z.boolean().optional(),
  name: z.string().optional(),
  present: z.boolean().optional(),
});

const RobotKF = z.object({
  pos: Vec.optional(),
  heading: z.number().optional(),
  gaze: z.string().nullable().optional(),
});

export const KeyframeSchema = z.object({
  t: z.number().min(0),
  robot: RobotKF.optional(),
  people: z.record(z.string(), PersonKF).optional(),
  belief: z.record(z.string(), BeliefKF).optional(),
  group: z.array(z.string()).optional(),
  detached: z.array(z.string()).optional(),
  clock: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  budget: z.object({ label: z.string(), remaining: z.number(), total: z.number() }).optional(),
  highlight: z.string().nullable().optional(),
  lights: z.number().min(0).max(1).optional(),
});
export type Keyframe = z.infer<typeof KeyframeSchema>;

const bubblePlacement = {
  duration: z.number().positive().optional(),
  side: z.enum(["left", "right"]).optional(),
  place: z.enum(["above", "below"]).optional(),
  lift: z.number().optional(),
  maxWidth: z.number().optional(),
};

export const EventSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("say"), t: z.number(), who: z.string(), text: z.string(), to: z.string().optional(), ...bubblePlacement }),
  z.object({ kind: z.literal("heard"), t: z.number(), text: z.string(), attribution: z.string().optional(), conf: z.number().optional(), ...bubblePlacement }),
  z.object({ kind: z.literal("ticker"), t: z.number(), text: z.string() }),
  z.object({ kind: z.literal("pulse"), t: z.number(), at: z.string(), color: z.enum(["lost", "stale"]).optional() }),
  z.object({ kind: z.literal("title"), t: z.number(), text: z.string(), subtitle: z.string().optional(), duration: z.number().optional() }),
  z.object({ kind: z.literal("fail"), t: z.number(), at: z.union([z.string(), Vec]), persist: z.boolean().optional() }),
]);
export type TraceEvent = z.infer<typeof EventSchema>;
export type SayEvent = Extract<TraceEvent, { kind: "say" }>;
export type HeardEvent = Extract<TraceEvent, { kind: "heard" }>;

export const BeatSchema = z.object({ t: z.number(), text: z.string(), duration: z.number().optional() });

export const TraceSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  floorplan: z.string(),
  duration: z.number().positive(),
  view: z.enum(["overlay", "split"]).default("overlay"),
  layers: z.partialRecord(z.enum(LAYER_NAMES), z.boolean()).default({}),
  principals: z.array(z.string()).max(3).default([]),
  keyframes: z.array(KeyframeSchema).min(1),
  events: z.array(EventSchema).default([]),
  narration: z.array(BeatSchema).default([]),
});
export type Trace = z.infer<typeof TraceSchema>;

export const loadTrace = (raw: unknown): Trace => {
  const trace = TraceSchema.parse(raw);
  const ts = trace.keyframes.map((k) => k.t);
  for (let i = 1; i < ts.length; i++) {
    if (ts[i] < ts[i - 1]) throw new Error(`trace ${trace.id}: keyframes out of order at index ${i}`);
  }
  return trace;
};

// Floorplans are feature lists in meters, y pointing down.
const FeatureSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("wall"), points: z.array(Vec).min(2) }),
  z.object({ kind: z.literal("exhibit"), x: z.number(), y: z.number(), width: z.number(), height: z.number(), label: z.string().optional() }),
  z.object({ kind: z.literal("furniture"), x: z.number(), y: z.number(), width: z.number(), height: z.number(), label: z.string().optional() }),
  z.object({ kind: z.literal("zone"), x: z.number(), y: z.number(), width: z.number(), height: z.number(), label: z.string().optional() }),
  z.object({ kind: z.literal("dock"), x: z.number(), y: z.number(), heading: z.number() }),
]);

export const FloorplanSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  meters: z.object({ width: z.number().positive(), height: z.number().positive() }),
  features: z.array(FeatureSchema),
});
export type FloorplanData = z.infer<typeof FloorplanSchema>;
export const loadFloorplan = (raw: unknown): FloorplanData => FloorplanSchema.parse(raw);
