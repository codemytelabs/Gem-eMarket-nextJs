import { z } from "zod";

const baseListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().positive("Price must be positive"),
  currency: z.string().default("USD"),
  images: z.array(z.string().url()).max(10),
  reelUrl: z.string().url().nullable().optional(),
  category: z.enum(["GEM", "JEWELLERY", "PRECIOUS_METAL", "SERVICE"]),
  gemType: z.string().optional(),
  gemOrigin: z.string().optional(),
  caratWeight: z.number().positive().optional(),
  treatmentStatus: z.string().optional(),
  certificationBody: z.string().optional(),
  certificationNumber: z.string().optional(),
  certificationImages: z.array(z.string().url()).max(10).optional(),
  currentLocation: z.string().optional(),
  // Gem dimensions
  dimensionL: z.number().positive().optional(),
  dimensionW: z.number().positive().optional(),
  dimensionH: z.number().positive().optional(),
  // Gem parcel
  isLotSale: z.boolean().optional(),
  lotSize: z.number().int().positive().optional(),
  // Contact
  contactPhone: z.string().optional(),
  hideContactPhone: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
  metalType: z.string().optional(),
  metalPurity: z.string().optional(),
  weightGrams: z.number().positive().optional(),
  weightSovereigns: z.number().positive().optional(),
  // Jewellery
  jewelleryType: z.string().optional(),
  ringSize: z.string().optional(),
  // Services
  serviceType: z.string().optional(),
  pricingType: z.string().optional(),
  serviceArea: z.array(z.string()).optional(),
  turnaroundTime: z.string().optional(),
  isWholesale: z.boolean().default(false),
  // SEO
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
});

export const updateListingSchema = baseListingSchema.partial();

export const createListingSchema = baseListingSchema.superRefine(
  (data, ctx) => {
    // At least one photo or video is required — a reel covers that on its
    // own, so only require an image when there's no reel.
    if (!data.reelUrl && data.images.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one photo or video is required",
        path: ["images"],
      });
    }
  },
);

export const seoUpdateSchema = z.object({
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
});

export const adminListingActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("request_changes"),
    reason: z.string().min(1, "A reason is required"),
  }),
  z.object({
    action: z.literal("reject"),
    reason: z.string().min(1, "A reason is required"),
  }),
]);

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
