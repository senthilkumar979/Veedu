import type { Household, ParentLocation } from "@veedu/types";

const MAX_PARENTS = 2;

export function normalizeParentLocations(
  input: Array<{ label?: string; place?: string }> | null | undefined,
): ParentLocation[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((row, index) => ({
      label: (row.label ?? `Parent ${index + 1}`).trim() || `Parent ${index + 1}`,
      place: (row.place ?? "").trim(),
    }))
    .filter((row) => row.place.length > 0)
    .slice(0, MAX_PARENTS);
}

/** Resolve up to two parent places, falling back to legacy parents_location. */
export function resolveParentLocations(
  household: Pick<Household, "parents_location" | "parents_locations"> | null | undefined,
): ParentLocation[] {
  if (!household) return [];
  const fromJson = normalizeParentLocations(household.parents_locations);
  if (fromJson.length) return fromJson;
  const legacy = household.parents_location?.trim();
  if (legacy) return [{ label: "Parents", place: legacy }];
  return [];
}

export function parentLocationsForSave(
  rows: Array<{ label: string; place: string }>,
): { parents_locations: ParentLocation[]; parents_location: string | null } {
  const parents_locations = normalizeParentLocations(rows);
  return {
    parents_locations,
    parents_location: parents_locations[0]?.place ?? null,
  };
}
