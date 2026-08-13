import { Target } from "lucide-react";
import { ComingSoon } from "@/components/features/ComingSoon";

export default function QuestsPage() {
  return (
    <ComingSoon
      icon={Target}
      title="Daily & friend quests"
      description="Daily challenges and streak-based rewards will show up here. Check your Profile for the achievements that are already live."
    />
  );
}
