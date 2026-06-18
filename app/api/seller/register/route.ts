import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const registerSellerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  country: z.string().optional(),
  locationCity: z.string().optional(),
  shopSlug: z
    .string()
    .min(3, "Shop URL must be at least 3 characters")
    .max(60)
    .regex(
      /^[a-z0-9-]+$/,
      "Shop URL may only contain lowercase letters, numbers, and hyphens",
    )
    .optional(),
  shopBio: z.string().max(500).optional(),
  specialties: z.array(z.string()).optional(),
  agreeToTerms: z.literal(true, { message: "You must agree to the terms" }),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: "Please sign in first" },
      { status: 401 },
    );
  }
  if (session.user.role !== "BUYER") {
    return NextResponse.json(
      { message: "You are already registered as a seller" },
      { status: 409 },
    );
  }

  const body = await req.json();
  const parsed = registerSellerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const {
    name,
    phone,
    whatsappNumber,
    country,
    locationCity,
    shopBio,
    specialties,
    shopSlug,
  } = parsed.data;

  // Check slug uniqueness (only when a slug was submitted)
  if (shopSlug) {
    const slugConflict = await db.user.findFirst({
      where: { shopSlug, NOT: { id: session.user.id } },
    });
    if (slugConflict) {
      return NextResponse.json(
        {
          message:
            "That shop URL is already taken. Please choose a different one.",
        },
        { status: 409 },
      );
    }
  }

  // Get the free subscription plan
  const freePlan = await db.subscriptionPlan.findFirst({
    where: { name: "free" },
  });

  // Upgrade user to SELLER + set shop info in one transaction
  const now = new Date();
  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        role: "SELLER",
        name,
        phone,
        whatsappNumber,
        country,
        locationCity,
        shopSlug,
        shopBio,
        specialties,
      },
    });

    // Create free subscription if a free plan exists and no subscription yet
    if (freePlan) {
      await tx.sellerSubscription.upsert({
        where: { sellerId: session.user.id },
        create: {
          sellerId: session.user.id,
          planId: freePlan.id,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: oneYearLater,
          freeBoostsRemaining: freePlan.monthlyFreeBoosts,
        },
        update: {},
      });
    }
  });

  return NextResponse.json(
    { message: "Seller account created successfully" },
    { status: 201 },
  );
}
