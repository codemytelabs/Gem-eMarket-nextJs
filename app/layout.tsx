import "./globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Lumevelo — Global Gem & Jewellery Marketplace",
    template: "%s | Lumevelo",
  },
  description:
    "Lumevelo is a global online marketplace for certified gems, precious metals, and fine jewellery — connecting buyers and verified sellers worldwide, anytime.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://lumevelo.com",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Lumevelo",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
