import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Gem, Zap, Edit, Eye, AlertTriangle } from "lucide-react";

export const metadata = { title: "My Listings" };

export default async function ListingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [listings, subscription] = await Promise.all([
    db.listing.findMany({
      where: { sellerId: session.user.id },
      orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
    }),
    db.sellerSubscription.findUnique({
      where: { sellerId: session.user.id },
      include: { plan: true },
    }),
  ]);

  const plan = subscription?.plan;
  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
  const limit = plan?.maxListings ?? null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Listings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeCount} active{limit ? ` / ${limit} allowed` : ""}
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

      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Gem className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No listings yet</p>
          <Link
            href="/dashboard/listings/new"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex flex-col gap-3 min-[425px]:flex-row min-[425px]:items-center min-[425px]:gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 shrink-0 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {listing.images[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Gem className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {listing.title}
                      </p>
                      {listing.isBoosted && (
                        <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Zap className="w-3 h-3" /> Boosted
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-blue-600 mt-0.5">
                      {listing.currency}{" "}
                      {Number(listing.price).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          listing.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : listing.status === "SOLD"
                              ? "bg-gray-100 text-gray-600"
                              : listing.status === "CHANGES_REQUESTED" ||
                                  listing.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {listing.status.replace("_", " ")}
                      </span>
                      {listing.caratWeight && (
                        <span className="text-xs text-gray-400">
                          {Number(listing.caratWeight)} ct
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 min-[425px]:justify-start">
                  <Link
                    href={`/listings/${listing.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="View listing"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/listings/${listing.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit listing"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {(listing.status === "CHANGES_REQUESTED" ||
                listing.status === "REJECTED") &&
                listing.rejectionReason && (
                  <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-red-700 dark:text-red-400">
                        <span className="font-medium">
                          Admin requested changes:
                        </span>{" "}
                        {listing.rejectionReason}
                      </p>
                      <Link
                        href={`/dashboard/listings/${listing.id}/edit`}
                        className="text-red-600 dark:text-red-400 font-medium underline text-xs"
                      >
                        Fix &amp; resubmit
                      </Link>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
