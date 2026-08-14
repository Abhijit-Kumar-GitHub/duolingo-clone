"use client";

import { useEffect, useRef, useState } from "react";
import {
  Coffee, UtensilsCrossed, Hand, Table, User, Users, Smile, Globe, Languages,
  MessageCircle, Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PathResponse, SkillNode, Unit } from "@/lib/api";
import { PathNode, NodeStatus, NodeKind } from "./PathNode";
import { NodePopover, NodePopoverMode } from "./NodePopover";
import { GuidebookButton } from "./GuidebookButton";
import { GlossyColor } from "./GlossyBadge";

// Classic Duolingo "snake" offsets — repeats every 8 nodes, alternating
// left and right (measured off the real path: amplitude ~70px, swinging
// both directions within a single unit's worth of nodes, not a one-sided
// lean like a plain ramp-up-then-down would give).
const ZIGZAG = [0, -48, -70, -48, 0, 48, 70, 48];

const UNIT_BANNER: Record<string, string> = {
  "duo-green": "bg-duo-green",
  "duo-blue": "bg-duo-blue",
  "duo-purple": "bg-duo-purple",
  "duo-teal": "bg-duo-teal",
};

const POPOVER_COLOR: Record<string, GlossyColor> = {
  "duo-green": "green",
  "duo-blue": "blue",
  "duo-purple": "purple",
  "duo-teal": "teal",
};

// Each skill's topic icon — only shown on that skill's "current" node (the
// one you're actually about to play). Every other not-yet-reached node uses
// a generic star instead, matching real Duolingo (it doesn't reveal what a
// node is about until you get there).
const TOPIC_ICONS: Record<string, any> = {
  coffee: Coffee,
  utensils: UtensilsCrossed,
  "hand-wave": Hand,
  table: Table,
  user: User,
  message: MessageCircle,
  smile: Smile,
  globe: Globe,
  languages: Languages,
  "home-heart": Users,
};

// One entry = one circular stop on the path. A "lesson" node maps 1:1 to a
// skill (real Duolingo's node popup counts "Lesson 2 of 4" *within* the
// node, which is exactly a skill's lesson list); chest and trophy are inert
// milestone stops the real path mixes in.
type Entry =
  | { kind: "lesson"; skill: SkillNode; status: NodeStatus }
  | { kind: "chest" | "trophy" };

function buildEntries(unit: Unit): Entry[] {
  const lessons: Entry[] = unit.skills.map((skill) => ({
    kind: "lesson" as const,
    skill,
    status:
      skill.status === "completed" ? "done"
      : skill.status === "available" ? "current"
      : "locked",
  }));
  // Chest sits just before the unit's final node, trophy caps the unit —
  // giving the 4-skill units the same 6-stop shape as the real app's.
  if (lessons.length <= 1) return [...lessons, { kind: "trophy" }];
  return [
    ...lessons.slice(0, -1),
    { kind: "chest" },
    lessons[lessons.length - 1],
    { kind: "trophy" },
  ];
}

