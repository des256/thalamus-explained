import React from "react";
import { AbsoluteFill, Easing, Freeze, Loop, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { DEFAULT_MODE, Mode, ThemeProvider, canvas, palettes } from "../theme";
import { Canvas, Title } from "../vocabulary";
import type { FloorplanData, Trace } from "../trace/schema";
import { generateScene } from "../trace/generate";
import { Scene } from "./Scene";

// The cold open with its ending: the scene shrinks into one tile of an
// endless string of robot failures, the camera runs along the string faster
// and faster, and the series title resolves out of the smear.

export type StripProps = { main: { trace: Trace; floorplan: FloorplanData }; mode?: Mode; title: string; subtitle?: string };

const T = { zoomStart: 86.5, zoomEnd: 88, scrollEnd: 100, titleIn: 99.3, titleFull: 101, end: 102 };
const TILE_SCALE = 1 / 3;
const TILE_GAP = 160;
const PITCH = canvas.width + TILE_GAP;
const TOTAL_TILES = 140;
const LOOP_SECONDS = 10;

export const stripDuration = () => Math.ceil(T.end * canvas.fps);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Camera: scale and the world x that sits at the centre of the screen.
const camera = (t: number) => {
  const s = interpolate(t, [T.zoomStart, T.zoomEnd], [1, TILE_SCALE], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const u = clamp01((t - T.zoomEnd) / (T.scrollEnd - T.zoomEnd));
  const tiles = TOTAL_TILES * u ** 3;
  return { s, p: canvas.width / 2 + tiles * PITCH, tiles };
};
const tilesPerSecond = (t: number) => {
  const u = clamp01((t - T.zoomEnd) / (T.scrollEnd - T.zoomEnd));
  return (3 * TOTAL_TILES * u * u) / (T.scrollEnd - T.zoomEnd);
};

const Tile: React.FC<{ index: number; main: StripProps["main"]; mode: Mode }> = ({ index, main, mode }) => {
  if (index === 0) return <Scene trace={main.trace} floorplan={main.floorplan} mode={mode} />;
  if (index % 4 === 2) {
    const frame = Math.floor(random(`freeze-${index}`) * 80 * canvas.fps);
    return (
      <Freeze frame={frame}>
        <Scene trace={main.trace} floorplan={main.floorplan} mode={mode} fade={false} />
      </Freeze>
    );
  }
  const g = generateScene(index);
  return (
    <Loop durationInFrames={LOOP_SECONDS * canvas.fps}>
      <Scene trace={g.trace} floorplan={g.floorplan} mode={mode} fade={false} />
    </Loop>
  );
};

export const Strip: React.FC<StripProps> = ({ main, mode = DEFAULT_MODE, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const palette = palettes[mode];
  const perFrame = tilesPerSecond(t) / fps;
  const samples = perFrame > 1 ? 5 : perFrame > 0.35 ? 3 : 1;
  const titleOpacity = interpolate(t, [T.titleIn, T.titleFull], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const visible = (p: number, s: number) => {
    const half = canvas.width / 2 / s;
    const lo = Math.max(0, Math.floor((p - half - canvas.width) / PITCH));
    const hi = Math.min(TOTAL_TILES + 12, Math.ceil((p + half) / PITCH));
    return Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => lo + i);
  };

  return (
    <AbsoluteFill style={{ backgroundColor: palette.background }}>
      {Array.from({ length: samples }, (_, k) => {
        const c = camera(t - k / samples / fps);
        return (
          <AbsoluteFill
            key={k}
            style={{
              opacity: 1 / samples,
              transformOrigin: "0 0",
              transform: `translate(${canvas.width / 2}px, ${canvas.height / 2}px) scale(${c.s}) translate(${-c.p}px, ${-canvas.height / 2}px)`,
            }}
          >
            {visible(c.p, c.s).map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: i * PITCH,
                  top: 0,
                  width: canvas.width,
                  height: canvas.height,
                  overflow: "hidden",
                  borderRadius: i === 0 && c.s >= 1 ? 0 : 24,
                  boxShadow: `0 0 0 6px ${palette.hairline}`,
                }}
              >
                <Tile index={i} main={main} mode={mode} />
              </div>
            ))}
          </AbsoluteFill>
        );
      })}
      {titleOpacity > 0 && (
        <AbsoluteFill style={{ opacity: titleOpacity }}>
          <ThemeProvider mode={mode}>
            <Canvas>
              <Title text={title} subtitle={subtitle} />
            </Canvas>
          </ThemeProvider>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
