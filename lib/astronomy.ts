import * as SunCalc from "suncalc";
import { DateTime } from "luxon";

export interface SolarTimes {
  sunrise: string; // e.g. "6:34 AM"
  sunset: string;  // e.g. "5:28 PM"
  isDaytime: boolean;
  solarNoon: string;
}

export function getSolarTimes(lat: number, lng: number, zoneName: string, date: Date = new Date()): SolarTimes {
  try {
    const times = SunCalc.getTimes(date, lat, lng);
    const now = date.getTime();
    const sunriseTime = times.sunrise ? times.sunrise.getTime() : null;
    const sunsetTime = times.sunset ? times.sunset.getTime() : null;

    let isDaytime = true;
    if (sunriseTime && sunsetTime) {
      if (sunriseTime < sunsetTime) {
        isDaytime = now >= sunriseTime && now < sunsetTime;
      } else {
        // Polar or crossing midnight
        isDaytime = now >= sunriseTime || now < sunsetTime;
      }
    }

    const sunriseStr = times.sunrise && !isNaN(times.sunrise.getTime())
      ? DateTime.fromJSDate(times.sunrise).setZone(zoneName).toFormat("h:mm a")
      : "--:--";

    const sunsetStr = times.sunset && !isNaN(times.sunset.getTime())
      ? DateTime.fromJSDate(times.sunset).setZone(zoneName).toFormat("h:mm a")
      : "--:--";

    const noonStr = times.solarNoon && !isNaN(times.solarNoon.getTime())
      ? DateTime.fromJSDate(times.solarNoon).setZone(zoneName).toFormat("h:mm a")
      : "--:--";

    return {
      sunrise: sunriseStr,
      sunset: sunsetStr,
      isDaytime,
      solarNoon: noonStr,
    };
  } catch {
    return {
      sunrise: "--:--",
      sunset: "--:--",
      isDaytime: true,
      solarNoon: "--:--",
    };
  }
}

export interface DstInfo {
  inDst: boolean;
  nextTransition: string | null; // e.g. "Sun, 29 Mar 2026 (+1h)" or "No upcoming clock change"
  changeDescription: string;
}

/**
 * Checks if the zone participates in DST and scans upcoming 365 days for the next offset change.
 */
export function getDstInfo(zoneName: string): DstInfo {
  try {
    const now = DateTime.now().setZone(zoneName);
    const currentOffset = now.offset;
    const inDst = now.isInDST;

    // Scan day by day for next 365 days to find offset transition
    let nextTransition: string | null = null;
    let changeDescription = inDst ? "Daylight Saving Time active" : "Standard Time active";

    let testDay = now.startOf("day");
    for (let i = 1; i <= 365; i++) {
      testDay = testDay.plus({ days: 1 });
      if (testDay.offset !== currentOffset) {
        // Found transition day! Pinpoint the exact hour
        let hourly = testDay.minus({ days: 1 });
        while (hourly.offset === currentOffset && hourly < testDay.plus({ days: 1 })) {
          hourly = hourly.plus({ hours: 1 });
        }
        const diffMinutes = hourly.offset - currentOffset;
        const diffStr = diffMinutes > 0 ? `+${diffMinutes / 60}h` : `${diffMinutes / 60}h`;
        const action = diffMinutes > 0 ? "Clocks spring forward" : "Clocks fall back";
        nextTransition = `${hourly.toFormat("ccc, d LLL yyyy")} (${diffStr})`;
        changeDescription = `${action} on ${hourly.toFormat("LLL d, yyyy")}`;
        break;
      }
    }

    if (!nextTransition) {
      nextTransition = "No upcoming clock change";
      changeDescription = "This location does not observe Daylight Saving Time changes.";
    }

    return {
      inDst,
      nextTransition,
      changeDescription,
    };
  } catch {
    return {
      inDst: false,
      nextTransition: "Unknown",
      changeDescription: "Standard time",
    };
  }
}
