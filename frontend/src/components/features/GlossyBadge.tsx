import clsx from "clsx";

export type GlossyColor = "green" | "blue" | "red" | "yellow" | "purple" | "fox" | "grey";

const COLOR_MAP: Record<GlossyColor, { bg: string; shadow: string }> = {
  green: { bg: "bg-duo-green", shadow: "shadow-duo-green" },
  blue: { bg: "bg-duo-blue", shadow: "shadow-duo-blue" },
  red: { bg: "bg-duo-red", shadow: "shadow-duo-red" },
  yellow: { bg: "bg-duo-yellow", shadow: "shadow-duo-yellow" },
  purple: { bg: "bg-duo-purple", shadow: "shadow-duo-purple" },
  fox: { bg: "bg-duo-fox", shadow: "shadow-duo-fox" },
  grey: { bg: "bg-duo-swan", shadow: "shadow-duo-gray" },
};

const SIZE_MAP = {
  sm: { box: "w-10 h-10", icon: 18 },
  md: { box: "w-14 h-14", icon: 24 },
  lg: { box: "w-20 h-20", icon: 32 },
};

// The signature glossy "coin" badge: flat color + bottom-edge shadow for a
// pressable 3D feel, plus a soft top-light/bottom-shade gradient overlay so
// it reads as an embossed disc rather than a flat-colored circle — same
// treatment as the path nodes (PathNode.tsx), extracted so every circular
// icon badge in the app (achievements, stat cards, popover glyphs, league
// trophy) shares one visual language instead of ad hoc tinted squares.
export function GlossyBadge({
  color, size = "md", icon: Icon, iconClassName, className, muted,
}: {
  color: GlossyColor;
  size?: "sm" | "md" | "lg";
  icon: any;
  iconClassName?: string;
  className?: string;
  muted?: boolean;
}) {
  const colors = COLOR_MAP[muted ? "grey" : color];
  const { box, icon: iconSize } = SIZE_MAP[size];

  return (
    <div className={clsx("relative rounded-full flex items-center justify-center shrink-0", box, colors.bg, colors.shadow, className)}>
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/45 via-white/0 to-black/10" />
      <Icon className={clsx("relative", muted ? "text-duo-hare" : "text-white", iconClassName)} size={iconSize} strokeWidth={2.2} />
    </div>
  );
}
