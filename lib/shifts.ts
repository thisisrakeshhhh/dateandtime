import { DateTime, Interval } from "luxon";

export interface ShiftInput {
  startTime: string; // "HH:mm", e.g. "18:00"
  endTime: string;   // "HH:mm", e.g. "03:00"
  shiftZone: string; // IANA zone, e.g. "Asia/Kolkata"
  clientCountrySlug: string; // e.g. "united-states", "united-kingdom", "australia"
  workDays: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
  dateIso: string;   // "yyyy-MM-dd"
}

export interface TargetZoneShiftResult {
  label: string; // "US Eastern", "US Central", "US Pacific", "UK", "Australia (Sydney)"
  ianaZone: string;
  abbr: string; // "EST", "EDT", "GMT", "BST", etc.
  isDST: boolean;
  convertedStartTime: string; // e.g. "08:30 AM"
  convertedEndTime: string;   // e.g. "05:30 PM"
  convertedStart24: string;   // "08:30"
  convertedEnd24: string;     // "17:30"
  dayOffset: number;          // -1, 0, +1
  dayOffsetLabel: string;     // "Same day", "Previous day", "Next day"
  overlapMinutes: number;     // minutes of overlap with 9 AM - 5 PM office hours
  overlapFormatted: string;   // e.g. "4h 30m"
  overlapWindow: string;      // e.g. "9:00 AM – 1:30 PM"
  overlapPercent: number;     // 0 - 100
}

export interface ShiftAnalysisResult {
  input: ShiftInput;
  shiftDurationMinutes: number;
  shiftDurationFormatted: string;
  crossesMidnight: boolean;
  clientCountryName: string;
  targets: TargetZoneShiftResult[];
  seasonalComparison: {
    winterDateIso: string;
    summerDateIso: string;
    currentIsDst: boolean;
    differenceNote: string;
  };
}

export const TARGET_ZONES = [
  {
    label: "US Eastern",
    ianaZone: "America/New_York",
    countrySlug: "united-states",
  },
  {
    label: "US Central",
    ianaZone: "America/Chicago",
    countrySlug: "united-states",
  },
  {
    label: "US Pacific",
    ianaZone: "America/Los_Angeles",
    countrySlug: "united-states",
  },
  {
    label: "United Kingdom",
    ianaZone: "Europe/London",
    countrySlug: "united-kingdom",
  },
  {
    label: "Australia (Eastern)",
    ianaZone: "Australia/Sydney",
    countrySlug: "australia",
  },
];

export const CLIENT_COUNTRIES: Record<string, { name: string; primaryZone: string }> = {
  "united-states": { name: "United States", primaryZone: "America/New_York" },
  "united-kingdom": { name: "United Kingdom", primaryZone: "Europe/London" },
  "australia": { name: "Australia", primaryZone: "Australia/Sydney" },
  "canada": { name: "Canada", primaryZone: "America/Toronto" },
};

/**
 * Calculates minute-accurate shift conversions and office hour overlaps using Luxon.
 */
