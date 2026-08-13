"use client";

import { useUserStore } from "@/store/useUserStore";
import { CoursePopover } from "./popovers/CoursePopover";
import { StreakPopover } from "./popovers/StreakPopover";
import { GoalPopover } from "./popovers/GoalPopover";
import { GemsPopover } from "./popovers/GemsPopover";
import { HeartsPopover } from "./popovers/HeartsPopover";

export function StatsBar() {
  const user = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);

  if (!user) return <div className="h-16" />;

  return (
    <div className="flex items-center gap-6 justify-end w-full max-w-3xl mx-auto px-4 py-4">
      <CoursePopover />
      <StreakPopover streak={user.streak} />
      <GoalPopover xpToday={user.xp_today} goal={user.daily_xp_goal} />
      <GemsPopover gems={user.gems} />
      <HeartsPopover hearts={user.hearts} maxHearts={user.max_hearts} onChange={fetchUser} />
    </div>
  );
}
