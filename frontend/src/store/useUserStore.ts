import { create } from "zustand";
import { api, User } from "@/lib/api";

interface UserState {
  user: User | null;
  loading: boolean;
  error: boolean;
  fetchUser: () => Promise<void>;
  applyLessonResult: (patch: Partial<User>) => void;
}

/** Global top-bar state: streak, XP, hearts, gems. Refetched after any
 * action that changes gamification stats (lesson complete, heart lost, refill). */
export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  error: false,
  fetchUser: async () => {
    set({ loading: true, error: false });
    try {
      const user = await api.getUser();
      set({ user, loading: false });
    } catch {
      // backend unreachable — surface a retry state instead of an unhandled rejection
      set({ loading: false, error: true });
    }
  },
  applyLessonResult: (patch) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...patch } });
  },
}));
