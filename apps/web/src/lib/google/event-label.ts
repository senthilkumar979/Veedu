/** Badge label from synced Google external_id (`family::…` / `primary::…`). */
export function googleEventCalendarLabel(
  externalId: string | null | undefined,
): string | null {
  if (!externalId) return null;
  if (externalId.startsWith("family::")) return "Family";
  if (externalId.startsWith("primary::")) return "Primary";
  return null;
}
