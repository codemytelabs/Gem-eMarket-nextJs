import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserSessions, revokeOtherSessions } from "@/lib/sessions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sessions = await getUserSessions(session.user.id);
  return NextResponse.json({
    sessions,
    currentSessionId: session.user.sessionId,
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id || !session.user.sessionId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await revokeOtherSessions(session.user.id, session.user.sessionId);
  return NextResponse.json({ message: "All other sessions signed out" });
}
