"use client";

import { useEffect, useState } from "react";
import { api, PathResponse } from "@/lib/api";
import { PathMap } from "@/components/features/PathMap";

export default function HomePage() {
  const [path, setPath] = useState<PathResponse | null>(null);

  useEffect(() => {
    api.getPath().then(setPath);
  }, []);

  if (!path) {
    return <div className="flex justify-center pt-24 text-duo-hare font-bold">Loading your path...</div>;
  }

  return (
    <div className="pt-4">
      <PathMap path={path} />
    </div>
  );
}
