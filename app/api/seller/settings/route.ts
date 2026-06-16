import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  locationCity: z.string().optional(),
  shopSlug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .min(3)
    .max(60)
    .optional(),
  shopBio: z.string().max(500).optional(),
  specialties: z.array(z.string()).optional(),
  shopMetaTitle: z.string().max(60).optional(),
  shopMetaDescription: z.string().max(155).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { shopSlug, shopMetaTitle, shopMetaDescription, ...rest } = parsed.data;

  // Check slug uniqueness
  if (shopSlug) {
    const existing = await db.user.findFirst({
      where: { shopSlug, NOT: { id: session.user.id } },
    });
    if (existing) {
      return NextResponse.json(
        { message: "This shop URL is already taken. Try a different one." },
        { status: 409 },
      );
    }
  }

  // Only Dealer plan can set custom SEO meta
  const allowCustomSeo = session.user.planName === "dealer";

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...rest,
      shopSlug: shopSlug || undefined,
      ...(allowCustomSeo && {
        shopMetaTitle: shopMetaTitle || null,
        shopMetaDescription: shopMetaDescription || null,
      }),
    },
  });

  return NextResponse.json({
    message: "Settings saved",
    shopSlug: updated.shopSlug,
  });
}
