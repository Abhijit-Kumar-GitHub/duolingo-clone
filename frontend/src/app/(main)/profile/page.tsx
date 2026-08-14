"use client";

import { useEffect, useState, type ComponentType } from "react";
import { api, Profile } from "@/lib/api";
import clsx from "clsx";
import { RightRail } from "@/components/features/rail/RightRail";
import { FollowingWidget } from "@/components/features/rail/FollowingWidget";
import { Avatar } from "@/components/features/art/Avatar";
import {
  ArtIconProps, CrownIcon, FlameIcon, LeagueBadgeIcon, TargetIcon, TrophyIcon, XpIcon,
} from "@/components/features/art/icons";

// Maps the achievement rows' `icon_name` (seeded in backend/app/seed.py) onto
// the art set. Unearned badges render the same shape in the grey ramp rather
// than a separate "locked" graphic — same convention as the locked path nodes.
const ICONS: Record<string, ComponentType<ArtIconProps>> = {
  footprints: TargetIcon,
  star: CrownIcon,
  flame: FlameIcon,
  trophy: TrophyIcon,
  medal: LeagueBadgeIcon,
};

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
          <Avatar name={user.display_name} seed={user.username} size={80} isOwl />
          <div>
            <h1 className="text-2xl font-extrabold text-duo-eel">{user.display_name}</h1>
            <p className="text-duo-wolf text-sm">@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard icon={FlameIcon} label="Day streak" value={user.streak} />
          <StatCard icon={XpIcon} label="Total XP" value={user.total_xp} />
          <StatCard icon={CrownIcon} label="Skills completed" value={profile.skills_completed} />
          <StatCard icon={TargetIcon} label="Lessons completed" value={profile.lessons_completed} />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-duo-eel text-lg">Achievements</h2>
          <span className="text-xs font-extrabold text-duo-blue uppercase tracking-wide">View All</span>
        </div>
        <div className="flex flex-col divide-y divide-duo-swan border border-duo-swan rounded-2xl px-4">
          {profile.achievements.map((a) => {
            const Icon = ICONS[a.icon_name] ?? TrophyIcon;
            const pct = a.earned ? 100 : 0; // requirement progress isn't exposed by the API — earned is binary
            return (
              <div key={a.code} className="flex items-center gap-4 py-4">
                <Icon size={46} muted={!a.earned} />
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

function StatCard({ icon: Icon, label, value }: { icon: ComponentType<ArtIconProps>; label: string; value: number }) {
  return (
    <div className="border border-duo-swan rounded-2xl p-4 flex items-center gap-3">
      <Icon size={32} />
      <div>
        <p className="font-extrabold text-xl text-duo-eel leading-none">{value}</p>
        <p className="text-xs text-duo-wolf">{label}</p>
      </div>
    </div>
  );
}
