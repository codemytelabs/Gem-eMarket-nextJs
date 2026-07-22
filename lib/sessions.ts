import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

// Matches session maxAge in auth.ts (30 days)
const REVOKED_TTL = 30 * 24 * 60 * 60;

export async function createUserSession(data: {
  userId: string;
  sessionId: string;
  deviceName: string | null;
  deviceType: string | null;
  ip: string | null;
}): Promise<void> {
  await db.userSession.create({ data });
}

export async function touchUserSession(sessionId: string): Promise<void> {
  // Throttle DB writes to once per 5 minutes per session to avoid hammering
  // the DB on every authenticated request.
  const key = `session:touch:${sessionId}`;
  const already = await redis.get(key);
  if (already) return;
  await redis.set(key, 1, { ex: 300 });
  await db.userSession.updateMany({
    where: { sessionId },
    data: { lastSeenAt: new Date() },
  });
}

export async function revokeSession(sessionId: string): Promise<void> {
  await Promise.all([
    redis.set(`revoked:${sessionId}`, 1, { ex: REVOKED_TTL }),
    db.userSession.deleteMany({ where: { sessionId } }),
  ]);
}

export async function isSessionRevoked(sessionId: string): Promise<boolean> {
  return (await redis.get(`revoked:${sessionId}`)) !== null;
}

export async function getUserSessions(userId: string) {
  return db.userSession.findMany({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
  });
}

export async function revokeOtherSessions(
  userId: string,
  currentSessionId: string,
): Promise<void> {
  const others = await db.userSession.findMany({
    where: { userId, sessionId: { not: currentSessionId } },
    select: { sessionId: true },
  });
  await Promise.all(others.map((s) => revokeSession(s.sessionId)));
}
