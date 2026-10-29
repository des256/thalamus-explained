import React from "react";
import { canvas, geometry, type, useTheme } from "../theme";
import { textWidth } from "./Stage";
import { Text } from "./Label";

// Chapter title, centred on the canvas.
export const Title: React.FC<{ text: string; subtitle?: string }> = ({ text, subtitle }) => {
  const { palette } = useTheme();
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  return (
    <g>
      <Text x={cx} y={cy - 30} text={text} size={type.title} weight={700} anchor="middle" />
      <line x1={cx - 60} y1={cy + 30} x2={cx + 60} y2={cy + 30} stroke={palette.slot.blue} strokeWidth={geometry.strokeThick} strokeLinecap="round" />
      {subtitle && <Text x={cx} y={cy + 80} text={subtitle} size={type.body} weight={400} anchor="middle" color={palette.inkSecondary} />}
    </g>
  );
};

// Lower third for the camera segments, bottom-left inside the safe margin.
export const LowerThird: React.FC<{ name: string; role: string; x?: number; y?: number }> = ({
  name,
  role,
  x = canvas.safe,
  y = canvas.height - canvas.safe - 80,
}) => {
  const { palette } = useTheme();
  const w = Math.max(textWidth(name, type.body, 600), textWidth(role, type.caption, 500)) + 48;
  return (
    <g>
      <rect x={x} y={y} width={w} height={80} rx={geometry.radius} fill={palette.panel} opacity={0.92} />
      <rect x={x} y={y} width={6} height={80} rx={3} fill={palette.slot.blue} />
      <Text x={x + 24} y={y + 28} text={name} size={type.body} weight={600} />
      <Text x={x + 24} y={y + 60} text={role} size={type.caption} weight={500} color={palette.inkSecondary} />
    </g>
  );
};
