import { DateTime } from "luxon";
import { siteConfig } from "./config";

export interface PlaceTimeInfo {
  timeZone: string;
  formattedTime: string; // "02:30 PM"
  formattedTime24: string; // "14:30"
  formattedDate: string; // "Saturday, November 21, 2026"
  formattedDateShort: string; // "Nov 21, 2026"
  dayOfWeek: string;
  hours: number;
  minutes: number;
  seconds: number;
  iso: string;
  utcOffsetString: string; // "UTC+05:30"
  offsetMinutes: number; // 330
  timeZoneAbbr: string; // "IST", "GMT", "EDT"
  isDST: boolean;
  isDaytime: boolean;
}

export interface TimeDifferenceResult {
  fromTime: PlaceTimeInfo;
  toTime: PlaceTimeInfo;
  diffMinutes: number; // positive if to is ahead of from
  diffHoursFloat: number;
  hoursPart: number;
  minutesPart: number;
  isSameTime: boolean;
  isToAhead: boolean;
  relationText: string; // "United Kingdom is 5h 30m behind India"
  relationTextShort: string; // "5h 30m behind"
  verbalSummary: string; // Comprehensive natural explanation
  dstNotice?: string;
}

export interface OverlapHour {
  hourA: number; // 0..23
  timeAFormatted: string; // "9:00 AM"
  timeA24: string; // "09:00"
  hourB: number;
  timeBFormatted: string; // "2:30 PM"
  timeB24: string; // "14:30"
  dayDifference: number; // -1, 0, +1
  dayDifferenceLabel: string; // "Same day", "Next day", "Previous day"
  isDayA: boolean;
  isDayB: boolean;
  isWorkHourA: boolean;
  isWorkHourB: boolean;
  isOverlapBothCalling: boolean; // Both between 9 AM and 9 PM
  isOverlapBothOffice: boolean; // Both between 9 AM and 5 PM
}

export interface OverlapWindow {
  overlapMinutes: number;
  overlapHoursFloat: number;
  formattedDuration: string; // "6.5 hours" or "6h 30m"
  fromStartFormatted: string; // "2:30 PM"
  fromEndFormatted: string;   // "9:00 PM"
  toStartFormatted: string;   // "9:00 AM"
  toEndFormatted: string;     // "3:30 PM"
  fromStartMinute: number;
  fromEndMinute: number;
  toStartMinute: number;
  toEndMinute: number;
}

export interface BestTimeToCallResult {
  hasOverlap: boolean;
  overlapMinutes: number;
  overlapHoursCount: number; // For backward compatibility / display
  overlapHoursFloat: number; // 6.5
  formattedDuration: string; // "6.5 hours"
  recommendedWindowFrom: string; // "2:30 PM – 9:00 PM"
  recommendedWindowTo: string;   // "9:00 AM – 3:30 PM"
  description: string;
  officeOverlapMinutes: number;
  officeOverlapHoursFloat: number;
  officeOverlapCount: number;
  officeWindowFrom?: string;
  officeWindowTo?: string;
  fromStartMinute?: number;
  fromEndMinute?: number;
  toStartMinute?: number;
  toEndMinute?: number;
  slots: OverlapHour[];
}

/**
 * Computes exact minute-level overlap between two time windows.
 * Correctly accounts for half-hour and 45-minute offsets (e.g. India, Nepal, Adelaide).
 */
