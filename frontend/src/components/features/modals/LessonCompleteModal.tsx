"use client";

import { useEffect, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { LessonCompleteResult } from "@/lib/api";
import { DuoOwl } from "../art/DuoOwl";
import { CrownIcon, FlameIcon, TargetIcon, XpIcon, ArtIconProps } from "../art/icons";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

// Real Duolingo's end-of-lesson stats aren't neutral bordered boxes — each
// one is a solid colour-filled card with the label reversed out in white
// across the top and the value on a white panel beneath, so the row reads as
// a set of prizes rather than a table. Colour is per-stat and fixed.
const CHIP_STYLES = {
  yellow: { shell: "bg-duo-yellow", value: "text-duo-yellow-dark" },
  fox: { shell: "bg-duo-fox", value: "text-duo-fox" },
  blue: { shell: "bg-duo-blue", value: "text-duo-blue" },
  purple: { shell: "bg-duo-purple", value: "text-duo-purple-dark" },
} as const;

type ChipColor = keyof typeof CHIP_STYLES;

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
        <DuoOwl size={128} className="mb-1" />
        <h2 className="text-2xl font-extrabold text-duo-yellow-dark">Lesson complete!</h2>
        {result.next_skill_unlocked && (
          <p className="text-duo-green font-bold text-sm">"{result.next_skill_unlocked}" unlocked!</p>
        )}

        <div className="grid grid-cols-2 gap-3 w-full my-6">
          <StatChip icon={XpIcon} color="yellow" label="Total XP" value={`+${result.xp_earned}`} />
          <StatChip icon={FlameIcon} color="fox" label="Day streak" value={result.streak} />
          <StatChip icon={CrownIcon} color="purple" label="Crowns" value={result.crowns} />
          <StatChip icon={TargetIcon} color="blue" label="Daily goal" value={result.daily_goal_met ? "Met!" : "Not yet"} />
        </div>

        <button onClick={() => router.push("/")} className="btn-duo-green w-full">
          Continue
        </button>
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, color, label, value }: {
  icon: ComponentType<ArtIconProps>;
  color: ChipColor;
  label: string;
  value: string | number;
}) {
  const c = CHIP_STYLES[color];
  return (
    <div className={clsx("rounded-2xl p-[2px] pt-0", c.shell)}>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-white py-1.5">{label}</p>
      <div className="bg-white rounded-[14px] flex items-center justify-center gap-1.5 py-2.5">
        <Icon size={20} />
        <span className={clsx("font-extrabold text-lg leading-none", c.value)}>{value}</span>
      </div>
    </div>
  );
}
