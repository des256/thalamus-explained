import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DEFAULT_MODE, DOMAINS, Domain, Mode, ThemeProvider, canvas, type, useTheme } from "../theme";
import { Canvas, Dot, Text } from "../vocabulary";
import { wrapText } from "../vocabulary/Stage";

// Chapter 3: the axis table builds up in three stages, each stage cut as its
// own shot so the editor can time it against the voice-over.
//
//   frame   the empty table: header with the four domains, seven blank bands
//   axis N  the N-th axis question writes itself into the left column
//   fill N  the cells of row N appear
//
// `axes` is how many axis labels are shown, `cells` how many rows are filled.
// The newest element animates; everything before it is static.

type AxisRow = {
  axis: string;
  museum: string;
  hospitality: string;
  care: string;
  stage: string;
};

const ROWS: AxisRow[] = [
  {
    axis: "Interaction horizon",
    museum: "One hour, then forget",
    hospitality: "Minutes per encounter; guests return for years",
    care: "Months to years with the same people",
    stage: "One session of 20-60 min, then forget",
  },
  {
    axis: "Identity set",
    museum: "Open, session-scoped, non-cooperative",
    hospitality: "Semi-open, linked to a reservation record",
    care: "Closed set; faces drift with age and illness",
    stage: "Open and anonymous; identity by seat",
  },
  {
    axis: "Who has authority",
    museum: "Tour operator",
    hospitality: "Front desk and floor staff",
    care: "Clinical staff, graded privileges",
    stage: "Host or session chair and talk plan",
  },
  {
    axis: "Mobility",
    museum: "Lead and herd a group",
    hospitality: "Escort, deliver, stationary reception",
    care: "Stationary companion, some wayfinding",
    stage: "Stationary on stage; gaze and turning",
  },
  {
    axis: "Failure ceiling",
    museum: "Reputational",
    hospitality: "Safety: allergens, access, payment",
    care: "Life safety and psychological harm",
    stage: "Reputational, amplified by audience",
  },
  {
    axis: "Repetition",
    museum: "Must not repeat itself",
    hospitality: "Neutral",
    care: "Often welcome or therapeutic",
    stage: "Must not repeat; a recap is welcome",
  },
  {
    axis: "Knowledge source",
    museum: "Static curated catalogue",
    hospitality: "Semi-dynamic services and local info",
    care: "Per-person care plan, must be authoritative",
    stage: "Talk itself, slides, and prepared Q&A",
  },
];

export const AXIS_ROW_COUNT = ROWS.length;

// Shot lengths in frames at 24 fps. Each holds a little after the motion ends.
export const FRAME_ANIMATION_FRAMES = 48; // 2.0 s: rule, headers, seven bands
export const AXIS_ANIMATION_FRAMES = 36; // 1.5 s: one label writes in
export const FILL_ANIMATION_FRAMES = 36; // 1.5 s: one row of cells appears
const WRITE_FRAMES = 16; // how long the typewriter takes for one label

export type AxisTableProps = {
  axes: number; // 0..7 axis labels shown; the last one writes in
  cells: number; // 0..7 rows with cells shown; the last one animates in
  buildFrame?: boolean; // animate the empty frame itself (first shot only)
  mode?: Mode;
};

// Column headers: more descriptive than the theme labels.
const COLUMN_LABEL: Record<Domain, string> = {
  museum: "Museum tour",
  hospitality: "Hotel",
  care: "Care home",
  stage: "Stage talk",
};

// Layout
const TABLE_X = canvas.safe;
const TABLE_Y = canvas.safe;
const TABLE_W = canvas.width - canvas.safe * 2;
const AXIS_COL_W = 320;
const COL_GAP = 20;
const DOMAIN_COL_W = Math.floor((TABLE_W - AXIS_COL_W - COL_GAP * 4) / 4); // 332
const HEADER_H = 72;
const ROW_H = 108;
const LINE_H = type.caption * 1.38;
const CELL_PAD_X = 18;

