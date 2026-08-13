import { create } from "zustand";
import { api, User } from "@/lib/api";

interface UserState {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  applyLessonResult: (patch: Partial<User>) => void;
}

/** Global top-bar state: streak, XP, hearts, gems. Refetched after any
 * action that changes gamification stats (lesson complete, heart lost, refill). */
export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    set({ loading: true });
    const user = await api.getUser();
    set({ user, loading: false });
  },
  applyLessonResult: (patch) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...patch } });
  },
}));
