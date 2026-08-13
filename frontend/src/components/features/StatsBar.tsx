"use client";

import { useUserStore } from "@/store/useUserStore";
import { CoursePopover } from "./popovers/CoursePopover";
import { StreakPopover } from "./popovers/StreakPopover";
import { GemsPopover } from "./popovers/GemsPopover";
import { HeartsPopover } from "./popovers/HeartsPopover";

// Real Duolingo's top bar is just these 4 pills — daily-goal progress lives
// in the right rail's Daily Quests card instead (components/features/rail/
// DailyQuestsWidget.tsx), not up here.
export function StatsBar() {
  const user = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);

  if (!user) return <div className="h-16" />;

  return (
    <div className="flex items-center gap-6 justify-end w-full max-w-3xl mx-auto px-4 py-4">
      <CoursePopover />
      <StreakPopover streak={user.streak} />
      <GemsPopover gems={user.gems} />
      <HeartsPopover hearts={user.hearts} maxHearts={user.max_hearts} onChange={fetchUser} />
    </div>
  );
}
