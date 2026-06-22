import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { mintCustomToken } from "@/lib/firebase-admin";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = await mintCustomToken(session.user.id);
  return NextResponse.json({ token });
}
