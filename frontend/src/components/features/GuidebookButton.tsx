"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

// Real Duolingo's unit banner has a Guidebook button opening a grammar/
// vocab reference sheet. No such content exists in this seed data, so it's
// a Coming Soon tooltip rather than a dead link.
export function GuidebookButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-3 py-2 text-xs font-extrabold uppercase tracking-wide whitespace-nowrap"
      >
        <BookOpen size={14} /> Guidebook
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 bg-duo-inverse text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap z-20 animate-pop-in">
          Guidebook coming soon
        </div>
      )}
    </div>
  );
}
