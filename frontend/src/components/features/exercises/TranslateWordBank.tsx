"use client";

import { useState } from "react";
import { Exercise } from "@/lib/api";

export function TranslateWordBank({ exercise, disabled, onSelect }: {
  exercise: Exercise; disabled: boolean; onSelect: (answer: string) => void;
}) {
  const bank: string[] = exercise.payload.word_bank ?? [];
  const [used, setUsed] = useState<number[]>([]); // indices into `bank`, in tap order

  const pick = (idx: number) => {
    if (disabled || used.includes(idx)) return;
    const next = [...used, idx];
    setUsed(next);
    onSelect(next.map((i) => bank[i]).join(" "));
  };

  const remove = (position: number) => {
    if (disabled) return;
    const next = used.filter((_, i) => i !== position);
    setUsed(next);
    onSelect(next.map((i) => bank[i]).join(" "));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* answer bar */}
      <div className="min-h-[52px] border-b-2 border-duo-swan flex flex-wrap gap-2 pb-3">
        {used.map((idx, position) => (
          <button
            key={position}
            onClick={() => remove(position)}
            className="px-4 py-2 rounded-xl border-2 border-duo-swan font-bold text-duo-eel bg-duo-card"
          >
            {bank[idx]}
          </button>
        ))}
      </div>

      {/* word bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((word, idx) => (
          <button
            key={idx}
            disabled={used.includes(idx) || disabled}
            onClick={() => pick(idx)}
            className="px-4 py-2 rounded-xl border-2 border-duo-swan font-bold text-duo-eel bg-duo-card disabled:opacity-0 disabled:pointer-events-none transition-opacity hover:bg-duo-snow"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
