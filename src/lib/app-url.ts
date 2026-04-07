/**
 * Canonical base URL for links (e.g. password reset). Prefer AUTH_URL in production.
 */
export function getAppBaseUrl(): string {
  const explicit = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}
