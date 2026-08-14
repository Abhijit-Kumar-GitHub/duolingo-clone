/**
 * The app's icon set for anything that reads as a *game asset* rather than a
 * UI control — the streak flame, gem, heart, XP bolt, crown, treasure chest,
 * trophy and league badge.
 *
 * Why these are hand-drawn SVG rather than lucide icons (which the rest of
 * the app still uses, correctly, for nav/chrome): lucide is a monochrome
 * *line* set. Duolingo's economy icons are the opposite — solid, multi-tone,
 * faceted shapes with a lit face and a shaded underside, the same lighting
 * model as the path nodes in GlossyBadge.tsx. A grey outlined `<Gem/>` next
 * to a glossy green path node looks like two different apps.
 *
 * These are original drawings in that visual language, not copies of
 * Duolingo's own asset files. Everything is inline SVG — no image requests,
 * no icon font, so they render identically offline and can't 404 in the
 * deployed build.
 *
 * Every icon takes the same props as a lucide icon (`size`, `className`,
 * `strokeWidth`) so it can be dropped into any slot that already accepts
 * one — including GlossyBadge's `icon` prop. `strokeWidth` is accepted and
 * ignored: these are filled shapes with no stroke to scale.
 */

export type ArtIconProps = {
  size?: number;
  className?: string;
  /** Locked / inactive variant — the same shape drawn in a grey ramp. */
  muted?: boolean;
  /** Accepted for lucide prop-compatibility; these icons have no stroke. */
  strokeWidth?: number;
};

// The grey ramp every icon falls back to when `muted` — deliberately the
// same greys GlossyBadge uses for a locked node, so a locked chest and the
// disc it sits next to desaturate to matching tones.
//
// These are CSS variables rather than literals because the ramp has to
// *invert* in dark mode: a muted icon needs to be lighter than the page
// there, not darker. Custom properties resolve inside SVG presentation
// attributes, so a `fill` can reference one directly.
const GREY = {
  light: "var(--duo-muted-1)",
  mid: "var(--duo-muted-2)",
  base: "var(--duo-muted-3)",
  dark: "var(--duo-muted-4)",
  darkest: "var(--duo-muted-5)",
};

