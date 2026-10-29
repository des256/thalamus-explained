import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DEFAULT_MODE, Mode, SLOTS, Slot, ThemeProvider, canvas, geometry, motion, useTheme } from "../theme";
import {
  BudgetBar,
  Bubble,
  Canvas,
  Clock,
  Fail,
  Floorplan,
  GazeLine,
  GroupHull,
  Narration,
  Person,
  Pulse,
  Robot,
  Stage,
  Ticker,
  Title,
} from "../vocabulary";
import { DEFAULT_LAYERS, FloorplanData, Trace, Vec } from "../trace/schema";
import { stateAt } from "../trace/state";
import cast from "../../../data/cast.json";

// One composition renders every trace. The trace decides the floorplan, the
// layers that are visible, and who the coloured principals are.

export type SceneProps = { trace: Trace; floorplan: FloorplanData; mode?: Mode; fade?: boolean };

const STAGE = { left: canvas.safe, top: 140, width: canvas.width - canvas.safe * 2, height: 740 };

type CastEntry = { id: string; name: string; age: "adult" | "elder" | "child"; role: string; slot: string };
const castById = new Map<string, CastEntry>((cast.people as CastEntry[]).map((p) => [p.id, p]));

const SceneInner: React.FC<SceneProps> = ({ trace, floorplan, fade = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { palette } = useTheme();
  const t = frame / fps;
  const state = useMemo(() => stateAt(trace, t, fps), [trace, t, fps]);
  const layers = { ...DEFAULT_LAYERS, ...trace.layers };

  // Colour slots for the principals; everyone else neutral.
  const slotOf = (id: string): Slot | null => {
    const i = trace.principals.indexOf(id);
    if (i < 0) return null;
    const preferred = castById.get(id)?.slot as Slot | undefined;
    const taken = trace.principals.slice(0, i).map((p) => castById.get(p)?.slot);
    if (preferred && !taken.includes(preferred)) return preferred;
    return SLOTS.find((s) => !taken.includes(s)) ?? null;
  };

  const posOf = (id: string): Vec | undefined => state.people.find((p) => p.id === id)?.pos;
  const members = state.group.map(posOf).filter((p): p is Vec => p !== undefined);
  const detached = state.detached.map(posOf).filter((p): p is Vec => p !== undefined);

  const fadeFrames = Math.max(1, Math.round(motion.pop * fps));
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [Math.min(durationInFrames - 1, durationInFrames - fadeFrames) - 1, durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneOpacity = !fade || state.title ? 1 : Math.min(fadeIn, fadeOut);
  const bubbleOpacity = (age: number) => interpolate(age, [0, motion.bubble], [0, 1], { extrapolateRight: "clamp" });

  return (
    <Canvas>
      <g opacity={sceneOpacity}>
        <Stage {...STAGE} meters={floorplan.meters} clip>
          <Floorplan features={floorplan.features} highlight={state.highlight} />
          {layers.hull && members.length > 0 && <GroupHull members={members} detached={detached} />}
          {layers.gaze && state.robot.gazeTarget && <GazeLine from={state.robot.pos} to={state.robot.gazeTarget} />}
          {layers.belief &&
            state.beliefs.map((b) => {
              const c = castById.get(b.id);
              return (
                <Person
                  key={`belief-${b.id}`}
                  x={b.pos[0]}
                  y={b.pos[1]}
                  view="belief"
                  name={layers.names ? (b.name ?? c?.name) : undefined}
                  unknown={!b.name && !c}
                  slot={slotOf(b.id)}
                  age={c?.age}
                  stale={b.stale}
                  confidence={layers.confidence ? b.conf : undefined}
                />
              );
            })}
          {state.people.map((p) => {
            const c = castById.get(p.id);
            return (
              <Person
                key={p.id}
                x={p.pos[0]}
                y={p.pos[1]}
                name={layers.names ? (c?.name ?? p.id) : undefined}
                slot={slotOf(p.id)}
                age={c?.age}
                staff={c?.role === "staff"}
                heading={layers.headings ? p.heading : undefined}
              />
            );
          })}
          {state.pulses.map((p, i) => (
            <Pulse key={i} x={p.at[0]} y={p.at[1]} phase={p.phase} color={p.color === "stale" ? palette.status.stale : undefined} />
          ))}
          <Robot x={state.robot.pos[0]} y={state.robot.pos[1]} heading={state.robot.heading} state={state.robot.state} />
          {layers.fails &&
            state.fails.map((f, i) => <Fail key={i} x={f.anchor[0]} y={f.anchor[1]} index={f.index} age={f.age} persist={f.persist} kind={f.kind} />)}
        </Stage>
        {state.lights < 1 && (
          <rect x={STAGE.left} y={STAGE.top} width={STAGE.width} height={STAGE.height} fill={palette.background} opacity={1 - state.lights} />
        )}
        <Stage {...STAGE} meters={floorplan.meters}>
          {state.bubbles.map((b, i) => (
            <g key={i} opacity={bubbleOpacity(b.age)}>
              <Bubble
                x={b.anchor[0]}
                y={b.anchor[1]}
                text={b.event.text}
                variant={b.event.kind === "say" ? "said" : "heard"}
                attribution={b.event.kind === "heard" ? b.event.attribution : undefined}
                side={b.event.side ?? (b.anchor[0] > floorplan.meters.width / 2 ? "left" : "right")}
                place={b.event.place}
                lift={b.event.lift}
                maxWidth={b.event.maxWidth}
                anchorRadius={b.anchorRadius}
              />
            </g>
          ))}
        </Stage>
        {layers.budget && state.budget && (
          <BudgetBar x={canvas.safe} y={60} label={state.budget.label} remaining={state.budget.remaining} total={state.budget.total} />
        )}
        {layers.clock && state.clock && <Clock x={canvas.width - canvas.safe} y={70} time={state.clock} />}
        {layers.ticker && state.ticker.length > 0 && <Ticker events={state.ticker} />}
        {layers.narration && state.narration && <Narration text={state.narration} />}
      </g>
      {state.title && (
        <g
          opacity={Math.min(
            interpolate(state.title.age, [0, motion.pop * 2], [0, 1], { extrapolateRight: "clamp" }),
            interpolate(state.title.remaining, [0, motion.pop * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          )}
        >
          <rect x={0} y={0} width={canvas.width} height={canvas.height} fill={palette.background} opacity={0.82} />
          <Title text={state.title.text} subtitle={state.title.subtitle} />
        </g>
      )}
    </Canvas>
  );
};

export const Scene: React.FC<SceneProps> = ({ mode = DEFAULT_MODE, ...rest }) => (
  <ThemeProvider mode={mode}>
    <SceneInner {...rest} />
  </ThemeProvider>
);

export const sceneDuration = (trace: Trace) => Math.ceil(trace.duration * canvas.fps);
export const stageGeometry = { ...STAGE, personRadius: geometry.person / 2 };
