"use client";

import Link from "next/link";
import { Popover, PopoverPanel } from "../Popover";
import { GemIcon } from "../art/icons";

export function GemsPopover({ gems }: { gems: number }) {
  return (
    <Popover
      trigger={
        <span className="flex items-center gap-1.5 font-extrabold text-duo-blue">
          <GemIcon size={24} />
          {gems}
        </span>
      }
    >
      <PopoverPanel className="w-64">
        <div className="flex items-center gap-3 mb-1">
          <GemIcon size={40} />
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
