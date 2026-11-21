import { NextRequest, NextResponse } from "next/server";

interface DailyData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

function getWmoCondition(code: number): { name: string; icon: string } {
  if (code === 0) return { name: "Clear sky", icon: "sun" };
  if (code === 1) return { name: "Mainly clear", icon: "sun-cloud" };
  if (code === 2) return { name: "Partly cloudy", icon: "cloud-sun" };
  if (code === 3) return { name: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48) return { name: "Foggy", icon: "fog" };
  if (code >= 51 && code <= 57) return { name: "Drizzle", icon: "drizzle" };
  if (code >= 61 && code <= 67) return { name: "Rain", icon: "rain" };
  if (code >= 71 && code <= 77) return { name: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { name: "Rain showers", icon: "rain" };
  if (code >= 85 && code <= 86) return { name: "Snow showers", icon: "snow" };
  if (code >= 95 && code <= 99) return { name: "Thunderstorm", icon: "thunderstorm" };
  return { name: "Partly cloudy", icon: "cloud-sun" };
}

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

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,apparent_temperature,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`;

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 900 }, // Cache 15 min in Next.js
      headers: {
        "User-Agent": "TimeBridge-App/1.0",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Upstream error ${res.status}` }, { status: 502 });
    }

    const text = await res.text();
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Empty weather response" });
    }
    const data = JSON.parse(text);
    const current = data.current;
    const daily: DailyData = data.daily;

    const condition = getWmoCondition(current?.weather_code ?? 0);

    const forecast = (daily?.time || []).map((dateStr, idx) => {
      const cond = getWmoCondition(daily.weather_code[idx] ?? 0);
      const d = new Date(dateStr);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      return {
        date: dateStr,
        day: idx === 0 ? "Today" : dayName,
        maxTemp: Math.round(daily.temperature_2m_max[idx] ?? 0),
        minTemp: Math.round(daily.temperature_2m_min[idx] ?? 0),
        condition: cond.name,
        icon: cond.icon,
      };
    });

    return NextResponse.json(
      {
        success: true,
        current: {
          temperature: Math.round(current.temperature_2m ?? 0),
          feelsLike: Math.round(current.apparent_temperature ?? 0),
          condition: condition.name,
          icon: condition.icon,
          isDay: current.is_day === 1,
        },
        forecast,
        attribution: "Weather data by Open-Meteo.com (CC BY 4.0)",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 200 });
  }
}
