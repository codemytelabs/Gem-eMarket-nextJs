interface SignResponse {
  timestamp?: number;
  signature?: string;
  folder?: string;
  apiKey?: string;
  cloudName?: string;
  message?: string;
}

export async function uploadImage(
  file: File,
  folder: "listings" | "documents" = "listings",
): Promise<string> {
  const signRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: file.type,
      folder,
      sizeBytes: file.size,
    }),
  });

  let signData: SignResponse = {};
  const ct = signRes.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    signData = await signRes.json();
  }

  if (!signRes.ok) {
    throw new Error(signData.message ?? `Upload failed (${signRes.status})`);
  }

  const {
    timestamp,
    signature,
    folder: cloudFolder,
    apiKey,
    cloudName,
  } = signData;
  if (!timestamp || !signature || !apiKey || !cloudName) {
    throw new Error("No upload credentials received from server");
  }

  // Browser uploads straight to Cloudinary — our server never touches the
  // file bytes, so it never spends bandwidth or memory on the upload itself.
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", cloudFolder!);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(
      uploadData.error?.message ?? "Failed to upload file to Cloudinary",
    );
  }

  return uploadData.secure_url as string;
}
