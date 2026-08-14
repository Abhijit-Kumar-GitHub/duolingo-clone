"use client";

import { useState } from "react";
import clsx from "clsx";

export type GlossyColor = "green" | "blue" | "red" | "yellow" | "purple" | "teal" | "fox" | "grey";

// Three-stop ramps (top face / rim top / rim bottom) per color, in hex —
// centralized here as the single source of truth for this one component,
// since CSS gradients need real color stops rather than Tailwind's flat
// utility classes.
const COLOR_MAP: Record<GlossyColor, { face: string; rimTop: string; rimBottom: string }> = {
  green: { face: "#58CC02", rimTop: "#58A700", rimBottom: "#468A00" },
  blue: { face: "#1CB0F6", rimTop: "#1899D6", rimBottom: "#127DAF" },
  red: { face: "#FF4B4B", rimTop: "#EA2B2B", rimBottom: "#C21F1F" },
  yellow: { face: "#FFC800", rimTop: "#E6B800", rimBottom: "#C29A00" },
  purple: { face: "#CE82FF", rimTop: "#A568C9", rimBottom: "#8A54A8" },
  teal: { face: "#00CD9C", rimTop: "#00A87E", rimBottom: "#008A68" },
  fox: { face: "#FF9600", rimTop: "#CC7A00", rimBottom: "#A66200" },
  grey: { face: "#E5E5E5", rimTop: "#CFCFCF", rimBottom: "#B8B8B8" },
};

// faceW/faceH are the literal box dimensions of the top face (and the rim
// beneath it) — width > height by design, ~0.72 ratio. Combined with a
// PERCENTAGE border-radius (50%, see below — not Tailwind's rounded-full,
// which is a fixed 9999px and gets clamped to a stadium/pill shape with
// flat sides on a non-square box), this reads as a properly flattened
// disc: percentage radii resolve independently per axis (50% of width,
// 50% of height), so every edge is fully consumed by curvature with no
// flat segments anywhere — a true ellipse inscribed in the box.
const SIZE_MAP = {
  sm: { faceW: 40, faceH: 29, rim: 6, icon: 17 },
  md: { faceW: 56, faceH: 41, rim: 8, icon: 22 },
  lg: { faceW: 80, faceH: 58, rim: 11, icon: 30 },
  xl: { faceW: 58, faceH: 42, rim: 8, icon: 22 },
};

// A real isometric "coin" viewed from an elevated angle: two identically
// -shaped ellipses (same box, same border-radius), the base shifted
// straight down by the rim depth so only its own bottom curve peeks out —
// that peeking sliver shares the top face's curvature instead of being a
// flat box-shadow offset. The rim gets a top-to-bottom dark gradient
// (ambient occlusion), the top face gets a radial highlight near the
// upper-left (a light source). The icon is a fixed-size SVG centered in
// the box (not stretched to fill it), so flattening the badge doesn't
// squash the icon.
export function GlossyBadge({
  color, size = "md", icon: Icon, iconClassName, className, muted, iconSize: iconSizeOverride, strokeWidth = 2.2, pressable = false, iconProps,
}: {
  color: GlossyColor;
  size?: "sm" | "md" | "lg" | "xl";
  icon: any;
  iconClassName?: string;
  className?: string;
  muted?: boolean;
  iconSize?: number;
  strokeWidth?: number;
  // Extra props forwarded verbatim to the icon component. Only meaningful
  // for the multi-tone SVGs in art/icons.tsx (which take `muted`, `tier`,
  // …); deliberately opt-in rather than always-on, because lucide spreads
  // whatever it's given straight onto the <svg> element and would turn an
  // unknown prop into a React DOM warning.
  iconProps?: Record<string, unknown>;
  // Real Duolingo's path nodes react to hover by sinking the top face
  // toward the rim (like the button is already being pressed), not with a
  // tooltip or a lift. Only meaningful on clickable nodes.
  pressable?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const c = COLOR_MAP[muted ? "grey" : color];
  const { faceW, faceH, rim, icon: iconSize } = SIZE_MAP[size];
  const pressOffset = Math.round(rim * 0.3);

  return (
    <div
      className={clsx("relative shrink-0", className)}
      style={{ width: faceW, height: faceH + rim, filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.15))" }}
      onMouseEnter={pressable ? () => setHovered(true) : undefined}
      onMouseLeave={pressable ? () => setHovered(false) : undefined}
    >
      {/* rim / underside — same-shape ellipse, shifted down; only its bottom curve shows */}
      <div
        className="absolute inset-x-0"
        style={{ top: rim, height: faceH, borderRadius: "50%", background: `linear-gradient(to bottom, ${c.rimTop}, ${c.rimBottom})` }}
      />
      {/* top face — slides toward the rim on hover to fake a press */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-center transition-transform duration-100"
        style={{
          height: faceH,
          borderRadius: "50%",
          backgroundImage: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)`,
          backgroundColor: c.face,
          transform: pressable && hovered ? `translateY(${pressOffset}px)` : undefined,
        }}
      >
        <Icon
          className={clsx(muted ? "text-duo-hare" : "text-white", iconClassName)}
          size={iconSizeOverride ?? iconSize}
          strokeWidth={strokeWidth}
          {...iconProps}
        />
      </div>
    </div>
  );
}
