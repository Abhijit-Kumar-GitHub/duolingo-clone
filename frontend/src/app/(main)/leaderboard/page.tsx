"use client";

import { useEffect, useState } from "react";
import { api, LeaderboardEntry } from "@/lib/api";
import { Trophy } from "lucide-react";
import clsx from "clsx";
import { RightRail } from "@/components/features/rail/RightRail";
import { DailyQuestsWidget } from "@/components/features/rail/DailyQuestsWidget";

const MEDAL_COLOR = ["text-duo-yellow", "text-duo-hare", "text-duo-fox"];

// Static tier ladder — real promotion/demotion between leagues would need a
// weekly-rollover job, out of scope; the seeded user is always "in" Bronze.
const LEAGUES = ["Bronze", "Silver", "Gold", "Sapphire", "Ruby"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api.getLeaderboard().then(setEntries).catch((err) => console.error("Failed to load leaderboard", err));
  }, []);

  return (
    <div className="flex gap-10 max-w-4xl mx-auto pt-6 pb-16">
      <div className="flex-1 min-w-0 max-w-lg">
      <div className="flex items-center justify-center gap-3 mb-6">
        {LEAGUES.map((league) => (
          <div
            key={league}
            title={league}
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center border-2",
              league === "Bronze" ? "bg-duo-fox/15 border-duo-fox" : "bg-duo-swan/60 border-transparent opacity-60"
            )}
          >
            <Trophy size={18} className={league === "Bronze" ? "text-duo-fox" : "text-duo-hare"} />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center text-center mb-6">
        <div className="bg-duo-yellow/15 rounded-full p-4 mb-3">
          <Trophy className="text-duo-yellow" size={40} />
        </div>
        <h1 className="text-2xl font-extrabold text-duo-eel">Bronze League</h1>
        <p className="text-duo-wolf text-sm">Top learners this week</p>
      </div>

      <div className="border border-duo-swan rounded-2xl divide-y divide-duo-swan overflow-hidden">
        {entries.map((entry) => (
          <div
            key={entry.username}
            className={clsx(
              "flex items-center gap-4 px-4 py-3",
              entry.is_current_user && "bg-duo-blue/5"
            )}
          >
            <span className={clsx("w-6 text-center font-extrabold", entry.rank <= 3 ? MEDAL_COLOR[entry.rank - 1] : "text-duo-wolf")}>
              {entry.rank}
            </span>
            <span className="text-2xl">{entry.avatar_emoji}</span>
            <span className={clsx("flex-1 font-bold", entry.is_current_user ? "text-duo-blue" : "text-duo-eel")}>
              {entry.display_name}
              {entry.is_current_user && " (You)"}
            </span>
            <span className="font-bold text-duo-wolf text-sm">{entry.weekly_xp} XP</span>
          </div>
        ))}
      </div>
      </div>
      <RightRail>
        <DailyQuestsWidget />
      </RightRail>
    </div>
  );
}
