import { create } from "zustand";
import { api, Exercise, LessonCompleteResult } from "@/lib/api";

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

  loadLesson: (skillId: number, currentHearts: number) => Promise<void>;
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
};

export const useLessonStore = create<LessonState>((set, get) => ({
  ...initialState,

  loadLesson: async (skillId, currentHearts) => {
    set({ ...initialState, loading: true, skillId, hearts: currentHearts });
    const lesson = await api.getLesson(skillId);
    set({ lessonId: lesson.lesson_id, exercises: lesson.exercises, loading: false });
  },

  submitAnswer: async (exerciseId, answer) => {
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
  },

  // Match Pairs has no single "check" moment — each mismatched tap should
  // still cost a heart like the other four exercise types, but without
  // swapping in the full-screen feedback bar (the exercise itself shows the
  // mismatch via a shake). Reuses the same check-answer endpoint with a
  // guaranteed-wrong sentinel purely to run its heart-loss logic.
  loseHeartForMismatch: async (exerciseId) => {
    if (get().hearts <= 0) return;
    const result = await api.checkAnswer(exerciseId, "__mismatch__");
    set({ hearts: result.hearts_remaining });
    if (result.hearts_remaining <= 0) {
      set({ isOutOfHearts: true });
    }
  },

  advance: () => {
    const { currentIndex, exercises, lessonId, correctCount, hearts } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex >= exercises.length) {
      // lesson finished — fire completion request
      api.completeLesson(lessonId!, correctCount, exercises.length, hearts).then((result) => {
        set({ isLessonComplete: true, result });
      });
      return;
    }
    set({ currentIndex: nextIndex, feedback: "idle", lastCorrectAnswer: null });
  },

  reset: () => set({ ...initialState }),
}));
