"use client";

import { Target } from "lucide-react";
import { Popover, PopoverPanel } from "../Popover";

const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function GoalPopover({ xpToday, goal }: { xpToday: number; goal: number }) {
  const pct = goal > 0 ? Math.min(1, xpToday / goal) : 0;
  const met = xpToday >= goal;

  return (
    <Popover
      trigger={
        <span className="flex items-center gap-1.5 font-extrabold text-duo-eel">
          <span className="relative flex items-center justify-center w-6 h-6 shrink-0">
            <svg viewBox="0 0 24 24" className="absolute inset-0 -rotate-90">
              <circle cx="12" cy="12" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="3" className="text-duo-swan" />
              <circle
                cx="12" cy="12" r={RADIUS} fill="none" strokeWidth="3" strokeLinecap="round"
                stroke="currentColor"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - pct)}
                className={met ? "text-duo-green" : "text-duo-yellow"}
              />
            </svg>
            <Target size={12} className={met ? "text-duo-green" : "text-duo-wolf"} strokeWidth={2.5} />
          </span>
          {Math.min(xpToday, goal)}/{goal}
        </span>
      }
    >
      <PopoverPanel className="w-64">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-duo-green/15 rounded-xl p-2">
            <Target className="text-duo-green" size={26} />
          </div>
          <div>
            <p className="font-extrabold text-duo-eel">Daily Goal</p>
            <p className="text-sm text-duo-wolf">
              {met ? "You hit today's goal!" : `${xpToday} / ${goal} XP today`}
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-duo-swan rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all ${met ? "bg-duo-green" : "bg-duo-yellow"}`}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </PopoverPanel>
    </Popover>
  );
}
