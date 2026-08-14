"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { GemIcon } from "./art/icons";
import { useRouter } from "next/navigation";
import { api, Checkpoint, PathResponse, SkillNode, Unit } from "@/lib/api";
import { PathNode, NodeStatus } from "./PathNode";
import { NodePopover, NodePopoverMode } from "./NodePopover";
import { GuidebookButton } from "./GuidebookButton";
import { GlossyColor } from "./GlossyBadge";
import { useUserStore } from "@/store/useUserStore";

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

// One entry = one circular stop on the path. A "lesson" node maps 1:1 to a
// skill (real Duolingo's node popup counts "Lesson 2 of 4" *within* the
// node, which is exactly a skill's lesson list); trophy is a purely
// decorative end-of-unit marker, but the chest is a real checkpoint — see
// handleOpenChest below.
type Entry =
  | { kind: "lesson"; skill: SkillNode; status: NodeStatus }
  | { kind: "chest"; checkpoint: Checkpoint | null }
  | { kind: "trophy" };

function buildEntries(unit: Unit): Entry[] {
  const lessons: Entry[] = unit.skills.map((skill) => ({
    kind: "lesson" as const,
    skill,
    status:
      skill.status === "completed" ? "done"
      : skill.status === "available" ? "current"
      : "locked",
  }));
  // Chest sits roughly halfway through the unit — ceil(N/2) skills before
  // it, the rest after — matching crud.checkpoint_gate_index on the backend
  // exactly, so "which skill does opening it unlock" agrees on both sides.
  // Trophy caps the unit.
  if (lessons.length <= 1) return [...lessons, { kind: "trophy" }];
  const beforeCount = Math.ceil(lessons.length / 2);
  return [
    ...lessons.slice(0, beforeCount),
    { kind: "chest", checkpoint: unit.checkpoint },
    ...lessons.slice(beforeCount),
    { kind: "trophy" },
  ];
}

export function PathMap({ path, onRefresh }: { path: PathResponse; onRefresh?: () => void }) {
  const router = useRouter();
  const fetchUser = useUserStore((s) => s.fetchUser);
  const [openNode, setOpenNode] = useState<string | null>(null);
  const [activeUnit, setActiveUnit] = useState(0);
  const [reward, setReward] = useState<number | null>(null);
  const [openingChest, setOpeningChest] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Tapping an available chest is a one-shot action: pay out a random gem
  // reward and unlock the skill it was gating (crud.open_checkpoint does
  // both server-side, re-verifying the prerequisite skills itself rather
  // than trusting the client). A stale double-tap just 400s — the button
  // is already disabled once `openingChest` is true.
  const handleOpenChest = async (unitId: number) => {
    if (openingChest) return;
    setOpeningChest(true);
    try {
      const result = await api.openCheckpoint(unitId);
      setReward(result.gems_earned);
      setTimeout(() => setReward(null), 2800);
      fetchUser();
      onRefresh?.();
    } catch {
      // e.g. another tab already opened it — a refresh will resync the UI
    } finally {
      setOpeningChest(false);
    }
  };

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
  // The first unit you haven't touched at all — the only one that may offer
  // a jump-ahead (see the map below).
  const firstUnstartedIdx = path.units.findIndex((u) => u.skills.every((s) => s.status === "locked"));

  return (
    // The tall bottom padding is load-bearing, not cosmetic: without a
    // viewport's worth of runway below the last unit, that unit's section can
    // never scroll its top past the sticky banner's line, so the final unit's
    // banner (colour and all) would be unreachable.
    <div className="flex flex-col items-center pb-[60vh] max-w-md mx-auto">
      <div className="sticky top-0 z-20 w-full bg-white pt-2 pb-3">
        <div className={`${UNIT_BANNER[banner.color_theme] ?? "bg-duo-green"} rounded-2xl px-5 py-4 text-white shadow-duo-card flex items-center justify-between gap-3`}>
          <div className="min-w-0">
            {/* The unit label doubles as the way back out to the section
                list, and carries a back-arrow to say so — same affordance as
                the real banner. */}
            <button
              onClick={() => router.push("/sections")}
              className="flex items-center gap-1.5 text-xs font-bold uppercase opacity-90 hover:opacity-100 hover:underline underline-offset-2"
            >
              <ArrowLeft size={14} strokeWidth={3} />
              {banner.title}
            </button>
            <p className="font-extrabold text-lg truncate">{banner.description}</p>
          </div>
          <GuidebookButton />
        </div>
      </div>

      {/* Only the *next* unit offers a jump-ahead, not every locked one —
          otherwise Units 2 and 3 both show a "Jump here?" bubble at the same
          time, which the real path never does (you can only test out of the
          unit you're actually next to). */}
      {path.units.map((unit, unitIdx) => {
        const entries = buildEntries(unit);
        // Each unit's snake curve starts fresh at offset 0 rather than
        // carrying momentum over from the previous unit's ending offset.
        let globalIndex = 0;
        const unitNotStarted = unitIdx === firstUnstartedIdx;
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

                if (entry.kind === "trophy") {
                  return (
                    <PathNode
                      key={`${unit.id}-trophy-${i}`}
                      kind="trophy"
                      status={unitDone ? "done" : "locked"}
                      colorTheme={unit.color_theme}
                      offset={offset}
                      clickable={false}
                      label="Unit trophy"
                    />
                  );
                }

                if (entry.kind === "chest") {
                  const cp = entry.checkpoint;
                  const chestStatus: NodeStatus = cp?.opened ? "done" : cp?.available ? "current" : "locked";
                  return (
                    <PathNode
                      key={`${unit.id}-chest-${i}`}
                      kind="chest"
                      status={chestStatus}
                      colorTheme={unit.color_theme}
                      offset={offset}
                      clickable={!!cp?.available && !openingChest}
                      onActivate={() => handleOpenChest(unit.id)}
                      label={cp?.opened ? "Treasure chest (opened)" : cp?.available ? "Open treasure chest" : "Treasure chest"}
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

      {reward !== null && (
        <p className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-duo-eel text-white text-sm font-extrabold px-5 py-3 rounded-xl shadow-duo-card animate-pop-in z-50 flex items-center gap-2">
          <GemIcon size={18} /> +{reward} gems!
        </p>
      )}
    </div>
  );
}
