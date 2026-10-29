import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DEFAULT_MODE, Domain, Mode, ThemeProvider, canvas, geometry, useTheme } from "../theme";
import { Canvas, Dot, Text } from "../vocabulary";
import type { FloorplanData } from "../trace/schema";
import { BuildState, PlanBuild, StageRect, captionOpacity } from "./Buildup";

// Camera version of the build-up. Each map is a full page in a two-by-two
// grid. The camera sits on one page while it builds, pans to the next, and
// after the last one pulls back to show the whole grid.

export type BuildupPanProps = {
  plans: FloorplanData[];
  captions: string[];
  domains: Domain[];
  active: number; // -1 builds all four in sequence
  panIn?: boolean; // start on the previous page and pan over
  zoomOut?: boolean; // pull back to the grid after building
  mode?: Mode;
};

const PAN = 1.0;
const BUILD = 4.5;
const ZOOM = 1.6;
const HOLD = 1.5;
const PAGE_GAP = 160;
const STAGE: StageRect = { left: canvas.safe, top: 140, width: canvas.width - canvas.safe * 2, height: 740 };
const GRID_W = 2 * canvas.width + PAGE_GAP;
const GRID_H = 2 * canvas.height + PAGE_GAP;
const OVERVIEW = Math.min((canvas.width - 2 * canvas.safe) / GRID_W, (canvas.height - 2 * canvas.safe) / GRID_H);

export const buildupPanSeconds = (panIn: boolean, zoomOut: boolean) => (panIn ? PAN : 0) + BUILD + (zoomOut ? ZOOM : 0) + HOLD;
export const buildupPanAllSeconds = (n: number) => n * BUILD + (n - 1) * PAN + ZOOM + HOLD;

const pageOrigin = (i: number) => ({ x: (i % 2) * (canvas.width + PAGE_GAP), y: Math.floor(i / 2) * (canvas.height + PAGE_GAP) });
const pageCenter = (i: number) => {
  const o = pageOrigin(i);
  return { x: o.x + canvas.width / 2, y: o.y + canvas.height / 2 };
};
const gridCenter = { x: GRID_W / 2, y: GRID_H / 2 };
const ease = Easing.inOut(Easing.cubic);
const mix = (a: number, b: number, u: number) => a + (b - a) * u;

type Camera = { s: number; cx: number; cy: number };

// Build start time of page j and the camera, for both modes.
const timeline = (props: BuildupPanProps, n: number) => {
  const { active, panIn = false, zoomOut = false } = props;
  const starts = (j: number) => (active < 0 ? j * (BUILD + PAN) : j === active ? (panIn ? PAN : 0) : j < active ? -Infinity : Infinity);
  const lastBuilt = active < 0 ? n - 1 : active;
  const buildEnd = starts(lastBuilt) + BUILD;
  const doZoom = active < 0 || zoomOut;
  const camera = (t: number): Camera => {
    // pans
    for (let j = 1; j < n; j++) {
      const arrive = starts(j);
      if (!Number.isFinite(arrive)) continue;
      if (t >= arrive - PAN && t < arrive) {
        const u = ease((t - (arrive - PAN)) / PAN);
        const a = pageCenter(j - 1);
        const b = pageCenter(j);
        return { s: 1, cx: mix(a.x, b.x, u), cy: mix(a.y, b.y, u) };
      }
    }
    // zoom out
    if (doZoom && t >= buildEnd) {
      const v = ease(Math.max(0, Math.min(1, (t - buildEnd) / ZOOM)));
      const c = pageCenter(lastBuilt);
      return { s: mix(1, OVERVIEW, v), cx: mix(c.x, gridCenter.x, v), cy: mix(c.y, gridCenter.y, v) };
    }
    // which page are we on
    let on = 0;
    for (let j = 0; j < n; j++) if (t >= starts(j)) on = j;
    const c = pageCenter(on);
    return { s: 1, cx: c.x, cy: c.y };
  };
  const stateOf = (j: number, t: number): { state: BuildState; local: number } => {
    const st = starts(j);
    if (st === -Infinity) return { state: "done", local: BUILD };
    const local = t - st;
    if (local < 0) return { state: "empty", local };
    if (local >= BUILD) return { state: "done", local };
    return { state: "building", local };
  };
  return { camera, stateOf };
};

const Page: React.FC<{ plan: FloorplanData; caption: string; domain: Domain; index: number; t: number; state: BuildState }> = ({ plan, caption, domain, index, t, state }) => {
  const { palette } = useTheme();
  const o = pageOrigin(index);
  return (
    <g transform={`translate(${o.x} ${o.y})`}>
      <rect x={0} y={0} width={canvas.width} height={canvas.height} fill={palette.background} stroke={palette.hairline} strokeWidth={geometry.strokeThin} />
      <PlanBuild plan={plan} t={t} state={state} stage={STAGE} />
      <g opacity={captionOpacity(plan, t, state)}>
        <Dot x={canvas.safe + 14} y={70} domain={domain} filled r={14} />
        <Text x={canvas.safe + 44} y={70} text={caption} size={60} weight={700} />
      </g>
    </g>
  );
};

const BuildupPanInner: React.FC<BuildupPanProps> = (props) => {
  const { plans, captions, domains } = props;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { camera, stateOf } = timeline(props, plans.length);
  const cam = camera(t);
  const dim = interpolate(cam.s, [OVERVIEW, 1], [1, 1]);
  return (
    <Canvas>
      <g opacity={dim} transform={`translate(${canvas.width / 2} ${canvas.height / 2}) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
        {plans.map((plan, i) => {
          const { state, local } = stateOf(i, t);
          return <Page key={plan.id} plan={plan} caption={captions[i]} domain={domains[i]} index={i} t={local} state={state} />;
        })}
      </g>
    </Canvas>
  );
};

export const BuildupPan: React.FC<BuildupPanProps> = ({ mode = DEFAULT_MODE, ...rest }) => (
  <ThemeProvider mode={mode}>
    <BuildupPanInner {...rest} />
  </ThemeProvider>
);
