import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  BarChart2,
  Settings,
  Zap,
  ShieldCheck,
  LogOut,
  Gem,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "My Listings", icon: Package },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/upgrade", label: "Plan & Billing", icon: Zap },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role === "BUYER") redirect("/login");

  const planBadgeColor: Record<string, string> = {
    free: "bg-gray-100 text-gray-600",
    basic: "bg-blue-100 text-blue-700",
    pro: "bg-purple-100 text-purple-700",
    dealer: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <Gem className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-900 dark:text-white">
              GemCeylon
            </span>
          </Link>
        </div>

        {/* Seller info */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session.user.name}
              </p>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize ${planBadgeColor[session.user.planName] ?? planBadgeColor.free}`}
              >
                {session.user.planName} plan
              </span>
            </div>
          </div>
          {session.user.isVerified && (
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Seller
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* Upgrade CTA for free/basic */}
        {(session.user.planName === "free" ||
          session.user.planName === "basic") && (
          <div className="mx-3 mb-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              {session.user.planName === "free" ? "Upgrade to Basic" : "Go Pro"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {session.user.planName === "free"
                ? "Get 20 listings + shop profile"
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

        {/* Sign out */}
        <div className="px-3 pb-4">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
