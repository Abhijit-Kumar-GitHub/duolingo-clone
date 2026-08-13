"use client";

import { useState } from "react";
import clsx from "clsx";
import { Exercise } from "@/lib/api";

export function MultipleChoice({ exercise, disabled, onSelect }: {
  exercise: Exercise; disabled: boolean; onSelect: (answer: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const options: string[] = exercise.payload.options ?? [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          disabled={disabled}
          onClick={() => { setSelected(opt); onSelect(opt); }}
          className={clsx(
            "text-left px-5 py-4 rounded-2xl border-2 font-bold text-duo-eel transition-colors",
            selected === opt ? "border-duo-blue bg-duo-blue/10" : "border-duo-swan hover:bg-duo-snow",
            disabled && "pointer-events-none"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
