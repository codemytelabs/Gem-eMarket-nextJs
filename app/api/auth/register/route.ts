import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils/client-ip";
import {
  isChannelVerified,
  clearChannelVerified,
  normalizePhone,
} from "@/lib/otp";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await rateLimit(`register:${ip}`, 5, 3600);
  if (!allowed) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { name, email, password, phone, role, country, locationCity } =
    parsed.data;

  const emailVerified = await isChannelVerified(`email:${email}`);
  const phoneVerified = phone
    ? await isChannelVerified(`phone:${normalizePhone(phone)}`)
    : false;

  if (!emailVerified && !phoneVerified) {
    return NextResponse.json(
      { message: "Please verify your email or phone number to continue" },
      { status: 400 },
    );
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { message: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        emailVerified: emailVerified ? new Date() : null,
        passwordHash,
        phone,
        phoneVerified,
        role,
        country,
        locationCity,
      },
    });

    // Assign FREE subscription plan to sellers automatically
    if (role === "SELLER") {
      const freePlan = await tx.subscriptionPlan.findUnique({
        where: { name: "free" },
      });
      if (freePlan) {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setFullYear(periodEnd.getFullYear() + 10); // Free = never expires

        await tx.sellerSubscription.create({
          data: {
            sellerId: newUser.id,
            planId: freePlan.id,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            freeBoostsRemaining: freePlan.monthlyFreeBoosts,
          },
        });
      }
    }

    return newUser;
  });

  await clearChannelVerified(`email:${email}`);
  if (phone) await clearChannelVerified(`phone:${normalizePhone(phone)}`);

  return NextResponse.json(
    {
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 201 },
  );
}
