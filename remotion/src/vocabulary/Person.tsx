import React from "react";
import { geometry, type, useTheme, Slot } from "../theme";
import { useStage, deg } from "./Stage";
import { Pill } from "./Label";

export type Age = "adult" | "elder" | "child";

export type PersonProps = {
  x: number;
  y: number;
  name?: string;
  slot?: Slot | null;
  age?: Age;
  view?: "truth" | "belief";
  stale?: boolean;
  unknown?: boolean;
  bystander?: boolean;
  staff?: boolean;
  addressee?: boolean;
  confidence?: number;
  heading?: number;
  labelSide?: "below" | "above";
};

// People are discs. Colour carries identity for at most three principals per
// scene; everyone else is neutral and relies on the name label. Truth is
// solid, belief is a dashed ghost in the same hue, stale belief is amber.
export const Person: React.FC<PersonProps> = ({
  x,
  y,
  name,
  slot,
  age = "adult",
  view = "truth",
  stale = false,
  unknown = false,
  bystander = false,
  staff = false,
  addressee = false,
  confidence,
  heading,
  labelSide = "below",
}) => {
  const { palette } = useTheme();
  const { toPx } = useStage();
  const [cx, cy] = toPx(x, y);
  const r = (age === "child" ? geometry.child : geometry.person) / 2;
  const hue = unknown || !slot ? null : palette.slot[slot];
  const belief = view === "belief";

  const fill = belief ? (hue ?? palette.neutralStroke) : (hue ?? palette.neutralFill);
  const fillOpacity = belief ? 0.18 : 1;
  const stroke = belief
    ? stale
      ? palette.status.stale
      : (hue ?? palette.neutralStroke)
    : palette.discRing
      ? palette.ink
      : hue
        ? "none"
        : palette.neutralStroke;
  const strokeOpacity = !belief && palette.discRing ? 0.35 : 1;

  const confColor =
    confidence === undefined
      ? palette.inkSecondary
      : confidence >= 0.7
        ? (hue ?? palette.inkSecondary)
        : confidence >= 0.4
          ? palette.status.stale
          : palette.status.lost;

  const labelY = labelSide === "below" ? cy + r + (confidence !== undefined ? 30 : 22) : cy - r - 22;

  return (
    <g opacity={bystander ? 0.7 : 1}>
      {addressee && (
        <polygon
          points={`${cx - 10},${cy - r - 30} ${cx + 10},${cy - r - 30} ${cx},${cy - r - 16}`}
          fill={palette.ink}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth={belief ? geometry.strokeThin + 1 : geometry.strokeThin}
        strokeDasharray={belief ? "6 5" : undefined}
      />
      {heading !== undefined && (
        <line
          x1={cx + Math.cos(deg(heading)) * (r - 6)}
          y1={cy + Math.sin(deg(heading)) * (r - 6)}
          x2={cx + Math.cos(deg(heading)) * (r + 8)}
          y2={cy + Math.sin(deg(heading)) * (r + 8)}
          stroke={belief ? (stale ? palette.status.stale : (hue ?? palette.neutralStroke)) : palette.background}
          strokeWidth={geometry.strokeThick}
          strokeLinecap="round"
        />
      )}
      {unknown && (
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={type.label}
          fontWeight={700}
          fill={palette.ink}
        >
          ?
        </text>
      )}
      {staff && (
        <g>
          <rect x={cx + r - 12} y={cy - r - 8} width={22} height={22} rx={5} fill={palette.ink} />
          <text
            x={cx + r - 1}
            y={cy - r + 4}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={16}
            fontWeight={700}
            fill={palette.background}
          >
            S
          </text>
        </g>
      )}
      {confidence !== undefined && (
        <g>
          <rect
            x={cx - geometry.confidence.width / 2}
            y={cy + r + 8}
            width={geometry.confidence.width}
            height={geometry.confidence.height}
            rx={3}
            fill={palette.hairline}
          />
          <rect
            x={cx - geometry.confidence.width / 2}
            y={cy + r + 8}
            width={Math.max(0, Math.min(1, confidence)) * geometry.confidence.width}
            height={geometry.confidence.height}
            rx={3}
            fill={confColor}
          />
        </g>
      )}
      {name && (
        <Pill
          x={cx}
          y={labelY}
          text={name}
          size={type.label}
          weight={600}
          color={belief && stale ? palette.status.stale : belief ? (hue ?? palette.inkSecondary) : palette.ink}
        />
      )}
    </g>
  );
};
