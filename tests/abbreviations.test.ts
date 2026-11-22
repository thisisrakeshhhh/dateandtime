import { describe, it, expect } from "vitest";
import {
  getAbbreviation,
  getAbbreviationPair,
  calculateAbbreviationConversion,
  generateAbbreviation24HourTable,
  generateAbbreviationFaqs,
} from "../lib/abbreviations";

describe("Time zone abbreviation converter logic", () => {
  it("loads abbreviations and valid pairs correctly", () => {
    const est = getAbbreviation("EST");
    const ist = getAbbreviation("IST");
    const gmt = getAbbreviation("GMT");

    expect(est).toBeDefined();
    expect(est?.name).toBe("Eastern Standard Time");
    expect(ist).toBeDefined();
    expect(ist?.name).toBe("India Standard Time");
    expect(gmt).toBeDefined();

    const pair = getAbbreviationPair("est-to-ist");
    expect(pair).toBeDefined();
    expect(pair?.from).toBe("EST");
    expect(pair?.to).toBe("IST");
  });

  it("converts EST to IST correctly in winter (standard time)", () => {
    // January 15, 2026: New York is EST (UTC-5), India is IST (UTC+5:30)
    // Difference is 10 hours and 30 minutes
    const res = calculateAbbreviationConversion("EST", "IST", "2026-01-15", "12:00");
    expect(res).toBeDefined();
    // 12:00 PM EST + 10h 30m = 10:30 PM IST (same day)
    expect(res?.toTimeFormatted).toBe("10:30 PM");
    expect(res?.dayDifference).toBe(0);
    expect(res?.diffHoursPart).toBe(10);
    expect(res?.diffMinutesPart).toBe(30);
    expect(res?.isToAhead).toBe(true);
    expect(res?.diffFormatted).toBe("10h 30m");
    expect(res?.oneLineAnswer).toContain("IST is 10h 30m ahead of EST");
  });

  it("converts EST/EDT to IST correctly in summer (EDT DST observed in NY)", () => {
    // July 15, 2026: New York is EDT (UTC-4), India is IST (UTC+5:30)
    // Difference is 9 hours and 30 minutes
    const res = calculateAbbreviationConversion("EST", "IST", "2026-07-15", "12:00");
    expect(res).toBeDefined();
    // 12:00 PM EDT + 9h 30m = 9:30 PM IST
    expect(res?.toTimeFormatted).toBe("9:30 PM");
    expect(res?.diffHoursPart).toBe(9);
    expect(res?.diffMinutesPart).toBe(30);
    expect(res?.diffFormatted).toBe("9h 30m");
    expect(res?.oneLineAnswer).toContain("IST is 9h 30m ahead of EST");
  });

  it("handles day rollover accurately (e.g. 8:00 PM EST in winter -> next morning IST)", () => {
    // 20:00 (8:00 PM) EST + 10h 30m = 06:30 AM IST next day (+1 day)
    const res = calculateAbbreviationConversion("EST", "IST", "2026-01-15", "20:00");
    expect(res?.toTimeFormatted).toBe("6:30 AM");
    expect(res?.dayDifference).toBe(1);
    expect(res?.dayDifferenceLabel).toBe("Next day");
  });

  it("converts GMT to IST with half-hour difference", () => {
    // GMT/UTC is UTC+0, IST is UTC+5:30 -> difference 5h 30m
    const res = calculateAbbreviationConversion("GMT", "IST", "2026-01-15", "10:00");
    expect(res?.toTimeFormatted).toBe("3:30 PM");
    expect(res?.diffHoursPart).toBe(5);
    expect(res?.diffMinutesPart).toBe(30);
    expect(res?.isToAhead).toBe(true);
    expect(res?.oneLineAnswer).toContain("IST is 5h 30m ahead of GMT");
  });

  it("converts PST to IST accurately across winter and summer", () => {
    // Winter: PST (UTC-8) -> IST (UTC+5:30) = 13h 30m ahead
    const winter = calculateAbbreviationConversion("PST", "IST", "2026-01-15", "09:00");
    expect(winter?.toTimeFormatted).toBe("10:30 PM");
    expect(winter?.diffHoursPart).toBe(13);
    expect(winter?.diffMinutesPart).toBe(30);

    // Summer: PDT (UTC-7) -> IST (UTC+5:30) = 12h 30m ahead
    const summer = calculateAbbreviationConversion("PST", "IST", "2026-07-15", "09:00");
    expect(summer?.toTimeFormatted).toBe("9:30 PM");
    expect(summer?.diffHoursPart).toBe(12);
    expect(summer?.diffMinutesPart).toBe(30);
  });

  it("converts reverse direction (IST to EST) where target is behind", () => {
    // 10:00 AM IST in winter - 10h 30m = 11:30 PM previous day EST
    const res = calculateAbbreviationConversion("IST", "EST", "2026-01-15", "10:00");
    expect(res?.toTimeFormatted).toBe("11:30 PM");
    expect(res?.dayDifference).toBe(-1);
    expect(res?.dayDifferenceLabel).toBe("Previous day");
    expect(res?.isToAhead).toBe(false);
    expect(res?.oneLineAnswer).toContain("EST is 10h 30m behind IST");
  });

  it("handles Adelaide (ACST / ACDT) half-hour Australian time zone", () => {
    // ACST is UTC+9:30, ACDT is UTC+10:30 (Daylight Saving)
    // Jan 15 is summer in Australia (ACDT = UTC+10:30)
    // From IST (UTC+5:30) to ACDT (UTC+10:30) difference is exactly 5 hours
    const summerAdelaide = calculateAbbreviationConversion("IST", "ACDT", "2026-01-15", "12:00");
    expect(summerAdelaide?.diffHoursPart).toBe(5);
    expect(summerAdelaide?.diffMinutesPart).toBe(0);

    // July 15 is winter in Australia (ACST = UTC+9:30)
    // From IST (UTC+5:30) to ACST (UTC+9:30) difference is 4 hours
    const winterAdelaide = calculateAbbreviationConversion("IST", "ACST", "2026-07-15", "12:00");
    expect(winterAdelaide?.diffHoursPart).toBe(4);
    expect(winterAdelaide?.diffMinutesPart).toBe(0);
  });

  it("generates 24-hour conversion table with valid formatting", () => {
    const table = generateAbbreviation24HourTable("EST", "IST", "2026-01-15");
    expect(table).toHaveLength(24);
    expect(table[0].hour24).toBe(0);
    expect(table[0].fromTime12).toBe("12:00 AM");
    expect(table[0].toTime12).toBe("10:30 AM");
    expect(table[12].fromTime12).toBe("12:00 PM");
    expect(table[12].toTime12).toBe("10:30 PM");
  });

  it("generates rich FAQ entries with real answers", () => {
    const est = getAbbreviation("EST")!;
    const ist = getAbbreviation("IST")!;
    const faqs = generateAbbreviationFaqs(est, ist, "2026-01-15");
    expect(faqs.length).toBeGreaterThanOrEqual(4);
    for (const faq of faqs) {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
      expect(faq.answer.length).toBeGreaterThan(20);
    }
  });
});
