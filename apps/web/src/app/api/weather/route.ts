import { NextResponse } from "next/server";
import type { ParentLocation } from "@veedu/types";
import { weatherForLocations } from "@/lib/weather";

export const dynamic = "force-dynamic";

/**
 * GET /api/weather?home=Antwerp&parents=Amma:Dindigul,Appa:Chennai
 * Legacy: ?parents=Dindigul (single place, label "Parents")
 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseParents(raw: string | null): ParentLocation[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => {
      const colon = part.indexOf(":");
      if (colon > 0) {
        return {
          label:
            safeDecode(part.slice(0, colon).trim()) || `Parent ${index + 1}`,
          place: safeDecode(part.slice(colon + 1).trim()),
        };
      }
      return {
        label: index === 0 ? "Parents" : `Parent ${index + 1}`,
        place: safeDecode(part),
      };
    })
    .filter((p) => p.place);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get("home");
  const parents = parseParents(searchParams.get("parents"));

  try {
    const data = await weatherForLocations({ home, parents });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Weather failed";
    return NextResponse.json(
      {
        home: { snapshot: null, error: message, source: "empty", label: "Home" },
        parents: parents.map((p) => ({
          snapshot: null,
          error: message,
          source: "empty",
          label: p.label,
        })),
      },
      { status: 200 },
    );
  }
}
