import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateListingSchema } from "@/lib/validations/listing";
import { invalidateCache } from "@/lib/redis";

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
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.listing.findFirst({
    where: { id, sellerId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const updated = await db.listing.update({
    where: { id },
    data: parsed.data,
  });

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
  return NextResponse.json({ message: "Listing deleted" });
}
