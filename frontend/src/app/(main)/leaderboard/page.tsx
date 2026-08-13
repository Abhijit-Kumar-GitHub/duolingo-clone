"use client";

import { useEffect, useState } from "react";
import { api, LeaderboardEntry } from "@/lib/api";
import { Trophy } from "lucide-react";
import clsx from "clsx";

const MEDAL_COLOR = ["text-duo-yellow", "text-duo-hare", "text-duo-fox"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api.getLeaderboard().then(setEntries);
  }, []);

  return (
    <div className="max-w-lg mx-auto pt-6 pb-16">
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
  );
}
