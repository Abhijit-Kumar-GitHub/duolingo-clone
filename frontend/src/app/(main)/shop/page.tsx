"use client";

import { Infinity as InfinityIcon, Snowflake, Shirt } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { GemIcon, HeartIcon } from "@/components/features/art/icons";
import { SuperBanner } from "@/components/features/rail/SuperBanner";
import { RightRail } from "@/components/features/rail/RightRail";
import { LeagueWidget } from "@/components/features/rail/LeagueWidget";
import { DailyQuestsWidget } from "@/components/features/rail/DailyQuestsWidget";

const HEARTS_ITEMS = [
  { icon: HeartIcon, name: "Refill Hearts", description: "Get full hearts so you can worry less about making mistakes in a lesson.", price: "350", color: "text-duo-red", bg: "bg-duo-red/10" },
  { icon: InfinityIcon, name: "Unlimited Hearts", description: "Never run out of hearts with Super!", price: "Free trial", color: "text-duo-blue", bg: "bg-duo-blue/10" },
];

const POWER_UP_ITEMS = [
  { icon: Snowflake, name: "Streak Freeze", description: "Streak Freeze allows your streak to remain in place for one full day of inactivity.", price: "200", color: "text-duo-blue", bg: "bg-duo-blue/10" },
  { icon: Shirt, name: "Mascot Outfit", description: "Dress up your mascot with a fresh look.", price: "500", color: "text-duo-purple", bg: "bg-duo-purple/10" },
];

function ShopRow({ icon: Icon, name, description, price, color, bg }: {
  icon: any; name: string; description: string; price: string; color: string; bg: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 opacity-75">
      <div className={`${bg} rounded-2xl p-2.5 shrink-0`}>
        <Icon className={color} size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-duo-eel">{name}</p>
        <p className="text-xs text-duo-wolf leading-snug">{description}</p>
      </div>
      <span className="shrink-0 border-2 border-duo-swan rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-duo-wolf whitespace-nowrap">
        {price === "Free trial" ? price : (
          <span className="flex items-center gap-1">
            Get for <GemIcon size={12} /> {price}
          </span>
        )}
      </span>
    </div>
  );
}

export default function ShopPage() {
  const gems = useUserStore((s) => s.user?.gems ?? 0);

  return (
    <div className="flex gap-10 max-w-4xl mx-auto pt-6 pb-16">
      <div className="flex-1 min-w-0 max-w-lg">
        <SuperBanner />

        <div className="flex items-center gap-2 justify-center mb-6 -mt-2">
          <GemIcon size={22} />
          <span className="font-extrabold text-duo-eel">{gems} gems</span>
        </div>

        <h2 className="font-extrabold text-duo-eel text-lg mb-1">Hearts</h2>
        <div className="divide-y divide-duo-swan mb-6">
          {HEARTS_ITEMS.map((item) => <ShopRow key={item.name} {...item} />)}
        </div>

        <h2 className="font-extrabold text-duo-eel text-lg mb-1">Power-Ups</h2>
        <div className="divide-y divide-duo-swan">
          {POWER_UP_ITEMS.map((item) => <ShopRow key={item.name} {...item} />)}
        </div>

        <p className="text-center text-xs font-extrabold uppercase tracking-wide text-duo-blue bg-duo-blue/10 px-3 py-1.5 rounded-full mt-8 mx-auto w-fit">
          Purchases coming soon — hearts already refill from the heart popover
        </p>
      </div>
      <RightRail>
        <LeagueWidget />
        <DailyQuestsWidget />
      </RightRail>
    </div>
  );
}
