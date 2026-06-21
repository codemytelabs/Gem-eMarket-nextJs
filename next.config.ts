import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
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
};

export default nextConfig;
