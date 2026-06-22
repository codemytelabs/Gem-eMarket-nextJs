import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getFirestoreAdmin } from "@/lib/firebase-admin";

const bodySchema = z.union([
  z.object({ notificationId: z.string().min(1) }),
  z.object({ all: z.literal(true) }),
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const itemsRef = getFirestoreAdmin()
    .collection("notifications")
    .doc(session.user.id)
    .collection("items");

  if ("all" in parsed.data) {
    const unread = await itemsRef.where("read", "==", false).get();
    await Promise.all(unread.docs.map((doc) => doc.ref.update({ read: true })));
  } else {
    await itemsRef.doc(parsed.data.notificationId).update({ read: true });
  }

  return NextResponse.json({ message: "Marked read" });
}
