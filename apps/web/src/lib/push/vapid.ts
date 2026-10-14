export function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || "";
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:ops@veedu.app";

  return {
    publicKey,
    privateKey,
    subject,
    isConfigured: Boolean(publicKey && privateKey),
  };
}
