import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Zap, Crown, Building2 } from "lucide-react";
import { DashboardNav } from "./_components/DashboardNav";

const planBadge: Record<
  string,
  { label: string; cls: string; Icon?: React.ElementType }
> = {
  free: { label: "Free", cls: "bg-gray-700 text-gray-300" },
  basic: { label: "Basic", cls: "bg-blue-900/70 text-blue-300", Icon: Zap },
  pro: { label: "Pro", cls: "bg-purple-900/70 text-purple-300", Icon: Crown },
  dealer: {
    label: "Dealer",
    cls: "bg-amber-900/70 text-amber-300",
    Icon: Building2,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role === "BUYER") redirect("/login");

  const badge = planBadge[session.user.planName] ?? planBadge.free;
  const { Icon: PlanIcon } = badge;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar — dark, distinct from topnav */}
      <aside className="w-56 shrink-0 bg-gray-900 flex flex-col border-r border-gray-800">
        {/* Plan badge strip */}
        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
          {PlanIcon && (
            <PlanIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )}
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}
          >
            {badge.label} Plan
          </span>
          {session.user.isVerified && (
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-auto" />
          )}
        </div>

        {/* Nav links — client component for active state */}
        <DashboardNav />

        {/* Upgrade CTA for free / basic */}
        {(session.user.planName === "free" ||
          session.user.planName === "basic") && (
          <div className="mx-3 mb-4 p-3 rounded-lg bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-800/40">
            <p className="text-xs font-semibold text-gray-200">
              {session.user.planName === "free" ? "Upgrade to Basic" : "Go Pro"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {session.user.planName === "free"
                ? "More listings + shop profile"
                : "Unlimited listings + analytics"}
            </p>
            <Link
              href="/subscription"
              className="mt-2 block text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md py-1.5 transition-colors"
            >
              View Plans →
            </Link>
          </div>
        )}
      </aside>

      {/* Main content — no artificial max-width, minimal padding */}
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50 dark:bg-gray-950">
        <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </main>
    </div>
  );
}
