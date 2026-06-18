import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { couponUpdateSchema } from "@/lib/validations/subscription";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const coupon = await db.couponCode.findUnique({ where: { id } });
  if (!coupon) {
    return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...coupon,
    discountValue: Number(coupon.discountValue),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.couponCode.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = couponUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { validFrom, validUntil, code, ...rest } = parsed.data;

  if (code && code !== existing.code) {
    const codeTaken = await db.couponCode.findUnique({ where: { code } });
    if (codeTaken) {
      return NextResponse.json(
        { message: "A coupon with this code already exists" },
        { status: 409 },
      );
    }
  }

  const coupon = await db.couponCode.update({
    where: { id },
    data: {
      ...rest,
      ...(code ? { code } : {}),
      ...(validFrom !== undefined
        ? { validFrom: validFrom ? new Date(validFrom) : null }
        : {}),
      ...(validUntil !== undefined
        ? { validUntil: validUntil ? new Date(validUntil) : null }
        : {}),
    },
  });

  return NextResponse.json({
    ...coupon,
    discountValue: Number(coupon.discountValue),
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.couponCode.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
  }

  await db.couponCode.delete({ where: { id } });
  return NextResponse.json({ message: "Coupon deleted" });
}
