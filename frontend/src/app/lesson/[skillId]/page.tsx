import { Suspense } from "react";
import { LessonPlayer } from "@/components/features/LessonPlayer";

// LessonPlayer reads ?practice=1 via useSearchParams, which Next requires to
// sit under a Suspense boundary (otherwise `next build` bails on this route).
export default function LessonPage({ params }: { params: { skillId: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-duo-hare font-bold">Loading lesson...</div>}>
      <LessonPlayer skillId={Number(params.skillId)} />
    </Suspense>
  );
}
