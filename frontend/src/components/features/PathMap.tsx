"use client";

import { Hand, UtensilsCrossed, PawPrint, Users, Palette, Plane, Star, BookOpen, Dumbbell, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { PathResponse } from "@/lib/api";
import { PathNode, NodeStatus } from "./PathNode";
import { GuidebookButton } from "./GuidebookButton";
import { JumpAheadBubble } from "./JumpAheadBubble";

// Classic Duolingo "snake" offsets — repeats every 8 nodes, alternating
// left and right (measured off the real path: amplitude ~70px, swinging
// both directions within a single unit's worth of nodes, not a one-sided
// lean like a plain ramp-up-then-down would give).
const ZIGZAG = [0, -48, -70, -48, 0, 48, 70, 48];

const UNIT_BANNER: Record<string, string> = {
  "duo-green": "bg-duo-green",
  "duo-blue": "bg-duo-blue",
};

// Each skill's topic icon — only shown on that skill's "current" node (the
// one you're actually about to play). Every other not-yet-reached node uses
// a generic filler icon instead, matching real Duolingo (it doesn't reveal
// what a lesson is about until you get there).
const TOPIC_ICONS: Record<string, any> = {
  "hand-wave": Hand,
  utensils: UtensilsCrossed,
  paw: PawPrint,
  "home-heart": Users,
  palette: Palette,
  plane: Plane,
};

const FILLER_ICONS = [Star, BookOpen, Dumbbell];

export function PathMap({ path }: { path: PathResponse }) {
  const router = useRouter();

  // Flatten every unit's skills into individual lesson-node entries first,
  // so we know which node is the very last in each unit (→ trophy) before
  // we render anything.
  type Entry = {
    skillId: number; unitId: number; colorTheme: string; label?: string;
    status: NodeStatus; topicIcon: any; clickable: boolean;
  };

  const unitEntries: Entry[][] = path.units.map((unit) => {
    const entries: Entry[] = [];
    unit.skills.forEach((skill) => {
      const total = Math.max(skill.total_lessons, 1);
      const TopicIcon = TOPIC_ICONS[skill.icon_name] ?? Star;
      // Label the node that best identifies the skill: the current node
      // when there is one (that's the one you're about to play), otherwise
      // the last node (fully done or fully locked skills have no "current").
      const currentIndex = skill.status === "available" ? Math.min(skill.lessons_completed, total - 1) : -1;
      const labelIndex = currentIndex >= 0 ? currentIndex : total - 1;

      for (let i = 0; i < total; i++) {
        let status: NodeStatus;
        let clickable: boolean;
        if (skill.status === "completed") {
          status = "done";
          clickable = true; // tapping a finished skill replays it
        } else if (skill.status === "locked") {
          status = "locked";
          clickable = false;
        } else if (i < skill.lessons_completed) {
          status = "done";
          clickable = true;
        } else if (i === currentIndex) {
          status = "current";
          clickable = true;
        } else {
          status = "upcoming";
          clickable = false;
        }
        entries.push({
          skillId: skill.id,
          unitId: unit.id,
          colorTheme: unit.color_theme,
          label: i === labelIndex ? skill.title : undefined,
          status,
          topicIcon: TopicIcon,
          clickable,
        });
      }
    });
    return entries;
  });

  let jumpPlaced = false;

  return (
    <div className="flex flex-col items-center pb-24 max-w-md mx-auto">
      {path.units.map((unit, unitIdx) => {
        const entries = unitEntries[unitIdx];
        // Each unit's snake curve starts fresh at offset 0 rather than
        // carrying momentum over from the previous unit's ending offset.
        let globalIndex = 0;
        // A unit only offers a "jump ahead" checkpoint once you've actually
        // set foot in it (at least one skill reached) — never into a fully
        // locked future unit you haven't unlocked yet.
        const unitUnlocked = unit.skills.some((skill) => skill.status !== "locked");

        return (
          <div key={unit.id} className="w-full mb-4">
            <div className={`${UNIT_BANNER[unit.color_theme] ?? "bg-duo-green"} rounded-2xl px-5 py-4 mb-10 text-white shadow-duo-card flex items-center justify-between gap-3`}>
              <div>
                <p className="text-xs font-bold uppercase opacity-90">{unit.title}</p>
                <p className="font-extrabold text-lg">{unit.description}</p>
              </div>
              <GuidebookButton />
            </div>

            <div className="flex flex-col gap-6 items-center pb-14">
              {entries.map((entry, i) => {
                const offset = ZIGZAG[globalIndex % ZIGZAG.length];
                globalIndex += 1;

                const isUnitLast = i === entries.length - 1;
                const showFillerAsTrophy = isUnitLast && entry.status !== "done" && entry.status !== "current";
                const Icon = entry.status === "current"
                  ? entry.topicIcon
                  : showFillerAsTrophy
                    ? Trophy
                    : FILLER_ICONS[i % FILLER_ICONS.length];

                const showJump = unitUnlocked && entry.status === "locked" && !jumpPlaced;
                if (showJump) jumpPlaced = true;

                return (
                  <div key={`${entry.skillId}-${i}`} className="relative">
                    {showJump && <JumpAheadBubble />}
                    <PathNode
                      status={entry.status}
                      icon={Icon}
                      colorTheme={entry.colorTheme}
                      offset={offset}
                      clickable={entry.clickable}
                      onClick={() => router.push(`/lesson/${entry.skillId}`)}
                      label={entry.label}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
