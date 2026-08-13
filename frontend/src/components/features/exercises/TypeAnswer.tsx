"use client";

import { useState } from "react";
import { Exercise } from "@/lib/api";

export function TypeAnswer({ exercise, disabled, onSelect }: {
  exercise: Exercise; disabled: boolean; onSelect: (answer: string) => void;
}) {
  const [value, setValue] = useState("");
  const hint: string = exercise.payload.hint ?? "";

  return (
    <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
      {hint && <p className="text-sm text-duo-wolf">{hint}</p>}
      <input
        autoFocus
        disabled={disabled}
        value={value}
        onChange={(e) => { setValue(e.target.value); onSelect(e.target.value); }}
        placeholder="Type your answer"
        className="border-2 border-duo-swan focus:border-duo-blue outline-none rounded-2xl px-4 py-4 font-bold text-lg text-duo-eel disabled:bg-duo-snow"
      />
    </div>
  );
}
