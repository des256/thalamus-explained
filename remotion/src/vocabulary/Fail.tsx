import React from "react";
import { interpolate } from "remotion";
import { geometry, motion, useTheme } from "../theme";
import { useStage } from "./Stage";

// A red cross that lights up where something went wrong and stays as a faint
// tally. Robot crosses line up below and to the left of the disc, clear of the
// speech arcs and bubbles, person crosses above and to the left, fixed crosses at the point itself; each anchor stacks leftward.
export const Fail: React.FC<{
  x: number;
  y: number;
  index?: number;
  age: number;
  persist?: boolean;
  kind?: "robot" | "person" | "fixed";
}> = ({ x, y, index = 0, age, persist = true, kind = "fixed" }) => {
  const { palette } = useTheme();
  const { toPx } = useStage();
  const [cx, cy] = toPx(x, y);
  const r = kind === "robot" ? geometry.robot / 2 : kind === "person" ? geometry.person / 2 : 0;
  const px = (kind === "robot" ? cx - r - 10 : kind === "person" ? cx - r - 4 : cx) - index * 20;
  const py = kind === "robot" ? cy + r + 12 : kind === "person" ? cy - r - 6 : cy;
  const scale = interpolate(age, [0, motion.pop], [1.9, 1], { extrapolateRight: "clamp" });
  const opacity = persist
    ? interpolate(age, [0, motion.pop * 1.5, motion.pop * 4], [1, 1, 0.55], { extrapolateRight: "clamp" })
    : interpolate(age, [0, motion.pop, motion.pop * 4], [1, 1, 0], { extrapolateRight: "clamp" });
  const h = 7;
  return (
    <g transform={`translate(${px}, ${py}) scale(${scale})`} opacity={opacity}>
      <line x1={-h} y1={-h} x2={h} y2={h} stroke={palette.status.lost} strokeWidth={geometry.strokeThick} strokeLinecap="round" />
      <line x1={-h} y1={h} x2={h} y2={-h} stroke={palette.status.lost} strokeWidth={geometry.strokeThick} strokeLinecap="round" />
    </g>
  );
};