export function calculateIntervalOverlap(
  fromZone: string,
  toZone: string,
  windowAStartHour: number,
  windowAEndHour: number,
  windowBStartHour: number,
  windowBEndHour: number,
  referenceDate: DateTime = DateTime.now()
): OverlapWindow | null {
  const baseDate = referenceDate.setZone(fromZone).startOf("day");

  // Window for Place A
  const aStart = baseDate.set({ hour: windowAStartHour, minute: 0, second: 0, millisecond: 0 });
  const aEnd = aStart.plus({ hours: windowAEndHour - windowAStartHour });

  let bestOverlap: OverlapWindow | null = null;
  let maxMinutes = 0;

  // Check Place B windows across day offsets [-1, 0, 1] to catch international date lines
  for (const dayOffset of [-1, 0, 1]) {
    const bBase = referenceDate.setZone(toZone).plus({ days: dayOffset }).startOf("day");
    const bStart = bBase.set({ hour: windowBStartHour, minute: 0, second: 0, millisecond: 0 });
    const bEnd = bStart.plus({ hours: windowBEndHour - windowBStartHour });

    const overlapStartMillis = Math.max(aStart.toMillis(), bStart.toMillis());
    const overlapEndMillis = Math.min(aEnd.toMillis(), bEnd.toMillis());

    if (overlapEndMillis > overlapStartMillis) {
      const minutes = Math.round((overlapEndMillis - overlapStartMillis) / 60000);
      if (minutes > maxMinutes) {
        maxMinutes = minutes;
        const hoursFloat = Number((minutes / 60).toFixed(1));

        const fromStartDt = DateTime.fromMillis(overlapStartMillis).setZone(fromZone);
        const fromEndDt = DateTime.fromMillis(overlapEndMillis).setZone(fromZone);
        const toStartDt = DateTime.fromMillis(overlapStartMillis).setZone(toZone);
        const toEndDt = DateTime.fromMillis(overlapEndMillis).setZone(toZone);

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        let formattedDuration = `${hoursFloat} hours`;
        if (mins === 30) {
          formattedDuration = `${hoursFloat} hours`;
        } else if (mins > 0) {
          formattedDuration = `${hours}h ${mins}m`;
        } else {
          formattedDuration = `${hours} hour${hours > 1 ? "s" : ""}`;
        }

        bestOverlap = {
          overlapMinutes: minutes,
          overlapHoursFloat: hoursFloat,
          formattedDuration,
          fromStartFormatted: fromStartDt.toFormat("h:mm a"),
          fromEndFormatted: fromEndDt.toFormat("h:mm a"),
          toStartFormatted: toStartDt.toFormat("h:mm a"),
          toEndFormatted: toEndDt.toFormat("h:mm a"),
          fromStartMinute: fromStartDt.hour * 60 + fromStartDt.minute,
          fromEndMinute: fromEndDt.hour * 60 + fromEndDt.minute,
          toStartMinute: toStartDt.hour * 60 + toStartDt.minute,
          toEndMinute: toEndDt.hour * 60 + toEndDt.minute,
        };
      }
    }
  }

  return bestOverlap;
}

/**
 * Computes the optimal "Best Time to Call" window based on 9 AM to 9 PM in both places.
 * Uses exact minute arithmetic to correctly handle 30m and 45m time zones.
 */
