"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Popover, PopoverPanel } from "../Popover";
import { FlagIcon, FlagCode } from "../FlagIcon";

const CURRENT_COURSE = { flag: "es" as FlagCode, name: "Spanish" };

// These aren't backed by real seeded content — clicking one shows a "coming
// soon" message, per the assignment's "one seeded language is enough /
// multiple languages can be a placeholder" allowance.
const AVAILABLE_COURSES: { flag: FlagCode; name: string }[] = [
  { flag: "fr", name: "French" },
  { flag: "de", name: "German" },
  { flag: "jp", name: "Japanese" },
  { flag: "it", name: "Italian" },
];

export function CoursePopover({ level }: { level: number }) {
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const pickComingSoon = (name: string) => {
    setNotice(`${name} isn't seeded in this demo yet — only Spanish has content.`);
    setTimeout(() => setNotice(null), 2500);
  };

  return (
    <Popover
      align="left"
      trigger={
        <span className="flex items-center gap-1.5 font-extrabold text-duo-eel">
          <FlagIcon code={CURRENT_COURSE.flag} size={22} />
          {level}
        </span>
      }
    >
      <PopoverPanel className="w-72">
        <p className="text-xs font-extrabold uppercase tracking-wide text-duo-hare mb-3">
          {adding ? "Add a new course" : "My courses"}
        </p>

        {!adding ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-duo-blue/10">
              <FlagIcon code={CURRENT_COURSE.flag} size={28} />
              <span className="flex-1 font-bold text-duo-blue">{CURRENT_COURSE.name}</span>
              <Check size={18} className="text-duo-blue" />
            </div>
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-xl border-2 border-dashed border-duo-swan text-duo-wolf font-bold hover:bg-duo-snow"
            >
              <Plus size={18} /> Add a new course
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-1">
            {AVAILABLE_COURSES.map((c) => (
              <button
                key={c.name}
                onClick={() => pickComingSoon(c.name)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-duo-snow text-left"
              >
                <FlagIcon code={c.flag} size={28} />
                <span className="font-bold text-duo-eel">{c.name}</span>
              </button>
            ))}
            <button onClick={() => setAdding(false)} className="text-xs font-bold text-duo-blue mt-2 self-start">
              ← Back
            </button>
          </div>
        )}

        {notice && <p className="text-xs text-duo-wolf bg-duo-snow rounded-lg px-3 py-2 mt-3">{notice}</p>}
      </PopoverPanel>
    </Popover>
  );
}
