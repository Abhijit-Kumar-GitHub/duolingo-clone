"use client";

import { PathResponse } from "@/lib/api";
import { SkillNode } from "./SkillNode";

// Classic Duolingo "snake" offsets — repeats every 6 nodes.
const ZIGZAG = [0, 64, 96, 64, 0, -64, -96, -64];

const UNIT_BANNER: Record<string, string> = {
  "duo-green": "bg-duo-green",
  "duo-blue": "bg-duo-blue",
};

export function PathMap({ path }: { path: PathResponse }) {
  let globalIndex = 0;

  return (
    <div className="flex flex-col items-center pb-24 max-w-md mx-auto">
      {path.units.map((unit) => (
        <div key={unit.id} className="w-full mb-4">
          <div className={`${UNIT_BANNER[unit.color_theme] ?? "bg-duo-green"} rounded-2xl px-5 py-4 mb-10 text-white shadow-duo-card`}>
            <p className="text-xs font-bold uppercase opacity-90">{unit.title}</p>
            <p className="font-extrabold text-lg">{unit.description}</p>
          </div>

          <div className="flex flex-col gap-24 items-center pb-14">
            {unit.skills.map((skill) => {
              const offset = ZIGZAG[globalIndex % ZIGZAG.length];
              globalIndex += 1;
              return <SkillNode key={skill.id} skill={skill} unit={unit} offset={offset} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