export function calculateBestTimeToCall(
  fromZone: string,
  toZone: string,
  fromName: string = "Place A",
  toName: string = "Place B",
  fromLat?: number,
  fromLng?: number,
  toLat?: number,
  toLng?: number,
  referenceDate: DateTime = DateTime.now()
): BestTimeToCallResult {
  const slots = generate24HourTable(fromZone, toZone, fromLat, fromLng, toLat, toLng, 0);

  // Exact minute overlap for Awake hours (9 AM to 9 PM = 9:00 to 21:00)
  const awakeOverlap = calculateIntervalOverlap(
    fromZone,
    toZone,
    siteConfig.workHours.start,
    siteConfig.workHours.end,
    siteConfig.workHours.start,
    siteConfig.workHours.end,
    referenceDate
  );

  // Exact minute overlap for Business Office hours (9 AM to 5 PM = 9:00 to 17:00)
  const officeOverlap = calculateIntervalOverlap(
    fromZone,
    toZone,
    siteConfig.officeHours.start,
    siteConfig.officeHours.end,
    siteConfig.officeHours.start,
    siteConfig.officeHours.end,
    referenceDate
  );

  const hasOverlap = awakeOverlap !== null && awakeOverlap.overlapMinutes > 0;
  const overlapMinutes = awakeOverlap ? awakeOverlap.overlapMinutes : 0;
  const overlapHoursFloat = awakeOverlap ? awakeOverlap.overlapHoursFloat : 0;
  const overlapHoursCount = Math.round(overlapHoursFloat);
  const formattedDuration = awakeOverlap ? awakeOverlap.formattedDuration : "0 hours";

  let recommendedWindowFrom = "No direct 9 AM – 9 PM overlap";
  let recommendedWindowTo = "Schedule outside standard hours";
  let description = "";

  if (hasOverlap && awakeOverlap) {
    recommendedWindowFrom = `${awakeOverlap.fromStartFormatted} to ${awakeOverlap.fromEndFormatted}`;
    recommendedWindowTo = `${awakeOverlap.toStartFormatted} to ${awakeOverlap.toEndFormatted}`;
    description = `Best window: ${recommendedWindowFrom} ${fromName} time (${recommendedWindowTo} in ${toName}) · ${formattedDuration} overlap. Both parties will be awake between 9:00 AM and 9:00 PM.`;
  } else {
    description = `No direct 9:00 AM to 9:00 PM overlap. A good compromise is early morning around 8:00 AM or late evening around 9:00 PM in ${fromName}.`;
  }

  let officeWindowFrom: string | undefined;
  let officeWindowTo: string | undefined;
  const officeOverlapMinutes = officeOverlap ? officeOverlap.overlapMinutes : 0;
  const officeOverlapHoursFloat = officeOverlap ? officeOverlap.overlapHoursFloat : 0;
  const officeOverlapCount = Math.round(officeOverlapHoursFloat);

  if (officeOverlap && officeOverlap.overlapMinutes > 0) {
    officeWindowFrom = `${officeOverlap.fromStartFormatted} to ${officeOverlap.fromEndFormatted}`;
    officeWindowTo = `${officeOverlap.toStartFormatted} to ${officeOverlap.toEndFormatted}`;
  }

  return {
    hasOverlap,
    overlapMinutes,
    overlapHoursCount,
    overlapHoursFloat,
    formattedDuration,
    recommendedWindowFrom,
    recommendedWindowTo,
    description,
    officeOverlapMinutes,
    officeOverlapHoursFloat,
    officeOverlapCount,
    officeWindowFrom,
    officeWindowTo,
    fromStartMinute: awakeOverlap ? awakeOverlap.fromStartMinute : undefined,
    fromEndMinute: awakeOverlap ? awakeOverlap.fromEndMinute : undefined,
    toStartMinute: awakeOverlap ? awakeOverlap.toStartMinute : undefined,
    toEndMinute: awakeOverlap ? awakeOverlap.toEndMinute : undefined,
    slots,
  };
}

/**
 * Approximate solar position calculation to determine whether a coordinate is in daylight or nighttime.
 * Uses solar declination and hour angle.
 */
export function isCoordinateDaytime(lat: number, lng: number, dt: DateTime = DateTime.utc()): boolean {
  // Convert dt to UTC
  const utc = dt.toUTC();
  const dayOfYear = utc.ordinal;
  const hourUtc = utc.hour + utc.minute / 60 + utc.second / 3600;

  // Approximate Solar Declination (radians)
  const declination = 0.409 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 82));

  // Solar hour angle (radians)
  // Solar noon occurs at longitude * 4 minutes from UTC noon
  const solarTimeHours = (hourUtc + lng / 15 + 24) % 24;
  const hourAngle = ((solarTimeHours - 12) * Math.PI) / 12;

  const latRad = (lat * Math.PI) / 180;

  // Solar elevation angle (altitude)
  const sinAltitude =
    Math.sin(latRad) * Math.sin(declination) +
    Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle);

  // Sunrise/sunset occurs roughly when altitude is >= -0.833 degrees (sin(-0.833°) ≈ -0.0145)
  return sinAltitude > -0.0145;
}

/**
 * Returns formatted UTC offset string like "UTC+05:30" or "UTC-05:00" or "UTC+00:00"
 */
