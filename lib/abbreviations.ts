import { DateTime } from "luxon";
import abbreviationsData from "@/data/abbreviations.json";
import abbreviationPairsData from "@/data/abbreviationPairs.json";
import { formatHourMinuteDiff } from "@/lib/time";

export interface MajorCity {
  name: string;
  country: string;
  timezone: string;
}

export interface AbbreviationInfo {
  code: string;
  name: string;
  defaultIana: string;
  type: "standard" | "daylight" | "permanent";
  standardOffset: string;
  daylightOffset?: string;
  standardPartner?: string;
  daylightPartner?: string;
  seasonalWarning: string;
  ambiguityWarning: string;
  whenObserved: string;
  majorCities: MajorCity[];
}

export interface AbbreviationPair {
  from: string;
  to: string;
  slug: string;
  category: string;
}

export interface AbbreviationConversionResult {
  fromCode: string;
  toCode: string;
  fromName: string;
  toName: string;
  fromIana: string;
  toIana: string;
  fromOffsetStr: string;
  toOffsetStr: string;
  fromTimeFormatted: string; // e.g. "12:00 PM"
  toTimeFormatted: string;   // e.g. "10:30 PM"
  fromDateFormatted: string; // e.g. "Wednesday, November 25, 2026"
  toDateFormatted: string;   // e.g. "Wednesday, November 25, 2026"
  diffMinutes: number;
  diffHoursPart: number;
  diffMinutesPart: number;
  isSameTime: boolean;
  isToAhead: boolean;
  diffFormatted: string; // e.g. "10h 30m"
  oneLineAnswer: string;
  dayDifference: number; // -1, 0, +1
  dayDifferenceLabel: string; // "Same day", "Next day", "Previous day"
}

export interface AbbreviationTableRow {
  hour24: number;
  fromTime12: string;
  fromTime24: string;
  toTime12: string;
  toTime24: string;
  dayDifference: number;
  dayDifferenceLabel: string;
  isDayA: boolean;
  isDayB: boolean;
  isWorkA: boolean;
  isWorkB: boolean;
  isOverlapAwake: boolean;
  isOverlapOffice: boolean;
}

export interface AbbreviationFaq {
  question: string;
  answer: string;
}

export function getAllAbbreviations(): AbbreviationInfo[] {
  return abbreviationsData as AbbreviationInfo[];
}

export function getAbbreviation(code: string): AbbreviationInfo | undefined {
  const upper = code.toUpperCase();
  return (abbreviationsData as AbbreviationInfo[]).find((a) => a.code === upper);
}

export function getAllAbbreviationPairs(): AbbreviationPair[] {
  return abbreviationPairsData as AbbreviationPair[];
}

export function getAbbreviationPair(slug: string): AbbreviationPair | undefined {
  return (abbreviationPairsData as AbbreviationPair[]).find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase()
  );
}

/**
 * Calculates minute-accurate timezone conversion for two abbreviations using real IANA zones.
 * Never uses fixed offsets, ensuring DST transitions and historical rules are exact.
 */