export function calculateShiftAnalysis(input: ShiftInput): ShiftAnalysisResult {
  const [startH, startM] = input.startTime.split(":").map(Number);
  const [endH, endM] = input.endTime.split(":").map(Number);

  const validStartH = isNaN(startH) ? 18 : Math.max(0, Math.min(23, startH));
  const validStartM = isNaN(startM) ? 0 : Math.max(0, Math.min(59, startM));
  const validEndH = isNaN(endH) ? 3 : Math.max(0, Math.min(23, endH));
  const validEndM = isNaN(endM) ? 0 : Math.max(0, Math.min(59, endM));

  // Determine if shift crosses midnight in source zone
  const startMinutesFromMidnight = validStartH * 60 + validStartM;
  const endMinutesFromMidnight = validEndH * 60 + validEndM;
  const crossesMidnight = endMinutesFromMidnight <= startMinutesFromMidnight;

  const shiftDurationMinutes = crossesMidnight
    ? (1440 - startMinutesFromMidnight) + endMinutesFromMidnight
    : endMinutesFromMidnight - startMinutesFromMidnight;

  const durationHours = Math.floor(shiftDurationMinutes / 60);
  const durationRemainderMinutes = shiftDurationMinutes % 60;
  const shiftDurationFormatted = durationRemainderMinutes > 0
    ? `${durationHours}h ${durationRemainderMinutes}m`
    : `${durationHours} hours`;

  // Base Start DateTime in Shift Zone
  const baseStartDt = DateTime.fromISO(`${input.dateIso}T00:00:00`, { zone: input.shiftZone })
    .set({ hour: validStartH, minute: validStartM, second: 0, millisecond: 0 });

  const validStartDt = baseStartDt.isValid
    ? baseStartDt
    : DateTime.now().setZone(input.shiftZone).set({ hour: validStartH, minute: validStartM, second: 0, millisecond: 0 });

  // Base End DateTime (next day if crosses midnight)
  const validEndDt = crossesMidnight
    ? validStartDt.plus({ days: 1 }).set({ hour: validEndH, minute: validEndM })
    : validStartDt.set({ hour: validEndH, minute: validEndM });

  const sourceInterval = Interval.fromDateTimes(validStartDt, validEndDt);

  const targets: TargetZoneShiftResult[] = TARGET_ZONES.map((tz) => {
    const targetStart = validStartDt.setZone(tz.ianaZone);
    const targetEnd = validEndDt.setZone(tz.ianaZone);

    // Day difference
    const startDayDiff = Math.round(
      (targetStart.startOf("day").toMillis() - validStartDt.startOf("day").toMillis()) / 86400000
    );

    let dayOffsetLabel = "Same day";
    if (startDayDiff > 0) dayOffsetLabel = "Next day";
    else if (startDayDiff < 0) dayOffsetLabel = "Previous day";

    // Client Office hours are 9:00 AM to 5:00 PM (09:00 to 17:00) on the target's primary business day
    // We check overlap with target office hours on targetStart's day and targetEnd's day if different
    const officeStartDay1 = targetStart.startOf("day").set({ hour: 9, minute: 0 });
    const officeEndDay1 = targetStart.startOf("day").set({ hour: 17, minute: 0 });

    let totalOverlapMinutes = 0;
    let overlapWindow = "No direct overlap";

    const intersection1 = sourceInterval.intersection(
      Interval.fromDateTimes(officeStartDay1.setZone(input.shiftZone), officeEndDay1.setZone(input.shiftZone))
    );

    if (intersection1 && intersection1.isValid) {
      totalOverlapMinutes += Math.round(intersection1.length("minutes"));
      overlapWindow = `${intersection1.start?.setZone(tz.ianaZone).toFormat("h:mm a")} – ${intersection1.end?.setZone(tz.ianaZone).toFormat("h:mm a")}`;
    }

    // Check day 2 if shift crosses into another calendar day in target zone
    if (targetEnd.startOf("day").toMillis() !== targetStart.startOf("day").toMillis()) {
      const officeStartDay2 = targetEnd.startOf("day").set({ hour: 9, minute: 0 });
      const officeEndDay2 = targetEnd.startOf("day").set({ hour: 17, minute: 0 });
      const intersection2 = sourceInterval.intersection(
        Interval.fromDateTimes(officeStartDay2.setZone(input.shiftZone), officeEndDay2.setZone(input.shiftZone))
      );
      if (intersection2 && intersection2.isValid) {
        const extraMinutes = Math.round(intersection2.length("minutes"));
        totalOverlapMinutes += extraMinutes;
        const window2 = `${intersection2.start?.setZone(tz.ianaZone).toFormat("h:mm a")} – ${intersection2.end?.setZone(tz.ianaZone).toFormat("h:mm a")}`;
        overlapWindow = overlapWindow === "No direct overlap" ? window2 : `${overlapWindow} & ${window2}`;
      }
    }

    const overlapHours = Math.floor(totalOverlapMinutes / 60);
    const overlapRemainder = totalOverlapMinutes % 60;
    const overlapFormatted = totalOverlapMinutes === 0
      ? "0m"
      : overlapRemainder > 0
      ? `${overlapHours}h ${overlapRemainder}m`
      : `${overlapHours}h`;

    // Maximum office day is 8 hours (480 minutes)
    const overlapPercent = Math.min(100, Math.round((totalOverlapMinutes / 480) * 100));

    return {
      label: tz.label,
      ianaZone: tz.ianaZone,
      abbr: targetStart.toFormat("ZZZZ"),
      isDST: targetStart.isInDST,
      convertedStartTime: targetStart.toFormat("h:mm a"),
      convertedEndTime: targetEnd.toFormat("h:mm a"),
      convertedStart24: targetStart.toFormat("HH:mm"),
      convertedEnd24: targetEnd.toFormat("HH:mm"),
      dayOffset: startDayDiff,
      dayOffsetLabel,
      overlapMinutes: totalOverlapMinutes,
      overlapFormatted,
      overlapWindow,
      overlapPercent,
    };
  });

  // Seasonal DST Comparison: Compare chosen date with opposite season (6 months away)
  const clientInfo = CLIENT_COUNTRIES[input.clientCountrySlug] || CLIENT_COUNTRIES["united-states"];
  const clientZone = clientInfo.primaryZone;
  const currentClientDt = validStartDt.setZone(clientZone);
  const isSummerNow = currentClientDt.isInDST;

  const year = validStartDt.year;
  const winterDateIso = `${year}-01-15`;
  const summerDateIso = `${year}-07-15`;

  // Calculate overlap in winter vs summer
  const winterAnalysis = calculateSimpleOverlapMinutes(
    input.startTime,
    input.endTime,
    input.shiftZone,
    clientZone,
    winterDateIso
  );
  const summerAnalysis = calculateSimpleOverlapMinutes(
    input.startTime,
    input.endTime,
    input.shiftZone,
    clientZone,
    summerDateIso
  );

  const diffMinutesSeasonal = summerAnalysis - winterAnalysis;
  let differenceNote = "";
  if (diffMinutesSeasonal === 0) {
    differenceNote = `Daylight Saving Time shifts maintain a steady ${Math.floor(summerAnalysis / 60)}h ${summerAnalysis % 60}m overlap across both winter and summer for this shift.`;
  } else if (diffMinutesSeasonal > 0) {
    differenceNote = `During Summer Daylight Saving Time (${clientInfo.name} clocks forward), your overlap increases by ${diffMinutesSeasonal} minutes (from ${Math.floor(winterAnalysis / 60)}h ${winterAnalysis % 60}m in winter to ${Math.floor(summerAnalysis / 60)}h ${summerAnalysis % 60}m in summer).`;
  } else {
    differenceNote = `During Summer Daylight Saving Time (${clientInfo.name} clocks forward), your overlap decreases by ${Math.abs(diffMinutesSeasonal)} minutes (from ${Math.floor(winterAnalysis / 60)}h ${winterAnalysis % 60}m in winter to ${Math.floor(summerAnalysis / 60)}h ${summerAnalysis % 60}m in summer).`;
  }

  return {
    input,
    shiftDurationMinutes,
    shiftDurationFormatted,
    crossesMidnight,
    clientCountryName: clientInfo.name,
    targets,
    seasonalComparison: {
      winterDateIso,
      summerDateIso,
      currentIsDst: isSummerNow,
      differenceNote,
    },
  };
}

