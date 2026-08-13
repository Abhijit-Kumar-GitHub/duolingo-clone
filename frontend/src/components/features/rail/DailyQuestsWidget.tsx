"use client";

import Link from "next/link";
import { Zap, Gift } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

// Compact rail version of the daily-goal quest card, reused on Learn/Shop.
// The full version (with the "more quests unlock soon" row) lives on the
// /quests page itself — this is just the teaser, matching how real
// Duolingo repeats a shrunk Daily Quests card outside the Quests page.
export function DailyQuestsWidget() {
  const user = useUserStore((s) => s.user);
  if (!user) return null;

  const pct = Math.min(100, Math.round((user.xp_today / Math.max(user.daily_xp_goal, 1)) * 100));

  return (
    <div className="border border-duo-swan rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-extrabold text-duo-eel text-sm">Daily Quests</p>
        <Link href="/quests" className="text-xs font-extrabold text-duo-blue uppercase tracking-wide">
          View All
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Zap className="text-duo-yellow fill-duo-yellow shrink-0" size={22} />
        <div className="flex-1">
          <p className="text-xs font-bold text-duo-eel mb-1">Earn {user.daily_xp_goal} XP</p>
          <div className="h-2.5 bg-duo-swan rounded-full overflow-hidden">
            <div className="h-full bg-duo-yellow rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="bg-duo-yellow/15 rounded-lg p-1.5 shrink-0">
          <Gift className="text-duo-fox" size={16} />
        </div>
      </div>
    </div>
  );
}
