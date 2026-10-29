import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DEFAULT_MODE, Domain, Mode, ThemeProvider, canvas, geometry, type, useTheme } from "../theme";
import { Canvas, Dot, Floorplan, Robot, Stage, Text } from "../vocabulary";
import type { FloorplanData } from "../trace/schema";

// Chapter 3: the four floor maps build up one by one. Walls draw themselves,
// zones fade in, furniture and exhibits pop, the dock ring draws, the robot
// drops onto it, and the caption lands. Two layouts share this: the grid
// version here, and the camera version in BuildupPan.

export type BuildState = "empty" | "building" | "done";
export type StageRect = { left: number; top: number; width: number; height: number };

export type BuildupProps = {
  plans: FloorplanData[];
  captions: string[];
  domains: Domain[];
  active: number;
  perPlan?: number;
  mode?: Mode;
};

export const PER_PLAN_SECONDS = 5;

// Per-feature start and duration in seconds, by kind and order within kind.
export const schedule = (plan: FloorplanData) => {
  const counts = { wall: 0, zone: 0, rect: 0 };
  const out = plan.features.map((f) => {
    if (f.kind === "wall") return { start: 0.1 + counts.wall++ * 0.35, dur: 0.7 };
    if (f.kind === "zone") return { start: 0.9 + counts.zone++ * 0.1, dur: 0.4 };
    if (f.kind === "dock") return { start: 0, dur: 0.4 };
    return { start: 1.1 + counts.rect++ * 0.12, dur: 0.4 };
  });
  const lastRect = Math.max(0, ...out.filter((_, i) => plan.features[i].kind !== "dock").map((s) => s.start + s.dur));
  const dockStart = lastRect + 0.1;
  plan.features.forEach((f, i) => {
    if (f.kind === "dock") out[i] = { start: dockStart, dur: 0.4 };
  });
  return { steps: out, robotAt: dockStart + 0.35 };
};

// One plan at a given local time, inside a stage rectangle.
export const PlanBuild: React.FC<{ plan: FloorplanData; t: number; state: BuildState; stage: StageRect }> = ({ plan, t, state, stage }) => {
  const { fps } = useVideoConfig();
  if (state === "empty") return null;
  const { steps, robotAt } = schedule(plan);
  const progress = state === "done" ? undefined : steps.map((s) => (t - s.start) / s.dur);
  const dock = plan.features.find((f) => f.kind === "dock");
  const robotVisible = state === "done" || t >= robotAt;
  const drop = state === "done" ? 1 : spring({ frame: Math.max(0, Math.round((t - robotAt) * fps)), fps, config: { damping: 11, stiffness: 120 } });
  return (
    <Stage {...stage} meters={plan.meters}>
      <Floorplan features={plan.features} progress={progress} />
      {dock && robotVisible && <Robot x={dock.x} y={dock.y} heading={dock.heading} scale={1.6 - 0.6 * drop} opacity={Math.min(1, drop * 1.5)} />}
    </Stage>
  );
};

export const captionOpacity = (plan: FloorplanData, t: number, state: BuildState) =>
  state === "done" ? 1 : state === "empty" ? 0 : Math.max(0, Math.min(1, (t - schedule(plan).robotAt) / 0.4));

// --- Grid version -----------------------------------------------------------

const FULL: StageRect = { left: 0, top: 0, width: canvas.width - canvas.safe * 2, height: 740 };
const GAP = 24;
const SLOT_W = (canvas.width - canvas.safe * 2 - GAP) / 2;
const SLOT_H = (canvas.height - canvas.safe * 2 - GAP) / 2;
const SLOT_SCALE = SLOT_W / FULL.width;

const slotOrigin = (i: number) => ({
  x: canvas.safe + (i % 2) * (SLOT_W + GAP),
  y: canvas.safe + Math.floor(i / 2) * (SLOT_H + GAP),
});

const Slot: React.FC<{ plan: FloorplanData; caption: string; domain: Domain; index: number; t: number; state: BuildState }> = ({ plan, caption, domain, index, t, state }) => {
  const { palette } = useTheme();
  const { x, y } = slotOrigin(index);
  if (state === "empty") {
    return <rect x={x} y={y} width={SLOT_W} height={SLOT_H} rx={12} fill="none" stroke={palette.hairline} strokeWidth={geometry.strokeThin} strokeDasharray="10 10" />;
  }
  const planH = FULL.height * SLOT_SCALE;
  const offsetY = (SLOT_H - 48 - planH) / 2 + 48;
  return (
    <g>
      <g transform={`translate(${x} ${y + offsetY}) scale(${SLOT_SCALE})`}>
        <PlanBuild plan={plan} t={t} state={state} stage={FULL} />
      </g>
      <g opacity={captionOpacity(plan, t, state)}>
        <Dot x={x + 12} y={y + 20} domain={domain} filled r={7} />
        <Text x={x + 30} y={y + 20} text={caption} size={type.label} weight={600} />
      </g>
    </g>
  );
};

const BuildupInner: React.FC<BuildupProps> = ({ plans, captions, domains, active, perPlan = PER_PLAN_SECONDS }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <Canvas>
      {plans.map((plan, i) => {
        let state: BuildState;
        let local = t;
        if (active < 0) {
          local = t - i * perPlan;
          state = local < 0 ? "empty" : local >= perPlan ? "done" : "building";
        } else {
          state = i < active ? "done" : i === active ? "building" : "empty";
        }
        return <Slot key={plan.id} plan={plan} caption={captions[i]} domain={domains[i]} index={i} t={local} state={state} />;
      })}
    </Canvas>
  );
};

export const Buildup: React.FC<BuildupProps> = ({ mode = DEFAULT_MODE, ...rest }) => (
  <ThemeProvider mode={mode}>
    <BuildupInner {...rest} />
  </ThemeProvider>
);
