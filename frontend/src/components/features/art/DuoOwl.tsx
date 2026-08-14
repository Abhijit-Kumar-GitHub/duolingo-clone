/**
 * The mascot.
 *
 * Every "empty state / celebration / brand" slot in this app was a bare
 * emoji until now (🎉 on the lesson-complete screen, 🃏 in the sidebar
 * promo, 🦉 as the profile avatar). Emoji are the wrong tool for that job
 * twice over: they render as a *different picture* on every OS — and on
 * Windows specifically, Segoe UI Emoji has no flag ligatures at all, which
 * is the same reason FlagIcon.tsx exists — and they can't be tinted to the
 * brand palette. So the mascot is drawn here instead, in the same flat,
 * high-saturation, thick-shape style as the rest of the art.
 *
 * This is an original owl drawn to fit that style, not Duolingo's own
 * character art — the point of the exercise is recreating the *UI
 * language*, and shipping a traced copy of a trademarked mascot would be
 * the wrong call even in a clone.
 *
 * The paths live in one shared fragment so <DuoOwl> (full body) and
 * <DuoMark> (head crop, for the wordmark lockup and small avatars) can
 * never drift apart — the crop is purely a viewBox change.
 */

const GREEN = "#58CC02";
const GREEN_DARK = "#46A302";
const BELLY = "#89E219";
const BEAK = "#FFC800";
const BEAK_DARK = "#FF9600";
const PUPIL = "#4B4B4B";

// The Super upsell renders the same bird in the subscription's brand
// gradient instead of flat green (see rail/SuperCard.tsx). Only the plumage
// changes — beak, eyes and feet stay put, or it stops reading as the mascot.
const SUPER_GRADIENT_ID = "duo-super-plumage";

function OwlPaths({ gradient }: { gradient?: boolean }) {
  const body = gradient ? `url(#${SUPER_GRADIENT_ID})` : GREEN;
  const wing = gradient ? "rgba(0,0,0,0.14)" : GREEN_DARK;
  const belly = gradient ? "rgba(255,255,255,0.28)" : BELLY;
  return (
    <>
      {gradient && (
        <defs>
          <linearGradient id={SUPER_GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#58CC02" />
            <stop offset="45%" stopColor="#1CB0F6" />
            <stop offset="100%" stopColor="#CE82FF" />
          </linearGradient>
        </defs>
      )}

      {/* feet */}
      <g fill={BEAK_DARK}>
        <path d="M47 103c6 0 11 2.6 11 5.8S53 114 47 114s-11-2-11-5.2 5-5.8 11-5.8Z" />
        <path d="M73 103c6 0 11 2.6 11 5.8S79 114 73 114s-11-2-11-5.2 5-5.8 11-5.8Z" />
      </g>

      {/* ear tufts — drawn before the body so their bases disappear under it */}
      <g fill={body}>
        <path d="M36 20C30 12 29 6 31 1c5 5 12 10 17 13Z" />
        <path d="M84 20c6-8 7-14 5-19-5 5-12 10-17 13Z" />
      </g>

      {/* body */}
      <path d="M60 8C33 8 15 30 15 58s19 50 45 50 45-22 45-50S87 8 60 8Z" fill={body} />

      {/* wings */}
      <ellipse cx="19" cy="66" rx="8.5" ry="17" fill={wing} />
      <ellipse cx="101" cy="66" rx="8.5" ry="17" fill={wing} />

      {/* belly */}
      <ellipse cx="60" cy="82" rx="29" ry="24" fill={belly} />

      {/* eyes */}
      <circle cx="43" cy="46" r="17" fill="#fff" />
      <circle cx="77" cy="46" r="17" fill="#fff" />
      <circle cx="45" cy="48" r="7" fill={PUPIL} />
      <circle cx="75" cy="48" r="7" fill={PUPIL} />
      <circle cx="47.6" cy="45.2" r="2.4" fill="#fff" />
      <circle cx="77.6" cy="45.2" r="2.4" fill="#fff" />

      {/* beak — tucked between and slightly over the eyes, like the real one */}
      <path d="M60 55c9 0 15 5 15 11s-6.7 12-15 12-15-5.5-15-12 6-11 15-11Z" fill={BEAK} />
      <path d="M45.4 68.5C47.5 74 53.2 78 60 78s12.5-4 14.6-9.5Z" fill={BEAK_DARK} />
    </>
  );
}

export function DuoOwl({ size = 120, className, gradient }: {
  size?: number; className?: string; gradient?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <OwlPaths gradient={gradient} />
    </svg>
  );
}

/** Head-and-shoulders crop of the same drawing — for the wordmark lockup,
 *  small avatars, and anywhere a full body would render too small to read. */
export function DuoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="12 0 96 96"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <OwlPaths />
    </svg>
  );
}
