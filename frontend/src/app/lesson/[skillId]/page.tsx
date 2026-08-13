import { LessonPlayer } from "@/components/features/LessonPlayer";

export default function LessonPage({ params }: { params: { skillId: string } }) {
  return <LessonPlayer skillId={Number(params.skillId)} />;
}
