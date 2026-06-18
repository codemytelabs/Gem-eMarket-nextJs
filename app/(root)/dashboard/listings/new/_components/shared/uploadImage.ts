export async function uploadImage(
  file: File,
  folder: "listings" | "documents" = "listings",
): Promise<string> {
  const presignRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder,
      sizeBytes: file.size,
    }),
  });

  let presignData: {
    uploadUrl?: string;
    publicUrl?: string;
    message?: string;
  } = {};
  const ct = presignRes.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    presignData = await presignRes.json();
  }

  if (!presignRes.ok) {
    throw new Error(
      presignData.message ?? `Upload failed (${presignRes.status})`,
    );
  }

  if (!presignData.uploadUrl) {
    throw new Error("No upload URL received from server");
  }

  const putRes = await fetch(presignData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error("Failed to upload file to storage. Please try again.");
  }

  return presignData.publicUrl as string;
}
