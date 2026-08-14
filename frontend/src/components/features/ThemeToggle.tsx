"use client";

import clsx from "clsx";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

/**
 * Dark-mode switch. Rendered as a menu row (in the sidebar's More popover)
 * and as a standalone setting (on /settings), so it takes the same shape as
 * the MoreLink rows next to it.
 *
 * `role="switch"` + `aria-checked` rather than a styled checkbox: it's a
 * two-state control with no form to submit, and this is the accessible
 * pattern screen readers announce correctly.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const ready = useThemeStore((s) => s.ready);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={toggle}
      // The sidebar's More popover closes when its trigger blurs. Suppressing
      // the mousedown default keeps focus where it is, so flipping the switch
      // doesn't dismiss the menu out from under you — you get to see it move.
      onMouseDown={(e) => e.preventDefault()}
      className={clsx(
        "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-duo-eel hover:bg-duo-snow transition-colors",
        className
      )}
    >
      {isDark ? <Moon size={18} className="text-duo-blue" /> : <Sun size={18} className="text-duo-wolf" />}
      <span className="flex-1 text-left">Dark mode</span>

      {/* Track + knob. Held invisible until the stored preference has been
          read, so it can't flash in the wrong position on first paint. */}
      <span
        className={clsx(
          "relative w-9 h-5 rounded-full shrink-0 transition-colors",
          isDark ? "bg-duo-blue" : "bg-duo-swan",
          !ready && "opacity-0"
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
            isDark ? "translate-x-[18px]" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}
