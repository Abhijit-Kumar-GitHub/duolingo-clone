"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/features/Sidebar";
import { StatsBar } from "@/components/features/StatsBar";
import { MobileNav } from "@/components/features/MobileNav";
import { useUserStore } from "@/store/useUserStore";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <StatsBar />
        <main className="flex-1 px-4 pb-20 md:pb-4">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
