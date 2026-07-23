import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ListingEditForm } from "@/components/listings/ListingEditForm";
import { toEditableListing } from "@/lib/utils/serializeListing";

export const metadata = { title: "Admin · Edit Listing" };

export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Edit Listing</h1>
        <p className="text-sm text-gray-500 mt-1">{listing.title}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ListingEditForm
          listing={toEditableListing(listing)}
          backHref="/admin/listings"
        />
      </div>
    </div>
  );
}
