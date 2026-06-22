import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appendMessage, createNotification } from "@/lib/messaging/server";
import { sendEnquiryNotification } from "@/lib/email";

const bodySchema = z.object({
  text: z.string().min(1).max(1000),
  replyTo: z
    .object({
      messageId: z.string().min(1),
      senderId: z.string().min(1),
      text: z.string().min(1),
    })
    .optional(),
  listingContext: z
    .object({
      id: z.string().min(1),
      title: z.string().min(1),
      slug: z.string().min(1),
      image: z.string().nullable(),
    })
    .optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const { text, replyTo, listingContext } = parsed.data;

  try {
    const { recipientId, conversation } = await appendMessage(
      conversationId,
      session.user.id,
      text,
      replyTo,
      listingContext,
    );

    await createNotification({
      userId: recipientId,
      type: "message",
      title: `${session.user.name}`,
      body: listingContext ? `Re: ${listingContext.title} — ${text}` : text,
      link: `/messages/${conversationId}`,
      conversationId,
    });

    // A message that references a listing doubles as that listing's "enquiry"
    // — record it for the seller's /dashboard/enquiries feed + email alert,
    // same as the old form used to, just triggered by the chat instead. Only
    // once per (buyer, listing): asking about the same listing again just
    // continues the existing thread without re-recording the enquiry.
    if (listingContext && session.user.id === conversation.buyerId) {
      const alreadyEnquired = await db.enquiry.findFirst({
        where: { listingId: listingContext.id, buyerId: conversation.buyerId },
        select: { id: true },
      });

      if (!alreadyEnquired) {
        await db.enquiry
          .create({
            data: {
              listingId: listingContext.id,
              sellerId: conversation.sellerId,
              buyerId: conversation.buyerId,
              buyerName: conversation.buyerName,
              message: text,
              conversationId,
            },
          })
          .catch(() => {});

        await db.sellerAnalyticsDaily
          .upsert({
            where: {
              sellerId_date: {
                sellerId: conversation.sellerId,
                date: new Date(),
              },
            },
            create: {
              sellerId: conversation.sellerId,
              date: new Date(),
              enquiriesReceived: 1,
            },
            update: { enquiriesReceived: { increment: 1 } },
          })
          .catch(() => {});

        const seller = await db.user.findUnique({
          where: { id: conversation.sellerId },
          select: { email: true, name: true },
        });
        if (seller) {
          await sendEnquiryNotification(
            seller.email,
            seller.name,
            listingContext.title,
            conversation.buyerName,
            text,
          ).catch(() => {});
        }
      }
    }

    return NextResponse.json({ message: "Sent" }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send message";
    const status =
      message === "Sender is not a participant in this conversation"
        ? 403
        : 400;
    return NextResponse.json({ message }, { status });
  }
}
