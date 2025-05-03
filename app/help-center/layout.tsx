"use client";

import Link from "next/link";
import React from "react";
import { useThemeStore } from "@/store/themeStore";
import { colors } from "@/lib/theme/colors";

interface CustomerServiceLayoutProps {
  children: React.ReactNode;
}

export default function CustomerServiceLayout({
  children,
}: CustomerServiceLayoutProps) {
  const { isDarkMode } = useThemeStore();

  const sidebarLinks = [
    { href: "/help-center/contact", label: "Contact Us" },
    { href: "/help-center/faq", label: "FAQ" },
    { href: "/help-center/complaints", label: "Complaints" },
    { href: "/help-center/delivery", label: "Delivery" },
    { href: "/help-center/privacy-policy", label: "Privacy Policy" },
  ];

  return (
    <div className="flex flex-col md:flex-row w-full">
      <aside
        className={`md:w-64 flex-shrink-0 p-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} border-r ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <h2
          className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : colors.neutral.text}`}
        >
          Help Center
        </h2>
        <nav>
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : `text-${colors.neutral.text} hover:bg-${colors.primary.light} hover:text-white`
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main
        className={`flex-grow p-6 ${isDarkMode ? "bg-gray-800 text-gray-200" : `bg-${colors.neutral.background} text-${colors.neutral.text}`}`}
      >
        {children}
      </main>
    </div>
  );
}
