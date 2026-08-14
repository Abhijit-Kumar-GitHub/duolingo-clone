"use client";

import { ReactNode } from "react";
import { Check, SkipForward, Star } from "lucide-react";
import clsx from "clsx";
import { GlossyBadge, GlossyColor } from "./GlossyBadge";
import { JumpAheadBubble } from "./JumpAheadBubble";
import { ChestIcon, TrophyIcon } from "./art/icons";

export type NodeStatus = "done" | "current" | "upcoming" | "locked";
// Real Duolingo mixes two decorative stops into each unit's node run: a
// treasure chest partway through and a trophy at the very end. Neither is a
// lesson — they're inert milestones, so they never open a popup.
export type NodeKind = "lesson" | "chest" | "trophy";

const COLOR_MAP: Record<string, GlossyColor> = {
  "duo-green": "green",
  "duo-blue": "blue",
  "duo-purple": "purple",
  "duo-teal": "teal",
};

// Hex twins of the colors above, for the conic-gradient progress ring
// (which needs real color values, not Tailwind utility classes).
const RING_COLOR: Record<GlossyColor, string> = {
  green: "#58CC02", blue: "#1CB0F6", red: "#FF4B4B", yellow: "#FFC800",
  purple: "#CE82FF", teal: "#00CD9C", fox: "#FF9600", grey: "#AFAFAF",
};

// One node = one lesson stop on the path, rendered as a GlossyBadge coin
// (same construction used for every other circular badge in the app — see
// GlossyBadge.tsx). Three states, matching the real path exactly:
//
//   done     unit-coloured disc + white checkmark
//   current  unit-coloured disc + white star + a ring showing lesson progress
//   locked   grey disc + grey star
//
// A node only turns *gold* in the real app once it's been taken to Legendary,
// which is a Super feature this clone stubs out (see NodePopover.tsx) — so
// nothing here ever goes gold, and a finished node keeps its unit's colour.
//
// Every standard lesson node carries a *star*, not a per-topic glyph — the
// real app doesn't reveal what a node teaches from the path, and only
// non-lesson stops (chest, trophy) get their own artwork. Locked nodes are
// deliberately inert (no onClick, no popup); only the single "current" node
// opens its Start panel, plus "done" nodes (Practice/Legendary panel).
export function PathNode({
  status, icon: Icon = Star, colorTheme, offset, clickable, onActivate, label,
  kind = "lesson", showJump, jumpTarget, progressPct = 0, popover,
}: {
  status: NodeStatus;
  icon?: any;
  colorTheme: string;
  offset: number;
  clickable: boolean;
  onActivate?: () => void;
  label?: string;
  kind?: NodeKind;
  // The first node of a not-yet-started unit gets a "Jump here?" bubble
  // above it (real Duolingo's placement test entry point), rendered in
  // this unit's color instead of the usual muted grey.
  showJump?: boolean;
  jumpTarget?: boolean;
  // How far into this node's skill you've already banked lessons — drawn
  // as a partial ring, only meaningful on the "current" node (the only
  // one with any in-progress state to show).
  progressPct?: number;
  // The open Start / Practice panel for this node, if it's the open one.
  popover?: ReactNode;
}) {
  const color = COLOR_MAP[colorTheme] ?? "green";
  const lit = status === "done" || status === "current" || jumpTarget;
  const ringPct = Math.max(0, Math.min(1, progressPct));

  const NodeIcon =
    kind === "trophy" ? TrophyIcon
    : status === "done" ? Check
    : jumpTarget ? SkipForward
    : Icon;

  // A Start / Jump bubble floats ~44px above the disc, which would otherwise
  // land on top of the node (or unit divider) directly above it — so any node
  // carrying one claims that vertical room for itself.
  const hasBubbleAbove = showJump || (status === "current" && kind === "lesson" && !popover);

  return (
    <div
      className={clsx("relative flex justify-center", hasBubbleAbove && "mt-10")}
      // Each node's translateX makes it its own stacking context, so a later
      // sibling would paint over an open panel no matter how high the panel's
      // own z-index is — the whole node has to be lifted instead.
      style={{ transform: `translateX(${offset}px)`, zIndex: popover ? 40 : undefined }}
    >
      {status === "current" && kind === "lesson" && !popover && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white border-2 border-duo-swan text-duo-green font-extrabold text-xs uppercase tracking-wide px-4 py-1.5 rounded-xl shadow-duo-card animate-bounce-in whitespace-nowrap">
          Start
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 bg-white border-r-2 border-b-2 border-duo-swan rotate-45" />
        </div>
      )}
      {showJump && <JumpAheadBubble color={color} />}

      <button
        onClick={clickable ? onActivate : undefined}
        disabled={!clickable}
        aria-label={label}
        aria-expanded={popover ? true : undefined}
        className={clsx(
          "relative transition-transform",
          clickable && "active:translate-y-1",
          status === "current" && "animate-pop-in"
        )}
      >
        {status === "current" && kind === "lesson" && (
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

        {kind === "chest" ? (
          // The chest is the one node that isn't a disc. Real Duolingo sits
          // it *on* the path as a standalone object, which is also what
          // makes it read as "an item to open" rather than "another lesson
          // to play" — so it deliberately skips GlossyBadge entirely, and
          // gets an idle float instead of a Start bubble as its affordance.
          <span className={clsx("block", clickable && "animate-bob")}>
            <ChestIcon
              size={62}
              muted={!lit}
              className={clsx(
                "transition-transform drop-shadow-[0_3px_2px_rgba(0,0,0,0.18)]",
                clickable && "hover:scale-110"
              )}
            />
          </span>
        ) : (
          <GlossyBadge
            size="xl"
            color={color}
            muted={!lit}
            icon={NodeIcon}
            // The trophy is one of the multi-tone art SVGs, so it needs the
            // grey ramp handed to it explicitly — GlossyBadge's own `muted`
            // only recolors the disc, not a filled icon on top of it.
            iconProps={kind === "trophy" ? { muted: !lit } : undefined}
            iconSize={kind === "trophy" ? 27 : status === "done" && kind === "lesson" ? 25 : 23}
            strokeWidth={status === "done" && kind === "lesson" ? 3.5 : 2.2}
            pressable={clickable}
          />
        )}
      </button>

      {popover}
    </div>
  );
}
