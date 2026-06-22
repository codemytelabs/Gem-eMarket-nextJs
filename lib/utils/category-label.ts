import { LISTING_CATEGORY } from "@/types/enums/category.enum";

const LABELS: Record<LISTING_CATEGORY, string> = {
  [LISTING_CATEGORY.GEM]: "Gem",
  [LISTING_CATEGORY.JEWELLERY]: "Jewellery",
  [LISTING_CATEGORY.PRECIOUS_METAL]: "Precious Metal",
  [LISTING_CATEGORY.SERVICE]: "Service",
};

export function categoryLabel(category: string): string {
  return LABELS[category as LISTING_CATEGORY] ?? category;
}
