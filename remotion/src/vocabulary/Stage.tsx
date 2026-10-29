import React, { createContext, useContext, useId } from "react";
import { AbsoluteFill } from "remotion";
import { canvas, useTheme } from "../theme";
import { fontFamily } from "../fonts";

// Full-frame SVG surface. Every vocabulary component renders SVG nodes, so a
// composition is one Canvas with Stages and chrome inside it.
export const Canvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { palette } = useTheme();
  return (
    <AbsoluteFill style={{ backgroundColor: palette.background, fontFamily }}>
      <svg
        width={canvas.width}
        height={canvas.height}
        viewBox={`0 0 ${canvas.width} ${canvas.height}`}
        style={{ fontFamily }}
      >
        {children}
      </svg>
    </AbsoluteFill>
  );
};

// Meters to pixels. A Stage is a rectangle on the canvas showing a floorplan
// of `meters` size, uniformly scaled and centred. Floorplan coordinates are
// meters with y pointing down, like the screen.
export type Transform = {
  toPx: (x: number, y: number) => [number, number];
  scale: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

const StageContext = createContext<Transform>({
  toPx: (x, y) => [x, y],
  scale: 1,
  left: 0,
  top: 0,
  width: canvas.width,
  height: canvas.height,
});

export const useStage = () => useContext(StageContext);

export const Stage: React.FC<{
  left: number;
  top: number;
  width: number;
  height: number;
  meters: { width: number; height: number };
  clip?: boolean;
  children: React.ReactNode;
}> = ({ left, top, width, height, meters, clip = false, children }) => {
  const clipId = useId();
  const scale = Math.min(width / meters.width, height / meters.height);
  const w = meters.width * scale;
  const h = meters.height * scale;
  const ox = left + (width - w) / 2;
  const oy = top + (height - h) / 2;
  const value: Transform = {
    toPx: (x, y) => [ox + x * scale, oy + y * scale],
    scale,
    left: ox,
    top: oy,
    width: w,
    height: h,
  };
  return (
    <StageContext.Provider value={value}>
      {clip ? (
        <g clipPath={`url(#${clipId})`}>
          <defs>
            <clipPath id={clipId}>
              <rect x={ox - 2} y={oy - 2} width={w + 4} height={h + 4} />
            </clipPath>
          </defs>
          {children}
        </g>
      ) : (
        children
      )}
    </StageContext.Provider>
  );
};

// Inter is not measured at render time. Per-glyph advance widths in em,
// approximate, biased slightly wide so wrapping and pills err on the safe
// side. The lint pass checks real overlap later.
const GLYPH: Record<string, number> = {
  " ": 0.28, "'": 0.2, ".": 0.28, ",": 0.28, ":": 0.28, ";": 0.28, "!": 0.3, "|": 0.26, "?": 0.52, "-": 0.35, "·": 0.3,
  "(": 0.35, ")": 0.35, "“": 0.45, "”": 0.45, '"': 0.45,
  i: 0.26, j: 0.28, l: 0.26, f: 0.34, t: 0.35, r: 0.38, I: 0.28,
  s: 0.5, z: 0.5, c: 0.54, a: 0.55, e: 0.57, k: 0.55, v: 0.53, x: 0.53, y: 0.53, J: 0.5,
  n: 0.6, u: 0.6, h: 0.6, b: 0.62, d: 0.62, p: 0.62, q: 0.62, g: 0.6, o: 0.6,
  m: 0.9, w: 0.82, M: 0.85, W: 0.95,
  A: 0.68, B: 0.66, C: 0.72, D: 0.72, E: 0.6, F: 0.58, G: 0.75, H: 0.74, K: 0.66, L: 0.56, N: 0.74, O: 0.78,
  P: 0.64, Q: 0.78, R: 0.66, S: 0.63, T: 0.62, U: 0.72, V: 0.68, X: 0.66, Y: 0.64, Z: 0.62,
};
export const textWidth = (text: string, size: number, weight = 500) => {
  let em = 0;
  for (const ch of text) em += GLYPH[ch] ?? (/[0-9]/.test(ch) ? 0.6 : 0.58);
  return em * size * 1.05 * (weight >= 600 ? 1.04 : 1);
};

export const wrapText = (text: string, size: number, maxWidth: number, weight = 500): string[] => {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (textWidth(candidate, size, weight) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
};

export const deg = (d: number) => (d * Math.PI) / 180;
