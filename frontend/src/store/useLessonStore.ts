import { create } from "zustand";
import { ApiError, api, Exercise, LessonCompleteResult } from "@/lib/api";

type FeedbackState = "idle" | "correct" | "incorrect";

interface LessonState {
  skillId: number | null;
  lessonId: number | null;
  exercises: Exercise[];
  currentIndex: number;
  correctCount: number;
  hearts: number;
  feedback: FeedbackState;
  lastCorrectAnswer: string | null;
  isOutOfHearts: boolean;
  isLessonComplete: boolean;
  result: LessonCompleteResult | null;
  loading: boolean;
  loadError: boolean;
  // Replaying an already-finished node from its Practice button: the
  // completion call halves XP and skips crown/unlock progress server-side.
  practice: boolean;

  loadLesson: (skillId: number, currentHearts: number, practice?: boolean) => Promise<void>;
  submitAnswer: (exerciseId: number, answer: string) => Promise<void>;
  loseHeartForMismatch: (exerciseId: number) => Promise<void>;
  advance: () => void;
  reset: () => void;
}

const initialState = {
  skillId: null,
  lessonId: null,
  exercises: [] as Exercise[],
  currentIndex: 0,
  correctCount: 0,
  hearts: 0,
  feedback: "idle" as FeedbackState,
  lastCorrectAnswer: null,
  isOutOfHearts: false,
  isLessonComplete: false,
  result: null,
  loading: false,
  loadError: false,
  practice: false,
};

export const useLessonStore = create<LessonState>((set, get) => ({
  ...initialState,

  loadLesson: async (skillId, currentHearts, practice = false) => {
    set({ ...initialState, loading: true, skillId, hearts: currentHearts, practice });
    try {
      const lesson = await api.getLesson(skillId);
      set({ lessonId: lesson.lesson_id, exercises: lesson.exercises, loading: false });
    } catch (err) {
      // The backend refuses to deal a lesson on zero hearts (routes.py). That
      // isn't a load failure — it's the same state the player already handles
      // mid-lesson, so route it to the out-of-hearts modal rather than the
      // generic "couldn't load" screen.
      if (err instanceof ApiError && err.code === "no_hearts") {
        set({ loading: false, hearts: 0, isOutOfHearts: true });
        return;
      }
      set({ loading: false, loadError: true });
    }
  },

  submitAnswer: async (exerciseId, answer) => {
    try {
      const result = await api.checkAnswer(exerciseId, answer);
      set({
        feedback: result.correct ? "correct" : "incorrect",
        lastCorrectAnswer: result.correct_answer,
        hearts: result.hearts_remaining,
        correctCount: get().correctCount + (result.correct ? 1 : 0),
      });
      if (!result.correct && result.hearts_remaining <= 0) {
        set({ isOutOfHearts: true });
      }
    } catch {
      // network hiccup — leave feedback at "idle" so the Check button is still usable
    }
  },

  // Match Pairs has no single "check" moment — each mismatched tap should
  // still cost a heart like the other four exercise types, but without
  // swapping in the full-screen feedback bar (the exercise itself shows the
  // mismatch via a shake). Reuses the same check-answer endpoint with a
  // guaranteed-wrong sentinel purely to run its heart-loss logic.
  loseHeartForMismatch: async (exerciseId) => {
    if (get().hearts <= 0) return;
    try {
      const result = await api.checkAnswer(exerciseId, "__mismatch__");
      set({ hearts: result.hearts_remaining });
      if (result.hearts_remaining <= 0) {
        set({ isOutOfHearts: true });
      }
    } catch {
      // network hiccup — skip this heart-loss rather than crash the lesson
    }
  },

  advance: () => {
    const { currentIndex, exercises, lessonId, correctCount, hearts, practice } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex >= exercises.length) {
      // lesson finished — fire completion request
      api.completeLesson(lessonId!, correctCount, exercises.length, hearts, practice)
        .then((result) => set({ isLessonComplete: true, result }))
        .catch(() => set({ loadError: true }));
      return;
    }
    set({ currentIndex: nextIndex, feedback: "idle", lastCorrectAnswer: null });
  },

  reset: () => set({ ...initialState }),
}));
