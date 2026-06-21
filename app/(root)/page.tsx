export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getCached, setCached } from "@/lib/redis";
import type { Metadata } from "next";
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
import { categories } from "@/config/const/navLinks";
import {
  GemCard,
  JewelleryCard,
  MetalCard,
  ServiceCard,
} from "@/components/cards";

// The homepage's listings/shops/blog/metal-price data is identical for every
// visitor, so it's cached in Redis rather than re-queried from Postgres on
// every request. Session-dependent bits (the "Sell"/"Dashboard" CTA) are
// read separately, outside the cache, so personalization still works.
const HOMEPAGE_CACHE_KEY = "homepage:v1";
const HOMEPAGE_CACHE_TTL_SECONDS = 60;

export const metadata: Metadata = {
  title: "Lumevelo - Certified Gems, Fine Jewellery & Precious Metals",
  description:
    "Lumevelo is the marketplace for certified sapphires, rubies and rare gems, gold and silver, handcrafted jewellery, and trusted gem industry services. All from verified sellers.",
};

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

async function fetchHomepageData() {
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

  const [
    metalPrices,
    featuredListings,
    featuredShops,
    blogPosts,
    activeListingCount,
    verifiedSellerCount,
  ] = await Promise.all([
    Promise.all(
      METALS.map((metal) =>
        db.metalPrice.findFirst({
          where: { metal },
          orderBy: { fetchedAt: "desc" },
        }),
      ),
    ),
    db.listing.findMany({
      where: { status: "ACTIVE", isFeaturedHomepage: true },
      include: sellerInclude,
      orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
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
    db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      include: { author: { select: { name: true, avatarUrl: true } } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    db.listing.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { role: "SELLER", isVerified: true } }),
  ]);

  // Fetched after featuredListings resolves so the same listing never appears in both sections
  const newArrivals = await db.listing.findMany({
    where: {
      status: "ACTIVE",
      id: { notIn: featuredListings.map((l) => l.id) },
    },
    include: sellerInclude,
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return {
    metalPrices,
    featuredListings,
    featuredShops,
    blogPosts,
    activeListingCount,
    verifiedSellerCount,
    newArrivals,
  };
}

type HomepageData = Awaited<ReturnType<typeof fetchHomepageData>>;

export default async function HomePage() {
  const session = await auth();
  const isSeller = session?.user?.role === "SELLER";
  const sellHref = !session?.user
    ? "/login?next=/seller-registration"
    : isSeller
      ? "/dashboard"
      : "/seller-registration";

  const cached = await getCached<HomepageData>(HOMEPAGE_CACHE_KEY);
  const {
    metalPrices,
    featuredListings,
    featuredShops,
    blogPosts,
    activeListingCount,
    verifiedSellerCount,
    newArrivals,
  } = cached ?? (await fetchHomepageData());

  if (!cached) {
    await setCached(
      HOMEPAGE_CACHE_KEY,
      {
        metalPrices,
        featuredListings,
        featuredShops,
        blogPosts,
        activeListingCount,
        verifiedSellerCount,
        newArrivals,
      },
      HOMEPAGE_CACHE_TTL_SECONDS,
    );
  }

  const servicesPreview =
    categories
      .find((c) => c.id === "services")
      ?.subcategories.filter((s) => s.id !== "all")
      .slice(0, 4) ?? [];

  return (
    <div className="bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark to-primary">
        <div className="absolute inset-0 opacity-20 bg-primary-dark">
          <Image
            src="/images/categories/gems/other-gems.png"
            alt=""
            fill
            sizes="100vw"
            quality={40}
            loading="eager"
            className="object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <p className="text-secondary-light font-semibold tracking-wide uppercase text-sm mb-4">
            Sri Lanka&apos;s Trusted Gem &amp; Jewellery Marketplace
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Certified Gems, Fine Jewellery &amp; <br />
            <span className="text-amber-500">Precious Metals</span>
          </h1>
          <p className="text-gray-200 max-w-2xl mx-auto mb-8 text-lg">
            Buy and sell certified sapphires, rubies and rare gems, gold and
            silver, handcrafted jewellery, and trusted valuation &amp;
            certification services — directly from verified Sri Lankan sellers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/gems"
              className="inline-flex items-center gap-2 bg-white text-primary-dark font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Browse Gems <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={sellHref}
              className="inline-flex items-center gap-2 border-2 border-white/70 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Store className="w-4 h-4" />{" "}
              {isSeller ? "Go to Seller Dashboard" : "Become a Seller"}
            </Link>
          </div>
        </div>
      </section>

      {/* Live metal prices */}
      {metalPrices.some(Boolean) && (
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
      )}

      {/* Shop by category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category, i) => (
            <Link
              key={category.id}
              href={category.subcategories[0]?.href ?? "/"}
              className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
            >
              <div className="aspect-square relative skeleton-shimmer">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  priority={i === 0}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-center font-semibold text-sm py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings — boosted/paid placements, visually distinct */}
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

      {/* New arrivals — freshest active listings, excluding anything already shown as Featured */}
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

      {/* Services */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Trusted Gem &amp; Jewellery Services
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Certification, valuation, custom design and more — from
            professionals who specialise in gems and precious metals.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {servicesPreview.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
              >
                <div className="aspect-square relative skeleton-shimmer">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-center font-medium text-sm py-3 text-gray-900 dark:text-white">
                  {service.name}
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/services"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all services →
            </Link>
          </div>
        </div>
      </section>

      {/* Verified shops */}
      {featuredShops.length > 0 && (
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
      )}

      {/* Trust band */}
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
            <p className="text-sm text-gray-300">Sri Lanka Origin Gems</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">Secure</p>
            <p className="text-sm text-gray-300">
              Payments via Stripe &amp; PayHere
            </p>
          </div>
        </div>
      </section>

      {/* Blog / learn & community */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Learn &amp; Share Gem Knowledge
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Guides, identification tips, and industry news from our community
              of gem and jewellery enthusiasts.
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
                            { month: "short", day: "numeric" },
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

      {/* Become a seller CTA */}
      <section className="bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {isSeller
              ? "Manage Your Shop on Lumevelo"
              : "Sell Your Gems, Jewellery, or Services on Lumevelo"}
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto mb-6">
            {isSeller
              ? "List new inventory, track enquiries, and grow your shop's reach on Lumevelo."
              : "Set up your shop, list your inventory, and reach buyers actively searching for certified gems, precious metals, and jewellery."}
          </p>
          <Link
            href={sellHref}
            className="inline-flex items-center gap-2 bg-white text-primary-dark font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSeller ? "Go to Dashboard" : "Start Selling"}{" "}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
