"use client";

import { useEffect, useRef, useState } from "react";
import { GlossyColor } from "./GlossyBadge";

// Card background per unit color — the popup is painted in the unit's own
// color in the real app (green Unit 1, purple Unit 2, teal Unit 3).
const CARD_BG: Record<GlossyColor, string> = {
  green: "#58CC02", blue: "#1CB0F6", purple: "#CE82FF", teal: "#00CD9C",
  red: "#FF4B4B", yellow: "#FFC800", fox: "#FF9600", grey: "#E5E5E5",
};

// Button label text picks up the same color so the white button reads as
// "cut out" of the card, matching Duolingo's treatment.
export type NodePopoverMode = "start" | "practice";

/**
 * The panel that opens when you tap a path node. Two variants, mirroring the
 * real app:
 *  - "start"    — the current node: unit name, "Lesson N of M", START +XP
 *  - "practice" — an already-finished node: PRACTICE at half XP, plus the
 *                 gold LEGENDARY upsell (a Super feature, so Coming Soon here)
 * Locked nodes deliberately open nothing at all — they're inert.
 */
export function NodePopover({
  color, unitTitle, mode, lessonNumber, lessonTotal, xpReward, onStart, onPractice, onClose,
}: {
  color: GlossyColor;
  unitTitle: string;
  mode: NodePopoverMode;
  lessonNumber?: number;
  lessonTotal?: number;
  xpReward: number;
  onStart?: () => void;
  onPractice?: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [legendaryNote, setLegendaryNote] = useState(false);
  const bg = CARD_BG[color];

  // Dismiss on outside click / Escape, so only one node panel is ever open
  // and it doesn't trap the page.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    // defer: the click that opened this panel is still bubbling right now
    const t = setTimeout(() => document.addEventListener("mousedown", onDown), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[270px] rounded-2xl px-4 pt-3 pb-4 z-30 animate-pop-in text-left"
      style={{ backgroundColor: bg }}
    >
      {/* tail pointing up at the node */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 rounded-sm"
        style={{ backgroundColor: bg }}
      />

      <p className="font-extrabold text-white text-lg leading-tight">{unitTitle}</p>

      {mode === "start" ? (
        <>
          <p className="text-white/85 font-bold text-sm mt-0.5 mb-3">
            Lesson {lessonNumber} of {lessonTotal}
          </p>
          <button
            onClick={onStart}
            className="w-full bg-white rounded-xl py-3 font-extrabold text-sm uppercase tracking-wide shadow-duo-card active:translate-y-0.5 transition-transform"
            style={{ color: bg }}
          >
            Start +{xpReward} XP
          </button>
        </>
      ) : (
        <>
          <p className="text-white/85 font-bold text-sm mt-0.5 mb-3">
            Prove your proficiency with Legendary
          </p>
          <button
            onClick={onPractice}
            className="w-full bg-white rounded-xl py-3 font-extrabold text-sm uppercase tracking-wide shadow-duo-card active:translate-y-0.5 transition-transform mb-2"
            style={{ color: bg }}
          >
            Practice +{Math.max(1, Math.floor(xpReward / 2))} XP
          </button>
          <button
            onClick={() => setLegendaryNote((v) => !v)}
            className="w-full rounded-xl py-3 font-extrabold text-sm uppercase tracking-wide text-white bg-duo-yellow shadow-duo-yellow active:translate-y-0.5 transition-transform"
          >
            Legendary +{xpReward * 4} XP
          </button>
          {legendaryNote && (
            <p className="mt-2 text-xs font-bold text-white/90 bg-black/15 rounded-lg px-3 py-2">
              Legendary is a Super feature — coming soon in this demo.
            </p>
          )}
        </>
      )}
    </div>
  );
}
