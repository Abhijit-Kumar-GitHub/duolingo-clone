"use client";

import { Gem } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverPanel } from "../Popover";
import { GlossyBadge } from "../GlossyBadge";

export function GemsPopover({ gems }: { gems: number }) {
  return (
    <Popover
      trigger={
        <span className="flex items-center gap-1.5 font-extrabold text-duo-blue">
          <Gem className="fill-duo-blue text-duo-blue" size={22} />
          {gems}
        </span>
      }
    >
      <PopoverPanel className="w-64">
        <div className="flex items-center gap-3 mb-1">
          <GlossyBadge color="blue" size="sm" icon={Gem} />
          <div>
            <p className="font-extrabold text-duo-eel">Gems</p>
            <p className="text-sm text-duo-wolf">You have {gems} gems</p>
          </div>
        </div>
        <Link href="/shop" className="text-sm font-extrabold text-duo-blue mt-2 inline-block">
          GO TO SHOP
        </Link>
      </PopoverPanel>
    </Popover>
  );
}
