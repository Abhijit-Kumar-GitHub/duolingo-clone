"use client";

import { useRef, useState } from "react";

/**
 * Opens on hover (matches Duolingo's desktop stats-bar behavior) with a
 * short close delay so moving the cursor from the trigger into the panel
 * doesn't flicker closed. Also toggles on click so it still works on
 * touch devices that don't fire hover events.
 */
export function Popover({ trigger, children, align = "right" }: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <button onClick={() => setOpen((o) => !o)} className="flex items-center">
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute top-full mt-3 z-40 animate-pop-in ${align === "right" ? "right-0" : "left-0"}`}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function PopoverPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-duo-card border border-duo-swan rounded-2xl shadow-xl w-80 p-5 ${className}`}>
      {children}
    </div>
  );
}
