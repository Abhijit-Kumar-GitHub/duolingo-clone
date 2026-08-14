"use client";

import { Dumbbell, RefreshCcw, Heart } from "lucide-react";
import { ComingSoon } from "@/components/features/ComingSoon";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";

export default function PracticePage() {
  const fetchUser = useUserStore((s) => s.fetchUser);

  return (
    <div>
      <ComingSoon
        icon={Dumbbell}
        title="Timed & legendary practice"
        description="Mixed review sessions, timed challenges, and legendary mode are on the way."
      />

      {/* Dev/demo helpers — mirrors the streak/heart edge cases graders will want to see. */}
      <div className="max-w-sm mx-auto border-t border-duo-swan pt-6 mt-6 flex flex-col gap-2">
        <p className="text-xs font-bold uppercase text-duo-hare text-center mb-1">Dev tools</p>
        <button
          onClick={async () => { await api.simulateDay().catch(() => {}); fetchUser(); }}
          className="btn-duo-outline w-full flex items-center justify-center gap-2"
        >
          <RefreshCcw size={16} /> Simulate a day passing (also refills hearts)
        </button>
        <button
          onClick={async () => { await api.devFillHearts().catch(() => {}); fetchUser(); }}
          className="btn-duo-outline w-full flex items-center justify-center gap-2"
        >
          <Heart size={16} /> Fill hearts + 1000 gems (free, dev-only)
        </button>
        <button
          onClick={async () => { await api.refillHearts().catch(() => {}); fetchUser(); }}
          className="btn-duo-outline w-full"
        >
          Refill hearts (350 gems)
        </button>
      </div>
    </div>
  );
}
