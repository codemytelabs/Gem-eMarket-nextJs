import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildUploadFolder, signUploadParams } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/redis";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const DOCUMENT_TYPES = [...IMAGE_TYPES, "application/pdf", "image/tiff"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { allowed: withinRateLimit } = await rateLimit(
    `upload:${session.user.id}`,
    20,
    60,
  );
  if (!withinRateLimit) {
    return NextResponse.json(
      { message: "Too many uploads. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const { contentType, folder = "listings", sizeBytes } = await req.json();

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

  // Only sign the params the client actually sends back — Cloudinary requires
  // every non-file param in the signature, in this exact set.
  const timestamp = Math.round(Date.now() / 1000);
  const uploadFolder = buildUploadFolder(folder, session.user.id);
  const signature = signUploadParams({ timestamp, folder: uploadFolder });

  return NextResponse.json({
    timestamp,
    signature,
    folder: uploadFolder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
