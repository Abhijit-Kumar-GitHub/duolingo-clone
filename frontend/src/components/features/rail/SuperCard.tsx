"use client";

import { DuoOwl } from "../art/DuoOwl";
import { SuperWordmark } from "./SuperWordmark";

// Static promo card — Super/subscriptions are explicitly a mockable
// placeholder per the assignment spec, so this never actually starts a
// trial; it's here purely for the visual rhythm of the real right rail.
//
// Note it is *not* a dark card: the real rail's Super upsell is a plain
// white bordered card like its neighbours, and the only things carrying the
// subscription's identity are the gradient wordmark, the gradient mascot,
// and the indigo CTA — which is what makes it stand out on an otherwise
// green-and-white page.
export function SuperCard() {
  return (
    <div className="border border-duo-swan rounded-2xl p-4 relative overflow-hidden">
      <DuoOwl size={78} gradient className="absolute -top-1 right-1 pointer-events-none" />
      <SuperWordmark className="text-lg mb-2" />
      <p className="font-extrabold text-duo-eel leading-snug mb-1 max-w-[60%]">
        Try Super for free
      </p>
      <p className="text-sm text-duo-wolf leading-snug mb-4">
        No ads, personalized practice, and unlimited Legendary!
      </p>
      <button className="w-full bg-duo-indigo text-white font-extrabold text-sm uppercase tracking-wide rounded-2xl py-3 shadow-duo-indigo cursor-default">
        Try 1 week free
      </button>
    </div>
  );
}
