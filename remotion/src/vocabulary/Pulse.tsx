import React from "react";
import { geometry, useTheme } from "../theme";
import { useStage } from "./Stage";

// Fires where truth and belief diverge. phase runs 0..1 over motion.pop.
export const Pulse: React.FC<{ x: number; y: number; phase: number; color?: string }> = ({ x, y, phase, color }) => {
  const { palette } = useTheme();
  const { toPx } = useStage();
  const [cx, cy] = toPx(x, y);
  const p = Math.max(0, Math.min(1, phase));
  return (
    <circle
      cx={cx}
      cy={cy}
      r={geometry.person / 2 + 6 + p * 44}
      fill="none"
      stroke={color ?? palette.status.lost}
      strokeWidth={geometry.strokeThick}
      opacity={1 - p}
    />
  );
};
