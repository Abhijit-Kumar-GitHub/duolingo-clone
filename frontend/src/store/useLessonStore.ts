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
