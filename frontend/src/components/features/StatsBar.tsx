"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { Logo } from "./art/Logo";
import { CoursePopover } from "./popovers/CoursePopover";
import { StreakPopover } from "./popovers/StreakPopover";
import { GemsPopover } from "./popovers/GemsPopover";
import { HeartsPopover } from "./popovers/HeartsPopover";

// Real Duolingo's top bar is just these 4 pills — daily-goal progress lives
// in the right rail's Daily Quests card instead (components/features/rail/
// DailyQuestsWidget.tsx), not up here.
export function StatsBar() {
  const user = useUserStore((s) => s.user);
  const error = useUserStore((s) => s.error);
  const fetchUser = useUserStore((s) => s.fetchUser);

  if (error) {
    return (
      <div className="flex items-center justify-end gap-2 w-full max-w-3xl mx-auto px-4 py-4 text-sm font-bold text-duo-red">
        <WifiOff size={16} /> Can't reach the server
        <button onClick={fetchUser} className="underline underline-offset-2">Retry</button>
      </div>
    );
  }

  if (!user) return <div className="h-16" />;

  return (
    <div className="flex items-center gap-4 sm:gap-6 justify-between md:justify-end w-full max-w-3xl mx-auto px-4 py-4">
      {/* Below `md` the Sidebar (and with it the wordmark) is hidden, so the
          top bar carries the brand instead — same as real Duolingo's mobile
          web header. */}
      <Link href="/" className="md:hidden" aria-label="Lingo home">
        <Logo size="sm" />
      </Link>
      <CoursePopover level={Math.floor(user.total_xp / 50) + 1} />
      <StreakPopover streak={user.streak} />
      <GemsPopover gems={user.gems} />
      <HeartsPopover hearts={user.hearts} maxHearts={user.max_hearts} onChange={fetchUser} />
    </div>
  );
}
