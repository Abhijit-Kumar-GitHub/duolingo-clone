"use client";

import { useEffect, useState } from "react";
import { Flame, Lock } from "lucide-react";
import clsx from "clsx";
import { api, DayActivity } from "@/lib/api";
import { Popover, PopoverPanel } from "../Popover";

export function StreakPopover({ streak }: { streak: number }) {
  const [days, setDays] = useState<DayActivity[] | null>(null);

  useEffect(() => {
    api.getWeeklyActivity().then(setDays);
  }, []);

  return (
    <Popover
      trigger={
        <span className="flex items-center gap-1.5 font-extrabold text-duo-fox">
          <Flame className={streak > 0 ? "fill-duo-fox text-duo-fox" : "text-duo-hare"} size={22} />
          {streak}
        </span>
      }
    >
      <PopoverPanel>
        <div className={clsx("rounded-2xl p-4 -m-1 mb-4", streak > 0 ? "bg-duo-fox/10" : "bg-duo-snow")}>
          <p className="font-extrabold text-lg text-duo-eel">{streak} day streak</p>
          <p className="text-sm text-duo-wolf mt-1">
            {streak > 0 ? "Keep it up — do a lesson today to extend it!" : "Do a lesson today to start a new streak!"}
          </p>

          <div className="flex justify-between mt-4">
            {(days ?? Array(7).fill(null)).map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-duo-wolf">{d?.day_label ?? "-"}</span>
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    d?.active ? "bg-duo-fox" : "bg-white border-2 border-duo-swan",
                    d?.is_today && !d?.active && "border-duo-fox"
                  )}
                >
                  {d?.active && <Flame size={14} className="text-white fill-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 border border-duo-swan rounded-2xl p-3">
          <div className="bg-duo-snow rounded-full p-2">
            <Lock size={18} className="text-duo-hare" />
          </div>
          <div>
            <p className="font-bold text-sm text-duo-eel">Streak Society</p>
            <p className="text-xs text-duo-wolf">Reach a 7 day streak to unlock exclusive rewards.</p>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  );
}