function Svg({ size = 24, className, box = 24, children }: {
  size?: number; className?: string; box?: number; children: React.ReactNode;
}) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${box} ${box}`} fill="none" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

/** Streak flame. Two nested flames — a wide orange body with a hotter
 *  yellow core — which is what makes it read as fire at 20px instead of as
 *  a generic teardrop. */
export function FlameIcon({ size, className, muted }: ArtIconProps) {
  const outer = muted ? GREY.base : "#FF9600";
  const inner = muted ? GREY.light : "#FFC800";
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 1.4c.5 3.2-.2 5.7-1.3 7.6.2-1.3.1-2.3-.3-3.3C8.7 8.4 5.4 11 5.4 15.9c0 4.1 3 7 6.6 7s6.6-2.9 6.6-7c0-1.9-.7-3.6-1.9-5.2-.2.9-.7 1.6-1.4 2.1.5-1.2.7-2.4.7-3.6 0-3.4-1.9-6.2-4-7.8Z"
        fill={outer}
      />
      <path
        d="M12 22.9c-2.2 0-3.8-1.6-3.8-3.8 0-2.9 2.9-4.2 3.5-7.6 1.9 1.7 4.1 4.4 4.1 7.3 0 2.3-1.6 4.1-3.8 4.1Z"
        fill={inner}
      />
    </Svg>
  );
}

/** Gem — the currency. **Blue**, and a compact hexagon rather than a long
 *  teardrop: flat top face, angled crown shoulders, a girdle across the
 *  middle and a short pavilion to a blunt point. Drawn as explicit facets so
 *  light catches unevenly instead of reading as a flat silhouette.
 *
 *  Worth stating outright because it's the easy thing to get wrong when
 *  cloning this bar: the gem is *not* red. Hearts are red; the gem is the
 *  same blue family as the app's accent colour, and the two sit next to each
 *  other in the top bar told apart by both hue and silhouette. */
export function GemIcon({ size, className, muted }: ArtIconProps) {
  const base = muted ? GREY.base : "#1CB0F6";
  const light = muted ? GREY.light : "#84D8FF";
  const dark = muted ? GREY.dark : "#1489C4";
  return (
    <Svg size={size} className={className}>
      {/* crown — flat top face plus the two angled shoulders */}
      <path d="M3 10 7.4 3.4h2.4L8.4 10H3Z" fill={light} />
      <path d="M9.4 3.4h5.2L15.6 10H8.4l1-6.6Z" fill={base} />
      <path d="M14.2 3.4h2.4L21 10h-5.4l-1.4-6.6Z" fill={dark} />
      {/* pavilion — short, so the whole stone stays hexagonal, not a teardrop */}
      <path d="M3 10h5.4L12 20.6 3 10Z" fill={base} />
      <path d="M8.4 10h7.2L12 20.6 8.4 10Z" fill={light} />
      <path d="M15.6 10H21l-9 10.6L15.6 10Z" fill={dark} />
    </Svg>
  );
}

/** Heart. Flat red like the real one, with a single soft highlight so it
 *  doesn't look like a sticker next to the glossy nodes. */
export function HeartIcon({ size, className, muted }: ArtIconProps) {
  const base = muted ? GREY.mid : "#FF4B4B";
  const shade = muted ? GREY.base : "#E53535";
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 21.7S2.4 15.5 2.4 8.9C2.4 5.6 5 3.1 8.2 3.1c1.8 0 3.2.9 3.8 2 .6-1.1 2-2 3.8-2 3.2 0 5.8 2.5 5.8 5.8 0 6.6-9.6 12.8-9.6 12.8Z"
        fill={base}
      />
      <path d="M12 21.7S2.4 15.5 2.4 8.9c0-.5.1-1 .2-1.5C4 13 12 18.6 12 18.6s8-5.6 9.4-11.2c.1.5.2 1 .2 1.5 0 6.6-9.6 12.8-9.6 12.8Z" fill={shade} />
      <ellipse cx="7.4" cy="8.2" rx="1.9" ry="2.6" fill="#fff" opacity={muted ? 0.4 : 0.35} transform="rotate(-28 7.4 8.2)" />
    </Svg>
  );
}

/** Half-shattered heart, for the out-of-hearts state. */
export function BrokenHeartIcon({ size, className }: ArtIconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M11.2 21.7S1.6 15.5 1.6 8.9C1.6 5.6 4.2 3.1 7.4 3.1c1.8 0 3.2.9 3.8 2l-1.9 4.6 2.6 1.9-2.3 3.1 1.6 7Z" fill="#FF4B4B" />
      <path d="M12.8 21.7s9.6-6.2 9.6-12.8c0-3.3-2.6-5.8-5.8-5.8-1.8 0-3.2.9-3.8 2l1.9 4.6-2.6 1.9 2.3 3.1-1.6 7Z" fill="#E53535" />
    </Svg>
  );
}

/** XP bolt. */
export function XpIcon({ size, className, muted }: ArtIconProps) {
  const base = muted ? GREY.mid : "#FFC800";
  const shade = muted ? GREY.base : "#E6A700";
  return (
    <Svg size={size} className={className}>
      <path d="M13.9 1.5 4.2 13.4h5.5L8.9 22.5l10.4-12.2h-6l.6-8.8Z" fill={base} />
      <path d="M9.7 13.4H4.2l9.7-11.9-.3 4.6-3.9 7.3Z" fill={shade} />
    </Svg>
  );
}

/** Crown — the skill-mastery counter. */
export function CrownIcon({ size, className, muted }: ArtIconProps) {
  const base = muted ? GREY.mid : "#FFC800";
  const shade = muted ? GREY.base : "#E6A700";
  return (
    <Svg size={size} className={className}>
      <path d="M2.4 7.1a1.2 1.2 0 0 1 1.9-1l3.4 2.5 3.3-4.5a1.2 1.2 0 0 1 2 0l3.3 4.5 3.4-2.5a1.2 1.2 0 0 1 1.9 1L20.4 18H3.6L2.4 7.1Z" fill={base} />
      <path d="M3.6 18h16.8l-.3 2.3a1 1 0 0 1-1 .9H4.9a1 1 0 0 1-1-.9L3.6 18Z" fill={shade} />
      <circle cx="12" cy="12.6" r="1.5" fill={shade} />
    </Svg>
  );
}

/** Treasure chest — the mid-unit checkpoint node. Rendered large and
 *  standalone on the path (see PathNode.tsx), so it carries more detail
 *  than the 20px stat icons: separate lid and body, gold banding, a lock
 *  plate, and plank seams. */
export function ChestIcon({ size, className, muted }: ArtIconProps) {
  const lid = muted ? GREY.mid : "#C1742F";
  const body = muted ? GREY.base : "#A05A2C";
  const band = muted ? GREY.light : "#FFC800";
  const bandDark = muted ? GREY.dark : "#E6A700";
  const seam = muted ? GREY.dark : "#8A4A20";
  return (
    <Svg size={size} className={className}>
      {/* lid */}
      <path d="M2.6 11.4V9.9C2.6 6 6.8 3 12 3s9.4 3 9.4 6.9v1.5H2.6Z" fill={lid} />
      {/* body */}
      <path d="M2.6 12.9h18.8v5.7a1.7 1.7 0 0 1-1.7 1.7H4.3a1.7 1.7 0 0 1-1.7-1.7v-5.7Z" fill={body} />
      {/* lid / body seam band */}
      <rect x="2.1" y="11.1" width="19.8" height="2.1" rx="1" fill={band} />
      <rect x="2.1" y="12.4" width="19.8" height="0.8" fill={bandDark} />
      {/* plank seams */}
      <path d="M7.2 4.6v6.5M16.8 4.6v6.5" stroke={seam} strokeWidth="0.7" opacity="0.5" />
      <path d="M2.6 16.6h18.8" stroke={seam} strokeWidth="0.7" opacity="0.4" />
      {/* lock plate */}
      <rect x="10" y="10.2" width="4" height="5.4" rx="1.2" fill={band} />
      <rect x="10" y="13.4" width="4" height="2.2" rx="0.6" fill={bandDark} />
      <circle cx="12" cy="13.2" r="0.9" fill={seam} />
    </Svg>
  );
}

/** Unit-end trophy. */
export function TrophyIcon({ size, className, muted }: ArtIconProps) {
  const base = muted ? GREY.mid : "#FFC800";
  const shade = muted ? GREY.base : "#E6A700";
  const light = muted ? GREY.light : "#FFE38A";
  return (
    <Svg size={size} className={className}>
      {/* side handles */}
      <path d="M7.4 4.6H4.2v2.2a4 4 0 0 0 3.7 4V8.6a1.8 1.8 0 0 1-1.5-1.8V6.4h1v-1.8ZM16.6 4.6h3.2v2.2a4 4 0 0 1-3.7 4V8.6a1.8 1.8 0 0 0 1.5-1.8V6.4h-1V4.6Z" fill={shade} />
      {/* cup */}
      <path d="M6.6 3h10.8v6.2c0 3.2-2.2 5.6-5.4 5.6s-5.4-2.4-5.4-5.6V3Z" fill={base} />
      <path d="M8.4 3h1.8v6.2c0 1.7.5 3.2 1.5 4.2-2.1-.5-3.3-2.4-3.3-4.9V3Z" fill={light} />
      {/* stem + base */}
      <path d="M10.8 14.6h2.4v2.6h-2.4z" fill={shade} />
      <path d="M7.6 17.2h8.8a1 1 0 0 1 1 1v1.6a1 1 0 0 1-1 1H7.6a1 1 0 0 1-1-1v-1.6a1 1 0 0 1 1-1Z" fill={base} />
      <path d="M6.6 19.4h10.8v.4a1 1 0 0 1-1 1H7.6a1 1 0 0 1-1-1v-.4Z" fill={shade} />
    </Svg>
  );
}

/** League badge — a hex shield in one of the tier metals. Tiers beyond
 *  Bronze aren't reachable in this clone (no weekly promotion job), but the
 *  component is tiered anyway so the leaderboard's tier ladder and the rail
 *  widget can't drift apart on colour. */
export type LeagueTier = "bronze" | "silver" | "gold" | "sapphire" | "ruby";

const TIER_RAMP: Record<LeagueTier, { light: string; base: string; dark: string }> = {
  bronze: { light: "#E8A76A", base: "#CD7F32", dark: "#96551D" },
  silver: { light: "#EDF1F5", base: "#C3CCD6", dark: "#8E9AA6" },
  gold: { light: "#FFE38A", base: "#FFC800", dark: "#D69B00" },
  sapphire: { light: "#7FD4FF", base: "#1CB0F6", dark: "#0E6E9C" },
  ruby: { light: "#FF8A8A", base: "#FF4B4B", dark: "#B41F1F" },
};

export function LeagueBadgeIcon({ size, className, muted, tier = "bronze" }: ArtIconProps & { tier?: LeagueTier }) {
  const c = muted ? { light: GREY.light, base: GREY.base, dark: GREY.dark } : TIER_RAMP[tier];
  return (
    <Svg size={size} className={className}>
      <path d="M12 1.3 21 6.4v11.2L12 22.7 3 17.6V6.4l9-5.1Z" fill={c.dark} />
      <path d="M12 3.1 19.4 7.3v9.4L12 20.9l-7.4-4.2V7.3L12 3.1Z" fill={c.base} />
      {/* emblem: a laurel-ish wing pair around a centre pip */}
      <path d="M12 6.6c1.8 1.2 2.8 3 2.8 5.1 0 2-1 3.8-2.8 5-1.8-1.2-2.8-3-2.8-5 0-2.1 1-3.9 2.8-5.1Z" fill={c.light} />
      <circle cx="12" cy="11.7" r="1.6" fill={c.dark} />
    </Svg>
  );
}

/** Daily-goal / quest target. */
export function TargetIcon({ size, className, muted }: ArtIconProps) {
  const base = muted ? GREY.mid : "#1CB0F6";
  const shade = muted ? GREY.base : "#1489C4";
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="10" fill={base} />
      <circle cx="12" cy="12" r="6.6" fill="#fff" />
      <circle cx="12" cy="12" r="4.2" fill={shade} />
      <circle cx="12" cy="12" r="1.8" fill="#fff" />
    </Svg>
  );
}
