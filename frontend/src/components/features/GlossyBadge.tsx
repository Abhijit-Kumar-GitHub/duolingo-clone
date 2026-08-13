import clsx from "clsx";

export type GlossyColor = "green" | "blue" | "red" | "yellow" | "purple" | "fox" | "grey";

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
  fox: { face: "#FF9600", rimTop: "#CC7A00", rimBottom: "#A66200" },
  grey: { face: "#E5E5E5", rimTop: "#CFCFCF", rimBottom: "#B8B8B8" },
};

const SIZE_MAP = {
  sm: { face: 40, rim: 7, icon: 18 },
  md: { face: 56, rim: 10, icon: 24 },
  lg: { face: 80, rim: 14, icon: 32 },
  xl: { face: 64, rim: 11, icon: 26 },
};

// A real isometric "coin": two identically-sized circles, the base shifted
// straight down by the rim depth so only its own bottom curve peeks out
// below the top face — that peeking sliver IS the rim, so it shares the top
// face's curvature instead of being a flat box-shadow offset. The rim gets
// a top-to-bottom dark gradient (ambient occlusion), the top face gets a
// radial highlight near the upper-left (a light source), and the icon sits
// on the (unsquashed) top face's own circle, not a flattened ellipse.
export function GlossyBadge({
  color, size = "md", icon: Icon, iconClassName, className, muted, iconSize: iconSizeOverride, strokeWidth = 2.2,
}: {
  color: GlossyColor;
  size?: "sm" | "md" | "lg" | "xl";
  icon: any;
  iconClassName?: string;
  className?: string;
  muted?: boolean;
  iconSize?: number;
  strokeWidth?: number;
}) {
  const c = COLOR_MAP[muted ? "grey" : color];
  const { face, rim, icon: iconSize } = SIZE_MAP[size];

  return (
    <div
      className={clsx("relative shrink-0", className)}
      style={{ width: face, height: face + rim, filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.15))" }}
    >
      {/* rim / underside — same-size circle, shifted down; only its bottom curve shows */}
      <div
        className="absolute inset-x-0 rounded-full"
        style={{ top: rim, height: face, background: `linear-gradient(to bottom, ${c.rimTop}, ${c.rimBottom})` }}
      />
      {/* top face */}
      <div
        className="absolute inset-x-0 top-0 rounded-full flex items-center justify-center"
        style={{
          height: face,
          backgroundImage: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)`,
          backgroundColor: c.face,
        }}
      >
        <Icon className={clsx(muted ? "text-duo-hare" : "text-white", iconClassName)} size={iconSizeOverride ?? iconSize} strokeWidth={strokeWidth} />
      </div>
    </div>
  );
}
