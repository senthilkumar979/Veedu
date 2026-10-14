import { NextResponse } from "next/server";
import { weatherForLocations } from "@/lib/weather";

export const dynamic = "force-dynamic";

/**
 * GET /api/weather?home=Antwerp&parents=Dindigul
 *
 * Resolves place-name strings via Open-Meteo Geocoding (first match),
 * then fetches current forecast. No API key required.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get("home");
  const parents = searchParams.get("parents");

  try {
    const data = await weatherForLocations({ home, parents });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        home: {
          snapshot: null,
          error: err instanceof Error ? err.message : "Weather failed",
          source: "empty",
        },
        parents: {
          snapshot: null,
          error: err instanceof Error ? err.message : "Weather failed",
          source: "empty",
        },
      },
      { status: 200 },
    );
  }
}
