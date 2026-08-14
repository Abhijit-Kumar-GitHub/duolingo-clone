"use client";

import { useState } from "react";
import { SkipForward } from "lucide-react";
import clsx from "clsx";

const COLOR_CLASSES: Record<string, string> = {
  green: "border-duo-green text-duo-green",
  blue: "border-duo-blue text-duo-blue",
  purple: "border-duo-purple text-duo-purple",
  teal: "border-duo-teal text-duo-teal",
};

// Real Duolingo lets you "test out" of a not-yet-started unit ahead via a
// placement quiz — one bubble sits above the very first node of each such
// unit, not beside an arbitrary locked node mid-path. That mechanic doesn't
// exist here (it would let players corrupt the skill-unlock progression
// this app tracks), so tapping it surfaces a Coming Soon note instead of
// silently unlocking anything.
export function JumpAheadBubble({ color = "green" }: { color?: string }) {
  const [open, setOpen] = useState(false);
  const colorClasses = COLOR_CLASSES[color] ?? COLOR_CLASSES.green;

  return (
    <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-10">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className={clsx(
          "flex items-center gap-1.5 bg-duo-card border-2 font-extrabold text-xs uppercase tracking-wide px-3 py-1.5 rounded-xl shadow-duo-card whitespace-nowrap",
          colorClasses
        )}
      >
        <SkipForward size={12} /> Jump here?
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-duo-inverse text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-20 animate-pop-in">
          Skip-ahead placement test coming soon
        </div>
      )}
    </div>
  );
}
