import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { couponCreateSchema } from "@/lib/validations/subscription";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const coupons = await db.couponCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    coupons.map((c) => ({
      ...c,
      discountValue: Number(c.discountValue),
    })),
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = couponCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { validFrom, validUntil, ...rest } = parsed.data;

  const existing = await db.couponCode.findUnique({
    where: { code: rest.code },
  });
  if (existing) {
    return NextResponse.json(
      { message: "A coupon with this code already exists" },
      { status: 409 },
    );
  }

  const coupon = await db.couponCode.create({
    data: {
      ...rest,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}
