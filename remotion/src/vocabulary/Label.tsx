import React from "react";
import { geometry, type, useTheme } from "../theme";
import { textWidth } from "./Stage";

// The pill behind every piece of text that sits on a floorplan. Without it
// labels disappear into the line art.
export const Pill: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  weight?: number;
  anchor?: "middle" | "start" | "end";
  color?: string;
  fill?: string;
  stroke?: string;
  tabular?: boolean;
}> = ({ x, y, text, size = type.label, weight = 500, anchor = "middle", color, fill, stroke, tabular }) => {
  const { palette } = useTheme();
  const w = textWidth(text, size, weight) + geometry.pill.padX * 2;
  const h = size + geometry.pill.padY * 2;
  const left = anchor === "middle" ? x - w / 2 : anchor === "start" ? x : x - w;
  return (
    <g>
      <rect
        x={left}
        y={y - h / 2}
        width={w}
        height={h}
        rx={geometry.radius}
        fill={fill ?? palette.panel}
        stroke={stroke ?? "none"}
        strokeWidth={geometry.strokeThin}
        opacity={0.92}
      />
      <text
        x={left + w / 2}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        fontWeight={weight}
        fill={color ?? palette.ink}
        style={tabular ? { fontVariantNumeric: "tabular-nums" } : undefined}
      >
        {text}
      </text>
    </g>
  );
};

// Plain text with the theme applied, for chrome outside the floorplan.
export const Text: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  weight?: number;
  anchor?: "middle" | "start" | "end";
  color?: string;
  tabular?: boolean;
  italic?: boolean;
}> = ({ x, y, text, size = type.body, weight = 500, anchor = "start", color, tabular, italic }) => {
  const { palette } = useTheme();
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={size}
      fontWeight={weight}
      fontStyle={italic ? "italic" : undefined}
      fill={color ?? palette.ink}
      style={tabular ? { fontVariantNumeric: "tabular-nums" } : undefined}
    >
      {text}
    </text>
  );
};
