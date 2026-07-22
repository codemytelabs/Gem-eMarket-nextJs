import { NextRequest, NextResponse } from "next/server";
import { sendEmailOtpSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils/client-ip";
import { generateOtpCode, storeOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await rateLimit(`email-otp:${ip}`, 5, 600);
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many requests. Try again later." },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = sendEmailOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { email } = parsed.data;
  const { allowed: addressAllowed } = await rateLimit(
    `email-otp-addr:${email}`,
    5,
    600,
  );
  if (!addressAllowed) {
    return NextResponse.json(
      { message: "Too many requests for this email. Try again later." },
      { status: 429 },
    );
  }

  const code = generateOtpCode();
  await storeOtp(`email:${email}`, code);
  await sendOtpEmail(email, code);

  return NextResponse.json({ message: "Verification code sent" });
}
