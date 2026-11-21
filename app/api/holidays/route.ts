import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("countryCode")?.toUpperCase();
  const dateParam = searchParams.get("date"); // e.g. "2026-11-21"

  if (!countryCode) {
    return NextResponse.json({ success: false, error: "Missing countryCode" }, { status: 400 });
  }

  const todayStr = dateParam || new Date().toISOString().slice(0, 10);
  const year = todayStr.slice(0, 4);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache 24 hours
      headers: {
        "User-Agent": "TimeBridge-App/1.0",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        isHoliday: false,
        holidayName: null,
      });
    }

    const holidays: NagerHoliday[] = await res.json();
    const todayHoliday = holidays.find((h) => h.date === todayStr);

    return NextResponse.json(
      {
        success: true,
        isHoliday: !!todayHoliday,
        holidayName: todayHoliday ? todayHoliday.name : null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch {
    // If upstream API is down or times out, fail gracefully
    return NextResponse.json(
      {
        success: true,
        isHoliday: false,
        holidayName: null,
      },
      { status: 200 }
    );
  }
}