export function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  const hStr = String(hours).padStart(2, "0");
  const mStr = String(minutes).padStart(2, "0");
  return `UTC${sign}${hStr}:${mStr}`;
}

/**
 * Formats hour and minute difference into a clean human string like "5h 30m" or "3 hours" or "45 minutes"
 */
export function formatHourMinuteDiff(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return "0 hours";
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  return parts.join(" ");
}

/**
 * Retrieves full time and daylight details for a place at a specific instant.
 */
export function getPlaceTimeInfo(
  timeZone: string,
  lat?: number,
  lng?: number,
  referenceDate?: DateTime
): PlaceTimeInfo {
  let dt: DateTime;
  try {
    dt = referenceDate ? referenceDate.setZone(timeZone) : DateTime.now().setZone(timeZone);
    if (!dt.isValid) {
      dt = DateTime.now().setZone("UTC");
    }
  } catch {
    dt = DateTime.now().setZone("UTC");
  }

  const offsetMinutes = dt.offset;
  const isDaytime =
    lat !== undefined && lng !== undefined
      ? isCoordinateDaytime(lat, lng, dt)
      : dt.hour >= 6 && dt.hour < 18;

  return {
    timeZone,
    formattedTime: dt.toFormat("hh:mm a"),
    formattedTime24: dt.toFormat("HH:mm"),
    formattedDate: dt.toFormat("cccc, MMMM d, yyyy"),
    formattedDateShort: dt.toFormat("LLL d, yyyy"),
    dayOfWeek: dt.toFormat("cccc"),
    hours: dt.hour,
    minutes: dt.minute,
    seconds: dt.second,
    iso: dt.toISO() || "",
    utcOffsetString: formatUtcOffset(offsetMinutes),
    offsetMinutes,
    timeZoneAbbr: dt.offsetNameShort || dt.toFormat("ZZZZ") || "UTC",
    isDST: dt.isInDST,
    isDaytime,
  };
}

/**
 * Calculates exact time difference between two places with varying daylight saving status and fractional offsets.
 */
export function formatTimeDifference(fromZone: string, toZone: string) {
  const diff = calculateTimeDifference(fromZone, toZone);
  return {
    isSameTime: diff.isSameTime,
    isAhead: diff.isToAhead,
    hoursPart: diff.hoursPart,
    minutesPart: diff.minutesPart,
    aheadOrBehindText: diff.relationTextShort,
    verbalSummary: diff.verbalSummary,
  };
}

export function calculateTimeDifference(
  fromZone: string,
  toZone: string,
  fromLat?: number,
  fromLng?: number,
  toLat?: number,
  toLng?: number,
  referenceDate?: DateTime
): TimeDifferenceResult {
  const fromTime = getPlaceTimeInfo(fromZone, fromLat, fromLng, referenceDate);
  const toTime = getPlaceTimeInfo(toZone, toLat, toLng, referenceDate);

  // Difference in minutes (toTime - fromTime)
  const diffMinutes = toTime.offsetMinutes - fromTime.offsetMinutes;
  const isSameTime = diffMinutes === 0;
  const isToAhead = diffMinutes > 0;
  const absDiff = Math.abs(diffMinutes);
  const hoursPart = Math.floor(absDiff / 60);
  const minutesPart = absDiff % 60;
  const diffHoursFloat = Number((diffMinutes / 60).toFixed(2));

  const diffFormatted = formatHourMinuteDiff(hoursPart, minutesPart);

  let relationText = "";
  let relationTextShort = "";
  let verbalSummary = "";

  if (isSameTime) {
    relationText = "Both places share the exact same local time";
    relationTextShort = "Same time";
    verbalSummary = "There is no time difference. Both locations share identical local standard clocks.";
  } else if (isToAhead) {
    relationText = `ahead by ${diffFormatted}`;
    relationTextShort = `${diffFormatted} ahead`;
    verbalSummary = `Clocks are ${diffFormatted} ahead. When planning calls or flights, keep in mind they are operating ahead in their day.`;
  } else {
    relationText = `behind by ${diffFormatted}`;
    relationTextShort = `${diffFormatted} behind`;
    verbalSummary = `Clocks are ${diffFormatted} behind. When planning calls or flights, keep in mind they are operating earlier in their day.`;
  }

  let dstNotice: string | undefined;
  if (fromTime.isDST && !toTime.isDST) {
    dstNotice = `Note: The origin location is currently observing Daylight Saving Time, while the destination is on standard time.`;
  } else if (!fromTime.isDST && toTime.isDST) {
    dstNotice = `Note: The destination location is currently observing Daylight Saving Time, while the origin is on standard time.`;
  } else if (fromTime.isDST && toTime.isDST) {
    dstNotice = `Both locations are currently observing Daylight Saving Time (summer time).`;
  }

  return {
    fromTime,
    toTime,
    diffMinutes,
    diffHoursFloat,
    hoursPart,
    minutesPart,
    isSameTime,
    isToAhead,
    relationText,
    relationTextShort,
    verbalSummary,
    dstNotice,
  };
}

