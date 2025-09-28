"use client";

import Layout from "@/components/layout/layout";
import { ThemeProvider } from "next-themes";
import React from "react";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Layout>{children}</Layout>
    </ThemeProvider>
  );
}
