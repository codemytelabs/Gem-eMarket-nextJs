import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 is S3-compatible. Swap to any S3-compatible provider
// by updating STORAGE_* env vars. No code changes needed.
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.STORAGE_ENDPOINT!, // https://<accountid>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.STORAGE_BUCKET_NAME!;
const PUBLIC_URL = process.env.STORAGE_PUBLIC_URL!; // R2 public bucket URL or CDN

export type UploadFolder =
  | "listings"
  | "profiles"
  | "banners"
  | "documents"
  | "reels";

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export function buildStorageKey(
  folder: UploadFolder,
  userId: string,
  filename: string,
): string {
  const ext = filename.split(".").pop();
  const timestamp = Date.now();
  return `${folder}/${userId}/${timestamp}.${ext}`;
}
