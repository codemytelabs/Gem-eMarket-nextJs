"use client";

import { useState } from "react";

export function useCreateListing(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create listing");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
