"use client";

import { Flame, Gem, Heart } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";

function Pill({ icon, value, color }: { icon: React.ReactNode; value: number | string; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-extrabold text-base ${color}`}>
      {icon}
      {value}
    </div>
  );
}

export function StatsBar() {
  const user = useUserStore((s) => s.user);
  if (!user) return <div className="h-10" />;

  return (
    <div className="flex items-center gap-5 justify-end w-full max-w-3xl mx-auto px-4 py-4">
      <Pill icon={<span className="text-lg">🇪🇸</span>} value="" color="text-duo-eel" />
      <Pill icon={<Flame className="fill-duo-fox text-duo-fox" size={22} />} value={user.streak} color="text-duo-fox" />
      <Pill icon={<Gem className="fill-duo-blue text-duo-blue" size={22} />} value={user.gems} color="text-duo-blue" />
      <Link href="/practice" className="hover:opacity-80">
        <Pill icon={<Heart className="fill-duo-red text-duo-red" size={22} />} value={user.hearts} color="text-duo-red" />
      </Link>
    </div>
  );
}
