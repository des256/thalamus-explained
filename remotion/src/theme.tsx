import React, { createContext, useContext } from "react";

// ---------------------------------------------------------------------------
// Fixed styling for every composition. Nothing visual is decided outside this
// file and the vocabulary components; scenes, cards and boards are data.
// ---------------------------------------------------------------------------

export type Mode = "dark" | "light" | "paper";
export const MODES: readonly Mode[] = ["paper", "dark", "light"] as const;
// The mode every composition uses unless told otherwise.
export const DEFAULT_MODE: Mode = "paper";

export type Slot = "blue" | "orange" | "aqua";
export const SLOTS: readonly Slot[] = ["blue", "orange", "aqua"] as const;

export type Domain = "museum" | "hospitality" | "care" | "stage";
export const DOMAINS: readonly Domain[] = ["museum", "hospitality", "care", "stage"] as const;
export const DOMAIN_LABEL: Record<Domain, string> = {
  museum: "Museum",
  hospitality: "Hospitality",
  care: "Care",
  stage: "Stage",
};

export type Part = "world" | "executive" | "llm" | "memory" | "actuation" | "handoff";
export const PART_LABEL: Record<Part, string> = {
  world: "World model",
  executive: "Executive",
  llm: "LLM",
  memory: "Memory",
  actuation: "Actuation",
  handoff: "Handoff",
};

export type Kind = "core" | "parameter" | "plugin";

export const canvas = { width: 1920, height: 1080, fps: 24, safe: 96 } as const;

export const type = {
  caption: 24,
  label: 28,
  body: 36,
  heading: 48,
  title: 72,
} as const;

export const geometry = {
  person: 44,
  child: 36,
  robot: 56,
  strokeThin: 2,
  strokeThick: 4,
  radius: 8,
  confidence: { width: 44, height: 6 },
  pill: { padX: 10, padY: 5 },
  card: { width: 300, height: 200 },
  dot: 10,
} as const;

// Seconds. Position tweens between keyframes are linear; these are the
// durations of the discrete things that pop, appear or travel.
export const motion = { pop: 0.3, bubble: 0.25, travel: 0.9 } as const;

export type Palette = {
  background: string;
  panel: string;
  hairline: string;
  ink: string;
  inkSecondary: string;
  muted: string;
  neutralFill: string;
  neutralStroke: string;
  slot: Record<Slot, string>;
  // Domain dots. The first three reuse the identity slots; the fourth is a
  // dots-only hue, validated against the trio, with dot position and the
  // legend as the secondary encoding.
  domain: Record<Domain, string>;
  status: { stale: string; lost: string; ok: string };
  hullAlpha: number;
  discRing: boolean;
};

export const palettes: Record<Mode, Palette> = {
  // The Thalamus diagnostics UI family. Three identity hues validated for
  // every pairing on this surface, including colour-vision simulation.
  dark: {
    background: "#0d1014",
    panel: "#131518",
    hairline: "#1f2226",
    ink: "#dde1e7",
    inkSecondary: "#9aa0aa",
    muted: "#5a6070",
    neutralFill: "#2a2f36",
    neutralStroke: "#5a6070",
    slot: { blue: "#4a86f0", orange: "#d95926", aqua: "#199e70" },
    domain: { museum: "#4a86f0", hospitality: "#d95926", care: "#199e70", stage: "#8b3fa8" },
    status: { stale: "#fab219", lost: "#d03b3b", ok: "#0ca30c" },
    hullAlpha: 0.1,
    discRing: false,
  },
  // Neutral light. Aqua sits just under 3:1 on this surface, so truth discs
  // carry a hairline ring and every disc carries a label.
  light: {
    background: "#fcfcfb",
    panel: "#f3f2ee",
    hairline: "#e1e0d9",
    ink: "#0b0b0b",
    inkSecondary: "#52514e",
    muted: "#898781",
    neutralFill: "#e1e0d9",
    neutralStroke: "#898781",
    slot: { blue: "#2a78d6", orange: "#eb6834", aqua: "#1baf7a" },
    domain: { museum: "#2a78d6", hospitality: "#eb6834", care: "#1baf7a", stage: "#4a3aa7" },
    status: { stale: "#b07a00", lost: "#d03b3b", ok: "#006300" },
    hullAlpha: 0.07,
    discRing: true,
  },
  // Warm paper. Same hues, same relief rules, a surface that reads as a
  // physical board rather than a screen.
  paper: {
    background: "#f7f3ea",
    panel: "#efe9dc",
    hairline: "#ddd6c6",
    ink: "#1d1a14",
    inkSecondary: "#5a554a",
    muted: "#8c8676",
    neutralFill: "#e2dccb",
    neutralStroke: "#8c8676",
    slot: { blue: "#2a78d6", orange: "#eb6834", aqua: "#1baf7a" },
    domain: { museum: "#2a78d6", hospitality: "#eb6834", care: "#1baf7a", stage: "#4a3aa7" },
    status: { stale: "#b07a00", lost: "#d03b3b", ok: "#006300" },
    hullAlpha: 0.07,
    discRing: true,
  },
};

type ThemeValue = { mode: Mode; palette: Palette };
const ThemeContext = createContext<ThemeValue>({ mode: DEFAULT_MODE, palette: palettes[DEFAULT_MODE] });

export const ThemeProvider: React.FC<{ mode?: Mode; children: React.ReactNode }> = ({ mode = DEFAULT_MODE, children }) => (
  <ThemeContext.Provider value={{ mode, palette: palettes[mode] }}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
