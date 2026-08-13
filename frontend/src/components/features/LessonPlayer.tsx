"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Heart } from "lucide-react";
import { useLessonStore } from "@/store/useLessonStore";
import { useUserStore } from "@/store/useUserStore";
import { FeedbackBar } from "./FeedbackBar";
import { MultipleChoice } from "./exercises/MultipleChoice";
import { TranslateWordBank } from "./exercises/TranslateWordBank";
import { MatchPairs } from "./exercises/MatchPairs";
import { FillBlank } from "./exercises/FillBlank";
import { TypeAnswer } from "./exercises/TypeAnswer";
import { OutOfHeartsModal } from "./modals/OutOfHeartsModal";
import { LessonCompleteModal } from "./modals/LessonCompleteModal";

const EXERCISE_COMPONENTS: Record<string, any> = {
  MULTIPLE_CHOICE: MultipleChoice,
  TRANSLATE: TranslateWordBank,
  MATCH_PAIRS: MatchPairs,
  FILL_BLANK: FillBlank,
  TYPE_ANSWER: TypeAnswer,
};

export function LessonPlayer({ skillId }: { skillId: number }) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const {
    exercises, currentIndex, hearts, feedback, lastCorrectAnswer,
    isOutOfHearts, isLessonComplete, result, loading, loadError,
    loadLesson, submitAnswer, loseHeartForMismatch, advance, reset,
  } = useLessonStore();

  const [pendingAnswer, setPendingAnswer] = useState<string>("");

  useEffect(() => {
    if (!user) { fetchUser(); return; }
    loadLesson(skillId, user.hearts);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, skillId]);

  useEffect(() => {
    // keep the top-bar heart count in sync as soon as the lesson mutates it
    if (!loading) fetchUser();
  }, [hearts]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-duo-hare font-bold">Something went wrong loading this lesson.</p>
        <div className="flex gap-3">
          <button onClick={() => loadLesson(skillId, hearts)} className="btn-duo-outline">Retry</button>
          <button onClick={() => router.push("/")} className="btn-duo-outline">Exit</button>
        </div>
      </div>
    );
  }

  if (loading || exercises.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-duo-hare font-bold">Loading lesson...</div>;
  }

  if (isOutOfHearts && !isLessonComplete) {
    return <OutOfHeartsModal onRefill={() => { useLessonStore.setState({ isOutOfHearts: false, hearts: 5 }); fetchUser(); }} />;
  }

  if (isLessonComplete && result) {
    return <LessonCompleteModal result={result} />;
  }

  const exercise = exercises[currentIndex];
  const ExerciseComponent = EXERCISE_COMPONENTS[exercise.type];
  const progressPct = Math.round((currentIndex / exercises.length) * 100);
  const answered = feedback !== "idle";

  const handleCheck = () => {
    if (!pendingAnswer) return;
    submitAnswer(exercise.id, pendingAnswer);
  };

  const handleContinue = () => {
    setPendingAnswer("");
    advance();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* header: close + progress bar + hearts */}
      <div className="flex items-center gap-4 px-4 py-4 max-w-2xl mx-auto w-full">
        <button onClick={() => router.push("/")} aria-label="Exit lesson">
          <X className="text-duo-hare hover:text-duo-wolf" size={26} />
        </button>
        <div className="flex-1 h-4 bg-duo-swan rounded-full overflow-hidden">
          <div className="h-full bg-duo-green rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center gap-1 font-extrabold text-duo-red">
          <Heart className="fill-duo-red" size={22} />
          {hearts}
        </div>
      </div>

      {/* exercise */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-4 pb-32">
        <p className="text-xs font-extrabold uppercase tracking-wide text-duo-hare mb-2">
          {exercise.type.replace("_", " ")}
        </p>
        <h1 className="text-2xl font-extrabold text-duo-eel mb-8">{exercise.prompt}</h1>
        <ExerciseComponent
          exercise={exercise}
          disabled={answered}
          onSelect={setPendingAnswer}
          onMismatch={() => loseHeartForMismatch(exercise.id)}
        />
      </div>

      <FeedbackBar
        feedback={feedback}
        correctAnswer={lastCorrectAnswer}
        canCheck={!!pendingAnswer}
        onCheck={handleCheck}
        onContinue={handleContinue}
      />
    </div>
  );
}
