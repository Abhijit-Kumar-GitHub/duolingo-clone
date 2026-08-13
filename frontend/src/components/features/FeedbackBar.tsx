"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";

interface Props {
  feedback: "idle" | "correct" | "incorrect";
  correctAnswer: string | null;
  canCheck: boolean;
  onCheck: () => void;
  onContinue: () => void;
}

export function FeedbackBar({ feedback, correctAnswer, canCheck, onCheck, onContinue }: Props) {
  if (feedback === "idle") {
    return (
      <div className="fixed bottom-0 left-0 right-0 border-t-2 border-duo-swan bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-end">
          <button onClick={onCheck} disabled={!canCheck} className="btn-duo-green w-full sm:w-auto">
            Check
          </button>
        </div>
      </div>
    );
  }

  const correct = feedback === "correct";
  return (
    <div
      className={clsx(
        "fixed bottom-0 left-0 right-0 border-t-2 animate-bounce-in",
        correct ? "bg-duo-green/10 border-duo-green" : "bg-duo-red/10 border-duo-red"
      )}
    >
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {correct ? (
            <CheckCircle2 className="text-duo-green shrink-0" size={32} />
          ) : (
            <XCircle className="text-duo-red shrink-0" size={32} />
          )}
          <div>
            <p className={clsx("font-extrabold", correct ? "text-duo-green-dark" : "text-duo-red-dark")}>
              {correct ? "Nicely done!" : "Correct solution:"}
            </p>
            {!correct && <p className="text-duo-eel font-bold text-sm">{correctAnswer}</p>}
          </div>
        </div>
        <button onClick={onContinue} className={correct ? "btn-duo-green" : "btn-duo-red"}>
          Continue
        </button>
      </div>
    </div>
  );
}
