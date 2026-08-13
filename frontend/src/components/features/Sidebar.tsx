"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Trophy, Target, ShoppingBag, CircleUserRound, Settings } from "lucide-react";
import clsx from "clsx";

// Note: "Lingo" is this clone's own placeholder wordmark, styled in the same
// bold-rounded-green treatment as the original — the UX patterns are what's
// being recreated here, not the trademarked logo asset itself.
//
// Real Duolingo's sidebar icons are each a fixed brand color (not just
// grayscale-until-active) — colored glyph + text/bg tint only on the active
// item, matched here via a per-item `color` token.
export const NAV_ITEMS = [
  { href: "/", label: "Learn", icon: Home, color: "text-duo-green", bg: "bg-duo-green/10" },
  { href: "/practice", label: "Practice", icon: Dumbbell, color: "text-duo-blue", bg: "bg-duo-blue/10" },
  { href: "/leaderboard", label: "Leaderboards", icon: Trophy, color: "text-duo-yellow-dark", bg: "bg-duo-yellow/10" },
  { href: "/quests", label: "Quests", icon: Target, color: "text-duo-fox", bg: "bg-duo-fox/10" },
  { href: "/shop", label: "Shop", icon: ShoppingBag, color: "text-duo-red", bg: "bg-duo-red/10" },
  { href: "/profile", label: "Profile", icon: CircleUserRound, color: "text-duo-purple", bg: "bg-duo-purple/10" },
  { href: "/settings", label: "Settings", icon: Settings, color: "text-duo-wolf", bg: "bg-duo-swan/50" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-duo-swan h-screen sticky top-0 px-4 py-6 shrink-0">
      <div className="px-3 mb-8">
        <span className="text-3xl font-black text-duo-green tracking-tight">lingo</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, color, bg }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide border-2 border-transparent transition-colors",
                active ? `${bg} ${color}` : "text-duo-eel hover:bg-duo-snow"
              )}
            >
              <Icon size={26} strokeWidth={active ? 2.5 : 2} className={color} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
