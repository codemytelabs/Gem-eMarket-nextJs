import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata = { title: "Admin · Settings" };

export default function AdminSettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Platform-wide configuration options will appear here in a future update."
      icon={Settings}
    />
  );
}
