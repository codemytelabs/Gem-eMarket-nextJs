import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { enquirySchema } from "@/lib/validations/subscription";
import { rateLimit } from "@/lib/redis";
import { sendEnquiryNotification } from "@/lib/email";
import { verifyOtpToken } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  // Rate limit: 10 enquiries per IP per 24h
  const { allowed } = await rateLimit(`enquiry:${ip}`, 10, 86400);
  if (!allowed) {
    return NextResponse.json(
      {
        message:
          "You have reached the daily enquiry limit. Try again tomorrow.",
      },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const {
    listingId,
    buyerName,
    buyerPhone,
    buyerEmail,
    message,
    firebaseIdToken,
  } = parsed.data;

  let buyerPhoneVerified = false;

  // Verify phone via Firebase OTP token if provided
  if (firebaseIdToken) {
    try {
      const { phone } = await verifyOtpToken(firebaseIdToken);
      if (phone !== buyerPhone) {
        return NextResponse.json(
          { message: "Phone number does not match OTP" },
          { status: 400 },
        );
      }
      buyerPhoneVerified = true;
    } catch {
      return NextResponse.json(
        { message: "Invalid OTP verification" },
        { status: 401 },
      );
    }
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId, status: "ACTIVE" },
    include: { seller: { select: { id: true, email: true, name: true } } },
  });

  if (!listing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  // Rate limit per listing: max 3 enquiries per IP per listing per day
  const listingRateKey = `enquiry:${ip}:${listingId}`;
  const listingRate = await rateLimit(listingRateKey, 3, 86400);
  if (!listingRate.allowed) {
    return NextResponse.json(
      {
        message:
          "You have already sent too many enquiries for this listing today.",
      },
      { status: 429 },
    );
  }

  const session = await auth();

  const enquiry = await db.enquiry.create({
    data: {
      listingId,
      sellerId: listing.sellerId,
      buyerId: session?.user?.id,
      buyerName,
      buyerPhone,
      buyerEmail,
      buyerPhoneVerified,
      message,
    },
  });

  // Track analytics
  await db.sellerAnalyticsDaily
    .upsert({
      where: {
        sellerId_date: { sellerId: listing.sellerId, date: new Date() },
      },
      create: {
        sellerId: listing.sellerId,
        date: new Date(),
        enquiriesReceived: 1,
      },
      update: { enquiriesReceived: { increment: 1 } },
    })
    .catch(() => {});

  // Notify seller via email
  await sendEnquiryNotification(
    listing.seller.email,
    listing.seller.name,
    listing.title,
    buyerName,
    message,
  ).catch(() => {});

  return NextResponse.json(
    {
      message: "Enquiry sent! The seller will contact you soon.",
      id: enquiry.id,
    },
    { status: 201 },
  );
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const [items, total] = await Promise.all([
    db.enquiry.findMany({
      where: { sellerId: session.user.id },
      include: {
        listing: {
          select: { id: true, title: true, slug: true, images: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.enquiry.count({ where: { sellerId: session.user.id } }),
  ]);

  return NextResponse.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
