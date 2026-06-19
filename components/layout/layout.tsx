"use client";

import React, { useEffect } from "react";

import { useThemeStore } from "@/store/themeStore";
import Navigation from "./navigation";
import Footer from "./footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  return (
    <div
      className={`flex flex-col min-h-screen ${isDarkMode ? "bg-gray-700" : "bg-white"} transition-colors duration-300`}
    >
      <Navigation />
      <main
        className={`flex-grow ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
