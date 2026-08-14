"use client";

import { useEffect, useState } from "react";
import { Infinity as InfinityIcon } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { Popover, PopoverPanel } from "../Popover";
import { GemIcon, HeartIcon } from "../art/icons";

function formatCountdown(seconds: number | null): string {
  if (seconds === null) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function HeartsPopover({ hearts, maxHearts, onChange }: {
  hearts: number; maxHearts: number; onChange: () => void;
}) {
  const [nextIn, setNextIn] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    api.getHearts().then((h) => setNextIn(h.next_heart_in_seconds)).catch(() => {});
  }, [hearts]);

  const refill = async () => {
    try {
      await api.refillHearts();
      onChange();
    } catch {
      setNotice("Not enough gems to refill right now.");
      setTimeout(() => setNotice(null), 2500);
    }
  };

  const comingSoon = () => {
    setNotice("Unlimited hearts (Super) isn't wired up in this demo.");
    setTimeout(() => setNotice(null), 2500);
  };

  const full = hearts >= maxHearts;

  return (
    <Popover
      trigger={
        <span className="flex items-center gap-1.5 font-extrabold text-duo-red">
          <HeartIcon size={24} muted={hearts === 0} />
          {hearts}
        </span>
      }
    >
      <PopoverPanel className="text-center">
        <p className="font-extrabold text-duo-eel mb-3">Hearts</p>
        <div className="flex justify-center gap-1.5 mb-3">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <HeartIcon key={i} size={28} muted={i >= hearts} />
          ))}
        </div>

        {full ? (
          <p className="text-sm text-duo-wolf mb-4">Hearts are full — keep on learning!</p>
        ) : (
          <p className="text-sm mb-4">
            <span className="font-extrabold text-duo-red">Next heart in {formatCountdown(nextIn)}</span>
          </p>
        )}

        <div className="flex flex-col gap-2 text-left">
          <button onClick={comingSoon} className="flex items-center justify-between border border-duo-swan rounded-xl px-4 py-3 hover:bg-duo-snow">
            <span className="flex items-center gap-2 font-bold text-sm text-duo-eel">
              <InfinityIcon size={18} className="text-duo-purple" /> Unlimited hearts
            </span>
            <span className="text-xs font-extrabold text-duo-purple">FREE TRIAL</span>
          </button>
          <button
            onClick={refill}
            disabled={full}
            className="flex items-center justify-between border border-duo-swan rounded-xl px-4 py-3 hover:bg-duo-snow disabled:opacity-40"
          >
            <span className="flex items-center gap-2 font-bold text-sm text-duo-eel">
              <HeartIcon size={18} /> Refill hearts
            </span>
            <span className="flex items-center gap-1 text-xs font-extrabold text-duo-blue">
              <GemIcon size={14} /> 350
            </span>
          </button>
        </div>

        {notice && <p className={clsx("text-xs text-duo-wolf bg-duo-snow rounded-lg px-3 py-2 mt-3")}>{notice}</p>}
      </PopoverPanel>
    </Popover>
  );
}
