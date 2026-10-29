import React from "react";
import { geometry, type, useTheme } from "../theme";
import { useStage } from "./Stage";
import { Text } from "./Label";

// Floorplans are data in meters, not artwork. Walls are polylines, everything
// else is a labelled rectangle. The same file can later drive the simulator.
export type Feature =
  | { kind: "wall"; points: [number, number][] }
  | { kind: "exhibit" | "furniture" | "zone"; x: number; y: number; width: number; height: number; label?: string }
  | { kind: "dock"; x: number; y: number; heading: number };

export const Floorplan: React.FC<{ features: Feature[]; highlight?: string }> = ({ features, highlight }) => {
  const { palette } = useTheme();
  const { toPx, scale } = useStage();
  return (
    <g>
      {features.map((f, i) => {
        if (f.kind === "wall") {
          const d = f.points.map(([x, y], j) => `${j === 0 ? "M" : "L"}${toPx(x, y).join(",")}`).join(" ");
          return <path key={i} d={d} fill="none" stroke={palette.muted} strokeWidth={geometry.strokeThick} strokeLinejoin="round" />;
        }
        if (f.kind === "dock") {
          const [cx, cy] = toPx(f.x, f.y);
          const r = geometry.robot / 2;
          const h = (f.heading * Math.PI) / 180;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={palette.muted} strokeWidth={geometry.strokeThin} strokeDasharray="5 5" />
              <line
                x1={cx + Math.cos(h) * (r + 4)}
                y1={cy + Math.sin(h) * (r + 4)}
                x2={cx + Math.cos(h) * (r + 16)}
                y2={cy + Math.sin(h) * (r + 16)}
                stroke={palette.muted}
                strokeWidth={geometry.strokeThin}
                strokeLinecap="round"
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
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="none" stroke={palette.hairline} strokeWidth={geometry.strokeThin} strokeDasharray="8 8" />
              {f.label && <Text x={x + 12} y={y + 20} text={f.label} size={type.caption} color={palette.muted} />}
            </g>
          );
        }
        return (
          <g key={i}>
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
