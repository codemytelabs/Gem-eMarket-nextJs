import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/messaging/server";

const bodySchema = z.object({ listingId: z.string().min(1) });

// Opens (or resumes) a direct chat with the seller — keyed by (buyer, seller),
// not by listing, so a buyer messaging the same seller about a second listing
// continues the same thread. No form, no message required yet: the buyer
// sends their first message in the chat UI itself, via
// /api/messages/[conversationId]/send, which is what actually attaches this
// listing's context to that message and backfills the per-listing Enquiry row.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: "Please log in to message a seller." },
      { status: 401 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const listing = await db.listing.findUnique({
    where: { id: parsed.data.listingId, status: "ACTIVE" },
    include: { seller: { select: { id: true, name: true } } },
  });
  if (!listing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  if (listing.sellerId === session.user.id) {
    return NextResponse.json(
      { message: "You can't message yourself about your own listing." },
      { status: 400 },
    );
  }

  const conversationId = await getOrCreateConversation({
    buyerId: session.user.id,
    buyerName: session.user.name,
    sellerId: listing.sellerId,
    sellerName: listing.seller.name,
  });

  return NextResponse.json({
    conversationId,
    listingContext: {
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      image: listing.images[0] ?? null,
    },
  });
}
