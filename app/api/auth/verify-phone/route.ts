import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { verifyOtpToken } from "@/lib/firebase-admin";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils/client-ip";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await rateLimit(`otp:${ip}`, 10, 3600);
  if (!allowed) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ message: "idToken required" }, { status: 400 });
  }

  let phone: string;
  try {
    const result = await verifyOtpToken(idToken);
    phone = result.phone;
  } catch {
    return NextResponse.json({ message: "Invalid OTP token" }, { status: 401 });
  }

  // If user is authenticated, link phone to their account
  const session = await auth();
  if (session?.user?.id) {
    await db.user.update({
      where: { id: session.user.id },
      data: { phone, phoneVerified: true },
    });
    return NextResponse.json({
      message: "Phone verified and linked to account",
      phone,
    });
  }

  // Otherwise return verified phone for use in enquiry flow (no login required)
  return NextResponse.json({ message: "Phone verified", phone });
}
