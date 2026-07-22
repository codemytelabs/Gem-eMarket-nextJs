import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Session } from "next-auth";
import { db } from "@/lib/db";
import { verifyEmailOtpSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils/client-ip";
import { consumeOtp, markChannelVerified } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await rateLimit(`email-otp-verify:${ip}`, 10, 600);
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = verifyEmailOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { email, code } = parsed.data;
  const valid = await consumeOtp(`email:${email}`, code);
  if (!valid) {
    return NextResponse.json(
      { message: "Incorrect or expired code" },
      { status: 400 },
    );
  }

  await markChannelVerified(`email:${email}`);

  // If a logged-in user is verifying their own email (e.g. account settings),
  // reflect it immediately rather than waiting on the registration flow.
  let session: Session | null = null;
  try {
    session = await auth();
  } catch {
    // Treat decrypt errors as unauthenticated.
  }
  if (session?.user?.id) {
    await db.user.update({
      where: { id: session.user.id },
      data: { emailVerified: new Date() },
    });
  }

  return NextResponse.json({ message: "Email verified", email });
}
