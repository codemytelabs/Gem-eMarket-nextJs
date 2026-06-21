import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({ token: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }

  await db.fcmToken.upsert({
    where: { token: parsed.data.token },
    create: { token: parsed.data.token, userId: session.user.id },
    update: { userId: session.user.id },
  });

  return NextResponse.json({ message: "Token registered" });
}
