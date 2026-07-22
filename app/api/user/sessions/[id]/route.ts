import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revokeSession } from "@/lib/sessions";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: sessionId } = await params;

  // Confirm this session belongs to the requesting user before revoking
  const record = await db.userSession.findFirst({
    where: { sessionId, userId: session.user.id },
  });
  if (!record) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 });
  }

  await revokeSession(sessionId);
  return NextResponse.json({ message: "Session signed out" });
}
