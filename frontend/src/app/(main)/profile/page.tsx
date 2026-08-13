"use client";

import { useEffect, useState } from "react";
import { api, Profile } from "@/lib/api";
import { Flame, Trophy, Star, Award, Footprints, Medal } from "lucide-react";
import clsx from "clsx";

const ICONS: Record<string, any> = { footprints: Footprints, star: Star, flame: Flame, trophy: Trophy, medal: Medal };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.getProfile().then(setProfile);
  }, []);

  if (!profile) return <div className="pt-24 text-center text-duo-hare font-bold">Loading profile...</div>;
  const { user } = profile;

  return (
    <div className="max-w-lg mx-auto pt-8 pb-16">
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

      <h2 className="font-extrabold text-duo-eel text-lg mb-3">Achievements</h2>
      <div className="grid grid-cols-2 gap-3">
        {profile.achievements.map((a) => {
          const Icon = ICONS[a.icon_name] ?? Award;
          return (
            <div
              key={a.code}
              className={clsx(
                "border rounded-2xl p-4 flex flex-col items-center text-center gap-1",
                a.earned ? "border-duo-yellow bg-duo-yellow/5" : "border-duo-swan opacity-50"
              )}
            >
              <Icon size={28} className={a.earned ? "text-duo-yellow" : "text-duo-hare"} />
              <span className="font-bold text-sm text-duo-eel">{a.title}</span>
              <span className="text-xs text-duo-wolf">{a.description}</span>
            </div>
          );
        })}
      </div>
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
