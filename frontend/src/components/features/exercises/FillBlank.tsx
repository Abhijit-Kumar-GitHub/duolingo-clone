"use client";

import { useState } from "react";
import clsx from "clsx";
import { Exercise } from "@/lib/api";

export function FillBlank({ exercise, disabled, onSelect }: {
  exercise: Exercise; disabled: boolean; onSelect: (answer: string) => void;
}) {
  const sentence: string = exercise.payload.sentence ?? "";
  const options: string[] = exercise.payload.options ?? [];
  const [selected, setSelected] = useState<string | null>(null);

  const parts = sentence.split("___");

  return (
    <div className="flex flex-col gap-8">
      <p className="text-xl font-bold text-duo-eel text-center leading-relaxed">
        {parts[0]}
        <span className="inline-block min-w-[90px] border-b-2 border-duo-blue mx-1 text-duo-blue">
          {selected ?? "\u00A0"}
        </span>
        {parts[1]}
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {options.map((opt) => (
          <button
            key={opt}
            disabled={disabled}
            onClick={() => { setSelected(opt); onSelect(opt); }}
            className={clsx(
              "px-4 py-2 rounded-xl border-2 font-bold text-duo-eel",
              selected === opt ? "border-duo-blue bg-duo-blue/10" : "border-duo-swan hover:bg-duo-snow",
              disabled && "pointer-events-none"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