export function calculateAbbreviationConversion(
  fromCode: string,
  toCode: string,
  dateIso: string = DateTime.now().toFormat("yyyy-MM-dd"),
  timeStr: string = "12:00" // 24h format HH:mm
): AbbreviationConversionResult | null {
  const fromAbbr = getAbbreviation(fromCode);
  const toAbbr = getAbbreviation(toCode);
  if (!fromAbbr || !toAbbr) return null;

  const [hours, minutes] = timeStr.split(":").map(Number);
  const validHours = isNaN(hours) ? 12 : Math.max(0, Math.min(23, hours));
  const validMinutes = isNaN(minutes) ? 0 : Math.max(0, Math.min(59, minutes));

  // Parse reference date in from-zone
  const baseFromDt = DateTime.fromISO(`${dateIso}T00:00:00`, { zone: fromAbbr.defaultIana })
    .set({ hour: validHours, minute: validMinutes, second: 0, millisecond: 0 });

  const validFromDt = baseFromDt.isValid
    ? baseFromDt
    : DateTime.now().setZone(fromAbbr.defaultIana).set({ hour: validHours, minute: validMinutes });

  const toDt = validFromDt.setZone(toAbbr.defaultIana);

  const fromOffset = validFromDt.offset; // in minutes
  const toOffset = toDt.offset;
  const diffMinutes = toOffset - fromOffset;

  const isSameTime = diffMinutes === 0;
  const isToAhead = diffMinutes > 0;
  const absDiff = Math.abs(diffMinutes);
  const diffHoursPart = Math.floor(absDiff / 60);
  const diffMinutesPart = absDiff % 60;
  const diffFormatted = formatHourMinuteDiff(diffHoursPart, diffMinutesPart);

  // Day difference calculation
  const fromDateNum = validFromDt.startOf("day").toMillis();
  const toDateNum = toDt.startOf("day").toMillis();
  const dayMillis = 86400000;
  const dayDiffRound = Math.round((toDateNum - fromDateNum) / dayMillis);

  let dayDifference = 0;
  let dayDifferenceLabel = "Same day";
  if (dayDiffRound > 0) {
    dayDifference = 1;
    dayDifferenceLabel = "Next day";
  } else if (dayDiffRound < 0) {
    dayDifference = -1;
    dayDifferenceLabel = "Previous day";
  }

  // Construct clear, non-contradictory one-line answer
  let oneLineAnswer = "";
  if (isSameTime) {
    oneLineAnswer = `${fromAbbr.code} and ${toAbbr.code} share the same local time on this date (${validFromDt.toFormat("h:mm a")}).`;
  } else if (isToAhead) {
    const dayContext = dayDifference === 1 ? " (next day)" : dayDifference === -1 ? " (previous day)" : " on the same day";
    oneLineAnswer = `${toAbbr.code} is ${diffFormatted} ahead of ${fromAbbr.code}. When it is ${validFromDt.toFormat("h:mm a")} ${fromAbbr.code}, it is ${toDt.toFormat("h:mm a")} ${toAbbr.code}${dayContext}.`;
  } else {
    const dayContext = dayDifference === 1 ? " (next day)" : dayDifference === -1 ? " (previous day)" : " on the same day";
    oneLineAnswer = `${toAbbr.code} is ${diffFormatted} behind ${fromAbbr.code}. When it is ${validFromDt.toFormat("h:mm a")} ${fromAbbr.code}, it is ${toDt.toFormat("h:mm a")} ${toAbbr.code}${dayContext}.`;
  }

  return {
    fromCode: fromAbbr.code,
    toCode: toAbbr.code,
    fromName: fromAbbr.name,
    toName: toAbbr.name,
    fromIana: fromAbbr.defaultIana,
    toIana: toAbbr.defaultIana,
    fromOffsetStr: validFromDt.toFormat("ZZZZ"),
    toOffsetStr: toDt.toFormat("ZZZZ"),
    fromTimeFormatted: validFromDt.toFormat("h:mm a"),
    toTimeFormatted: toDt.toFormat("h:mm a"),
    fromDateFormatted: validFromDt.toFormat("cccc, MMMM d, yyyy"),
    toDateFormatted: toDt.toFormat("cccc, MMMM d, yyyy"),
    diffMinutes,
    diffHoursPart,
    diffMinutesPart,
    isSameTime,
    isToAhead,
    diffFormatted,
    oneLineAnswer,
    dayDifference,
    dayDifferenceLabel,
  };
}

/**
 * Generates hour-by-hour comparison table for common times (00:00 to 23:00) on a specific date.
 */
export function generateAbbreviation24HourTable(
  fromCode: string,
  toCode: string,
  dateIso: string = DateTime.now().toFormat("yyyy-MM-dd")
): AbbreviationTableRow[] {
  const fromAbbr = getAbbreviation(fromCode);
  const toAbbr = getAbbreviation(toCode);
  if (!fromAbbr || !toAbbr) return [];

  const rows: AbbreviationTableRow[] = [];
  const baseFromDt = DateTime.fromISO(`${dateIso}T00:00:00`, { zone: fromAbbr.defaultIana });

  for (let hour = 0; hour < 24; hour++) {
    const fromDt = baseFromDt.set({ hour, minute: 0, second: 0 });
    const toDt = fromDt.setZone(toAbbr.defaultIana);

    const fromDateNum = fromDt.startOf("day").toMillis();
    const toDateNum = toDt.startOf("day").toMillis();
    const dayDiffRound = Math.round((toDateNum - fromDateNum) / 86400000);

    let dayDifference = 0;
    let dayDifferenceLabel = "Same day";
    if (dayDiffRound > 0) {
      dayDifference = 1;
      dayDifferenceLabel = "Next day";
    } else if (dayDiffRound < 0) {
      dayDifference = -1;
      dayDifferenceLabel = "Previous day";
    }

    const hourA = fromDt.hour;
    const hourB = toDt.hour;

    const isDayA = hourA >= 6 && hourA < 20;
    const isDayB = hourB >= 6 && hourB < 20;

    // Awake hours: 9 AM to 9 PM (9 to 21)
    const isAwakeA = hourA >= 9 && hourA < 21;
    const isAwakeB = hourB >= 9 && hourB < 21;
    const isOverlapAwake = isAwakeA && isAwakeB;

    // Office hours: 9 AM to 5 PM (9 to 17)
    const isWorkA = hourA >= 9 && hourA < 17;
    const isWorkB = hourB >= 9 && hourB < 17;
    const isOverlapOffice = isWorkA && isWorkB;

    rows.push({
      hour24: hour,
      fromTime12: fromDt.toFormat("h:00 a"),
      fromTime24: fromDt.toFormat("HH:00"),
      toTime12: toDt.toFormat("h:mm a"),
      toTime24: toDt.toFormat("HH:mm"),
      dayDifference,
      dayDifferenceLabel,
      isDayA,
      isDayB,
      isWorkA,
      isWorkB,
      isOverlapAwake,
      isOverlapOffice,
    });
  }

  return rows;
}

