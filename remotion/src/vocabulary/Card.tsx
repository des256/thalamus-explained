import React from "react";
import { DOMAINS, Domain, Kind, Part, PART_LABEL, geometry, type, useTheme } from "../theme";
import { wrapText } from "./Stage";

export type CardData = {
  id: string;
  title: string;
  pile?: string;
  part?: Part;
  domains: Domain[];
  kind?: Kind;
};

// One domain dot. Filled when the concern showed up in that domain.
export const Dot: React.FC<{ x: number; y: number; domain: Domain; filled: boolean; r?: number }> = ({ x, y, domain, filled, r = geometry.dot / 2 }) => {
  const { palette } = useTheme();
  const c = palette.domain[domain];
  return <circle cx={x} cy={y} r={r} fill={filled ? c : "none"} stroke={filled ? "none" : palette.muted} strokeWidth={geometry.strokeThin} />;
};

const KindMark: React.FC<{ x: number; y: number; kind: Kind }> = ({ x, y, kind }) => {
  const { palette } = useTheme();
  const s = 14;
  return (
    <g>
      <rect x={x} y={y - s / 2} width={s} height={s} rx={3} fill={kind === "core" ? palette.ink : "none"} stroke={palette.ink} strokeWidth={geometry.strokeThin} />
      {kind === "parameter" && <rect x={x} y={y - s / 2} width={s / 2} height={s} rx={3} fill={palette.ink} />}
      <text x={x + s + 8} y={y} dominantBaseline="central" fontSize={type.caption} fontWeight={500} fill={palette.inkSecondary}>
        {kind}
      </text>
    </g>
  );
};

// A concern card. The same component renders alone, on the board, and in
// the episode intro; `tag` picks whether the pile or the part is shown.
export const Card: React.FC<{
  x: number;
  y: number;
  data: CardData;
  tag?: "pile" | "part";
  highlight?: boolean;
  dimmed?: boolean;
  width?: number;
  height?: number;
}> = ({ x, y, data, tag = "pile", highlight = false, dimmed = false, width = geometry.card.width, height = geometry.card.height }) => {
  const { palette } = useTheme();
  const pad = 16;
  const tagText = tag === "part" ? (data.part ? PART_LABEL[data.part] : "") : (data.pile ?? "");
  const lines = wrapText(data.title, type.label, width - pad * 2, 600).slice(0, 3);
  const lineH = type.label * 1.2;
  return (
    <g opacity={dimmed ? 0.35 : 1}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={geometry.radius}
        fill={palette.panel}
        stroke={highlight ? palette.ink : palette.hairline}
        strokeWidth={highlight ? geometry.strokeThick : geometry.strokeThin}
      />
      {tagText && (
        <text x={x + pad} y={y + pad + type.caption * 0.5} dominantBaseline="central" fontSize={type.caption} fontWeight={500} fill={palette.inkSecondary}>
          {tagText}
        </text>
      )}
      {lines.map((l, i) => (
        <text key={i} x={x + pad} y={y + pad + type.caption + 14 + lineH * i + type.label * 0.5} dominantBaseline="central" fontSize={type.label} fontWeight={600} fill={palette.ink}>
          {l}
        </text>
      ))}
      {DOMAINS.map((d, i) => (
        <Dot key={d} x={x + pad + geometry.dot / 2 + i * (geometry.dot + 10)} y={y + height - pad - geometry.dot / 2} domain={d} filled={data.domains.includes(d)} />
      ))}
      {data.kind && <KindMark x={x + width - pad - 14 - 8 - data.kind.length * type.caption * 0.54} y={y + height - pad - geometry.dot / 2} kind={data.kind} />}
    </g>
  );
};
