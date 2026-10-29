import React from "react";
import { geometry, type, useTheme } from "../theme";
import { useStage } from "./Stage";
import { Pill } from "./Label";

const arrowhead = (x: number, y: number, angle: number, size: number) => {
  const a1 = angle + Math.PI * 0.82;
  const a2 = angle - Math.PI * 0.82;
  return `${x},${y} ${x + Math.cos(a1) * size},${y + Math.sin(a1) * size} ${x + Math.cos(a2) * size},${y + Math.sin(a2) * size}`;
};

const shorten = (ax: number, ay: number, bx: number, by: number, startBy: number, endBy: number) => {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x1: ax + ux * startBy, y1: ay + uy * startBy, x2: bx - ux * endBy, y2: by - uy * endBy, angle: Math.atan2(dy, dx) };
};

// Who is looking at whom. Thin, dashed, secondary ink.
export const GazeLine: React.FC<{
  from: [number, number];
  to: [number, number];
  fromRadius?: number;
  toRadius?: number;
}> = ({ from, to, fromRadius = geometry.robot / 2, toRadius = geometry.person / 2 }) => {
  const { palette } = useTheme();
  const { toPx } = useStage();
  const [ax, ay] = toPx(from[0], from[1]);
  const [bx, by] = toPx(to[0], to[1]);
  const s = shorten(ax, ay, bx, by, fromRadius + 10, toRadius + 14);
  return (
    <g>
      <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={palette.inkSecondary} strokeWidth={geometry.strokeThin} strokeDasharray="6 6" />
      <polygon points={arrowhead(s.x2, s.y2, s.angle, 12)} fill={palette.inkSecondary} />
    </g>
  );
};

// Who an utterance is for. Thick, curved, primary ink, optional label.
export const AddresseeArrow: React.FC<{
  from: [number, number];
  to: [number, number];
  label?: string;
  bulge?: number;
  fromRadius?: number;
  toRadius?: number;
}> = ({ from, to, label, bulge = 50, fromRadius = geometry.person / 2, toRadius = geometry.person / 2 }) => {
  const { palette } = useTheme();
  const { toPx } = useStage();
  const [ax, ay] = toPx(from[0], from[1]);
  const [bx, by] = toPx(to[0], to[1]);
  const s = shorten(ax, ay, bx, by, fromRadius + 10, toRadius + 14);
  const mx = (s.x1 + s.x2) / 2;
  const my = (s.y1 + s.y2) / 2;
  const nx = -Math.sin(s.angle) * bulge;
  const ny = Math.cos(s.angle) * bulge;
  const qx = mx + nx;
  const qy = my + ny;
  const endAngle = Math.atan2(s.y2 - qy, s.x2 - qx);
  return (
    <g>
      <path d={`M${s.x1},${s.y1} Q${qx},${qy} ${s.x2},${s.y2}`} fill="none" stroke={palette.ink} strokeWidth={geometry.strokeThick} strokeLinecap="round" />
      <polygon points={arrowhead(s.x2, s.y2, endAngle, 16)} fill={palette.ink} />
      {label && <Pill x={(mx + qx) / 2} y={(my + qy) / 2} text={label} size={type.caption} weight={600} />}
    </g>
  );
};
