"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  BarChart2,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  {
    href: "/dashboard/listings",
    label: "My Listings",
    icon: Package,
    exact: false,
  },
  {
    href: "/dashboard/enquiries",
    label: "Enquiries",
    icon: MessageSquare,
    exact: false,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart2,
    exact: false,
  },
  {
    href: "/dashboard/upgrade",
    label: "Plan & Billing",
    icon: Zap,
    exact: false,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    exact: false,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-4 space-y-0.5">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
              isActive
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive
                  ? "text-white"
                  : "text-gray-500 group-hover:text-gray-300"
              }`}
            />
            <span>{label}</span>
            {isActive && (
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
