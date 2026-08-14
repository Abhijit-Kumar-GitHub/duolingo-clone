"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import { api, PathResponse } from "@/lib/api";

// Real Duolingo groups its course into a handful of "Sections" (each a big
// bundle of units) shown as a standalone list, reached by tapping the
// "Section N, Unit M" label on a unit banner (see PathMap.tsx). This app
// only seeds one section's worth of content — Section 2/3 are Coming Soon
// placeholders, per the assignment's allowance to mock out-of-scope content
// rather than fake real progress for it.
const FUTURE_SECTIONS = [
  { name: "Section 2", units: 3 },
  { name: "Section 3", units: 3 },
];

export default function SectionsPage() {
  const router = useRouter();
  const [path, setPath] = useState<PathResponse | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    api.getPath().then(setPath).catch(() => setPath(null));
  }, []);

  let pct = 0;
  if (path) {
    let total = 0;
    let done = 0;
    for (const unit of path.units) {
      for (const skill of unit.skills) {
        total += skill.total_lessons;
        if (skill.status === "completed") done += skill.total_lessons;
        else if (skill.status === "available") done += skill.lessons_completed;
      }
    }
    pct = total > 0 ? Math.round((done / total) * 100) : 0;
  }

  const pickComingSoon = (name: string) => {
    setNotice(`${name} isn't seeded in this demo yet — only Section 1 has content.`);
    setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto pt-4">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-duo-eel font-bold mb-6 hover:text-duo-hare"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="flex flex-col gap-4">
        <div className="bg-duo-blue/10 border border-duo-blue/20 rounded-2xl p-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-duo-blue mb-1">A1 · In progress</p>
          <h2 className="text-2xl font-extrabold text-duo-eel mb-3">Section 1</h2>
          <div className="h-3 bg-duo-card rounded-full overflow-hidden mb-1">
            <div className="h-full bg-duo-blue rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs font-bold text-duo-wolf mb-4">{pct}% complete</p>
          <button onClick={() => router.push("/")} className="btn-duo-blue">Continue</button>
        </div>

        {FUTURE_SECTIONS.map((section) => (
          <div key={section.name} className="bg-duo-snow border border-duo-swan rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-duo-card border border-duo-swan flex items-center justify-center shrink-0">
              <Lock size={18} className="text-duo-hare" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-duo-eel">{section.name}</h3>
              <p className="text-xs font-bold text-duo-hare">{section.units} units · locked</p>
            </div>
            <button
              onClick={() => pickComingSoon(section.name)}
              className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-duo-hare border-2 border-duo-swan rounded-xl px-3 py-2"
            >
              <Sparkles size={14} /> Coming soon
            </button>
          </div>
        ))}
      </div>

      {notice && (
        <p className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-duo-inverse text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-duo-card animate-pop-in z-30">
          {notice}
        </p>
      )}
    </div>
  );
}