const domainColX = (i: number) => TABLE_X + AXIS_COL_W + COL_GAP + i * (DOMAIN_COL_W + COL_GAP);
const rowY = (i: number) => TABLE_Y + HEADER_H + i * ROW_H;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// The empty table. With `build`, the header rule draws left to right, the
// domain headers fade in one by one, then the row bands drop in top to bottom.
const Frame: React.FC<{ t: number; build: boolean }> = ({ t, build }) => {
  const { palette } = useTheme();
  const at = (start: number, dur: number) => (build ? clamp01((t - start) / dur) : 1);
  const rule = at(0, 0.5);
  return (
    <g>
      <line x1={TABLE_X} y1={TABLE_Y + HEADER_H} x2={TABLE_X + TABLE_W * rule} y2={TABLE_Y + HEADER_H} stroke={palette.ink} strokeWidth={2} />
      {DOMAINS.map((d, i) => {
        const x = domainColX(i);
        const cy = TABLE_Y + HEADER_H / 2;
        return (
          <g key={d} opacity={at(0.35 + i * 0.15, 0.3)}>
            <Dot x={x + 8} y={cy} domain={d} filled r={8} />
            <Text x={x + 24} y={cy} text={COLUMN_LABEL[d]} size={type.label} weight={600} />
          </g>
        );
      })}
      {ROWS.map((row, i) => {
        const y = rowY(i);
        return (
          <g key={row.axis} opacity={at(0.7 + i * 0.12, 0.3)}>
            {i % 2 === 0 && <rect x={TABLE_X} y={y} width={TABLE_W} height={ROW_H} fill={palette.panel} />}
            <line x1={TABLE_X} y1={y + ROW_H} x2={TABLE_X + TABLE_W} y2={y + ROW_H} stroke={palette.hairline} strokeWidth={1} />
          </g>
        );
      })}
    </g>
  );
};

// One axis question in the left column, revealed character by character.
const AxisLabel: React.FC<{ text: string; index: number; progress: number }> = ({ text, index, progress }) => {
  const shown = text.slice(0, Math.ceil(clamp01(progress) * text.length));
  if (!shown) return null;
  return <Text x={TABLE_X + CELL_PAD_X} y={rowY(index) + ROW_H / 2} text={shown} size={type.label} weight={600} />;
};

// The four cells of one row, sliding up a few pixels as they fade in.
const Cells: React.FC<{ row: AxisRow; index: number; progress: number }> = ({ row, index, progress }) => {
  const y = rowY(index);
  const slideY = interpolate(progress, [0, 1], [18, 0]);
  const opacity = interpolate(progress, [0, 0.35], [0, 1], { extrapolateRight: "clamp" });
  return (
    <g opacity={opacity} transform={`translate(0, ${slideY})`}>
      {DOMAINS.map((d, i) => {
        const lines = wrapText(row[d], type.caption, DOMAIN_COL_W - CELL_PAD_X * 2);
        const startY = y + ROW_H / 2 - (lines.length * LINE_H) / 2 + type.caption * 0.5;
        return (
          <g key={d}>
            {lines.map((line, li) => (
              <Text key={li} x={domainColX(i) + CELL_PAD_X} y={startY + li * LINE_H} text={line} size={type.caption} weight={400} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

const AxisTableInner: React.FC<AxisTableProps> = ({ axes, cells, buildFrame = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Only the newest element moves. In sequence order: frame, then axes, then cells.
  const activeAxis = buildFrame || cells > 0 ? -1 : axes - 1;
  const activeCell = buildFrame ? -1 : cells - 1;
  const write = interpolate(frame, [0, WRITE_FRAMES], [0, 1], { extrapolateRight: "clamp" });
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 150, mass: 0.8 } });

  return (
    <Canvas>
      <Frame t={t} build={buildFrame} />
      {ROWS.slice(0, axes).map((row, i) => (
        <AxisLabel key={row.axis} text={row.axis} index={i} progress={i === activeAxis ? write : 1} />
      ))}
      {ROWS.slice(0, cells).map((row, i) => (
        <Cells key={row.axis} row={row} index={i} progress={i === activeCell ? pop : 1} />
      ))}
    </Canvas>
  );
};

export const AxisTable: React.FC<AxisTableProps> = ({ mode = DEFAULT_MODE, ...rest }) => (
  <ThemeProvider mode={mode}>
    <AxisTableInner {...rest} />
  </ThemeProvider>
);
