"use client";

import { Gem, Heart, Snowflake, Shirt } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

const ITEMS = [
  { icon: Heart, name: "Refill hearts", cost: 350, color: "text-duo-red", bg: "bg-duo-red/10" },
  { icon: Snowflake, name: "Streak freeze", cost: 200, color: "text-duo-blue", bg: "bg-duo-blue/10" },
  { icon: Shirt, name: "Mascot outfit", cost: 500, color: "text-duo-purple", bg: "bg-duo-purple/10" },
];

export default function ShopPage() {
  const gems = useUserStore((s) => s.user?.gems ?? 0);

  return (
    <div className="max-w-lg mx-auto pt-8 pb-16">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-duo-blue/10 rounded-full p-4 mb-3">
          <Gem className="text-duo-blue fill-duo-blue" size={36} />
        </div>
        <h1 className="text-2xl font-extrabold text-duo-eel">{gems} gems</h1>
        <p className="text-duo-wolf text-sm">Spend gems on hearts, streak protection, and more.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ITEMS.map(({ icon: Icon, name, cost, color, bg }) => (
          <div key={name} className="border border-duo-swan rounded-2xl p-4 flex flex-col items-center gap-2 text-center opacity-60">
            <div className={`${bg} rounded-full p-3`}>
              <Icon className={color} size={26} />
            </div>
            <p className="font-bold text-sm text-duo-eel">{name}</p>
            <span className="flex items-center gap-1 text-xs font-extrabold text-duo-blue">
              <Gem size={12} className="fill-duo-blue" /> {cost}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs font-extrabold uppercase tracking-wide text-duo-blue bg-duo-blue/10 px-3 py-1.5 rounded-full mt-8 mx-auto w-fit">
        Purchases coming soon — hearts already refill from the heart popover
      </p>
    </div>
  );
}
