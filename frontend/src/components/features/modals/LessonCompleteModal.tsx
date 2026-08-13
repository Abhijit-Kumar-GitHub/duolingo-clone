"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Zap, Target, Flame, Crown } from "lucide-react";
import { LessonCompleteResult } from "@/lib/api";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export function LessonCompleteModal({ result }: { result: LessonCompleteResult }) {
  const router = useRouter();
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-4">
      {size.width > 0 && <Confetti width={size.width} height={size.height} numberOfPieces={220} recycle={false} />}

      <div className="text-center flex flex-col items-center gap-2 animate-pop-in max-w-sm w-full">
        <span className="text-6xl mb-2">🎉</span>
        <h2 className="text-2xl font-extrabold text-duo-eel">Lesson complete!</h2>
        {result.next_skill_unlocked && (
          <p className="text-duo-green font-bold text-sm mb-4">"{result.next_skill_unlocked}" unlocked!</p>
        )}

        <div className="grid grid-cols-2 gap-3 w-full my-6">
          <StatChip icon={<Zap className="text-duo-yellow fill-duo-yellow" />} label="Total XP" value={`+${result.xp_earned}`} />
          <StatChip icon={<Flame className="text-duo-fox fill-duo-fox" />} label="Day streak" value={result.streak} />
          <StatChip icon={<Crown className="text-duo-yellow fill-duo-yellow" />} label="Crowns" value={result.crowns} />
          <StatChip icon={<Target className="text-duo-blue fill-duo-blue" />} label="Daily goal" value={result.daily_goal_met ? "Met!" : "In progress"} />
        </div>

        <button onClick={() => router.push("/")} className="btn-duo-green w-full">
          Continue
        </button>
      </div>
    </div>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="border border-duo-swan rounded-2xl p-3 flex flex-col items-center gap-1">
      {icon}
      <p className="font-extrabold text-lg text-duo-eel leading-none">{value}</p>
      <p className="text-xs text-duo-wolf">{label}</p>
    </div>
  );
}