/**
 * Generates the full 24-hour conversion table ("When it is 9 AM in A, it is X in B")
 * Based on 9 AM to 9 PM calling hours.
 */
export function generate24HourTable(
  fromZone: string,
  toZone: string,
  fromLat?: number,
  fromLng?: number,
  toLat?: number,
  toLng?: number,
  startHour: number = 0
): OverlapHour[] {
  const result: OverlapHour[] = [];
  const now = DateTime.now().setZone(fromZone).startOf("day");

  for (let i = 0; i < 24; i++) {
    const currentHour = (startHour + i) % 24;
    const fromDt = now.set({ hour: currentHour, minute: 0, second: 0 });
    const toDt = fromDt.setZone(toZone);

    const hourA = fromDt.hour;
    const hourB = toDt.hour;

    // Day difference
    const fromDay = fromDt.day;
    const toDay = toDt.day;
    let dayDifference = 0;
    let dayDifferenceLabel = "Same day";

    if (toDay > fromDay || (fromDay > 27 && toDay === 1)) {
      dayDifference = 1;
      dayDifferenceLabel = "Next day";
    } else if (toDay < fromDay || (toDay > 27 && fromDay === 1)) {
      dayDifference = -1;
      dayDifferenceLabel = "Previous day";
    }

    const isDayA =
      fromLat !== undefined && fromLng !== undefined
        ? isCoordinateDaytime(fromLat, fromLng, fromDt)
        : hourA >= 6 && hourA < 18;

    const isDayB =
      toLat !== undefined && toLng !== undefined
        ? isCoordinateDaytime(toLat, toLng, toDt)
        : hourB >= 6 && hourB < 18;

    // Calling hours: 9 AM to 9 PM (9:00 to 21:00)
    const isWorkHourA = hourA >= siteConfig.workHours.start && hourA < siteConfig.workHours.end;
    const isWorkHourB = hourB >= siteConfig.workHours.start && hourB < siteConfig.workHours.end;
    const isOverlapBothCalling = isWorkHourA && isWorkHourB;

    // Office hours: 9 AM to 5 PM (9:00 to 17:00)
    const isOfficeA = hourA >= siteConfig.officeHours.start && hourA < siteConfig.officeHours.end;
    const isOfficeB = hourB >= siteConfig.officeHours.start && hourB < siteConfig.officeHours.end;
    const isOverlapBothOffice = isOfficeA && isOfficeB;

    result.push({
      hourA,
      timeAFormatted: fromDt.toFormat("h:00 a"),
      timeA24: fromDt.toFormat("HH:00"),
      hourB,
      timeBFormatted: toDt.toFormat("h:mm a"),
      timeB24: toDt.toFormat("HH:mm"),
      dayDifference,
      dayDifferenceLabel,
      isDayA,
      isDayB,
      isWorkHourA,
      isWorkHourB,
      isOverlapBothCalling,
      isOverlapBothOffice,
    });
  }

  return result;
}
