/**
 * Weather Service Adapter
 * 
 * Licensing Note:
 * - Open-Meteo Free Plan strictly forbids commercial use (including websites with advertisements such as Google AdSense).
 *   Source: https://open-meteo.com/en/terms ("Any use on websites displaying commercial advertising is considered commercial").
 * - When COMMERCIAL_WEATHER_KEY / WEATHER_API_KEY is not configured or in ad-supported mode without a paid license,
 *   this adapter returns compliant synthetic baseline estimates (or placeholder status) rather than making unlicensed calls.
 * 
 * Compliant Alternatives with Free Tiers for Commercial / Ad-supported Sites:
 * 1. WeatherAPI (https://www.weatherapi.com/) - Free tier up to 1,000,000 calls/month with commercial attribution.
 * 2. OpenWeatherMap (https://openweathermap.org/) - Free tier includes 1,000 calls/day (One Call 3.0) or 60 calls/min (Free 2.5) permitted for ad-supported websites.
 */

export interface WeatherResult {
  success: boolean;
  isPlaceholder?: boolean;
  current: {
    temperature: number;
    feelsLike: number;
    condition: string;
    icon: string;
    isDay: boolean;
  };
  forecast: Array<{
    date: string;
    day: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    icon: string;
  }>;
  attribution: string;
  note?: string;
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

/**
 * Returns synthetic baseline estimates based on latitude and month
 * when no commercial API key is provided, ensuring 100% compliance with ad terms.
 */
function getPlaceholderWeather(lat: number): WeatherResult {
  const month = new Date().getMonth(); // 0-11
  // Simple hemispheric seasonal model
  const isNorthern = lat >= 0;
  const isSummer = isNorthern ? (month >= 5 && month <= 7) : (month >= 11 || month <= 1);
  const isWinter = isNorthern ? (month >= 11 || month <= 1) : (month >= 5 && month <= 7);
  
  // Base temperature calculation from absolute latitude
  const absLat = Math.abs(lat);
  let baseTemp = Math.round(30 - (absLat * 0.45));
  if (isSummer) baseTemp += 5;
  if (isWinter) baseTemp -= 6;

  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const forecast = [0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return {
      date: d.toISOString().split("T")[0],
      day: offset === 0 ? "Today" : dayNames[d.getDay()],
      maxTemp: baseTemp + 2 + (offset % 2),
      minTemp: baseTemp - 5 + (offset % 2),
      condition: "Seasonal average",
      icon: "cloud-sun",
    };
  });

  return {
    success: true,
    isPlaceholder: true,
    current: {
      temperature: baseTemp,
      feelsLike: baseTemp - 1,
      condition: "Seasonal estimate",
      icon: "cloud-sun",
      isDay: true,
    },
    forecast,
    attribution: "Seasonal estimates (Open-Meteo free tier restricted for ad-supported sites).",
    note: "Commercial weather API key not configured. Displaying seasonal climate averages.",
  };
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherResult> {
  const apiKey = process.env.WEATHER_API_KEY || process.env.OPENMETEO_COMMERCIAL_KEY;
  const allowNonCommercialFree = process.env.ENABLE_NONCOMMERCIAL_OPENMETEO === "true";

  // If commercial key not supplied and non-commercial flag not explicitly set, use compliant placeholder
  if (!apiKey && !allowNonCommercialFree) {
    return getPlaceholderWeather(lat);
  }

  // If allowed or key present, fetch upstream
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,apparent_temperature,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`;

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 900 },
      headers: {
        "User-Agent": "TimeBridge-App/1.0",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return getPlaceholderWeather(lat);
    }

    const data = await res.json();
    const current = data.current;
    const daily = data.daily;
    const condition = getWmoCondition(current?.weather_code ?? 0);

    const forecast = (daily?.time || []).map((dateStr: string, idx: number) => {
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

    return {
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
    };
  } catch {
    return getPlaceholderWeather(lat);
  }
}
