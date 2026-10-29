import React from "react";
import { geometry, type, useTheme } from "../theme";
import { useStage, textWidth, wrapText } from "./Stage";

// Said: what a person actually uttered, anchored to them. Heard: what the
// robot's pipeline produced, anchored to the robot, with its attribution and
// confidence. The gap between the two is where half the concerns live.
export const Bubble: React.FC<{
  x: number;
  y: number;
  text: string;
  variant?: "said" | "heard";
  side?: "right" | "left";
  place?: "above" | "below";
  attribution?: string;
  maxWidth?: number;
  anchorRadius?: number;
  lift?: number;
}> = ({
  x,
  y,
  text,
  variant = "said",
  side = "right",
  place = "above",
  attribution,
  maxWidth = 420,
  anchorRadius = geometry.person / 2,
  lift = 36,
}) => {
  const { palette } = useTheme();
  const { toPx } = useStage();
  const [ax, ay] = toPx(x, y);
  const size = type.label;
  const lineH = size * 1.3;
  const padX = 16;
  const padY = 12;
  const heard = variant === "heard";
  const body = heard ? text : `“${text}”`;
  const lines = wrapText(body, size, maxWidth - padX * 2, 500);
  const headerH = heard ? type.caption * 1.3 : 0;
  const headerW = heard ? textWidth("heard", type.caption, 600) + 24 + (attribution ? textWidth(attribution, type.caption, 500) : 0) : 0;
  const w = Math.min(maxWidth, Math.max(...lines.map((l) => textWidth(l, size, 500)), headerW) + padX * 2);
  const h = lines.length * lineH + padY * 2 + headerH;
  const dir = side === "right" ? 1 : -1;
  const bx = side === "right" ? ax + anchorRadius + 18 : ax - anchorRadius - 18 - w;
  // Below the anchor the name label sits first; clear it.
  const drop = Math.max(lift, anchorRadius + 44);
  const by = place === "above" ? ay - lift - h : ay + drop;
  const edgeY = place === "above" ? by + h : by;
  const tipY = place === "above" ? ay - anchorRadius * 0.4 : ay + anchorRadius * 0.4;
  const tailBaseX = side === "right" ? bx + 18 : bx + w - 18;
  const fill = heard ? palette.background : palette.panel;
  const stroke = heard ? palette.inkSecondary : palette.ink;
  return (
    <g>
      <path
        d={`M${tailBaseX},${edgeY} L${ax + dir * (anchorRadius + 4)},${tipY} L${tailBaseX + dir * 24},${edgeY}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={geometry.strokeThin}
        strokeDasharray={heard ? "5 4" : undefined}
        strokeLinejoin="round"
      />
      <rect
        x={bx}
        y={by}
        width={w}
        height={h}
        rx={geometry.radius * 1.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={geometry.strokeThin}
        strokeDasharray={heard ? "5 4" : undefined}
      />
      <rect x={Math.min(tailBaseX, tailBaseX + dir * 24) + 1} y={place === "above" ? by + h - 2 : by - 2} width={22} height={4} fill={fill} />
      {heard && (
        <g>
          <text x={bx + padX} y={by + padY + type.caption * 0.6} fontSize={type.caption} fontWeight={600} fill={palette.inkSecondary}>
            heard
          </text>
          {attribution && (
            <text
              x={bx + w - padX}
              y={by + padY + type.caption * 0.6}
              fontSize={type.caption}
              fontWeight={500}
              textAnchor="end"
              fill={palette.inkSecondary}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {attribution}
            </text>
          )}
        </g>
      )}
      {lines.map((l, i) => (
        <text
          key={i}
          x={bx + padX}
          y={by + padY + headerH + lineH * i + size * 0.78}
          fontSize={size}
          fontWeight={500}
          fontStyle={heard ? "italic" : undefined}
          fill={heard ? palette.inkSecondary : palette.ink}
        >
          {l}
        </text>
      ))}
    </g>
  );
};
