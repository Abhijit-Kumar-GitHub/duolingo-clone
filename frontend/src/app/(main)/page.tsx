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
  const [error, setError] = useState(false);

  const loadPath = () => {
    setError(false);
    api.getPath().then(setPath).catch(() => setError(true));
  };

  useEffect(loadPath, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 pt-24 text-center">
        <p className="text-duo-hare font-bold">Couldn't load your path — is the backend running?</p>
        <button onClick={loadPath} className="btn-duo-outline">Retry</button>
      </div>
    );
  }

  if (!path) {
    return <div className="flex justify-center pt-24 text-duo-hare font-bold">Loading your path...</div>;
  }

  return (
    <div className="flex gap-10 max-w-4xl mx-auto pt-4">
      <div className="flex-1 min-w-0">
        <PathMap path={path} onRefresh={loadPath} />
      </div>
      <RightRail>
        <SuperCard />
        <LeagueWidget />
        <DailyQuestsWidget />
      </RightRail>
    </div>
  );
}
