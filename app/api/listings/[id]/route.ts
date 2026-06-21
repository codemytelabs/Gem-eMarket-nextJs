import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateListingSchema } from "@/lib/validations/listing";
import { invalidateCache } from "@/lib/redis";
import { deleteAsset } from "@/lib/cloudinary";
import { getReelQuotaStatus } from "@/lib/reelQuota";
import { flattenFieldErrors } from "@/lib/utils/zodErrors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const listing = await db.listing.findFirst({
    where: { OR: [{ id }, { slug: id }], status: "ACTIVE" },
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
          shopBio: true,
          whatsappNumber: true,
          subscription: {
            select: { plan: { select: { name: true, displayName: true } } },
          },
        },
      },
    },
  });

  if (!listing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  // Track view asynchronously (fire and forget)
  const ip = req.headers.get("x-forwarded-for") ?? undefined;
  db.listingView
    .create({ data: { listingId: listing.id, viewerIp: ip } })
    .catch(() => {});

  return NextResponse.json({
    ...listing,
    seller: {
      ...listing.seller,
      planName: listing.seller.subscription?.plan.name ?? "free",
      subscription: undefined,
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "SELLER" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const isAdmin = session.user.role === "ADMIN";
  const existing = await db.listing.findFirst({
    where: isAdmin ? { id } : { id, sellerId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0].message,
        fieldErrors: flattenFieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  // Seller editing a listing that needed changes counts as resubmitting it for review
  const isResubmission =
    !isAdmin &&
    (existing.status === "CHANGES_REQUESTED" || existing.status === "REJECTED");

  const isNewReel =
    !isAdmin &&
    !!parsed.data.reelUrl &&
    parsed.data.reelUrl !== existing.reelUrl;

  if (isNewReel) {
    const quota = await getReelQuotaStatus(session.user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        { message: "Your plan's reel upload allowance is used up." },
        { status: 403 },
      );
    }
  }

  const updated = await db.listing.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(isResubmission
        ? { status: "PENDING_REVIEW", rejectionReason: null }
        : {}),
    },
  });

  if (isNewReel) {
    await db.reelUpload.create({
      data: { sellerId: existing.sellerId, listingId: existing.id },
    });
  }

  // Clean up any images/certs/reel that were replaced or removed in this edit
  const removedImages = [
    ...existing.images.filter((url) => !updated.images.includes(url)),
    ...existing.certificationImages.filter(
      (url) => !updated.certificationImages.includes(url),
    ),
  ];
  await Promise.all(
    removedImages.map((url) => deleteAsset(url).catch(() => {})),
  );
  if (existing.reelUrl && existing.reelUrl !== updated.reelUrl) {
    await deleteAsset(existing.reelUrl, "video").catch(() => {});
  }

  await invalidateCache(`listings:*`);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const where =
    session.user.role === "ADMIN" ? { id } : { id, sellerId: session.user.id };

  const existing = await db.listing.findFirst({ where });
  if (!existing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  await db.listing.delete({ where: { id } });

  await Promise.all(
    [...existing.images, ...existing.certificationImages].map((url) =>
      deleteAsset(url).catch(() => {}),
    ),
  );
  if (existing.reelUrl) {
    await deleteAsset(existing.reelUrl, "video").catch(() => {});
  }

  return NextResponse.json({ message: "Listing deleted" });
}
