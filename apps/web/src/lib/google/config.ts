export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/contacts.readonly",
] as const;

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || "";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/google/callback`;
  return {
    clientId,
    clientSecret,
    redirectUri,
    appUrl: appUrl.replace(/\/$/, ""),
    isConfigured: Boolean(clientId && clientSecret),
  };
}
