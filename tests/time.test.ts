import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import { computeSolarTerminator } from "../lib/solar";
import {
  calculateTimeDifference,
  generate24HourTable,
  calculateBestTimeToCall,
  formatUtcOffset,
  formatHourMinuteDiff,
  formatMinutesDuration,
  isCoordinateDaytime,
} from "../lib/time";

describe("Time & Timezone Calculations - Step 0 Validation", () => {
  it("formats UTC offset strings properly", () => {
    expect(formatUtcOffset(330)).toBe("UTC+05:30"); // India
    expect(formatUtcOffset(345)).toBe("UTC+05:45"); // Nepal
    expect(formatUtcOffset(-300)).toBe("UTC-05:00"); // US Eastern
    expect(formatUtcOffset(-210)).toBe("UTC-03:30"); // Newfoundland
    expect(formatUtcOffset(570)).toBe("UTC+09:30"); // Adelaide standard
    expect(formatUtcOffset(630)).toBe("UTC+10:30"); // Adelaide DST
    expect(formatUtcOffset(0)).toBe("UTC+00:00"); // GMT
  });

  it("formats hour minute differences properly", () => {
    expect(formatHourMinuteDiff(5, 30)).toBe("5h 30m");
    expect(formatHourMinuteDiff(0, 45)).toBe("45m");
    expect(formatHourMinuteDiff(4, 0)).toBe("4h");
    expect(formatHourMinuteDiff(0, 0)).toBe("0 hours");
  });

  it("formats minute durations properly", () => {
    expect(formatMinutesDuration(390)).toBe("6h 30m");
    expect(formatMinutesDuration(150)).toBe("2h 30m");
    expect(formatMinutesDuration(480)).toBe("8 hours");
    expect(formatMinutesDuration(60)).toBe("1 hour");
    expect(formatMinutesDuration(45)).toBe("45m");
    expect(formatMinutesDuration(0)).toBe("0 hours");
  });

  describe("India (Asia/Kolkata, UTC+5:30) calculations", () => {
    it("regression test: confirms India vs UK call window is India 2:30 PM-9:00 PM = UK 9:00 AM-3:30 PM", () => {
      const winterRef = DateTime.fromISO("2026-01-15T12:00:00Z");
      const bestTime = calculateBestTimeToCall("Asia/Kolkata", "Europe/London", "India", "UK", 28.6, 77.2, 51.5, -0.12, winterRef);
      expect(bestTime.recommendedWindowFrom).toBe("2:30 PM to 9:00 PM");
      expect(bestTime.recommendedWindowTo).toBe("9:00 AM to 3:30 PM");
      expect(bestTime.formattedDuration).toBe("6h 30m");
      expect(bestTime.officeWindowFrom).toBe("2:30 PM to 5:00 PM");
      expect(bestTime.officeWindowTo).toBe("9:00 AM to 11:30 AM");
      expect(bestTime.officeFormattedDuration).toBe("2h 30m");
    });

    it("calculates accurate time difference and non-contradictory summary in winter (GMT)", () => {
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
        winterDate,
        "India",
        "United Kingdom"
      );

      expect(diff.diffMinutes).toBe(-330); // UK is 330 min behind India
      expect(diff.hoursPart).toBe(5);
      expect(diff.minutesPart).toBe(30);
      expect(diff.isToAhead).toBe(false);
      expect(diff.relationTextShort).toBe("5h 30m behind");
      // Verbal summary must never contradict: India is ahead, UK is behind
      expect(diff.verbalSummary).toContain("India is 5h 30m ahead of United Kingdom");
      expect(diff.verbalSummary).not.toBe("Clocks are 5h 30m behind. When planning calls or flights, keep in mind they are operating earlier in their day.");
    });

    it("calculates minute-accurate awake and office overlap between India and UK in winter", () => {
      // UK awake: 09:00 - 21:00 GMT = 14:30 - 02:30 IST next day
      // India awake: 09:00 - 21:00 IST
      // Exact awake overlap: India 2:30 PM - 9:00 PM = UK 9:00 AM - 3:30 PM (6.5 hours = 390 minutes)
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
      expect(bestTime.overlapMinutes).toBe(390); // 6h 30m
      expect(bestTime.overlapHoursFloat).toBe(6.5);
      expect(bestTime.formattedDuration).toBe("6h 30m");
      expect(bestTime.recommendedWindowFrom).toBe("2:30 PM to 9:00 PM");
      expect(bestTime.recommendedWindowTo).toBe("9:00 AM to 3:30 PM");

      // Office overlap (9 AM - 5 PM):
      // India office: 09:00 - 17:00 IST
      // UK office: 09:00 - 17:00 GMT = 14:30 - 22:30 IST
      // Exact office overlap: India 2:30 PM - 5:00 PM = UK 9:00 AM - 11:30 AM (2.5 hours = 150 minutes)
      expect(bestTime.hasOfficeOverlap).toBe(true);
      expect(bestTime.officeOverlapMinutes).toBe(150);
      expect(bestTime.officeOverlapHoursFloat).toBe(2.5);
      expect(bestTime.officeFormattedDuration).toBe("2h 30m");
      expect(bestTime.officeWindowFrom).toBe("2:30 PM to 5:00 PM");
      expect(bestTime.officeWindowTo).toBe("9:00 AM to 11:30 AM");
    });

    it("calculates accurate overlap between India and UK in summer (BST, UTC+1)", () => {
      // In summer (June), UK is on BST (UTC+1), India is UTC+5:30. Difference is 4h 30m.
      // UK awake: 09:00 - 21:00 BST = 13:30 - 01:30 IST
      // Overlap: India 1:30 PM - 9:00 PM = UK 9:00 AM - 4:30 PM (7.5 hours = 450 minutes)
      const summerRef = DateTime.fromISO("2026-06-15T12:00:00Z");
      const bestTime = calculateBestTimeToCall(
        "Asia/Kolkata",
        "Europe/London",
        "India",
        "United Kingdom",
        28.6,
        77.2,
        51.5,
        -0.12,
        summerRef
      );

      expect(bestTime.hasOverlap).toBe(true);
      expect(bestTime.overlapMinutes).toBe(450); // 7h 30m
      expect(bestTime.formattedDuration).toBe("7h 30m");
      expect(bestTime.recommendedWindowFrom).toBe("1:30 PM to 9:00 PM");
      expect(bestTime.recommendedWindowTo).toBe("9:00 AM to 4:30 PM");

      // Office overlap in summer (9 AM - 5 PM):
      // UK office: 09:00 - 17:00 BST = 13:30 - 21:30 IST
      // Overlap: India 1:30 PM - 5:00 PM = UK 9:00 AM - 12:30 PM (3.5 hours = 210 minutes)
      expect(bestTime.hasOfficeOverlap).toBe(true);
      expect(bestTime.officeOverlapMinutes).toBe(210);
      expect(bestTime.officeFormattedDuration).toBe("3h 30m");
      expect(bestTime.officeWindowFrom).toBe("1:30 PM to 5:00 PM");
      expect(bestTime.officeWindowTo).toBe("9:00 AM to 12:30 PM");
    });
  });

  describe("Nepal (Asia/Kathmandu, UTC+5:45) calculations", () => {
    it("handles Nepal (+5:45) quarter-hour fractional offset accurately", () => {
      // Nepal is UTC+5:45. India is UTC+5:30. Nepal is 15 minutes ahead of India.
      const ref = DateTime.fromISO("2026-04-10T10:00:00Z");
      const diff = calculateTimeDifference(
        "Asia/Kolkata",
        "Asia/Kathmandu",
        28.6,
        77.2,
        27.7,
        85.3,
        ref,
        "India",
        "Nepal"
      );
      expect(diff.diffMinutes).toBe(15);
      expect(diff.hoursPart).toBe(0);
      expect(diff.minutesPart).toBe(15);
      expect(diff.isToAhead).toBe(true);
      expect(diff.relationTextShort).toBe("15m ahead");
      expect(diff.verbalSummary).toContain("Nepal is 15m ahead of India");
    });

    it("calculates exact minute overlap for Nepal to India", () => {
      // Nepal awake: 09:00 - 21:00 NPT = 08:45 - 20:45 IST
      // India awake: 09:00 - 21:00 IST
      // Awake overlap: India 9:00 AM - 8:45 PM = Nepal 9:15 AM - 9:00 PM (11h 45m = 705 minutes)
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
      expect(bestTime.formattedDuration).toBe("11h 45m");
      expect(bestTime.recommendedWindowFrom).toBe("9:00 AM to 8:45 PM");
      expect(bestTime.recommendedWindowTo).toBe("9:15 AM to 9:00 PM");

      // Office overlap (9 AM - 5 PM):
      // Nepal office: 09:00 - 17:00 NPT = 08:45 - 16:45 IST
      // India office: 09:00 - 17:00 IST
      // Overlap: India 9:00 AM - 4:45 PM = Nepal 9:15 AM - 5:00 PM (7h 45m = 465 minutes)
      expect(bestTime.hasOfficeOverlap).toBe(true);
      expect(bestTime.officeOverlapMinutes).toBe(465);
      expect(bestTime.officeFormattedDuration).toBe("7h 45m");
      expect(bestTime.officeWindowFrom).toBe("9:00 AM to 4:45 PM");
      expect(bestTime.officeWindowTo).toBe("9:15 AM to 5:00 PM");
    });
  });

  describe("Adelaide (Australia/Adelaide, UTC+9:30 standard / UTC+10:30 DST)", () => {
    it("handles Adelaide standard time in southern winter (July, ACST UTC+9:30)", () => {
      // In July: Adelaide is on standard time ACST (UTC+9:30).
      // India is UTC+5:30. Adelaide is 4 hours ahead.
      const winterRef = DateTime.fromISO("2026-07-15T10:00:00Z");
      const diff = calculateTimeDifference(
        "Asia/Kolkata",
        "Australia/Adelaide",
        28.6,
        77.2,
        -34.9,
        138.6,
        winterRef,
        "India",
        "Adelaide"
      );
      expect(diff.diffMinutes).toBe(240); // 4 hours
      expect(diff.hoursPart).toBe(4);
      expect(diff.minutesPart).toBe(0);
      expect(diff.isToAhead).toBe(true);
      expect(diff.toTime.isDST).toBe(false);

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
      // Adelaide awake: 09:00 - 21:00 ACST = 05:00 - 17:00 IST
      // Overlap: India 9:00 AM - 5:00 PM = Adelaide 1:00 PM - 9:00 PM (8 hours = 480 minutes)
      expect(bestTime.overlapMinutes).toBe(480);
      expect(bestTime.formattedDuration).toBe("8 hours");
      expect(bestTime.recommendedWindowFrom).toBe("9:00 AM to 5:00 PM");
      expect(bestTime.recommendedWindowTo).toBe("1:00 PM to 9:00 PM");

      // Office overlap:
      // Adelaide office: 09:00 - 17:00 ACST = 05:00 - 13:00 IST
      // India office: 09:00 - 17:00 IST
      // Overlap: India 9:00 AM - 1:00 PM = Adelaide 1:00 PM - 5:00 PM (4 hours = 240 minutes)
      expect(bestTime.officeOverlapMinutes).toBe(240);
      expect(bestTime.officeFormattedDuration).toBe("4 hours");
      expect(bestTime.officeWindowFrom).toBe("9:00 AM to 1:00 PM");
      expect(bestTime.officeWindowTo).toBe("1:00 PM to 5:00 PM");
    });

    it("handles Adelaide daylight saving time in southern summer (January, ACDT UTC+10:30)", () => {
      // In January: Adelaide is on daylight saving time ACDT (UTC+10:30).
      // India is UTC+5:30. Adelaide is 5 hours ahead.
      const summerRef = DateTime.fromISO("2026-01-15T10:00:00Z");
      const diff = calculateTimeDifference(
        "Asia/Kolkata",
        "Australia/Adelaide",
        28.6,
        77.2,
        -34.9,
        138.6,
        summerRef,
        "India",
        "Adelaide"
      );
      expect(diff.diffMinutes).toBe(300); // 5 hours
      expect(diff.hoursPart).toBe(5);
      expect(diff.minutesPart).toBe(0);
      expect(diff.isToAhead).toBe(true);
      expect(diff.toTime.isDST).toBe(true);

      const bestTime = calculateBestTimeToCall(
        "Asia/Kolkata",
        "Australia/Adelaide",
        "India",
        "Adelaide",
        28.6,
        77.2,
        -34.9,
        138.6,
        summerRef
      );
      // Adelaide awake: 09:00 - 21:00 ACDT = 04:00 - 16:00 IST
      // Overlap: India 9:00 AM - 4:00 PM = Adelaide 2:00 PM - 9:00 PM (7 hours = 420 minutes)
      expect(bestTime.overlapMinutes).toBe(420);
      expect(bestTime.formattedDuration).toBe("7 hours");
      expect(bestTime.recommendedWindowFrom).toBe("9:00 AM to 4:00 PM");
      expect(bestTime.recommendedWindowTo).toBe("2:00 PM to 9:00 PM");

      // Office overlap:
      // Adelaide office: 09:00 - 17:00 ACDT = 04:00 - 12:00 IST
      // Overlap: India 9:00 AM - 12:00 PM = Adelaide 2:00 PM - 5:00 PM (3 hours = 180 minutes)
      expect(bestTime.officeOverlapMinutes).toBe(180);
      expect(bestTime.officeFormattedDuration).toBe("3 hours");
      expect(bestTime.officeWindowFrom).toBe("9:00 AM to 12:00 PM");
      expect(bestTime.officeWindowTo).toBe("2:00 PM to 5:00 PM");
    });

    it("calculates Adelaide to UK overlap across both seasons", () => {
      // In July: Adelaide is ACST (UTC+9:30), London is BST (UTC+1). Difference is 8h 30m.
      const julyRef = DateTime.fromISO("2026-07-15T12:00:00Z");
      const diffJuly = calculateTimeDifference("Europe/London", "Australia/Adelaide", 51.5, -0.12, -34.9, 138.6, julyRef);
      expect(diffJuly.diffMinutes).toBe(510); // 8h 30m ahead
      expect(diffJuly.hoursPart).toBe(8);
      expect(diffJuly.minutesPart).toBe(30);

      const bestJuly = calculateBestTimeToCall("Europe/London", "Australia/Adelaide", "London", "Adelaide", 51.5, -0.12, -34.9, 138.6, julyRef);
      // London awake: 09:00 - 21:00 BST = 17:30 - 05:30 ACST
      // Adelaide awake: 09:00 - 21:00 ACST
      // Overlap: London 9:00 AM - 12:30 PM = Adelaide 5:30 PM - 9:00 PM (3.5 hours = 210 minutes)
      expect(bestJuly.overlapMinutes).toBe(210);
      expect(bestJuly.formattedDuration).toBe("3h 30m");
      expect(bestJuly.recommendedWindowFrom).toBe("9:00 AM to 12:30 PM");
      expect(bestJuly.recommendedWindowTo).toBe("5:30 PM to 9:00 PM");
      // Office overlap: 0 minutes (London 9 AM BST = 5:30 PM ACST, after Adelaide office hours end at 5 PM)
      expect(bestJuly.hasOfficeOverlap).toBe(false);
      expect(bestJuly.officeOverlapMinutes).toBe(0);
    });
  });

  describe("DST Transition Weeks (US, UK, Australia)", () => {
    it("handles US vs UK spring transition gap (March 2026)", () => {
      // US starts DST on 2nd Sunday in March (March 8, 2026): UTC-4 EDT.
      // UK starts DST on last Sunday in March (March 29, 2026): still on UTC+0 GMT.
      // During March 8-28, 2026: Time difference between New York and London is 4 hours instead of 5 hours!
      const transitionMidMarch = DateTime.fromISO("2026-03-18T14:00:00Z");
      const diffTransition = calculateTimeDifference(
        "America/New_York",
        "Europe/London",
        40.71,
        -74.0,
        51.5,
        -0.12,
        transitionMidMarch,
        "New York",
        "London"
      );
      expect(diffTransition.fromTime.isDST).toBe(true); // US is EDT
      expect(diffTransition.toTime.isDST).toBe(false); // UK is still GMT
      expect(diffTransition.diffMinutes).toBe(240); // 4 hours
      expect(diffTransition.hoursPart).toBe(4);
      expect(diffTransition.minutesPart).toBe(0);

      // In mid-January (both on standard time): difference is 5 hours
      const winterRef = DateTime.fromISO("2026-01-15T14:00:00Z");
      const diffWinter = calculateTimeDifference("America/New_York", "Europe/London", 40.71, -74.0, 51.5, -0.12, winterRef);
      expect(diffWinter.diffMinutes).toBe(300); // 5 hours

      // In mid-June (both on DST: EDT UTC-4, BST UTC+1): difference is 5 hours
      const summerRef = DateTime.fromISO("2026-06-15T14:00:00Z");
      const diffSummer = calculateTimeDifference("America/New_York", "Europe/London", 40.71, -74.0, 51.5, -0.12, summerRef);
      expect(diffSummer.diffMinutes).toBe(300); // 5 hours
    });

    it("handles US vs UK autumn transition gap (late October / early November 2026)", () => {
      // UK ends DST on last Sunday in October (October 25, 2026): shifts back to GMT UTC+0.
      // US ends DST on 1st Sunday in November (November 1, 2026): still on EDT UTC-4.
      // During Oct 25 - Oct 31, 2026: Time difference is again 4 hours!
      const transitionAutumn = DateTime.fromISO("2026-10-28T14:00:00Z");
      const diffAutumn = calculateTimeDifference(
        "America/New_York",
        "Europe/London",
        40.71,
        -74.0,
        51.5,
        -0.12,
        transitionAutumn,
        "New York",
        "London"
      );
      expect(diffAutumn.fromTime.isDST).toBe(true); // US is still EDT
      expect(diffAutumn.toTime.isDST).toBe(false); // UK shifted to GMT
      expect(diffAutumn.diffMinutes).toBe(240); // 4 hours
    });

    it("handles Australia (Sydney) cross-hemisphere DST shifts with UK and US", () => {
      // Sydney switches out of DST on 1st Sunday in April (April 5, 2026): AEDT (+11) -> AEST (+10).
      // UK switched to BST (+1) on March 29, 2026.
      // March 30, 2026: Sydney is AEDT (+11), London is BST (+1) -> diff is 10 hours
      const lateMarch = DateTime.fromISO("2026-03-30T10:00:00Z");
      const diffLateMarch = calculateTimeDifference(
        "Europe/London",
        "Australia/Sydney",
        51.5,
        -0.12,
        -33.86,
        151.2,
        lateMarch
      );
      expect(diffLateMarch.diffMinutes).toBe(600); // 10 hours

      // April 10, 2026: Sydney is AEST (+10), London is BST (+1) -> diff is 9 hours
      const midApril = DateTime.fromISO("2026-04-10T10:00:00Z");
      const diffMidApril = calculateTimeDifference(
        "Europe/London",
        "Australia/Sydney",
        51.5,
        -0.12,
        -33.86,
        151.2,
        midApril
      );
      expect(diffMidApril.diffMinutes).toBe(540); // 9 hours

      // January 15, 2026: Sydney is AEDT (+11), London is GMT (+0) -> diff is 11 hours
      const midJan = DateTime.fromISO("2026-01-15T10:00:00Z");
      const diffMidJan = calculateTimeDifference(
        "Europe/London",
        "Australia/Sydney",
        51.5,
        -0.12,
        -33.86,
        151.2,
        midJan
      );
      expect(diffMidJan.diffMinutes).toBe(660); // 11 hours
    });
  });

  describe("24-Hour table generation and solar daytime calculations", () => {
    it("computes 24-hour table with valid overlap information for India to UK", () => {
      const winterRef = DateTime.fromISO("2026-01-15T12:00:00Z");
      const table = generate24HourTable("Asia/Kolkata", "Europe/London", 28.6, 77.2, 51.5, -0.12, 0, winterRef);
      expect(table.length).toBe(24);
      expect(table[0].timeAFormatted).toBeDefined();
      expect(table[0].timeBFormatted).toBeDefined();
      const callingOverlapSlots = table.filter((s) => s.isOverlapBothCalling);
      expect(callingOverlapSlots.length).toBeGreaterThan(0);
      const officeOverlapSlots = table.filter((s) => s.isOverlapBothOffice);
      expect(officeOverlapSlots.length).toBeGreaterThan(0);
    });

    it("accurately detects day and night via solar altitude", () => {
      const londonNoon = DateTime.fromISO("2026-06-21T12:00:00Z");
      expect(isCoordinateDaytime(51.5074, -0.1278, londonNoon)).toBe(true);

      const londonMidnight = DateTime.fromISO("2026-12-21T00:00:00Z");
      expect(isCoordinateDaytime(51.5074, -0.1278, londonMidnight)).toBe(false);
    });

    it("computes solar terminator polygon coordinates accurately", () => {
      const term = computeSolarTerminator(new Date("2026-06-21T12:00:00Z"));
      expect(term.subsolarPoint).toBeDefined();
      expect(term.declinationDegrees).toBeGreaterThan(20);
      expect(term.nightPolygonLatLngs.length).toBeGreaterThan(100);
    });
  });
});
