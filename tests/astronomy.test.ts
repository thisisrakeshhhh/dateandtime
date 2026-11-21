import { describe, it, expect } from "vitest";
import { getSolarTimes, getDstInfo } from "@/lib/astronomy";

describe("astronomy utils", () => {
  it("computes sunrise and sunset times for London", () => {
    const times = getSolarTimes(51.5074, -0.1278, "Europe/London", new Date("2026-06-21T12:00:00Z"));
    expect(times.sunrise).toBeTruthy();
    expect(times.sunset).toBeTruthy();
    expect(times.isDaytime).toBe(true);
  });

  it("computes DST transition for London", () => {
    const dst = getDstInfo("Europe/London");
    expect(dst).toBeDefined();
    expect(typeof dst.inDst).toBe("boolean");
    expect(dst.nextTransition).toBeDefined();
  });

  it("handles non-DST timezones like Asia/Kolkata", () => {
    const dst = getDstInfo("Asia/Kolkata");
    expect(dst.inDst).toBe(false);
    expect(dst.nextTransition).toBe("No upcoming clock change");
  });
});
