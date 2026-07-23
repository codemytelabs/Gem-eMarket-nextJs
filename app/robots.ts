import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://lumevelo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Routes now sit behind a locale prefix (/en/admin, /ta/admin, ...),
      // so a bare "/admin/" rule no longer matches — wildcard past the
      // locale segment instead.
      disallow: ["/api/", "/*/admin/", "/*/dashboard/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
