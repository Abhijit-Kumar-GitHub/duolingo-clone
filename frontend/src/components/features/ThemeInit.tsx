"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

/**
 * Pulls the already-applied theme into the Zustand store on mount.
 *
 * The class itself is set *before* this runs, by the inline script in
 * layout.tsx — doing it in an effect would mean one painted frame of the
 * wrong theme (a white flash on every load for a dark-mode user). This
 * component only reconciles React state with what's already on the DOM.
 */
export function ThemeInit() {
  const hydrate = useThemeStore((s) => s.hydrate);
  useEffect(() => hydrate(), [hydrate]);
  return null;
}
