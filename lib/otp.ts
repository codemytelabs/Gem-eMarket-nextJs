import crypto from "crypto";
import { redis } from "@/lib/redis";

// Codes are single-use and short-lived; "verified" flags outlive them so a
// multi-step signup form (verify -> fill in password -> submit) can still
// prove the channel was verified once the registration request finally lands.
const OTP_TTL_SECONDS = 300; // 5 minutes
const VERIFIED_TTL_SECONDS = 1800; // 30 minutes

// Registration sends "+94 77 123 4567" (the user-facing display format) while
// Firebase's decoded token returns "+94771234567" (E.164, no spaces) — strip
// everything but digits and the leading "+" so both sides hit the same key.
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function storeOtp(key: string, code: string): Promise<void> {
  await redis.set(`otp:${key}`, hashOtp(code), { ex: OTP_TTL_SECONDS });
}

export async function consumeOtp(key: string, code: string): Promise<boolean> {
  const stored = await redis.get<string>(`otp:${key}`);
  if (!stored || stored !== hashOtp(code)) return false;
  await redis.del(`otp:${key}`);
  return true;
}

export async function markChannelVerified(key: string): Promise<void> {
  // Upstash auto-JSON-decodes on get(), so a numeric-looking string like "1"
  // comes back as the number 1 — store/compare a real boolean instead so the
  // round trip is type-stable.
  await redis.set(`verified:${key}`, true, { ex: VERIFIED_TTL_SECONDS });
}

export async function isChannelVerified(key: string): Promise<boolean> {
  return (await redis.get<boolean>(`verified:${key}`)) === true;
}

export async function clearChannelVerified(key: string): Promise<void> {
  await redis.del(`verified:${key}`);
}
