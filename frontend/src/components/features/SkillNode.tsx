"use client";

import { Lock, Crown, Hand, UtensilsCrossed, PawPrint, Users, Palette, Plane, Star } from "lucide-react";
import clsx from "clsx";
import { SkillNode as SkillNodeType, Unit } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Each skill keeps ONE fixed icon representing its topic (matches classic
// Duolingo skill bubbles) — status is conveyed by color/lock/crown overlay,
// not by swapping the icon out for a generic check/star.
const TOPIC_ICONS: Record<string, any> = {
  "hand-wave": Hand,
  utensils: UtensilsCrossed,
  paw: PawPrint,
  "home-heart": Users,
  palette: Palette,
  plane: Plane,
};

const COLOR_MAP: Record<string, { bg: string; shadow: string }> = {
  "duo-green": { bg: "bg-duo-green", shadow: "shadow-duo-green" },
  "duo-blue": { bg: "bg-duo-blue", shadow: "shadow-duo-blue" },
};

export function SkillNode({ skill, unit, offset }: { skill: SkillNodeType; unit: Unit; offset: number }) {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = COLOR_MAP[unit.color_theme] ?? COLOR_MAP["duo-green"];
  const locked = skill.status === "locked";
  const available = skill.status === "available";
  const TopicIcon = TOPIC_ICONS[skill.icon_name] ?? Star;

  return (
    <div className="relative flex justify-center" style={{ transform: `translateX(${offset}px)` }}>
      {available && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white border-2 border-duo-swan text-duo-green font-extrabold text-xs uppercase tracking-wide px-4 py-1.5 rounded-xl shadow-duo-card animate-bounce-in whitespace-nowrap">
          Start
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 bg-white border-r-2 border-b-2 border-duo-swan rotate-45" />
        </div>
      )}

      <button
        onClick={() => !locked && router.push(`/lesson/${skill.id}`)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={locked}
        className={clsx(
          "relative w-20 h-20 rounded-full flex items-center justify-center transition-transform",
          "active:translate-y-1",
          locked && "bg-duo-swan shadow-duo-gray cursor-not-allowed",
          !locked && `${colors.bg} ${colors.shadow}`,
          available && "animate-pop-in ring-4 ring-offset-2 ring-duo-green/30"
        )}
      >
        <TopicIcon className={locked ? "text-duo-hare" : "text-white"} size={32} strokeWidth={2.2} />

        {locked && (
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-7 h-7 flex items-center justify-center border-2 border-duo-swan">
            <Lock size={13} className="text-duo-hare" />
          </div>
        )}

        {skill.crowns > 0 && (
          <div className="absolute -bottom-2 -right-1 bg-duo-yellow rounded-full w-7 h-7 flex items-center justify-center border-2 border-white">
            <Crown size={14} className="text-white fill-white" />
          </div>
        )}
      </button>

      {showTooltip && !available && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-duo-eel text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-10">
          {locked ? "Complete the previous skill to unlock" : skill.title}
        </div>
      )}

      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-bold text-duo-wolf whitespace-nowrap">
        {skill.title}
      </span>
    </div>
  );
}
