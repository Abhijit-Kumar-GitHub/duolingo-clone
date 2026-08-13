"use client";

import { useEffect, useState } from "react";
import { api, PathResponse } from "@/lib/api";
import { PathMap } from "@/components/features/PathMap";
import { RightRail } from "@/components/features/rail/RightRail";
import { SuperCard } from "@/components/features/rail/SuperCard";
import { LeagueWidget } from "@/components/features/rail/LeagueWidget";
import { DailyQuestsWidget } from "@/components/features/rail/DailyQuestsWidget";

export default function HomePage() {
  const [path, setPath] = useState<PathResponse | null>(null);

  useEffect(() => {
    api.getPath().then(setPath);
  }, []);

  if (!path) {
    return <div className="flex justify-center pt-24 text-duo-hare font-bold">Loading your path...</div>;
  }

  return (
    <div className="flex gap-10 max-w-4xl mx-auto pt-4">
      <div className="flex-1 min-w-0">
        <PathMap path={path} />
      </div>
      <RightRail>
        <SuperCard />
        <LeagueWidget />
        <DailyQuestsWidget />
      </RightRail>
    </div>
  );
}
