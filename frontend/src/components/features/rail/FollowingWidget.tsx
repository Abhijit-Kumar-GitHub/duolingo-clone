"use client";

import { useEffect, useState } from "react";
import { ChevronRight, UserPlus, Users } from "lucide-react";
import { api, LeaderboardEntry } from "@/lib/api";

// Profile-page-only rail variant (in place of the Super/League/Quests
// widgets shown elsewhere). Friends/social is explicitly a mockable area
// per the assignment spec — this reuses the real seeded leaderboard rows
// as a stand-in "following" list rather than real follow relationships,
// which don't exist in the schema.
export function FollowingWidget() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState<"following" | "followers">("following");

  useEffect(() => {
    api.getLeaderboard().then((rows) => setEntries(rows.filter((r) => !r.is_current_user))).catch(() => {});
  }, []);

  const shown = tab === "following" ? entries.slice(0, 1) : [...entries].reverse().slice(0, 2);

  return (
    <>
      <div className="border border-duo-swan rounded-2xl p-4">
        <div className="flex rounded-xl bg-duo-snow p-1 mb-3">
          {(["following", "followers"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-xs font-extrabold uppercase tracking-wide py-1.5 rounded-lg transition-colors ${
                tab === t ? "bg-white text-duo-eel shadow-duo-card" : "text-duo-hare"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {shown.map((entry) => (
            <div key={entry.username} className="flex items-center gap-3">
              <span className="text-2xl">{entry.avatar_emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-duo-eel truncate">{entry.display_name}</p>
                <p className="text-xs text-duo-wolf">{entry.weekly_xp} XP</p>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="text-xs text-duo-wolf">Nobody here yet.</p>}
        </div>
      </div>

      <div className="border border-duo-swan rounded-2xl p-4">
        <p className="font-extrabold text-duo-eel text-sm mb-3">Add Friends</p>
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-between text-sm font-bold text-duo-eel cursor-default">
            <span className="flex items-center gap-2"><Users size={16} className="text-duo-blue" /> Find friends</span>
            <ChevronRight size={16} className="text-duo-hare" />
          </button>
          <button className="flex items-center justify-between text-sm font-bold text-duo-eel cursor-default">
            <span className="flex items-center gap-2"><UserPlus size={16} className="text-duo-green" /> Invite friends</span>
            <ChevronRight size={16} className="text-duo-hare" />
          </button>
        </div>
      </div>
    </>
  );
}
