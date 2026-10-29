import React from "react";
import { geometry, type, useTheme } from "../theme";
import { useStage, deg } from "./Stage";
import { Pill } from "./Label";

export type RobotState = "idle" | "listening" | "speaking" | "moving";

// The robot is a disc in primary ink with a heading pointer, so it never
// collides with a person hue. State is drawn as shape around the rim.
export const Robot: React.FC<{
  x: number;
  y: number;
  heading?: number;
  state?: RobotState;
  gaze?: number;
  name?: string;
  scale?: number;
  opacity?: number;
}> = ({ x, y, heading = 0, state = "idle", gaze, name, scale: zoom = 1, opacity = 1 }) => {
  const { palette } = useTheme();
  const { toPx, scale } = useStage();
  const [cx, cy] = toPx(x, y);
  const r = geometry.robot / 2;
  const h = deg(heading);
  const pointer = [
    [cx + Math.cos(h) * (r + 14), cy + Math.sin(h) * (r + 14)],
    [cx + Math.cos(h + deg(115)) * (r - 2), cy + Math.sin(h + deg(115)) * (r - 2)],
    [cx + Math.cos(h - deg(115)) * (r - 2), cy + Math.sin(h - deg(115)) * (r - 2)],
  ]
    .map((p) => p.join(","))
    .join(" ");

  const arc = (radius: number, from: number, to: number) => {
    const a = h + deg(from);
    const b = h + deg(to);
    return `M${cx + Math.cos(a) * radius},${cy + Math.sin(a) * radius} A${radius},${radius} 0 0 1 ${cx + Math.cos(b) * radius},${cy + Math.sin(b) * radius}`;
  };

  return (
    <g opacity={opacity} transform={zoom === 1 ? undefined : `translate(${cx}, ${cy}) scale(${zoom}) translate(${-cx}, ${-cy})`}>
      {gaze !== undefined && (
        <path
          d={`M${cx},${cy} L${cx + Math.cos(h - deg(25)) * gaze * scale},${cy + Math.sin(h - deg(25)) * gaze * scale} A${gaze * scale},${gaze * scale} 0 0 1 ${cx + Math.cos(h + deg(25)) * gaze * scale},${cy + Math.sin(h + deg(25)) * gaze * scale} Z`}
          fill={palette.ink}
          opacity={0.08}
        />
      )}
      {state === "moving" && (
        <g stroke={palette.muted} strokeWidth={geometry.strokeThick} fill="none" strokeLinecap="round">
          <path d={arc(r + 12, 150, 210)} />
          <path d={arc(r + 22, 155, 205)} />
        </g>
      )}
      <polygon points={pointer} fill={palette.ink} />
      <circle cx={cx} cy={cy} r={r} fill={palette.ink} />
      <circle cx={cx} cy={cy} r={r * 0.32} fill={palette.background} />
      {state === "listening" && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 10}
          fill="none"
          stroke={palette.ink}
          strokeWidth={geometry.strokeThin + 1}
          strokeDasharray="2 7"
          strokeLinecap="round"
        />
      )}
      {state === "speaking" && (
        <g stroke={palette.ink} strokeWidth={geometry.strokeThin + 1} fill="none" strokeLinecap="round">
          <path d={arc(r + 18, -28, 28)} />
          <path d={arc(r + 28, -28, 28)} />
          <path d={arc(r + 38, -28, 28)} />
        </g>
      )}
      {name && <Pill x={cx} y={cy + r + 24} text={name} size={type.label} weight={600} />}
    </g>
  );
};
