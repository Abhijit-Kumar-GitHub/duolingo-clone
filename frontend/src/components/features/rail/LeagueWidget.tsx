"use client";

import Link from "next/link";
import { Mountain } from "lucide-react";

// Reused across Learn/Shop/Quests, mirroring how real Duolingo repeats this
// exact card in its right rail on every main page. Static league name — a
// real tier system would need weekly promotion/demotion logic, out of scope
// here (the actual ranking on /leaderboard is real, seeded data).
export function LeagueWidget() {
  return (
    <div className="border border-duo-swan rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-extrabold text-duo-eel text-sm">Bronze League</p>
        <Link href="/leaderboard" className="text-xs font-extrabold text-duo-blue uppercase tracking-wide">
          View League
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-duo-fox/10 rounded-xl p-2 shrink-0">
          <Mountain className="text-duo-fox" size={22} />
        </div>
        <p className="text-xs text-duo-wolf leading-snug">
          Complete a lesson to join this week's leaderboard and compete against other learners.
        </p>
      </div>
    </div>
  );
}
