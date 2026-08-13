import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/features/ComingSoon";

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Settings"
      description="Account, notifications, and Super subscription settings will live here."
    />
  );
}
