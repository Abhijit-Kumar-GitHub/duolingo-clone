"use client";

import { Zap, Gift, Lock } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { RightRail } from "@/components/features/rail/RightRail";
import { MonthlyChallengeCard } from "@/components/features/rail/MonthlyChallengeCard";

function hoursUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 3_600_000));
}

export default function QuestsPage() {
  const user = useUserStore((s) => s.user);
  if (!user) return null;

  const pct = Math.min(100, Math.round((user.xp_today / Math.max(user.daily_xp_goal, 1)) * 100));

  return (
    <div className="flex gap-10 max-w-4xl mx-auto pt-6 pb-16">
      <div className="flex-1 min-w-0 max-w-lg">
        <div className="bg-duo-purple rounded-2xl px-6 py-5 text-white mb-8">
          <p className="text-xl font-extrabold mb-1">Welcome Back!</p>
          <p className="text-sm text-white/90">Complete quests to earn rewards!</p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-duo-eel text-lg">Daily Quests</h2>
          <span className="text-xs font-extrabold text-duo-wolf uppercase tracking-wide">
            {hoursUntilMidnight()} hours
          </span>
        </div>

        <div className="border border-duo-swan rounded-2xl p-4 flex items-center gap-3 mb-3">
          <Zap className="text-duo-yellow fill-duo-yellow shrink-0" size={26} />
          <div className="flex-1">
            <p className="font-bold text-sm text-duo-eel mb-1.5">Earn {user.daily_xp_goal} XP</p>
            <div className="h-3 bg-duo-swan rounded-full overflow-hidden">
              <div className="h-full bg-duo-yellow rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-duo-wolf mt-1">{Math.min(user.xp_today, user.daily_xp_goal)} / {user.daily_xp_goal}</p>
          </div>
          <div className="bg-duo-yellow/15 rounded-lg p-2 shrink-0">
            <Gift className="text-duo-fox" size={20} />
          </div>
        </div>

        <div className="border border-duo-swan rounded-2xl p-4 flex items-center gap-3 opacity-50">
          <div className="bg-duo-swan rounded-full p-2 shrink-0">
            <Lock className="text-duo-hare" size={18} />
          </div>
          <p className="text-sm font-bold text-duo-wolf">More quests unlock soon</p>
        </div>
      </div>

      <RightRail>
        <MonthlyChallengeCard />
      </RightRail>
    </div>
  );
}
