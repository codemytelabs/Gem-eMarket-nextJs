import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getPresignedUploadUrl,
  buildStorageKey,
  getPublicUrl,
} from "@/lib/storage";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const DOCUMENT_TYPES = [...IMAGE_TYPES, "application/pdf", "image/tiff"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const {
    filename,
    contentType,
    folder = "listings",
    sizeBytes,
  } = await req.json();

  const allowed = folder === "documents" ? DOCUMENT_TYPES : IMAGE_TYPES;
  if (!allowed.includes(contentType)) {
    return NextResponse.json(
      {
        message:
          folder === "documents"
            ? "Only JPEG, PNG, WebP, AVIF, TIFF, and PDF files are allowed"
            : "Only JPEG, PNG, WebP, and AVIF images are allowed",
      },
      { status: 400 },
    );
  }

  if (sizeBytes && sizeBytes > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { message: "File exceeds the 10 MB limit" },
      { status: 400 },
    );
  }

  try {
    const key = buildStorageKey(folder, session.user.id, filename);
    const uploadUrl = await getPresignedUploadUrl(key, contentType, 300);
    const publicUrl = getPublicUrl(key);
    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("[upload] presign error:", err);
    return NextResponse.json(
      {
        message: "Storage service error. Please try again or contact support.",
      },
      { status: 500 },
    );
  }
}
