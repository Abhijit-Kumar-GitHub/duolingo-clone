"use client";

import { Infinity as InfinityIcon } from "lucide-react";
import { GlossyBadge } from "../GlossyBadge";

// Full-width variant of SuperCard used as the Shop page's top banner (real
// Duolingo uses the compact card in the rail but a wide banner here) —
// same mocked-upsell content, just a different shape for a different slot.
export function SuperBanner() {
  return (
    <div className="bg-duo-eel rounded-2xl px-6 py-5 text-white flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <GlossyBadge color="purple" icon={InfinityIcon} />
        <div>
          <span className="inline-block bg-duo-yellow text-duo-eel text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wide mb-1">
            SUPER
          </span>
          <p className="font-extrabold leading-snug">Start a 1 week free trial to enjoy exclusive Super benefits</p>
        </div>
      </div>
      <button className="bg-white text-duo-eel font-extrabold text-xs uppercase tracking-wide rounded-2xl px-5 py-3 shrink-0 opacity-90 cursor-default whitespace-nowrap">
        Start my free 7 days
      </button>
    </div>
  );
}
