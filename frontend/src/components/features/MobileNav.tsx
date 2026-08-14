"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ACTIVE, NAV_ITEMS } from "./Sidebar";

// Mirrors real Duolingo's mobile bottom tab bar — shown only below `md`,
// where Sidebar.tsx (`hidden md:flex`) disappears entirely. Reuses the same
// NAV_ITEMS as the desktop sidebar so every route stays reachable on phone
// widths, just icon-only instead of icon+label.
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch bg-white border-t-2 border-duo-swan h-16 pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className="flex-1 flex flex-col items-center justify-center gap-0.5"
          >
            <span className={clsx("rounded-xl p-1.5 border-2 border-transparent transition-colors", active && NAV_ACTIVE)}>
              <Icon size={22} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
