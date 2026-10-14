/** Default quiet hours match Settings copy: 22:00 – 07:00 (local). */
export const QUIET_HOURS = {
  startHour: 22,
  endHour: 7,
};

export function isQuietHours(
  date = new Date(),
  startHour: number = QUIET_HOURS.startHour,
  endHour: number = QUIET_HOURS.endHour,
): boolean {
  const hour = date.getHours();
  if (startHour === endHour) return false;
  if (startHour > endHour) {
    // wraps midnight, e.g. 22–07
    return hour >= startHour || hour < endHour;
  }
  return hour >= startHour && hour < endHour;
}
