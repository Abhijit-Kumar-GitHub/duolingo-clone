"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { BrokenHeartIcon, GemIcon } from "../art/icons";

export function OutOfHeartsModal({ onRefill }: { onRefill: () => void }) {
  const router = useRouter();

  const handleRefill = async () => {
    try {
      await api.refillHearts();
      onRefill();
    } catch {
      // not enough gems — real app would open the shop; here we just bail to the path
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 bg-duo-bg/95 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-4 animate-pop-in">
        <BrokenHeartIcon size={84} />
        <h2 className="text-2xl font-extrabold text-duo-eel">You ran out of hearts!</h2>
        <p className="text-duo-wolf">Refill your hearts with gems to keep going, or come back later — hearts regenerate over time.</p>

        <button onClick={handleRefill} className="btn-duo-blue w-full flex items-center justify-center gap-2">
          <GemIcon size={20} /> Refill for 350
        </button>
        <button onClick={() => router.push("/")} className="btn-duo-outline w-full">
          End lesson
        </button>
      </div>
    </div>
  );
}
