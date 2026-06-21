// On Vercel, x-real-ip and x-vercel-forwarded-for are set by the edge
// network itself and cannot be spoofed by the client, unlike x-forwarded-for
// which a client can set directly. Fall back to x-forwarded-for's first hop
// only for non-Vercel deployments (e.g. self-hosted behind a trusted proxy).
// Accepts a plain Request so it also works inside NextAuth's authorize().
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
