import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://lumevelo.com";

// Emits one sitemap entry per locale for a given path, each annotated with
// hreflang alternates pointing at its siblings — this is what lets Google
// index the /ta/ and /si/ versions as translations instead of duplicate
// content competing with /en/.
function localizedUrls(
  path: string,
  opts: Pick<
    MetadataRoute.Sitemap[number],
    "lastModified" | "priority" | "changeFrequency"
  >,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${BASE}/${locale}${path}`]),
  );
  return routing.locales.map((locale) => ({
    url: `${BASE}/${locale}${path}`,
    ...opts,
    alternates: { languages },
  }));
}

const staticHubs: MetadataRoute.Sitemap = [
  ...localizedUrls("/", { priority: 1.0, changeFrequency: "daily" }),
  ...localizedUrls("/gems", { priority: 1.0, changeFrequency: "daily" }),
  ...localizedUrls("/jewellery", { priority: 0.9, changeFrequency: "daily" }),
  ...localizedUrls("/precious-metals", {
    priority: 0.9,
    changeFrequency: "daily",
  }),
  ...localizedUrls("/services", { priority: 0.8, changeFrequency: "daily" }),
  ...localizedUrls("/sellers", { priority: 0.8, changeFrequency: "weekly" }),
  ...localizedUrls("/blogs", { priority: 0.7, changeFrequency: "weekly" }),
  ...localizedUrls("/about", { priority: 0.6, changeFrequency: "monthly" }),
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

    const listingUrls: MetadataRoute.Sitemap = listings.flatMap((l) =>
      localizedUrls(`/listings/${l.slug}`, {
        lastModified: l.updatedAt,
        priority: 0.8,
        changeFrequency: "weekly",
      }),
    );

    const shopUrls: MetadataRoute.Sitemap = sellers
      .filter((s) => s.shopSlug)
      .flatMap((s) =>
        localizedUrls(`/shop/${s.shopSlug}`, {
          lastModified: s.updatedAt,
          priority: 0.7,
          changeFrequency: "weekly",
        }),
      );

    const blogUrls: MetadataRoute.Sitemap = posts.flatMap((p) =>
      localizedUrls(`/blogs/${p.slug}`, {
        lastModified: p.updatedAt,
        priority: 0.6,
        changeFrequency: "monthly",
      }),
    );

    return [...staticHubs, ...listingUrls, ...shopUrls, ...blogUrls];
  } catch {
    return staticHubs;
  }
}
