import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Gem,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  MapPin,
  BookOpen,
  Clock,
  Store,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { getOrSetCached } from "@/lib/redis";
import {
  GemCard,
  JewelleryCard,
  MetalCard,
  ServiceCard,
} from "@/components/cards";

// Each section below fetches and caches only the data it needs, independent
// of the others. Rendered inside its own <Suspense> boundary in page.tsx, so
// a slow/cold-cache section streams in on its own instead of blocking the
// rest of the homepage (hero, category grid, services preview, and the
// seller CTA need no DB data at all and render immediately).

const CACHE_TTL_SECONDS = 60;

const METALS = ["GOLD_24K", "GOLD_22K", "SILVER", "PLATINUM"] as const;
const METAL_LABELS: Record<string, string> = {
  GOLD_24K: "Gold 24K",
  GOLD_22K: "Gold 22K",
  SILVER: "Silver",
  PLATINUM: "Platinum",
};

const BLOG_TOPICS_PREVIEW = [
  {
    title: "How to Spot a Treated Gemstone",
    blurb:
      "What heating, fracture-filling, and other treatments mean for value.",
  },
  {
    title: "A Buyer's Guide to Ceylon Sapphires",
    blurb: "Colour, clarity, and certification basics before you buy.",
  },
  {
    title: "Caring for Gold & Silver Jewellery",
    blurb: "Simple habits that keep precious metal pieces looking new.",
  },
] as const;

const cardForCategory: Record<
  string,
  typeof GemCard | typeof JewelleryCard | typeof MetalCard | typeof ServiceCard
> = {
  GEM: GemCard,
  JEWELLERY: JewelleryCard,
  PRECIOUS_METAL: MetalCard,
  SERVICE: ServiceCard,
};

const sellerInclude = {
  seller: {
    select: {
      name: true,
      isVerified: true,
      locationCity: true,
      subscription: { select: { plan: { select: { name: true } } } },
    },
  },
};

