"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardNav } from "./DashboardNav";

interface DashboardShellProps {
  badgeLabel: string;
  badgeClassName: string;
  planIcon?: React.ReactNode;
  isVerified: boolean;
  showUpgradeCta: boolean;
  upgradeCtaLabel: string;
  upgradeCtaHint: string;
  children: React.ReactNode;
}

export function DashboardShell({
  badgeLabel,
  badgeClassName,
  planIcon,
  isVerified,
  showUpgradeCta,
  upgradeCtaLabel,
  upgradeCtaHint,
  children,
}: DashboardShellProps) {
  // Icon-only rail is the resting state on mobile — expand to reveal labels.
  // Desktop is unaffected: always the full labeled sidebar, as before.
  const [collapsed, setCollapsed] = useState(true);

  const renderSidebarContent = (
    isCollapsed: boolean,
    onNavigate?: () => void,
  ) => (
    <>
      <DashboardNav onNavigate={onNavigate} collapsed={isCollapsed} />

      {!isCollapsed && (
        <div className="mt-6 mx-3 mb-4">
          <div className="flex items-center gap-2 px-1 mb-2">
            {planIcon}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeClassName}`}
            >
              {badgeLabel} Plan
            </span>
            {isVerified && (
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-auto" />
            )}
          </div>

          {showUpgradeCta && (
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-800/40">
              <p className="text-xs font-semibold text-gray-200">
                {upgradeCtaLabel}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{upgradeCtaHint}</p>
              <Link
                href="/subscription"
                onClick={onNavigate}
                className="mt-2 block text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md py-1.5 transition-colors"
              >
                View Plans →
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="relative flex min-h-screen">
      {/* Backdrop while the mobile rail is expanded — taps outside collapse it.
          Scoped to this container (not the viewport) so it sits between the
          site nav and footer rather than covering them. */}
      {!collapsed && (
        <div
          className="md:hidden absolute inset-0 bg-black/50 z-40"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Mobile sidebar — overlay rail scoped to this container (absolute,
          not fixed), so expanding it widens over the dashboard content only
          without covering the site nav/footer above and below it. */}
      <aside
        className={`md:hidden absolute inset-y-0 left-0 z-50 flex flex-col ${
          collapsed ? "w-12 min-[425px]:w-16" : "w-48"
        } shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto transition-all duration-200`}
      >
        <div
          className={`flex items-center px-3 py-3 ${collapsed ? "justify-center" : "justify-end"}`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="text-gray-400 hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
        {renderSidebarContent(collapsed, () => setCollapsed(true))}
      </aside>

      {/* Desktop sidebar — unchanged: always the full labeled sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 shrink-0 bg-gray-900 border-r border-gray-800">
        {renderSidebarContent(false)}
      </aside>

      {/* Reserves space for the always-visible collapsed mobile rail (thinner
          below 425px to match) so content never sits underneath it; md:pl-0
          since desktop's sidebar is a normal flex sibling, not an overlay. */}
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50 dark:bg-gray-950 pl-12 min-[425px]:pl-16 md:pl-0">
        <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </main>
    </div>
  );
}
