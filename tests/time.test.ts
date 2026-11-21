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

  it("computes exact minute overlap for India to UK (6.5h awake overlap in winter)", () => {
    // UK: 9:00 AM to 9:00 PM GMT = 14:30 to 02:30 IST next day
    // India: 9:00 AM to 9:00 PM IST
    // Exact overlap: 2:30 PM to 9:00 PM India time = 6.5 hours (390 minutes)
    const winterRef = DateTime.fromISO("2026-01-15T12:00:00Z");
    const bestTime = calculateBestTimeToCall(
      "Asia/Kolkata",
      "Europe/London",
      "India",
      "United Kingdom",
      28.6,
      77.2,
      51.5,
      -0.12,
      winterRef
    );

    expect(bestTime.hasOverlap).toBe(true);
    expect(bestTime.overlapMinutes).toBe(390); // Exactly 6.5 hours
    expect(bestTime.overlapHoursFloat).toBe(6.5);
    expect(bestTime.recommendedWindowFrom).toBe("2:30 PM to 9:00 PM");
    expect(bestTime.recommendedWindowTo).toBe("9:00 AM to 3:30 PM");

    // Office overlap: 9 AM - 5 PM
    // India office: 09:00 - 17:00 IST
    // UK office: 09:00 - 17:00 GMT = 14:30 - 22:30 IST
    // Overlap: 2:30 PM to 5:00 PM IST (2.5 hours = 150 minutes)
    expect(bestTime.officeOverlapMinutes).toBe(150);
    expect(bestTime.officeOverlapHoursFloat).toBe(2.5);
    expect(bestTime.officeWindowFrom).toBe("2:30 PM to 5:00 PM");
    expect(bestTime.officeWindowTo).toBe("9:00 AM to 11:30 AM");
  });

  it("computes exact minute overlap for Nepal (UTC+5:45) to India (UTC+5:30)", () => {
    // Nepal is 15 minutes ahead of India
    // Overlap: 11h 45m = 705 minutes
    const ref = DateTime.fromISO("2026-05-10T10:00:00Z");
    const bestTime = calculateBestTimeToCall(
      "Asia/Kolkata",
      "Asia/Kathmandu",
      "India",
      "Nepal",
      28.6,
      77.2,
      27.7,
      85.3,
      ref
    );

    expect(bestTime.hasOverlap).toBe(true);
    expect(bestTime.overlapMinutes).toBe(705); // 11h 45m
    expect(bestTime.recommendedWindowFrom).toBe("9:00 AM to 8:45 PM");
    expect(bestTime.recommendedWindowTo).toBe("9:15 AM to 9:00 PM");
  });

  it("computes exact minute overlap for Adelaide (UTC+9:30) to India (UTC+5:30)", () => {
    // Winter in Adelaide (July): ACST is UTC+9:30. Adelaide is 4 hours ahead of India.
    // Adelaide awake: 09:00 to 21:00 ACST = 05:00 to 17:00 IST
    // India awake: 09:00 to 21:00 IST
    // Overlap: 09:00 to 17:00 IST (8 hours = 480 minutes)
    const winterRef = DateTime.fromISO("2026-07-15T10:00:00Z");
    const bestTime = calculateBestTimeToCall(
      "Asia/Kolkata",
      "Australia/Adelaide",
      "India",
      "Adelaide",
      28.6,
      77.2,
      -34.9,
      138.6,
      winterRef
    );

    expect(bestTime.hasOverlap).toBe(true);
    expect(bestTime.overlapMinutes).toBe(480);
    expect(bestTime.recommendedWindowFrom).toBe("9:00 AM to 5:00 PM");
    expect(bestTime.recommendedWindowTo).toBe("1:00 PM to 9:00 PM");
  });

  it("handles DST transition weeks accurately between US and UK", () => {
    // In mid-March (e.g., March 18, 2026):
    // US has already switched to EDT (UTC-4) on March 8, but UK is still on GMT (UTC+0) until March 29.
    // Time difference is 4 hours instead of the usual 5 hours!
    const transitionWeek = DateTime.fromISO("2026-03-18T14:00:00Z");
    const diff = calculateTimeDifference(
      "America/New_York",
      "Europe/London",
      40.71,
      -74.0,
      51.5,
      -0.12,
      transitionWeek
    );
    expect(diff.diffMinutes).toBe(240); // 4 hours
    expect(diff.hoursPart).toBe(4);
    expect(diff.minutesPart).toBe(0);

    const bestTime = calculateBestTimeToCall(
      "America/New_York",
      "Europe/London",
      "New York",
      "London",
      40.71,
      -74.0,
      51.5,
      -0.12,
      transitionWeek
    );
    // UK awake: 09:00 - 21:00 GMT = 05:00 - 17:00 EDT
    // US awake: 09:00 - 21:00 EDT
    // Overlap: 09:00 to 17:00 EDT (8 hours = 480 minutes)
    expect(bestTime.overlapMinutes).toBe(480);
    expect(bestTime.recommendedWindowFrom).toBe("9:00 AM to 5:00 PM");
    expect(bestTime.recommendedWindowTo).toBe("1:00 PM to 9:00 PM");

    // In mid-January (both on standard time, difference is 5 hours):
    const winterStandard = DateTime.fromISO("2026-01-15T14:00:00Z");
    const diffStandard = calculateTimeDifference(
      "America/New_York",
      "Europe/London",
      40.71,
      -74.0,
      51.5,
      -0.12,
      winterStandard
    );
    expect(diffStandard.diffMinutes).toBe(300); // 5 hours
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
