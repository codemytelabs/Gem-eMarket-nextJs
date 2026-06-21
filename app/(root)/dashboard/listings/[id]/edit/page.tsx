import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ListingEditForm } from "@/components/listings/ListingEditForm";
import { toEditableListing } from "@/lib/utils/serializeListing";
import { getReelQuotaStatus } from "@/lib/reelQuota";

export const metadata = { title: "Edit Listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const [listing, reelQuota] = await Promise.all([
    db.listing.findFirst({ where: { id, sellerId: session.user.id } }),
    getReelQuotaStatus(session.user.id),
  ]);
  if (!listing) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Listing
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {listing.title}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <ListingEditForm
          listing={toEditableListing(listing)}
          backHref="/dashboard/listings"
          canUploadReels={reelQuota.allowed}
          reelsRemaining={reelQuota.remaining}
          reelsMaxPerMonth={reelQuota.maxPerMonth}
        />
      </div>
    </div>
  );
}
