import React from "react";
import { geometry, type, useTheme } from "../theme";
import { useStage } from "./Stage";
import { Text } from "./Label";

// Floorplans are data in meters, not artwork. Walls are polylines, everything
// else is a labelled rectangle, plus a dock for the robot's home position.
// The same file can later drive the simulator.
export type Feature =
  | { kind: "wall"; points: [number, number][] }
  | { kind: "exhibit" | "furniture" | "zone"; x: number; y: number; width: number; height: number; label?: string }
  | { kind: "dock"; x: number; y: number; heading: number };

// `progress` is an optional per-feature 0..1 for build-up animations: walls
// draw along their length, rectangles pop, zones fade, the dock ring draws.
export const Floorplan: React.FC<{ features: Feature[]; highlight?: string; progress?: number[] }> = ({ features, highlight, progress }) => {
  const { palette } = useTheme();
  const { toPx, scale } = useStage();
  const pop = (p: number) => {
    // ease out with a little overshoot
    const u = 1 - Math.pow(1 - p, 3);
    return 0.7 + 0.3 * u + 0.12 * Math.sin(p * Math.PI);
  };
  return (
    <g>
      {features.map((f, i) => {
        const p = progress ? Math.max(0, Math.min(1, progress[i] ?? 1)) : 1;
        if (p <= 0) return null;
        if (f.kind === "wall") {
          const d = f.points.map(([x, y], j) => `${j === 0 ? "M" : "L"}${toPx(x, y).join(",")}`).join(" ");
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={palette.muted}
              strokeWidth={geometry.strokeThick}
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={p < 1 ? 1 : undefined}
              strokeDashoffset={p < 1 ? 1 - p : undefined}
            />
          );
        }
        if (f.kind === "dock") {
          const [cx, cy] = toPx(f.x, f.y);
          const r = geometry.robot / 2;
          const h = (f.heading * Math.PI) / 180;
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={r + 4}
                fill="none"
                stroke={palette.muted}
                strokeWidth={geometry.strokeThin}
                strokeDasharray={p < 1 ? `${p} 1` : "5 5"}
                pathLength={p < 1 ? 1 : undefined}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              <line
                x1={cx + Math.cos(h) * (r + 4)}
                y1={cy + Math.sin(h) * (r + 4)}
                x2={cx + Math.cos(h) * (r + 16)}
                y2={cy + Math.sin(h) * (r + 16)}
                stroke={palette.muted}
                strokeWidth={geometry.strokeThin}
                strokeLinecap="round"
                opacity={p >= 1 ? 1 : 0}
              />
            </g>
          );
        }
        const [x, y] = toPx(f.x, f.y);
        const w = f.width * scale;
        const h = f.height * scale;
        const hot = f.kind === "exhibit" && highlight !== undefined && f.label === highlight;
        if (f.kind === "zone") {
          return (
            <g key={i} opacity={p}>
              <rect x={x} y={y} width={w} height={h} fill="none" stroke={palette.hairline} strokeWidth={geometry.strokeThin} strokeDasharray="8 8" />
              {f.label && <Text x={x + 12} y={y + 20} text={f.label} size={type.caption} color={palette.muted} />}
            </g>
          );
        }
        const z = p < 1 ? pop(p) : 1;
        const cxr = x + w / 2;
        const cyr = y + h / 2;
        return (
          <g key={i} opacity={Math.min(1, p * 2)} transform={p < 1 ? `translate(${cxr} ${cyr}) scale(${z}) translate(${-cxr} ${-cyr})` : undefined}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={4}
              fill={f.kind === "furniture" ? palette.hairline : palette.panel}
              stroke={hot ? palette.ink : f.kind === "exhibit" ? palette.muted : "none"}
              strokeWidth={hot ? geometry.strokeThick : geometry.strokeThin}
            />
            {f.label && (
              <Text
                x={x + w / 2}
                y={y + h / 2}
                text={f.label}
                size={type.caption}
                anchor="middle"
                color={hot ? palette.ink : palette.inkSecondary}
                weight={hot ? 600 : 500}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
