import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Session } from "next-auth";
import { verifyOtpToken } from "@/lib/firebase-admin";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils/client-ip";
import { markChannelVerified, normalizePhone } from "@/lib/otp";

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

  // Flagged regardless of session, so an unauthenticated registration flow
  // can later prove this phone was verified when the account is created.
  await markChannelVerified(`phone:${normalizePhone(phone)}`);

  // If user is authenticated, link phone to their account.
  // Guard against JWTSessionError (stale/rotated AUTH_SECRET) — auth() should
  // return null on decrypt failure but can throw in some NextAuth v5 builds.
  let session: Session | null = null;
  try {
    session = await auth();
  } catch {
    // Treat decrypt errors as unauthenticated — the channel is already flagged.
  }
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

  // Otherwise return verified phone for use in enquiry/registration flows
  // (no login required)
  return NextResponse.json({ message: "Phone verified", phone });
}
