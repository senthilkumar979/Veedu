import type { PendingGoogleTokens } from "./oauth-cookie";

/**
 * In-process stash for OAuth tokens between /callback and /finish.
 * Works for `next dev` and single-node deploys. Cookie is a backup for
 * multi-instance / cold starts; prefer SUPABASE_SERVICE_ROLE_KEY in prod.
 */
const g = globalThis as unknown as {
  __veeduGooglePending?: Map<string, PendingGoogleTokens>;
};

function store(): Map<string, PendingGoogleTokens> {
  if (!g.__veeduGooglePending) g.__veeduGooglePending = new Map();
  return g.__veeduGooglePending;
}

export function setPendingGoogleTokens(
  userId: string,
  tokens: PendingGoogleTokens,
) {
  store().set(userId, tokens);
}

export function peekPendingGoogleTokens(
  userId: string,
): PendingGoogleTokens | null {
  return store().get(userId) ?? null;
}

export function clearPendingGoogleTokens(userId: string) {
  store().delete(userId);
}
