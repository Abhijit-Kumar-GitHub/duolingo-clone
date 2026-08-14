"use client";

import { DuoOwl } from "../art/DuoOwl";
import { SuperWordmark } from "./SuperWordmark";

// Full-width variant of SuperCard used as the Shop page's top banner (real
// Duolingo uses the compact card in the rail but a wide banner here) —
// same mocked-upsell content and the same white-card treatment, just a
// different shape for a different slot.
export function SuperBanner() {
  return (
    <div className="border border-duo-swan rounded-2xl px-6 py-5 flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4 min-w-0">
        <DuoOwl size={64} gradient className="shrink-0" />
        <div className="min-w-0">
          <SuperWordmark className="text-base" />
          <p className="font-extrabold text-duo-eel leading-snug">Try Super for free</p>
          <p className="text-sm text-duo-wolf leading-snug">
            No ads, personalized practice, and unlimited Legendary!
          </p>
        </div>
      </div>
      <button className="bg-duo-indigo text-white font-extrabold text-xs uppercase tracking-wide rounded-2xl px-5 py-3 shrink-0 shadow-duo-indigo cursor-default whitespace-nowrap">
        Try 1 week free
      </button>
    </div>
  );
}
