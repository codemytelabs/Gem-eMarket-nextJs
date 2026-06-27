import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://lumevelo.com";

const staticHubs: MetadataRoute.Sitemap = [
  { url: `${BASE}/`, priority: 1.0, changeFrequency: "daily" },
  { url: `${BASE}/gems`, priority: 1.0, changeFrequency: "daily" },
  { url: `${BASE}/jewellery`, priority: 0.9, changeFrequency: "daily" },
  { url: `${BASE}/precious-metals`, priority: 0.9, changeFrequency: "daily" },
  { url: `${BASE}/services`, priority: 0.8, changeFrequency: "daily" },
  { url: `${BASE}/sellers`, priority: 0.8, changeFrequency: "weekly" },
  { url: `${BASE}/blogs`, priority: 0.7, changeFrequency: "weekly" },
  { url: `${BASE}/about`, priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [listings, sellers, posts] = await Promise.all([
      db.listing.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      }),
      db.user.findMany({
        where: { role: "SELLER", shopSlug: { not: null } },
        select: { shopSlug: true, updatedAt: true },
      }),
      db.blogPost.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const listingUrls: MetadataRoute.Sitemap = listings.map((l) => ({
      url: `${BASE}/listings/${l.slug}`,
      lastModified: l.updatedAt,
      priority: 0.8,
      changeFrequency: "weekly",
    }));

    const shopUrls: MetadataRoute.Sitemap = sellers
      .filter((s) => s.shopSlug)
      .map((s) => ({
        url: `${BASE}/shop/${s.shopSlug}`,
        lastModified: s.updatedAt,
        priority: 0.7,
        changeFrequency: "weekly",
      }));

    const blogUrls: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${BASE}/blogs/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.6,
      changeFrequency: "monthly",
    }));

    return [...staticHubs, ...listingUrls, ...shopUrls, ...blogUrls];
  } catch {
    return staticHubs;
  }
}
