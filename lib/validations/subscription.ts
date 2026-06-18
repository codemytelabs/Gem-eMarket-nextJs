import { z } from "zod";

export const upgradeSchema = z.object({
  planId: z.string().min(1),
  gateway: z.enum(["PAYHERE"]),
  couponCode: z.string().optional(),
  cycle: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1),
  planId: z.string().min(1),
  cycle: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
});

const couponBaseSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(40)
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Code can only contain letters, numbers, hyphens and underscores",
    )
    .transform((v) => v.toUpperCase()),
  description: z.string().max(255).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_USD", "FREE_MONTHS"]),
  discountValue: z.number().positive(),
  applicablePlanIds: z.array(z.string()).default([]),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]).nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  maxUsesPerUser: z.number().int().positive().default(1),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
});

const refinePercentage = <
  T extends { discountType?: string; discountValue?: number },
>(
  data: T,
) =>
  data.discountType !== "PERCENTAGE" ||
  data.discountValue === undefined ||
  data.discountValue <= 100;

export const couponCreateSchema = couponBaseSchema.refine(refinePercentage, {
  message: "Percentage discount cannot exceed 100",
  path: ["discountValue"],
});

export const couponUpdateSchema = couponBaseSchema
  .partial()
  .refine(refinePercentage, {
    message: "Percentage discount cannot exceed 100",
    path: ["discountValue"],
  });

export const boostSchema = z.object({
  boostType: z.enum([
    "TOP_SEARCH_1D",
    "TOP_SEARCH_3D",
    "TOP_SEARCH_7D",
    "CATEGORY_BANNER",
  ]),
  useFreeBoost: z.boolean().default(false),
  gateway: z.enum(["PAYHERE"]).optional(),
});

export const enquirySchema = z.object({
  listingId: z.string().min(1),
  buyerName: z.string().min(2),
  buyerPhone: z.string().min(8),
  buyerEmail: z.string().email().optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000),
  firebaseIdToken: z.string().optional(),
});

export type UpgradeInput = z.infer<typeof upgradeSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
