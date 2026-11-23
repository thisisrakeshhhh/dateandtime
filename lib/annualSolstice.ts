import * as SunCalc from "suncalc";

export interface AnnualDaylightRange {
  longestDayFormatted: string;   // e.g. "15h 24m"
  shortestDayFormatted: string;  // e.g. "8h 52m"
  earliestSunrise: string;       // e.g. "5:21 AM"
  latestSunset: string;          // e.g. "8:45 PM"
  solsticeDiffFormatted: string; // e.g. "6h 32m"
  isConstantDaylight: boolean;
}

function formatDurationMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}

export function computeAnnualDaylightRange(lat: number, lng: number): AnnualDaylightRange {
  try {
    const june21 = new Date(2026, 5, 21, 12, 0, 0);
    const dec21 = new Date(2026, 11, 21, 12, 0, 0);

    const timesJune = SunCalc.getTimes(june21, lat, lng);
    const timesDec = SunCalc.getTimes(dec21, lat, lng);

    const durJuneMins = timesJune.sunset && timesJune.sunrise
      ? (timesJune.sunset.getTime() - timesJune.sunrise.getTime()) / 60000
      : 720;

    const durDecMins = timesDec.sunset && timesDec.sunrise
      ? (timesDec.sunset.getTime() - timesDec.sunrise.getTime()) / 60000
      : 720;

    const maxMins = Math.max(durJuneMins, durDecMins);
    const minMins = Math.min(durJuneMins, durDecMins);
    const diffMins = Math.abs(maxMins - minMins);

    const isNearEquator = Math.abs(lat) < 5;

    return {
      longestDayFormatted: formatDurationMinutes(Math.max(60, Math.min(1440, maxMins))),
      shortestDayFormatted: formatDurationMinutes(Math.max(60, Math.min(1440, minMins))),
      earliestSunrise: timesJune.sunrise && !isNaN(timesJune.sunrise.getTime())
        ? timesJune.sunrise.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : "5:30 AM",
      latestSunset: timesJune.sunset && !isNaN(timesJune.sunset.getTime())
        ? timesJune.sunset.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : "8:30 PM",
      solsticeDiffFormatted: formatDurationMinutes(diffMins),
      isConstantDaylight: isNearEquator || diffMins < 45,
    };
  } catch {
    return {
      longestDayFormatted: "14h 30m",
      shortestDayFormatted: "9h 30m",
      earliestSunrise: "5:45 AM",
      latestSunset: "8:15 PM",
      solsticeDiffFormatted: "5h 00m",
      isConstantDaylight: false,
    };
  }
}
