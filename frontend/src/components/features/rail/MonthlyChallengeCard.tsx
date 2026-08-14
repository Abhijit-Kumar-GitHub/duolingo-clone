"use client";

import Link from "next/link";
import { TrophyIcon } from "../art/icons";

// Quests-page-only rail teaser — monthly challenges have no backend model
// (out of scope per the assignment's bonus/mocked-content allowances), so
// this stays a static "unlock soon" card rather than faking real progress.
export function MonthlyChallengeCard() {
  return (
    <div className="border border-duo-swan rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <TrophyIcon size={34} className="shrink-0" />
        <p className="font-extrabold text-duo-eel text-sm leading-snug">
          Monthly challenges unlock soon!
        </p>
      </div>
      <p className="text-xs text-duo-wolf leading-snug mb-3">
        Complete each month's challenge to earn exclusive badges.
      </p>
      <Link
        href="/"
        className="block text-center bg-white border-2 border-duo-swan text-duo-blue font-extrabold text-xs uppercase tracking-wide rounded-2xl py-2.5"
      >
        Start a Lesson
      </Link>
    </div>
  );
}
