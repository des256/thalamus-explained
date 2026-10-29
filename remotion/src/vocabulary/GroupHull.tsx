import React from "react";
import { geometry, useTheme } from "../theme";
import { useStage } from "./Stage";

const hull = (pts: [number, number][]): [number, number][] => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: [number, number][] = [];
  for (const q of [...p].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
};

// A soft blob around the members of the group. A detached member gets a
// broken tether in the lost colour, which is what a straggler looks like.
export const GroupHull: React.FC<{
  members: [number, number][];
  detached?: [number, number][];
  padding?: number;
}> = ({ members, detached = [], padding = 44 }) => {
  const { palette } = useTheme();
  const { toPx } = useStage();
  const px = members.map(([x, y]) => toPx(x, y));
  const h = hull(px);
  if (h.length === 0) return null;
  const d = h.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z";
  const c = h.reduce((acc, [x, y]) => [acc[0] + x / h.length, acc[1] + y / h.length], [0, 0]);
  return (
    <g>
      <path
        d={d}
        fill={palette.ink}
        stroke={palette.ink}
        strokeWidth={padding * 2}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={palette.hullAlpha}
      />
      {detached.map(([x, y], i) => {
        const [bx, by] = toPx(x, y);
        return (
          <line
            key={i}
            x1={c[0]}
            y1={c[1]}
            x2={bx}
            y2={by}
            stroke={palette.status.lost}
            strokeWidth={geometry.strokeThin}
            strokeDasharray="4 10"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};