/**
 * Generates tailored FAQs with structured answers for search engine rich results.
 */
export function generateAbbreviationFaqs(
  fromAbbr: AbbreviationInfo,
  toAbbr: AbbreviationInfo,
  dateIso: string = DateTime.now().toFormat("yyyy-MM-dd")
): AbbreviationFaq[] {
  const conv = calculateAbbreviationConversion(fromAbbr.code, toAbbr.code, dateIso, "12:00");
  const diffStr = conv ? conv.diffFormatted : "the standard offset";

  return [
    {
      question: `What is the time difference between ${fromAbbr.code} and ${toAbbr.code}?`,
      answer: conv
        ? conv.isSameTime
          ? `${fromAbbr.code} (${fromAbbr.name}) and ${toAbbr.code} (${toAbbr.name}) share the exact same clock offset. There is zero time difference.`
          : conv.isToAhead
          ? `${toAbbr.code} is ${diffStr} ahead of ${fromAbbr.code}. When it is 12:00 PM ${fromAbbr.code}, it is ${conv.toTimeFormatted} ${toAbbr.code}.`
          : `${fromAbbr.code} is ${diffStr} ahead of ${toAbbr.code} (meaning ${toAbbr.code} is ${diffStr} behind ${fromAbbr.code}). When it is 12:00 PM ${fromAbbr.code}, it is ${conv.toTimeFormatted} ${toAbbr.code}.`
        : `The time difference depends on the current calendar season and whether Daylight Saving Time is active.`,
    },
    {
      question: `How do I convert a meeting time from ${fromAbbr.code} to ${toAbbr.code}?`,
      answer: conv
        ? conv.isToAhead
          ? `To convert from ${fromAbbr.code} to ${toAbbr.code}, add ${diffStr} to the ${fromAbbr.code} time. For example, 9:00 AM ${fromAbbr.code} becomes ${calculateAbbreviationConversion(fromAbbr.code, toAbbr.code, dateIso, "09:00")?.toTimeFormatted} ${toAbbr.code}.`
          : `To convert from ${fromAbbr.code} to ${toAbbr.code}, subtract ${diffStr} from the ${fromAbbr.code} time. For example, 5:00 PM ${fromAbbr.code} becomes ${calculateAbbreviationConversion(fromAbbr.code, toAbbr.code, dateIso, "17:00")?.toTimeFormatted} ${toAbbr.code}.`
        : `Use our live interactive converter above to pick any time and calendar date for minute-accurate conversion.`,
    },
    {
      question: `Does ${fromAbbr.code} or ${toAbbr.code} observe Daylight Saving Time (DST)?`,
      answer: `${fromAbbr.code} (${fromAbbr.name}): ${fromAbbr.seasonalWarning} Meanwhile, ${toAbbr.code} (${toAbbr.name}): ${toAbbr.seasonalWarning}`,
    },
    {
      question: `What are the best working hours to schedule a call between ${fromAbbr.code} and ${toAbbr.code}?`,
      answer: `To coordinate across ${fromAbbr.code} and ${toAbbr.code} without disrupting normal sleep, aim for mutual awake hours (9:00 AM to 9:00 PM local time in both locations). Consult the common times table above to identify mutually convenient overlap hours.`,
    },
    {
      question: `Which major global cities use ${fromAbbr.code} and ${toAbbr.code}?`,
      answer: `${fromAbbr.code} is primarily observed in cities such as ${fromAbbr.majorCities.map((c) => c.name).join(", ")}, whereas ${toAbbr.code} is observed in ${toAbbr.majorCities.map((c) => c.name).join(", ")}.`,
    },
  ];
}
