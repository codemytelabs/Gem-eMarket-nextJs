import type { ListingCategory } from "@prisma/client";

export const CATEGORY_IMAGE_MAX: Record<ListingCategory, number> = {
  GEM: 3,
  JEWELLERY: 10,
  PRECIOUS_METAL: 3,
  SERVICE: 6,
};

export const CERTIFICATION_IMAGE_MAX = 5; // flat across categories today

export function getEffectiveLimit(
  categoryMax: number,
  planMax: number | null,
): { max: number; isPlanLimited: boolean } {
  const max = planMax === null ? categoryMax : Math.min(categoryMax, planMax);
  return { max, isPlanLimited: planMax !== null && planMax < categoryMax };
}
