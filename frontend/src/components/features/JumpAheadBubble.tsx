"use client";

import { useState } from "react";
import { SkipForward } from "lucide-react";

// Real Duolingo lets you "test out" of a locked section ahead via a
// placement quiz. That mechanic doesn't exist here (it would let players
// corrupt the skill-unlock progression this app tracks), so tapping it
// surfaces a Coming Soon note instead of silently unlocking anything.
export function JumpAheadBubble() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute -left-32 top-5 z-10">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="flex items-center gap-1.5 bg-white border-2 border-duo-purple text-duo-purple font-extrabold text-xs uppercase tracking-wide px-3 py-1.5 rounded-xl shadow-duo-card whitespace-nowrap"
      >
        <SkipForward size={12} /> Jump here?
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-duo-eel text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-20 animate-pop-in">
          Skip-ahead placement test coming soon
        </div>
      )}
    </div>
  );
}
