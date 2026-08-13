"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Trophy, User, Settings, Dumbbell } from "lucide-react";
import clsx from "clsx";

// Note: "Lingo" is this clone's own placeholder wordmark, styled in the same
// bold-rounded-green treatment as the original — the UX patterns are what's
// being recreated here, not the trademarked logo asset itself.
const NAV_ITEMS = [
  { href: "/", label: "Learn", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/leaderboard", label: "Leaderboards", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-duo-swan h-screen sticky top-0 px-4 py-6 shrink-0">
      <div className="px-3 mb-8">
        <span className="text-3xl font-black text-duo-green tracking-tight">lingo</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide border-2 transition-colors",
                active
                  ? "bg-duo-blue/10 text-duo-blue border-duo-blue/20"
                  : "text-duo-wolf border-transparent hover:bg-duo-snow"
              )}
            >
              <Icon size={26} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
