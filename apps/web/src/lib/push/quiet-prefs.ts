const KEY = "veedu.quietHours";

export interface QuietPrefs {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

export const DEFAULT_QUIET_PREFS: QuietPrefs = {
  enabled: true,
  startHour: 22,
  endHour: 7,
};

export function loadQuietPrefs(): QuietPrefs {
  if (typeof window === "undefined") return DEFAULT_QUIET_PREFS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_QUIET_PREFS;
    const parsed = JSON.parse(raw) as Partial<QuietPrefs>;
    return {
      enabled: parsed.enabled ?? true,
      startHour: Number(parsed.startHour ?? 22),
      endHour: Number(parsed.endHour ?? 7),
    };
  } catch {
    return DEFAULT_QUIET_PREFS;
  }
}

export function saveQuietPrefs(prefs: QuietPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
