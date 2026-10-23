import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  return (
    process.env.GOOGLE_OAUTH_STATE_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    "veedu-dev-oauth-state"
  );
}

export function signOAuthState(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyOAuthState(
  state: string,
  maxAgeMs = 15 * 60 * 1000,
): string | null {
  try {
    const raw = Buffer.from(state, "base64url").toString("utf8");
    const [userId, ts, sig] = raw.split(".");
    if (!userId || !ts || !sig) return null;
    const payload = `${userId}.${ts}`;
    const expected = createHmac("sha256", secret()).update(payload).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (Date.now() - Number(ts) > maxAgeMs) return null;
    return userId;
  } catch {
    return null;
  }
}
