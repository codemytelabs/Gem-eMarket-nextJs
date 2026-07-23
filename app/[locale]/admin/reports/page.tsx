import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata = { title: "Admin · Reports" };

export default function AdminReportsPage() {
  return (
    <ComingSoon
      title="Reports"
      description="User-submitted reports and moderation flags will appear here once reporting is built."
      icon={FileText}
    />
  );
}
