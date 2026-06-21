import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { NewListingWizard } from "./_components/NewListingWizard";
import { getReelQuotaStatus } from "@/lib/reelQuota";

export const metadata: Metadata = { title: "New Listing — Dashboard" };

export default async function NewListingPage() {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    redirect("/dashboard/listings");
  }

  const [seller, reelQuota] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        locationCity: true,
        country: true,
        phone: true,
        whatsappNumber: true,
      },
    }),
    getReelQuotaStatus(session.user.id),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          New Listing
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Fill in the details below to publish your listing on the marketplace.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <NewListingWizard
          sellerLocation={seller?.locationCity ?? ""}
          sellerCountry={seller?.country ?? "LK"}
          sellerPhone={seller?.phone ?? seller?.whatsappNumber ?? ""}
          canUploadReels={reelQuota.allowed}
          reelsRemaining={reelQuota.remaining}
          reelsMaxPerMonth={reelQuota.maxPerMonth}
        />
      </div>
    </div>
  );
}
