/**
 * Sidebar / bottom-nav icons.
 *
 * These are separate from art/icons.tsx because they're a different job: the
 * icons there are *game assets* that appear at many sizes (a gem in the top
 * bar, on a shop row, inside a toast), while these only ever render at ~26px
 * in one place and each stands for a destination.
 *
 * They're drawn rather than pulled from lucide for the same reason the rest
 * of the art is: real Duolingo's nav isn't a monochrome line set whose colour
 * flips on selection — every item is a small illustrated object in its own
 * fixed colours (a birdhouse, a dumbbell, a shield, a chest, a storefront),
 * and it's the *row* that highlights, not the glyph. A row of grey outlines
 * that turn green when active is the single most obvious tell that a clone
 * is a clone.
 */

export type NavIconProps = { size?: number; className?: string };

function Svg({ size = 26, className, children }: NavIconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

/** Learn — a birdhouse, not a generic house: red roof, yellow box, dark
 *  entry hole and a perch. */
export function BirdhouseIcon(p: NavIconProps) {
  return (
    <Svg {...p}>
      <path d="M5.2 8.6h13.6v11.2a1.6 1.6 0 0 1-1.6 1.6H6.8a1.6 1.6 0 0 1-1.6-1.6V8.6Z" fill="#FFC800" />
      <path d="M12 1.8 2 9.4h20L12 1.8Z" fill="#FF4B4B" />
      <path d="M12 1.8v7.6h10L12 1.8Z" fill="#EA2B2B" />
      <circle cx="12" cy="13.6" r="3.1" fill="#8A5200" />
      <rect x="11.2" y="16.4" width="1.6" height="4.4" rx="0.8" fill="#8A5200" />
    </Svg>
  );
}

/** Practice — a dumbbell on the diagonal. */
export function DumbbellIcon(p: NavIconProps) {
  return (
    <Svg {...p}>
      {/* Chunky weights and a short thick bar — at 26px a thin bar with small
          ends stops reading as a dumbbell and starts reading as a bone. */}
      <g transform="rotate(-45 12 12)">
        <rect x="5" y="9.8" width="14" height="4.4" rx="1" fill="#1CB0F6" />
        <rect x="1.6" y="6.4" width="5.4" height="11.2" rx="1.2" fill="#1899D6" />
        <rect x="17" y="6.4" width="5.4" height="11.2" rx="1.2" fill="#1899D6" />
      </g>
    </Svg>
  );
}

/** Leaderboards — a gold shield, lit on the left, shaded on the right. */
export function ShieldIcon(p: NavIconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2 4.4 4.9v7.3c0 4.3 3.1 8 7.6 9.8 4.5-1.8 7.6-5.5 7.6-9.8V4.9L12 2Z" fill="#FFC800" />
      <path d="M12 2v20c4.5-1.8 7.6-5.5 7.6-9.8V4.9L12 2Z" fill="#E6A700" />
    </Svg>
  );
}

/** Quests — a gold-lidded chest. Deliberately a different drawing from the
 *  wooden path chest in art/icons.tsx: this one is a flat nav glyph at 26px,
 *  that one is a 62px object sitting on the path. */
export function QuestChestIcon(p: NavIconProps) {
  return (
    <Svg {...p}>
      <path d="M3.4 10.4h17.2v8.4a1.6 1.6 0 0 1-1.6 1.6H5a1.6 1.6 0 0 1-1.6-1.6v-8.4Z" fill="#FFC800" />
      <path d="M3.4 10.4V6.8A1.6 1.6 0 0 1 5 5.2h14a1.6 1.6 0 0 1 1.6 1.6v3.6H3.4Z" fill="#E6A700" />
      <rect x="10.2" y="8.8" width="3.6" height="5" rx="1.2" fill="#8A5200" />
      <path d="M3.4 14.2h17.2" stroke="#8A5200" strokeWidth="0.9" opacity="0.4" />
    </Svg>
  );
}

/** Shop — a storefront with a striped awning. */
export function StorefrontIcon(p: NavIconProps) {
  return (
    <Svg {...p}>
      <path d="M3.6 9.4h16.8v10.2a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6V9.4Z" fill="#FF4B4B" />
      <path d="M2.4 4.2h19.2l1.2 5.2H1.2l1.2-5.2Z" fill="#EA2B2B" />
      <path d="M8.6 4.2h3.2l-.8 5.2H7.8l.8-5.2ZM15 4.2h3.2l1.2 5.2h-3.2L15 4.2Z" fill="#FF8A8A" />
      <rect x="9" y="13.4" width="6" height="7.8" rx="0.8" fill="#fff" opacity="0.92" />
    </Svg>
  );
}

/** Profile — the dashed ring the real app shows for an unfinished profile. */
export function ProfileRingIcon(p: NavIconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9.6" stroke="#AFAFAF" strokeWidth="1.6" strokeDasharray="3.2 2.8" />
      <circle cx="12" cy="10" r="3.1" fill="#AFAFAF" />
      <path d="M6.6 18.6a5.6 5.6 0 0 1 10.8 0 9.5 9.5 0 0 1-10.8 0Z" fill="#AFAFAF" />
    </Svg>
  );
}

/** More — a filled violet disc with an ellipsis. */
export function MoreDotsIcon(p: NavIconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9.6" fill="#CE82FF" />
      <g fill="#fff">
        <circle cx="7.8" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="16.2" cy="12" r="1.5" />
      </g>
    </Svg>
  );
}

/** Settings — a grey cog, for the "More" overflow menu. */
export function CogIcon(p: NavIconProps) {
  return (
    <Svg {...p}>
      <path
        d="M10.4 2h3.2l.5 2.4 1.7 1 2.3-.9 1.6 2.8-1.8 1.6v2l1.8 1.6-1.6 2.8-2.3-.9-1.7 1-.5 2.4h-3.2l-.5-2.4-1.7-1-2.3.9-1.6-2.8L5.7 12.5v-2L3.9 8.9l1.6-2.8 2.3.9 1.7-1L10.4 2Z"
        fill="#AFAFAF"
      />
      <circle cx="12" cy="11.5" r="3" fill="#fff" />
    </Svg>
  );
}
