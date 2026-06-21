import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // How long the Next.js Image Optimization cache (and any CDN in front of
    // it) keeps an optimized derivative before re-checking the source.
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days — these static category/nav images rarely change
  },

  // Expose only safe public env vars
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "https://lumevelo.com",
  },

  serverExternalPackages: ["bcryptjs"],

  turbopack: {
    root: __dirname,
  },

  async headers() {
    return [
      {
        // Static marketing/category images under /public — they're
        // content-hashed by filename changes only, so cache them
        // aggressively at the browser and CDN level.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
