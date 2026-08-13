"use client";

import { Check, SkipForward } from "lucide-react";
import clsx from "clsx";
import { GlossyBadge, GlossyColor } from "./GlossyBadge";
import { JumpAheadBubble } from "./JumpAheadBubble";

export type NodeStatus = "done" | "current" | "upcoming" | "locked";

const COLOR_MAP: Record<string, GlossyColor> = {
  "duo-green": "green",
  "duo-blue": "blue",
};

// Hex twins of the two colors above, for the conic-gradient progress ring
// (which needs real color values, not Tailwind utility classes).
const RING_COLOR: Record<GlossyColor, string> = {
  green: "#58CC02", blue: "#1CB0F6", red: "#FF4B4B", yellow: "#FFC800",
  purple: "#CE82FF", fox: "#FF9600", grey: "#AFAFAF",
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
  status, icon: Icon, colorTheme, offset, clickable, onClick, label, showJump, jumpTarget, progressPct = 0,
}: {
  status: NodeStatus;
  icon: any;
  colorTheme: string;
  offset: number;
  clickable: boolean;
  onClick?: () => void;
  label?: string;
  // The first node of a not-yet-started unit gets a "Jump here?" bubble
  // above it (real Duolingo's placement test entry point), rendered in
  // this unit's color instead of the usual muted grey.
  showJump?: boolean;
  jumpTarget?: boolean;
  // How far into this node's skill you've already banked lessons — drawn
  // as a partial ring, only meaningful on the "current" node (the only
  // one with any in-progress state to show).
  progressPct?: number;
}) {
  const color = COLOR_MAP[colorTheme] ?? "green";
  const lit = status === "done" || status === "current" || jumpTarget;
  const ringPct = Math.max(0, Math.min(1, progressPct));

  return (
    <div className="relative flex justify-center" style={{ transform: `translateX(${offset}px)` }}>
      {status === "current" && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white border-2 border-duo-swan text-duo-green font-extrabold text-xs uppercase tracking-wide px-4 py-1.5 rounded-xl shadow-duo-card animate-bounce-in whitespace-nowrap">
          Start
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 bg-white border-r-2 border-b-2 border-duo-swan rotate-45" />
        </div>
      )}
      {showJump && <JumpAheadBubble color={color} />}

      <button
        onClick={clickable ? onClick : undefined}
        disabled={!clickable}
        aria-label={label}
        className={clsx(
          "relative transition-transform",
          clickable && "active:translate-y-1",
          status === "current" && "animate-pop-in"
        )}
      >
        {status === "current" && (
          ringPct > 0 ? (
            // Sized bigger than the badge (not inset-x-0 / matching height)
            // so the ring's outer band sits outside the badge's own circle
            // — otherwise the opaque badge (painted after, in DOM order)
            // covers it completely since both would occupy the same box.
            <span
              className="absolute pointer-events-none"
              style={{
                left: -7, right: -7, top: -7, height: 42 + 14,
                borderRadius: "50%",
                background: `conic-gradient(${RING_COLOR[color]} ${ringPct * 360}deg, #E5E5E5 ${ringPct * 360}deg)`,
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
              }}
            />
          ) : (
            <span className="absolute inset-x-0 top-0 h-[42px] ring-4 ring-offset-2 ring-duo-green/30 pointer-events-none" style={{ borderRadius: "50%" }} />
          )
        )}

        <GlossyBadge
          size="xl"
          color={color}
          muted={!lit}
          icon={status === "done" ? Check : jumpTarget ? SkipForward : Icon}
          iconSize={status === "done" ? 25 : 23}
          strokeWidth={status === "done" ? 3.5 : 2.2}
          pressable={clickable}
        />
      </button>
    </div>
  );
}
