import clsx from "clsx";
import { DuoMark } from "./DuoOwl";

/**
 * Learner avatar.
 *
 * The seeded users each carry an `avatar_emoji`, and the leaderboard and
 * profile used to render that emoji raw. Two problems with that: an emoji
 * is a *different picture* per platform (and Windows in particular
 * substitutes aggressively), and a bare glyph on white looks nothing like
 * Duolingo, whose default avatar is a filled colour circle with the
 * learner's initial reversed out in white.
 *
 * So that's what this draws instead. The colour is derived from the
 * username rather than stored, which keeps it stable per-user across
 * renders and pages without adding a column to the schema for something
 * purely cosmetic.
 */

// Brand palette only — matching tailwind.config.ts's tokens, since these are
// real colour values for an inline style rather than utility classes.
const AVATAR_COLORS = ["#58CC02", "#1CB0F6", "#CE82FF", "#FF9600", "#00CD9C", "#FF4B4B", "#FFC800"];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function Avatar({ name, seed, size = 40, isOwl, className }: {
  name: string;
  /** Stable key for colour selection — the username, normally. */
  seed: string;
  size?: number;
  /** The signed-in learner gets the mascot instead of an initial. */
  isOwl?: boolean;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (isOwl) {
    return (
      <span
        className={clsx("inline-flex items-center justify-center rounded-full bg-duo-green/15 shrink-0", className)}
        style={{ width: size, height: size }}
      >
        <DuoMark size={size * 0.78} />
      </span>
    );
  }

  return (
    <span
      className={clsx("inline-flex items-center justify-center rounded-full text-white font-extrabold shrink-0 select-none", className)}
      style={{ width: size, height: size, backgroundColor: colorFor(seed), fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
