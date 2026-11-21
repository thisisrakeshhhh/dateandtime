import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import { computeSolarTerminator } from "../lib/solar";
import {
  calculateTimeDifference,
  generate24HourTable,
  calculateBestTimeToCall,
  formatUtcOffset,
  formatHourMinuteDiff,
  isCoordinateDaytime,
} from "../lib/time";

describe("Time & Timezone Calculations", () => {
  it("formats UTC offset strings properly", () => {
    expect(formatUtcOffset(330)).toBe("UTC+05:30"); // India
    expect(formatUtcOffset(345)).toBe("UTC+05:45"); // Nepal
    expect(formatUtcOffset(-300)).toBe("UTC-05:00"); // US Eastern
    expect(formatUtcOffset(-210)).toBe("UTC-03:30"); // Newfoundland
    expect(formatUtcOffset(0)).toBe("UTC+00:00"); // GMT
  });

  it("formats hour minute differences properly", () => {
    expect(formatHourMinuteDiff(5, 30)).toBe("5h 30m");
    expect(formatHourMinuteDiff(0, 45)).toBe("45m");
    expect(formatHourMinuteDiff(4, 0)).toBe("4h");
    expect(formatHourMinuteDiff(0, 0)).toBe("0 hours");
  });

  it("calculates accurate time difference between India and UK in winter", () => {
    // In winter (Nov - March), UK is on GMT (UTC+0), India is UTC+5:30
    // India is 5h 30m ahead of UK
    const winterDate = DateTime.fromISO("2026-01-15T12:00:00Z");
    const diff = calculateTimeDifference(
      "Asia/Kolkata",
      "Europe/London",
      28.61,
      77.2,
      51.5,
      -0.12,
      winterDate
    );

    expect(diff.diffMinutes).toBe(-330); // UK is 330 min behind India
    expect(diff.hoursPart).toBe(5);
    expect(diff.minutesPart).toBe(30);
    expect(diff.isToAhead).toBe(false);
    expect(diff.relationTextShort).toBe("5h 30m behind");
  });

  it("calculates accurate time difference between India and UK in summer (BST)", () => {
    // In summer (June), UK is on BST (UTC+1), India is UTC+5:30
    // Difference is 4h 30m
    const summerDate = DateTime.fromISO("2026-06-15T12:00:00Z");
    const diff = calculateTimeDifference(
      "Asia/Kolkata",
      "Europe/London",
      28.61,
      77.2,
      51.5,
      -0.12,
      summerDate
    );

    expect(diff.diffMinutes).toBe(-270); // UK is 270 min behind India
    expect(diff.hoursPart).toBe(4);
    expect(diff.minutesPart).toBe(30);
    expect(diff.relationTextShort).toBe("4h 30m behind");
    expect(diff.toTime.isDST).toBe(true);
  });

  it("handles Nepal (+5:45) fractional offset accurately", () => {
    // Nepal is UTC+5:45. India is UTC+5:30. Nepal is 15 minutes ahead of India.
    const ref = DateTime.fromISO("2026-04-10T10:00:00Z");
    const diff = calculateTimeDifference("Asia/Kolkata", "Asia/Kathmandu", 28.6, 77.2, 27.7, 85.3, ref);
    expect(diff.diffMinutes).toBe(15);
    expect(diff.hoursPart).toBe(0);
    expect(diff.minutesPart).toBe(15);
    expect(diff.isToAhead).toBe(true);
    expect(diff.relationTextShort).toBe("15m ahead");
  });

  it("handles Adelaide/Darwin (+9:30) fractional offset accurately", () => {
    // Winter in Adelaide (e.g. July): ACST is UTC+9:30.
    const winterRef = DateTime.fromISO("2026-07-01T10:00:00Z");
    const diff = calculateTimeDifference("Asia/Kolkata", "Australia/Darwin", 28.6, 77.2, -12.4, 130.8, winterRef);
    // India +5:30, Darwin +9:30 => Darwin is 4 hours ahead
    expect(diff.diffMinutes).toBe(240);
    expect(diff.hoursPart).toBe(4);
    expect(diff.minutesPart).toBe(0);
    expect(diff.isToAhead).toBe(true);
  });

  it("handles Chatham Islands (+12:45 / +13:45) quarter-hour offset accurately", () => {
    // Chatham standard time is UTC+12:45
    const winterRef = DateTime.fromISO("2026-07-01T10:00:00Z");
    const diff = calculateTimeDifference("UTC", "Pacific/Chatham", 0, 0, -43.9, -176.5, winterRef);
    expect(diff.diffMinutes).toBe(765); // 12 * 60 + 45 = 765
    expect(diff.hoursPart).toBe(12);
    expect(diff.minutesPart).toBe(45);
  });

  it("computes 24-hour table with valid overlap information", () => {
    const table = generate24HourTable("Asia/Kolkata", "Europe/London", 28.6, 77.2, 51.5, -0.12);
    expect(table.length).toBe(24);
    // Every entry must have valid time strings
    expect(table[0].timeAFormatted).toBeDefined();
    expect(table[0].timeBFormatted).toBeDefined();
    // At least one slot should overlap for India and UK
    const overlapSlots = table.filter((s) => s.isOverlapBothCalling);
    expect(overlapSlots.length).toBeGreaterThan(0);
  });

  it("computes best time to call between India and UK", () => {
    const bestTime = calculateBestTimeToCall(
      "Asia/Kolkata",
      "Europe/London",
      "India",
      "United Kingdom",
      28.6,
      77.2,
      51.5,
      -0.12
    );

    expect(bestTime.hasOverlap).toBe(true);
    expect(bestTime.overlapHoursCount).toBeGreaterThan(0);
    expect(bestTime.description).toContain("best time to call");
  });

  it("accurately detects day and night via solar altitude", () => {
    // London at noon UTC in summer is daytime
    const londonNoon = DateTime.fromISO("2026-06-21T12:00:00Z");
    const isLondonDay = isCoordinateDaytime(51.5074, -0.1278, londonNoon);
    expect(isLondonDay).toBe(true);

    // London at midnight UTC in winter is nighttime
    const londonMidnight = DateTime.fromISO("2026-12-21T00:00:00Z");
    const isLondonNight = isCoordinateDaytime(51.5074, -0.1278, londonMidnight);
    expect(isLondonNight).toBe(false);
  });

  it("computes solar terminator polygon coordinates accurately", () => {
    const term = computeSolarTerminator(new Date("2026-06-21T12:00:00Z"));
    expect(term.subsolarPoint).toBeDefined();
    expect(term.declinationDegrees).toBeGreaterThan(20); // Summer solstice ~23.4°
    expect(term.nightPolygonLatLngs.length).toBeGreaterThan(100);
  });
});
