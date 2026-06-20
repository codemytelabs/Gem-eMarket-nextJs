import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
import { adminListingActionSchema } from "@/lib/validations/listing";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.listing.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = adminListingActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  if (existing.status !== "PENDING_REVIEW") {
    return NextResponse.json(
      { message: "Only listings pending review can be actioned" },
      { status: 409 },
    );
  }

  const updated = await db.listing.update({
    where: { id },
    data:
      parsed.data.action === "approve"
        ? { status: "ACTIVE", rejectionReason: null }
        : { status: "CHANGES_REQUESTED", rejectionReason: parsed.data.reason },
  });

  await invalidateCache(`listings:*`);
  return NextResponse.json(updated);
}
