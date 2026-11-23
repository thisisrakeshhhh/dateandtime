import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weatherAdapter";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json({ success: false, error: "Missing coordinates" }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ success: false, error: "Invalid coordinates" }, { status: 400 });
  }

  const weather = await fetchWeather(lat, lng);

  return NextResponse.json(weather, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
    },
  });
}
