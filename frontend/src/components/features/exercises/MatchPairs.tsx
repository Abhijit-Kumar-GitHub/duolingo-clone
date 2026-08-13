"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Exercise } from "@/lib/api";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function MatchPairs({ exercise, disabled, onSelect }: {
  exercise: Exercise; disabled: boolean; onSelect: (answer: string) => void;
}) {
  const pairs: Record<string, string> = exercise.payload.pairs ?? {};
  const left = useMemo(() => shuffle(Object.keys(pairs)), [exercise.id]);
  const right = useMemo(() => shuffle(Object.values(pairs)), [exercise.id]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mismatch, setMismatch] = useState<string | null>(null);

  const trySelect = (side: "left" | "right", value: string) => {
    if (disabled || matched.includes(value)) return;

    if (side === "left") {
      setSelectedLeft(value);
      return;
    }
    if (!selectedLeft) return;

    if (pairs[selectedLeft] === value) {
      const nextMatched = [...matched, selectedLeft, value];
      setMatched(nextMatched);
      setSelectedLeft(null);
      if (nextMatched.length === left.length + right.length) {
        // canonical answer format expected by the backend, see seed.py `match()`
        onSelect(Object.entries(pairs).map(([l, r]) => `${l}:${r}`).join(","));
      }
    } else {
      setMismatch(value);
      setTimeout(() => setMismatch(null), 400);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
      <div className="flex flex-col gap-2">
        {left.map((word) => (
          <button
            key={word}
            onClick={() => trySelect("left", word)}
            disabled={matched.includes(word)}
            className={clsx(
              "px-4 py-3 rounded-xl border-2 font-bold text-sm",
              matched.includes(word) && "opacity-0 pointer-events-none",
              selectedLeft === word ? "border-duo-blue bg-duo-blue/10" : "border-duo-swan"
            )}
          >
            {word}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {right.map((word) => (
          <button
            key={word}
            onClick={() => trySelect("right", word)}
            disabled={matched.includes(word)}
            className={clsx(
              "px-4 py-3 rounded-xl border-2 font-bold text-sm",
              matched.includes(word) && "opacity-0 pointer-events-none",
              mismatch === word && "border-duo-red bg-duo-red/10 animate-shake"
            )}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
