import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket — update with your actual R2 subdomain
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
      // Custom CDN domain for R2 (set in env)
      ...(process.env.STORAGE_PUBLIC_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.STORAGE_PUBLIC_URL).hostname,
            },
          ]
        : []),
    ],
  },

  // Expose only safe public env vars
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "https://gemceylon.com",
  },

  serverExternalPackages: ["bcryptjs"],

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
