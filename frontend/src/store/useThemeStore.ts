import { create } from "zustand";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "lingo-theme";

interface ThemeState {
  theme: Theme;
  /** True once the stored preference has been read on the client. Guards
   *  against rendering a toggle in the wrong position during hydration. */
  ready: boolean;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
  /** Called once from ThemeInit — syncs the store to whatever the inline
   *  boot script in layout.tsx already put on <html>. */
  hydrate: () => void;
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // Matches the boot script's default, so the server-rendered markup and the
  // first client render agree.
  theme: "light",
  ready: false,

  setTheme: (theme) => {
    apply(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // private mode / storage disabled — the theme still applies for this
      // session, it just won't be remembered
    }
    set({ theme });
  },

  toggle: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),

  hydrate: () => {
    // The class is already correct at this point (the boot script runs before
    // paint); this only pulls it into React state so the toggle renders in
    // the right position.
    const isDark = document.documentElement.classList.contains("dark");
    set({ theme: isDark ? "dark" : "light", ready: true });
  },
}));
