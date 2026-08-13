"use client";

import { Infinity as InfinityIcon } from "lucide-react";
import { GlossyBadge } from "../GlossyBadge";

// Static promo card — Super/subscriptions are explicitly a mockable
// placeholder per the assignment spec, so this never actually starts a
// trial; it's here purely for the visual rhythm of the real right rail.
export function SuperCard() {
  return (
    <div className="bg-duo-eel rounded-2xl p-5 text-white relative overflow-hidden">
      <span className="absolute top-4 right-4 bg-duo-yellow text-duo-eel text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wide">
        SUPER
      </span>
      <GlossyBadge color="purple" size="sm" icon={InfinityIcon} className="mb-3" />
      <p className="font-extrabold leading-snug mb-3">
        Start a 1 week free trial to enjoy exclusive Super benefits
      </p>
      <button className="w-full bg-white text-duo-eel font-extrabold text-sm uppercase tracking-wide rounded-2xl py-3 opacity-90 cursor-default">
        Start my free 7 days
      </button>
    </div>
  );
}