export async function MetalPricesSection() {
  const metalPrices = await getOrSetCached(
    "homepage:metalPrices:v1",
    CACHE_TTL_SECONDS,
    () =>
      Promise.all(
        METALS.map((metal) =>
          db.metalPrice.findFirst({
            where: { metal },
            orderBy: { fetchedAt: "desc" },
          }),
        ),
      ),
  );

  if (!metalPrices.some(Boolean)) return null;

  return (
    <section className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metalPrices.map((mp, i) => {
            if (!mp) return null;
            const change = mp.changePercent24h
              ? Number(mp.changePercent24h)
              : 0;
            const up = change >= 0;
            return (
              <div
                key={METALS[i]}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {METAL_LABELS[METALS[i]]} / g
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${Number(mp.priceUsdPerGram).toFixed(2)}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    up ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {up ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(change).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export async function FeaturedAndNewArrivalsSection() {
  const { featuredListings, newArrivals } = await getOrSetCached(
    "homepage:listings:v1",
    CACHE_TTL_SECONDS,
    async () => {
      const featuredListings = await db.listing.findMany({
        where: { status: "ACTIVE", isFeaturedHomepage: true },
        include: sellerInclude,
        orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
        take: 8,
      });

      // Fetched after featuredListings resolves so the same listing never
      // appears in both sections.
      const newArrivals = await db.listing.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: featuredListings.map((l) => l.id) },
        },
        include: sellerInclude,
        orderBy: { createdAt: "desc" },
        take: 8,
      });

      return { featuredListings, newArrivals };
    },
  );

  return (
    <>
      {featuredListings.length > 0 && (
        <section className="bg-gradient-to-b from-amber-50 to-gray-50 dark:from-amber-950/15 dark:to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Featured
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Hand-Picked Listings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Promoted listings from our verified sellers.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredListings.map((listing) => {
                const Card = cardForCategory[listing.category];
                return <Card key={listing.id} listing={listing as never} />;
              })}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            New Arrivals
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Freshly listed gems, jewellery, and metals from our sellers.
          </p>
        </div>
        {newArrivals.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Gem className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            New listings are coming soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((listing) => {
              const Card = cardForCategory[listing.category];
              return <Card key={listing.id} listing={listing as never} />;
            })}
          </div>
        )}
      </section>
    </>
  );
}

export async function FeaturedShopsSection() {
  const featuredShops = await getOrSetCached(
    "homepage:shops:v1",
    CACHE_TTL_SECONDS,
    () =>
      db.user.findMany({
        where: {
          role: "SELLER",
          subscription: { plan: { hasShopProfile: true }, status: "ACTIVE" },
        },
        select: {
          id: true,
          name: true,
          shopSlug: true,
          shopBio: true,
          shopBannerUrl: true,
          isVerified: true,
          locationCity: true,
          specialties: true,
        },
        orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
        take: 4,
      }),
  );

  if (featuredShops.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Featured Shops
        </h2>
        <Link
          href="/sellers"
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {featuredShops.map((shop) => (
          <Link
            key={shop.id}
            href={`/shop/${shop.shopSlug}`}
            className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-primary-light hover:shadow-md transition-all"
          >
            <div className="h-24 relative bg-gradient-to-br from-primary/10 to-premium/10">
              {shop.shopBannerUrl && (
                <Image
                  src={shop.shopBannerUrl}
                  alt={`${shop.name} banner`}
                  fill
                  className="object-cover"
                />
              )}
              {shop.isVerified && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-gray-900 -mt-8 shadow">
                  <Store className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                    {shop.name}
                  </p>
                  {shop.locationCity && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" /> {shop.locationCity}
                    </div>
                  )}
                </div>
              </div>
              {shop.shopBio && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                  {shop.shopBio}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function TrustBandSection() {
  const { activeListingCount, verifiedSellerCount } = await getOrSetCached(
    "homepage:trustCounts:v1",
    CACHE_TTL_SECONDS,
    async () => {
      const [activeListingCount, verifiedSellerCount] = await Promise.all([
        db.listing.count({ where: { status: "ACTIVE" } }),
        db.user.count({ where: { role: "SELLER", isVerified: true } }),
      ]);
      return { activeListingCount, verifiedSellerCount };
    },
  );

  return (
    <section className="bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <p className="text-2xl font-bold text-white">
            {activeListingCount.toLocaleString()}+
          </p>
          <p className="text-sm text-gray-300">Active Listings</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">
            {verifiedSellerCount.toLocaleString()}+
          </p>
          <p className="text-sm text-gray-300">Verified Sellers</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">100%</p>
          <p className="text-sm text-gray-300">Certified Authenticity</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">Secure</p>
          <p className="text-sm text-gray-300">
            Payments via Stripe &amp; PayHere
          </p>
        </div>
      </div>
    </section>
  );
}

export async function BlogSection() {
  const blogPosts = await getOrSetCached(
    "homepage:blogPosts:v1",
    CACHE_TTL_SECONDS,
    () =>
      db.blogPost.findMany({
        where: { status: "PUBLISHED" },
        include: { author: { select: { name: true, avatarUrl: true } } },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Learn &amp; Share Gem Knowledge
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Guides, identification tips, and industry news from our community of
            gem and jewellery enthusiasts.
          </p>
        </div>
        <Link
          href="/blogs"
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
        >
          Visit the blog <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {blogPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-primary-light hover:shadow-md transition-all"
            >
              <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                {post.featuredImageUrl ? (
                  <Image
                    src={post.featuredImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </p>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{post.author.name}</span>
                  {post.publishedAt && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BLOG_TOPICS_PREVIEW.map((topic) => (
            <Link
              key={topic.title}
              href="/blogs"
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-primary-light hover:shadow-md transition-all"
            >
              <div className="aspect-video relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-300" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-2">
                  {topic.title}
                </p>
                <p className="text-sm text-gray-500">{topic.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
