import { describe, it, expect } from "vitest";
import {
  calculateShiftAnalysis,
  encodeShiftToParams,
  decodeShiftFromParams,
  ShiftInput,
} from "../lib/shifts";

describe("Shift Converter Logic & Calculations", () => {
  it("calculates shifts crossing midnight accurately", () => {
    // 6:00 PM to 3:00 AM IST shift (typical Indian IT US shift) = 9 hours
    const input: ShiftInput = {
      startTime: "18:00",
      endTime: "03:00",
      shiftZone: "Asia/Kolkata",
      clientCountrySlug: "united-states",
      workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      dateIso: "2026-01-15", // Winter (US EST UTC-5, IST UTC+5:30 -> difference 10h 30m)
    };

    const res = calculateShiftAnalysis(input);

    expect(res.crossesMidnight).toBe(true);
    expect(res.shiftDurationMinutes).toBe(540); // 9 hours * 60 = 540 min
    expect(res.shiftDurationFormatted).toBe("9 hours");

    // Check US Eastern target
    const usEastern = res.targets.find((t) => t.label === "US Eastern");
    expect(usEastern).toBeDefined();
    // 18:00 IST in winter (UTC+5:30) - 10h 30m = 07:30 AM EST
    expect(usEastern?.convertedStartTime).toBe("7:30 AM");
    // 03:00 IST next day - 10h 30m = 04:30 PM EST
    expect(usEastern?.convertedEndTime).toBe("4:30 PM");

    // Overlap with 9:00 AM - 5:00 PM EST office hours:
    // Shift is 7:30 AM to 4:30 PM EST.
    // Intersection with 9:00 AM - 5:00 PM is 9:00 AM to 4:30 PM = 7 hours and 30 minutes (450 minutes)!
    expect(usEastern?.overlapMinutes).toBe(450);
    expect(usEastern?.overlapFormatted).toBe("7h 30m");
    expect(usEastern?.overlapWindow).toContain("9:00 AM – 4:30 PM");
  });

  it("calculates DST changes between summer and winter for US shifts", () => {
    // In summer (July 15, 2026), New York is on EDT (UTC-4).
    // Difference between EDT and IST is 9h 30m (instead of 10h 30m).
    const summerInput: ShiftInput = {
      startTime: "18:00",
      endTime: "03:00",
      shiftZone: "Asia/Kolkata",
      clientCountrySlug: "united-states",
      workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      dateIso: "2026-07-15",
    };

    const res = calculateShiftAnalysis(summerInput);
    const usEastern = res.targets.find((t) => t.label === "US Eastern");

    // 18:00 IST - 9h 30m = 08:30 AM EDT
    expect(usEastern?.convertedStartTime).toBe("8:30 AM");
    // 03:00 IST next day - 9h 30m = 05:30 PM EDT
    expect(usEastern?.convertedEndTime).toBe("5:30 PM");

    // Overlap with 9:00 AM - 5:00 PM EDT:
    // Shift is 8:30 AM to 5:30 PM EDT.
    // Intersection with 9:00 AM - 5:00 PM is the FULL 8 hours (480 minutes, 100% overlap)!
    expect(usEastern?.overlapMinutes).toBe(480);
    expect(usEastern?.overlapPercent).toBe(100);
    expect(usEastern?.overlapFormatted).toBe("8h");
  });

  it("calculates UK shift timings in winter and summer", () => {
    // UK shift: 1:30 PM to 10:30 PM IST (13:30 to 22:30) = 9 hours
    // Winter (GMT, UTC+0 -> IST is UTC+5:30 -> difference 5h 30m)
    const winterUk: ShiftInput = {
      startTime: "13:30",
      endTime: "22:30",
      shiftZone: "Asia/Kolkata",
      clientCountrySlug: "united-kingdom",
      workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      dateIso: "2026-01-15",
    };

    const winterRes = calculateShiftAnalysis(winterUk);
    const ukWinter = winterRes.targets.find((t) => t.label === "United Kingdom");

    // 13:30 IST - 5h 30m = 08:00 AM GMT
    expect(ukWinter?.convertedStartTime).toBe("8:00 AM");
    // 22:30 IST - 5h 30m = 05:00 PM GMT
    expect(ukWinter?.convertedEndTime).toBe("5:00 PM");
    // Overlap with 9:00 AM - 5:00 PM GMT: 9:00 AM to 5:00 PM = 8 hours (480 minutes)!
    expect(ukWinter?.overlapMinutes).toBe(480);
    expect(ukWinter?.overlapPercent).toBe(100);

    // Summer (BST, UTC+1 -> IST is UTC+5:30 -> difference 4h 30m)
    const summerUk: ShiftInput = {
      startTime: "13:30",
      endTime: "22:30",
      shiftZone: "Asia/Kolkata",
      clientCountrySlug: "united-kingdom",
      workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      dateIso: "2026-07-15",
    };

    const summerRes = calculateShiftAnalysis(summerUk);
    const ukSummer = summerRes.targets.find((t) => t.label === "United Kingdom");

    // 13:30 IST - 4h 30m = 09:00 AM BST
    expect(ukSummer?.convertedStartTime).toBe("9:00 AM");
    // 22:30 IST - 4h 30m = 06:00 PM BST
    expect(ukSummer?.convertedEndTime).toBe("6:00 PM");
    // Overlap with 9:00 AM - 5:00 PM BST: 9:00 AM to 5:00 PM = 8 hours!
    expect(ukSummer?.overlapMinutes).toBe(480);
  });

  it("encodes and decodes shift parameters into URL search params without database", () => {
    const input: ShiftInput = {
      startTime: "19:30",
      endTime: "04:30",
      shiftZone: "Asia/Kolkata",
      clientCountrySlug: "united-states",
      workDays: ["Mon", "Tue", "Wed", "Thu"],
      dateIso: "2026-03-20",
    };

    const queryString = encodeShiftToParams(input);
    expect(queryString).toContain("start=19%3A30");
    expect(queryString).toContain("end=04%3A30");
    expect(queryString).toContain("zone=Asia%2FKolkata");

    const decoded = decodeShiftFromParams(new URLSearchParams(queryString));
    expect(decoded.startTime).toBe("19:30");
    expect(decoded.endTime).toBe("04:30");
    expect(decoded.shiftZone).toBe("Asia/Kolkata");
    expect(decoded.clientCountrySlug).toBe("united-states");
    expect(decoded.workDays).toEqual(["Mon", "Tue", "Wed", "Thu"]);
    expect(decoded.dateIso).toBe("2026-03-20");
  });
});