/**
 * Helper to compute client office overlap minutes for any arbitrary date.
 */
function calculateSimpleOverlapMinutes(
  startTime: string,
  endTime: string,
  shiftZone: string,
  clientZone: string,
  dateIso: string
): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startDt = DateTime.fromISO(`${dateIso}T00:00:00`, { zone: shiftZone })
    .set({ hour: startH, minute: startM, second: 0, millisecond: 0 });

  const crosses = (endH * 60 + endM) <= (startH * 60 + startM);
  const endDt = crosses
    ? startDt.plus({ days: 1 }).set({ hour: endH, minute: endM })
    : startDt.set({ hour: endH, minute: endM });

  const sourceInterval = Interval.fromDateTimes(startDt, endDt);

  const targetStart = startDt.setZone(clientZone);
  const targetEnd = endDt.setZone(clientZone);

  let minutes = 0;

  // Day 1 9 AM - 5 PM
  const off1S = targetStart.startOf("day").set({ hour: 9, minute: 0 }).setZone(shiftZone);
  const off1E = targetStart.startOf("day").set({ hour: 17, minute: 0 }).setZone(shiftZone);
  const int1 = sourceInterval.intersection(Interval.fromDateTimes(off1S, off1E));
  if (int1 && int1.isValid) {
    minutes += Math.round(int1.length("minutes"));
  }

  // Day 2 9 AM - 5 PM if spans another day
  if (targetEnd.startOf("day").toMillis() !== targetStart.startOf("day").toMillis()) {
    const off2S = targetEnd.startOf("day").set({ hour: 9, minute: 0 }).setZone(shiftZone);
    const off2E = targetEnd.startOf("day").set({ hour: 17, minute: 0 }).setZone(shiftZone);
    const int2 = sourceInterval.intersection(Interval.fromDateTimes(off2S, off2E));
    if (int2 && int2.isValid) {
      minutes += Math.round(int2.length("minutes"));
    }
  }

  return minutes;
}

/**
 * Encodes shift parameters into shareable query string parameters.
 */
export function encodeShiftToParams(shift: ShiftInput): string {
  const params = new URLSearchParams();
  params.set("start", shift.startTime);
  params.set("end", shift.endTime);
  params.set("zone", shift.shiftZone);
  params.set("client", shift.clientCountrySlug);
  params.set("days", shift.workDays.join(","));
  params.set("date", shift.dateIso);
  return params.toString();
}

/**
 * Decodes shift parameters from query string, with robust fallbacks.
 */
export function decodeShiftFromParams(searchParams: URLSearchParams | Record<string, string>): ShiftInput {
  const get = (key: string) => {
    if (typeof (searchParams as URLSearchParams).get === "function") {
      return (searchParams as URLSearchParams).get(key);
    }
    return (searchParams as Record<string, string>)[key];
  };

  const startTime = get("start") || "18:00";
  const endTime = get("end") || "03:00";
  const shiftZone = get("zone") || "Asia/Kolkata";
  const clientCountrySlug = get("client") || "united-states";
  const daysStr = get("days");
  const workDays = daysStr ? daysStr.split(",").filter(Boolean) : ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const dateIso = get("date") || DateTime.now().toFormat("yyyy-MM-dd");

  return {
    startTime,
    endTime,
    shiftZone,
    clientCountrySlug,
    workDays,
    dateIso,
  };
}