export function PathMap({ path }: { path: PathResponse }) {
  const router = useRouter();
  const [openNode, setOpenNode] = useState<string | null>(null);
  const [activeUnit, setActiveUnit] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // The banner is sticky and swaps to whichever unit currently owns the top
  // of the viewport — so scrolling out of Unit 1 hands the guidebook bar over
  // to Unit 2, colour and all, exactly like the real app.
  useEffect(() => {
    const onScroll = () => {
      const line = 96; // a little below the sticky banner's own top edge
      let idx = 0;
      sectionRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) idx = i;
      });
      setActiveUnit(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [path.units.length]);

  const banner = path.units[activeUnit] ?? path.units[0];

  return (
    // The tall bottom padding is load-bearing, not cosmetic: without a
    // viewport's worth of runway below the last unit, that unit's section can
    // never scroll its top past the sticky banner's line, so the final unit's
    // banner (colour and all) would be unreachable.
    <div className="flex flex-col items-center pb-[60vh] max-w-md mx-auto">
      <div className="sticky top-0 z-20 w-full bg-white pt-2 pb-3">
        <div className={`${UNIT_BANNER[banner.color_theme] ?? "bg-duo-green"} rounded-2xl px-5 py-4 text-white shadow-duo-card flex items-center justify-between gap-3`}>
          <div className="min-w-0">
            <button
              onClick={() => router.push("/sections")}
              className="text-xs font-bold uppercase opacity-90 hover:opacity-100 hover:underline underline-offset-2"
            >
              {banner.title}
            </button>
            <p className="font-extrabold text-lg truncate">{banner.description}</p>
          </div>
          <GuidebookButton />
        </div>
      </div>

      {path.units.map((unit, unitIdx) => {
        const entries = buildEntries(unit);
        // Each unit's snake curve starts fresh at offset 0 rather than
        // carrying momentum over from the previous unit's ending offset.
        let globalIndex = 0;
        // A not-yet-started unit (no skill reached at all) gets a single
        // "Jump here?" checkpoint above its very first node.
        const unitNotStarted = unit.skills.every((s) => s.status === "locked");
        const unitDone = unit.skills.every((s) => s.status === "completed");
        const popColor = POPOVER_COLOR[unit.color_theme] ?? "green";

        return (
          <div
            key={unit.id}
            ref={(el) => { sectionRefs.current[unitIdx] = el; }}
            className="w-full"
          >
            {/* Every unit past the first announces itself with a labelled
                rule, so you can see what's coming while still finishing the
                unit above it. Unit 1 doesn't need one — the banner says it. */}
            {unitIdx > 0 && (
              <div className="flex items-center gap-4 px-2 py-8">
                <span className="h-px flex-1 bg-duo-swan" />
                <span className="text-sm font-bold text-duo-hare text-center">{unit.description}</span>
                <span className="h-px flex-1 bg-duo-swan" />
              </div>
            )}

            <div className="flex flex-col gap-6 items-center pb-10">
              {entries.map((entry, i) => {
                const offset = ZIGZAG[globalIndex % ZIGZAG.length];
                globalIndex += 1;

                if (entry.kind !== "lesson") {
                  return (
                    <PathNode
                      key={`${unit.id}-${entry.kind}-${i}`}
                      kind={entry.kind as NodeKind}
                      status={unitDone ? "done" : "locked"}
                      icon={Star}
                      colorTheme={unit.color_theme}
                      offset={offset}
                      clickable={false}
                      label={entry.kind === "chest" ? "Treasure chest" : "Unit trophy"}
                    />
                  );
                }

                const { skill, status } = entry;
                const nodeKey = `${unit.id}-${skill.id}`;
                const isOpen = openNode === nodeKey;
                const clickable = status === "done" || status === "current";
                const jumpTarget = unitNotStarted && i === 0;
                const mode: NodePopoverMode = status === "done" ? "practice" : "start";

                return (
                  <PathNode
                    key={nodeKey}
                    kind="lesson"
                    status={status}
                    icon={status === "current" ? (TOPIC_ICONS[skill.icon_name] ?? Star) : Star}
                    colorTheme={unit.color_theme}
                    offset={offset}
                    clickable={clickable}
                    onActivate={() => setOpenNode(isOpen ? null : nodeKey)}
                    label={skill.title}
                    showJump={jumpTarget}
                    jumpTarget={jumpTarget}
                    progressPct={status === "current" ? skill.lessons_completed / Math.max(skill.total_lessons, 1) : 0}
                    popover={isOpen ? (
                      <NodePopover
                        color={popColor}
                        unitTitle={unit.description}
                        mode={mode}
                        lessonNumber={Math.min(skill.lessons_completed + 1, skill.total_lessons)}
                        lessonTotal={skill.total_lessons}
                        xpReward={skill.xp_reward}
                        onStart={() => router.push(`/lesson/${skill.id}`)}
                        onPractice={() => router.push(`/lesson/${skill.id}?practice=1`)}
                        onClose={() => setOpenNode(null)}
                      />
                    ) : undefined}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
