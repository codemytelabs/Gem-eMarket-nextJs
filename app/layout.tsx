"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import Layout from "@/components/layout/layout";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <html lang="en">
      <body className={inter.className}>
        {isAuthPage ? children : <Layout>{children}</Layout>}
      </body>
    </html>
  );
}
