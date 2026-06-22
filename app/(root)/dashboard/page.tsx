import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Package,
  MessageSquare,
  Zap,
  TrendingUp,
  Plus,
  Eye,
} from "lucide-react";

export const metadata = { title: "Seller Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const { welcome } = await searchParams;

  const [activeListings, totalEnquiries, unreadEnquiries, subscription] =
    await Promise.all([
      db.listing.count({
        where: { sellerId: session.user.id, status: "ACTIVE" },
      }),
      db.enquiry.count({ where: { sellerId: session.user.id } }),
      db.enquiry.count({ where: { sellerId: session.user.id, isRead: false } }),
      db.sellerSubscription.findUnique({
        where: { sellerId: session.user.id },
        include: { plan: true },
      }),
    ]);

  const plan = subscription?.plan;
  const listingLimit = plan?.maxListings ?? null;
  const listingUsagePct = listingLimit
    ? Math.min(100, (activeListings / listingLimit) * 100)
    : 0;

  const stats = [
    {
      label: "Active Listings",
      value: activeListings,
      sub: listingLimit ? `of ${listingLimit} allowed` : "Unlimited",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      href: "/dashboard/listings",
    },
    {
      label: "Total Enquiries",
      value: totalEnquiries,
      sub: `${unreadEnquiries} unread`,
      icon: MessageSquare,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
      href: "/dashboard/enquiries",
    },
    {
      label: "Free Boosts Left",
      value: subscription?.freeBoostsRemaining ?? 0,
      sub: "this month",
      icon: Zap,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      href: "/dashboard/listings",
    },
    {
      label: "Current Plan",
      value: plan?.displayName ?? "Free",
      sub:
        plan?.priceUsd && Number(plan.priceUsd) > 0
          ? `$${Number(plan.priceUsd)}/mo`
          : "Always free",
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      href: "/dashboard/upgrade",
    },
  ];

  return (
    <div className="space-y-8">
      {welcome === "1" && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-1">
            Welcome to your Seller Dashboard! 🎉
          </h2>
          <p className="text-blue-100 text-sm">
            Your seller account is live. Start by creating your first listing —
            it only takes a couple of minutes.
          </p>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first listing
          </Link>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {session.user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with your shop
          </p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            <div
              className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {s.value}
            </p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
              {s.label}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {s.sub}
            </p>
          </Link>
        ))}
      </div>

      {/* Listing limit bar */}
      {listingLimit && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Listing quota
            </p>
            <span className="text-sm text-gray-500">
              {activeListings} / {listingLimit} used
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${listingUsagePct >= 90 ? "bg-red-500" : "bg-blue-600"}`}
              style={{ width: `${listingUsagePct}%` }}
            />
          </div>
          {listingUsagePct >= 80 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              You&apos;re nearing your listing limit.{" "}
              <Link href="/dashboard/upgrade" className="underline font-medium">
                Upgrade your plan
              </Link>{" "}
              to add more.
            </p>
          )}
        </div>
      )}

      {/* Shop profile link for eligible plans */}
      {plan?.hasShopProfile && session.user.shopSlug && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Your shop profile is live
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                gemceylon.com/shop/{session.user.shopSlug}
              </p>
            </div>
            <Link
              href={`/shop/${session.user.shopSlug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
          </div>
        </div>
      )}

      {/* Recent enquiries */}
      {unreadEnquiries > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Unread Enquiries
            </h2>
            <Link
              href="/dashboard/enquiries"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You have{" "}
            <span className="font-semibold text-green-600">
              {unreadEnquiries} new enquiries
            </span>{" "}
            waiting for your response.
          </p>
          <Link
            href="/dashboard/enquiries"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Respond now
          </Link>
        </div>
      )}
    </div>
  );
}
