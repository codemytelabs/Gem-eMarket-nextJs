import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markConversationRead } from "@/lib/messaging/server";
import { getFirestoreAdmin } from "@/lib/firebase-admin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;

  const snap = await getFirestoreAdmin()
    .collection("conversations")
    .doc(conversationId)
    .get();
  if (!snap.exists || !snap.data()?.participants?.includes(session.user.id)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await markConversationRead(conversationId, session.user.id);
  return NextResponse.json({ message: "Marked read" });
}
