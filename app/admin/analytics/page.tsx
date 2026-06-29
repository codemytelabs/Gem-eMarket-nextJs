import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata = { title: "Admin · Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <ComingSoon
      title="Analytics"
      description="Platform-wide analytics: traffic, conversion, and revenue trends are coming in a future update."
      icon={BarChart3}
    />
  );
}
