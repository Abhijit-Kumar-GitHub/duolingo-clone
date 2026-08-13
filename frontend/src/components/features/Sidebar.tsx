"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Dumbbell, Trophy, Target, ShoppingBag, CircleUserRound, Settings,
  MoreHorizontal, GraduationCap, School, HelpCircle, LogOut,
} from "lucide-react";
import clsx from "clsx";

// Note: "Lingo" is this clone's own placeholder wordmark, styled in the same
// bold-rounded-green treatment as the original — the UX patterns are what's
// being recreated here, not the trademarked logo asset itself.
//
// Real Duolingo's sidebar icons are each a fixed brand color (not just
// grayscale-until-active) — colored glyph + text/bg tint only on the active
// item, matched here via a per-item `color` token.
//
// Full list (also used by MobileNav.tsx, which has no room for a "More"
// overflow menu so it flattens everything into one bottom bar). The desktop
// Sidebar below renders everything except Settings inline, then tucks
// Settings + a few static extras behind a "More" popover — matching real
// Duolingo's LEARN/LEADERBOARDS/QUESTS/SHOP/PROFILE + MORE structure.
export const NAV_ITEMS = [
  { href: "/", label: "Learn", icon: Home, color: "text-duo-green", bg: "bg-duo-green/10" },
  { href: "/practice", label: "Practice", icon: Dumbbell, color: "text-duo-blue", bg: "bg-duo-blue/10" },
  { href: "/leaderboard", label: "Leaderboards", icon: Trophy, color: "text-duo-yellow-dark", bg: "bg-duo-yellow/10" },
  { href: "/quests", label: "Quests", icon: Target, color: "text-duo-fox", bg: "bg-duo-fox/10" },
  { href: "/shop", label: "Shop", icon: ShoppingBag, color: "text-duo-red", bg: "bg-duo-red/10" },
  { href: "/profile", label: "Profile", icon: CircleUserRound, color: "text-duo-purple", bg: "bg-duo-purple/10" },
  { href: "/settings", label: "Settings", icon: Settings, color: "text-duo-wolf", bg: "bg-duo-swan/50" },
];

const SIDEBAR_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/settings");

export function Sidebar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = pathname === "/settings";

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-duo-swan h-screen sticky top-0 px-4 py-6 shrink-0">
      <div className="px-3 mb-8">
        <span className="text-3xl font-black text-duo-green tracking-tight">lingo</span>
      </div>
      <nav className="flex flex-col gap-1">
        {SIDEBAR_ITEMS.map(({ href, label, icon: Icon, color, bg }) => {
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

        <div className="relative">
          <button
            onClick={() => setMoreOpen((o) => !o)}
            onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
            className={clsx(
              "w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide border-2 border-transparent transition-colors",
              moreActive ? "bg-duo-swan/50 text-duo-wolf" : "text-duo-eel hover:bg-duo-snow"
            )}
          >
            <MoreHorizontal size={26} strokeWidth={moreActive ? 2.5 : 2} className="text-duo-wolf" />
            More
          </button>

          {moreOpen && <MoreMenu pathname={pathname} />}
        </div>
      </nav>

      <PromoWidget />
    </aside>
  );
}

function MoreMenu({ pathname }: { pathname: string }) {
  return (
    <div className="absolute left-full ml-2 bottom-0 w-56 bg-white border border-duo-swan rounded-2xl shadow-xl py-2 z-30 animate-pop-in">
      <MoreLink href="#" icon={GraduationCap} label="Lingo English Test" />
      <MoreLink href="#" icon={School} label="Schools" />
      <div className="my-1 border-t border-duo-swan" />
      <MoreLink href="/settings" icon={Settings} label="Settings" active={pathname === "/settings"} />
      <MoreLink href="#" icon={HelpCircle} label="Help" />
      <MoreLink href="#" icon={LogOut} label="Log Out" />
    </div>
  );
}

function MoreLink({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 px-4 py-2.5 text-sm font-bold",
        active ? "text-duo-green" : "text-duo-eel hover:bg-duo-snow"
      )}
    >
      <Icon size={18} className="text-duo-wolf" />
      {label}
    </Link>
  );
}

// Real Duolingo's sidebar pins a cross-promo widget (their chess app) at the
// bottom. This is a generic in-brand stand-in, not a copy of that specific
// promo — Coming Soon per this clone's usual placeholder convention.
function PromoWidget() {
  return (
    <div className="mt-auto border border-duo-swan rounded-2xl p-4 text-center">
      <p className="text-3xl mb-1">🃏</p>
      <p className="font-extrabold text-sm text-duo-eel leading-snug mb-1">Want to learn faster?</p>
      <p className="text-xs text-duo-wolf mb-3">Lingo makes it easy!</p>
      <button className="w-full border-2 border-duo-blue text-duo-blue font-extrabold text-xs uppercase tracking-wide rounded-2xl py-2 cursor-default">
        Try Flashcards
      </button>
    </div>
  );
}
