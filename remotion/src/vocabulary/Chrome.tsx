import React from "react";
import { canvas, geometry, type, useTheme } from "../theme";
import { textWidth, wrapText } from "./Stage";
import { Pill, Text } from "./Label";

// Wall clock, tabular so the digits do not jitter.
export const Clock: React.FC<{ x: number; y: number; time: string }> = ({ x, y, time }) => {
  const { palette } = useTheme();
  return <Pill x={x} y={y} text={time} size={type.label} weight={600} anchor="end" tabular stroke={palette.hairline} />;
};

// Time budget for the current stop. Turns amber when nearly spent and lost
// colour when overrun; the executive's view of time, not the LLM's.
export const BudgetBar: React.FC<{
  x: number;
  y: number;
  width?: number;
  label: string;
  remaining: number;
  total: number;
}> = ({ x, y, width = 420, label, remaining, total }) => {
  const { palette } = useTheme();
  const frac = Math.max(0, Math.min(1, remaining / total));
  const color = remaining < 0 ? palette.status.lost : frac < 0.25 ? palette.status.stale : palette.inkSecondary;
  const mm = Math.floor(Math.abs(remaining) / 60);
  const ss = Math.floor(Math.abs(remaining) % 60).toString().padStart(2, "0");
  const txt = remaining < 0 ? `${mm}:${ss} over` : `${mm}:${ss} left`;
  return (
    <g>
      <Text x={x} y={y} text={label} size={type.caption} weight={600} color={palette.inkSecondary} />
      <Text x={x + width} y={y} text={txt} size={type.caption} weight={600} anchor="end" color={color} tabular />
      <rect x={x} y={y + 18} width={width} height={8} rx={4} fill={palette.hairline} />
      <rect x={x} y={y + 18} width={width * (remaining < 0 ? 1 : frac)} height={8} rx={4} fill={color} />
    </g>
  );
};

// Event ticker along the bottom. Newest first, older entries recede.
export const Ticker: React.FC<{ y?: number; events: { t: number; text: string }[]; max?: number }> = ({
  y = canvas.height - 48,
  events,
  max = 4,
}) => {
  const { palette } = useTheme();
  const shown = events.slice(0, max);
  let cursor = canvas.safe;
  return (
    <g>
      <rect x={0} y={y - 24} width={canvas.width} height={48} fill={palette.panel} />
      <line x1={0} y1={y - 24} x2={canvas.width} y2={y - 24} stroke={palette.hairline} strokeWidth={1} />
      {shown.map((e, i) => {
        const stamp = `${e.t.toFixed(1)}s`;
        const x = cursor;
        const w = textWidth(stamp, type.caption, 600) + 12 + textWidth(e.text, type.caption, 500) + 40;
        cursor += w;
        const color = i === 0 ? palette.ink : palette.muted;
        return (
          <g key={i} opacity={i === 0 ? 1 : 0.8}>
            <Text x={x} y={y} text={stamp} size={type.caption} weight={600} color={i === 0 ? palette.inkSecondary : palette.muted} tabular />
            <Text x={x + textWidth(stamp, type.caption, 600) + 12} y={y} text={e.text} size={type.caption} weight={i === 0 ? 600 : 500} color={color} />
          </g>
        );
      })}
    </g>
  );
};

// Narration beat as a subtitle. Drives the scratch TTS timing too.
export const Narration: React.FC<{ y?: number; text: string; maxWidth?: number }> = ({
  y = canvas.height - 48 - 24 - 56,
  text,
  maxWidth = 1400,
}) => {
  const { palette } = useTheme();
  const lines = wrapText(text, type.body, maxWidth, 500);
  const lineH = type.body * 1.25;
  const w = Math.max(...lines.map((l) => textWidth(l, type.body, 500))) + 48;
  const h = lines.length * lineH + 20;
  const top = y - h + lineH / 2 + 10;
  return (
    <g>
      <rect x={canvas.width / 2 - w / 2} y={top} width={w} height={h} rx={geometry.radius} fill={palette.panel} opacity={0.9} />
      {lines.map((l, i) => (
        <Text key={i} x={canvas.width / 2} y={top + 10 + lineH * i + lineH / 2} text={l} size={type.body} weight={500} anchor="middle" />
      ))}
    </g>
  );
};
