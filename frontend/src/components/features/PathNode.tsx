"use client";

import { Check, Crown } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { GlossyBadge, GlossyColor } from "./GlossyBadge";

export type NodeStatus = "done" | "current" | "upcoming" | "locked";

const COLOR_MAP: Record<string, GlossyColor> = {
  "duo-green": "green",
  "duo-blue": "blue",
};

// One node = one lesson stop on the path, rendered as a GlossyBadge coin
// (same construction used for every other circular badge in the app — see
// GlossyBadge.tsx). Real Duolingo's discs stay grey/monochrome — with a
// generic filler icon — until you actually reach them; only the checkmark
// (done) or the lesson's own icon (current) breaks the grey. Locked and
// not-yet-reached nodes are deliberately inert (no onClick) — only the
// single "current" node per skill is clickable, plus "done" nodes (tapping
// a finished skill replays it, same as real Duolingo).
export function PathNode({
  status, icon: Icon, colorTheme, offset, clickable, onClick, label, crowns,
}: {
  status: NodeStatus;
  icon: any;
  colorTheme: string;
  offset: number;
  clickable: boolean;
  onClick?: () => void;
  label?: string;
  crowns?: number;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const color = COLOR_MAP[colorTheme] ?? "green";
  const lit = status === "done" || status === "current";

  return (
    <div className="relative flex justify-center" style={{ transform: `translateX(${offset}px)` }}>
      {status === "current" && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white border-2 border-duo-swan text-duo-green font-extrabold text-xs uppercase tracking-wide px-4 py-1.5 rounded-xl shadow-duo-card animate-bounce-in whitespace-nowrap">
          Start
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 bg-white border-r-2 border-b-2 border-duo-swan rotate-45" />
        </div>
      )}

      <button
        onClick={clickable ? onClick : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={!clickable}
        aria-label={label}
        className={clsx(
          "relative transition-transform",
          clickable && "active:translate-y-1",
          !clickable && "cursor-not-allowed",
          status === "current" && "animate-pop-in"
        )}
      >
        {status === "current" && (
          <span className="absolute inset-x-0 top-0 h-16 rounded-full ring-4 ring-offset-2 ring-duo-green/30 pointer-events-none" />
        )}

        <GlossyBadge
          size="xl"
          color={color}
          muted={!lit}
          icon={status === "done" ? Check : Icon}
          iconSize={status === "done" ? 28 : 26}
          strokeWidth={status === "done" ? 3.5 : 2.2}
        />

        {!!crowns && (
          <div className="absolute -bottom-2 -right-1 bg-duo-yellow rounded-full w-7 h-7 flex items-center justify-center border-2 border-white z-10">
            <Crown size={14} className="text-white fill-white" />
          </div>
        )}
      </button>

      {showTooltip && status !== "current" && label && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-duo-eel text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-10">
          {status === "locked" ? "Complete the previous skill to unlock" : label}
        </div>
      )}

      {label && (
        <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-xs font-bold text-duo-wolf whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}
