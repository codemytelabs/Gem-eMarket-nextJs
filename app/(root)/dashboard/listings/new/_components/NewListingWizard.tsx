"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { LISTING_CATEGORY } from "@/types/enums";
import { CategoryPicker } from "./CategoryPicker";
import { GemForm } from "./GemForm";
import { JewelleryForm } from "./JewelleryForm";
import { MetalForm } from "./MetalForm";
import { ServiceForm } from "./ServiceForm";

const CATEGORY_LABEL: Record<LISTING_CATEGORY, string> = {
  [LISTING_CATEGORY.GEM]: "Gemstone",
  [LISTING_CATEGORY.JEWELLERY]: "Jewellery",
  [LISTING_CATEGORY.PRECIOUS_METAL]: "Precious Metal",
  [LISTING_CATEGORY.SERVICE]: "Service",
};

interface NewListingWizardProps {
  sellerLocation?: string;
  sellerCountry?: string;
  sellerPhone?: string;
}

export function NewListingWizard({
  sellerLocation = "",
  sellerCountry = "LK",
  sellerPhone = "",
}: NewListingWizardProps) {
  const router = useRouter();
  const [category, setCategory] = useState<LISTING_CATEGORY | null>(null);

  const onSuccess = () => router.push("/dashboard/listings?created=1");

  if (!category) {
    return <CategoryPicker onSelect={setCategory} />;
  }

  const sharedProps = {
    onBack: () => setCategory(null),
    onSuccess,
    sellerLocation,
    sellerCountry,
    sellerPhone,
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setCategory(null)}
        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-5 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Change category
      </button>

      <div className="mb-5 pb-5 border-b border-gray-200 dark:border-gray-800">
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">
          Category
        </p>
        <p className="font-semibold text-gray-900 dark:text-white">
          {CATEGORY_LABEL[category]}
        </p>
      </div>

      {category === LISTING_CATEGORY.GEM && <GemForm {...sharedProps} />}
      {category === LISTING_CATEGORY.JEWELLERY && (
        <JewelleryForm {...sharedProps} />
      )}
      {category === LISTING_CATEGORY.PRECIOUS_METAL && (
        <MetalForm {...sharedProps} />
      )}
      {category === LISTING_CATEGORY.SERVICE && (
        <ServiceForm {...sharedProps} />
      )}
    </div>
  );
}
