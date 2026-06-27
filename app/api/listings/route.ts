import { NextRequest, NextResponse } from "next/server";
import type { Prisma, ListingCategory } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createListingSchema } from "@/lib/validations/listing";
import { getCached, setCached } from "@/lib/redis";
import slugify from "@/lib/utils/slugify";
import { getReelQuotaStatus } from "@/lib/reelQuota";
import { flattenFieldErrors } from "@/lib/utils/zodErrors";
import {
  CATEGORY_IMAGE_MAX,
  CERTIFICATION_IMAGE_MAX,
  getEffectiveLimit,
} from "@/lib/constants/imageLimits";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const gemType = searchParams.get("gemType");
  const search = searchParams.get("q");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 48);
  const sellerId = searchParams.get("sellerId");

  const cacheKey = `listings:${category}:${gemType}:${search}:${page}:${limit}:${sellerId}`;
  const cached = await getCached<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const where: Prisma.ListingWhereInput = { status: "ACTIVE" };
  if (category) where.category = category as ListingCategory;
  if (gemType) where.gemType = gemType;
  if (sellerId) where.sellerId = sellerId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { gemType: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    db.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            shopSlug: true,
            avatarUrl: true,
            isVerified: true,
            locationCity: true,
            specialties: true,
            subscription: { select: { plan: { select: { name: true } } } },
          },
        },
      },
      orderBy: [
        // Boosted first, then by plan tier, then newest
        { isBoosted: "desc" },
        { isFeaturedHomepage: "desc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.listing.count({ where }),
  ]);

  const response = {
    items: items.map((l) => ({
      ...l,
      seller: {
        ...l.seller,
        planName: l.seller.subscription?.plan.name ?? "free",
        subscription: undefined,
      },
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };

  await setCached(cacheKey, response, 1800); // 30 minutes
  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0].message,
        fieldErrors: flattenFieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  // Check plan listing limit
  const subscription = await db.sellerSubscription.findUnique({
    where: { sellerId: session.user.id },
    include: { plan: true },
  });
  const plan = subscription?.plan;

  if (plan?.maxListings !== null && plan?.maxListings !== undefined) {
    const activeCount = await db.listing.count({
      where: { sellerId: session.user.id, status: "ACTIVE" },
    });
    if (activeCount >= plan.maxListings) {
      return NextResponse.json(
        {
          message: `Your ${plan.displayName} plan allows max ${plan.maxListings} active listings. Upgrade to add more.`,
        },
        { status: 403 },
      );
    }
  }

  const imageLimit = getEffectiveLimit(
    CATEGORY_IMAGE_MAX[parsed.data.category],
    plan?.maxImagesPerListing ?? null,
  );
  if (parsed.data.images.length > imageLimit.max) {
    return NextResponse.json(
      {
        message: `Your plan allows up to ${imageLimit.max} photos per listing. Upgrade for more.`,
      },
      { status: 403 },
    );
  }

  const certLimit = getEffectiveLimit(
    CERTIFICATION_IMAGE_MAX,
    plan?.maxCertificationImages ?? null,
  );
  if ((parsed.data.certificationImages?.length ?? 0) > certLimit.max) {
    return NextResponse.json(
      {
        message: `Your plan allows up to ${certLimit.max} certification documents. Upgrade for more.`,
      },
      { status: 403 },
    );
  }

  if (parsed.data.reelUrl) {
    const quota = await getReelQuotaStatus(session.user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        { message: "Your plan's reel upload allowance is used up." },
        { status: 403 },
      );
    }
  }

  const { title, ...rest } = parsed.data;
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 0;
  while (await db.listing.findUnique({ where: { slug } })) {
    suffix++;
    slug = `${baseSlug}-${suffix}`;
  }

  // Auto-generate SEO if not provided
  const metaTitle =
    rest.metaTitle ??
    (rest.caratWeight && rest.gemType
      ? `${rest.caratWeight}ct ${rest.gemType}${rest.gemOrigin ? ` from ${rest.gemOrigin}` : ""} | Lumevelo`
      : `${title} | Lumevelo`);

  const metaDescription =
    rest.metaDescription ??
    `Buy certified ${rest.gemType ?? title}${rest.gemOrigin ? ` sourced from ${rest.gemOrigin}` : ""}${rest.caratWeight ? `. ${rest.caratWeight} carats` : ""}${rest.certificationBody ? `, certified by ${rest.certificationBody}` : ""}. Verified seller. Enquire now.`;

  // Set expiry date from plan (null = never expires)
  let expiresAt: Date | null = null;
  if (plan?.listingDurationDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.listingDurationDays);
  }

  const listing = await db.listing.create({
    data: {
      ...rest,
      title,
      slug,
      sellerId: session.user.id,
      metaTitle,
      metaDescription,
      expiresAt,
      status: "PENDING_REVIEW",
    },
  });

  if (listing.reelUrl) {
    await db.reelUpload.create({
      data: { sellerId: session.user.id, listingId: listing.id },
    });
  }

  return NextResponse.json(listing, { status: 201 });
}
