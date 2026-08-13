"use client";

import { useEffect, useState } from "react";
import { api, Profile } from "@/lib/api";
import { Flame, Trophy, Star, Award, Footprints, Medal } from "lucide-react";
import clsx from "clsx";
import { RightRail } from "@/components/features/rail/RightRail";
import { FollowingWidget } from "@/components/features/rail/FollowingWidget";

const ICONS: Record<string, any> = { footprints: Footprints, star: Star, flame: Flame, trophy: Trophy, medal: Medal };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.getProfile().then(setProfile).catch((err) => console.error("Failed to load profile", err));
  }, []);

  if (!profile) return <div className="pt-24 text-center text-duo-hare font-bold">Loading profile...</div>;
  const { user } = profile;

  return (
    <div className="flex gap-10 max-w-4xl mx-auto pt-8 pb-16">
      <div className="flex-1 min-w-0 max-w-lg">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-duo-green/10 flex items-center justify-center text-4xl">
            {user.avatar_emoji}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-duo-eel">{user.display_name}</h1>
            <p className="text-duo-wolf text-sm">@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard icon={<Flame className="text-duo-fox fill-duo-fox" />} label="Day streak" value={user.streak} />
          <StatCard icon={<Trophy className="text-duo-yellow fill-duo-yellow" />} label="Total XP" value={user.total_xp} />
          <StatCard icon={<Star className="text-duo-blue fill-duo-blue" />} label="Skills completed" value={profile.skills_completed} />
          <StatCard icon={<Award className="text-duo-purple fill-duo-purple" />} label="Lessons completed" value={profile.lessons_completed} />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-duo-eel text-lg">Achievements</h2>
          <span className="text-xs font-extrabold text-duo-blue uppercase tracking-wide">View All</span>
        </div>
        <div className="flex flex-col divide-y divide-duo-swan border border-duo-swan rounded-2xl px-4">
          {profile.achievements.map((a) => {
            const Icon = ICONS[a.icon_name] ?? Award;
            const pct = a.earned ? 100 : 0; // requirement progress isn't exposed by the API — earned is binary
            return (
              <div key={a.code} className="flex items-center gap-4 py-4">
                <div className={clsx(
                  "rounded-xl p-2.5 shrink-0",
                  a.earned ? "bg-duo-yellow/15" : "bg-duo-swan"
                )}>
                  <Icon size={24} className={a.earned ? "text-duo-yellow" : "text-duo-hare"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-extrabold text-sm text-duo-eel">{a.title}</p>
                    <span className="text-xs font-bold text-duo-wolf shrink-0 ml-2">{a.earned ? "Earned!" : "Locked"}</span>
                  </div>
                  <p className="text-xs text-duo-wolf mb-2">{a.description}</p>
                  <div className="h-2 bg-duo-swan rounded-full overflow-hidden">
                    <div className={clsx("h-full rounded-full", a.earned ? "bg-duo-yellow" : "bg-duo-hare/40")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <RightRail>
        <FollowingWidget />
      </RightRail>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="border border-duo-swan rounded-2xl p-4 flex items-center gap-3">
      {icon}
      <div>
        <p className="font-extrabold text-xl text-duo-eel leading-none">{value}</p>
        <p className="text-xs text-duo-wolf">{label}</p>
      </div>
    </div>
  );
}
