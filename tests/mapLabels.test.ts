import { describe, it, expect } from "vitest";
import { formatOffsetDiff, getVisibleMapPlaces } from "@/lib/mapLabels";

describe("mapLabels utils", () => {
  it("formats offset diff properly", () => {
    expect(formatOffsetDiff(0)).toBe("0h");
    expect(formatOffsetDiff(330)).toBe("+5h 30m");
    expect(formatOffsetDiff(-300)).toBe("-5h");
    expect(formatOffsetDiff(-210)).toBe("-3h 30m");
  });

  it("returns visible places for zoom 2 with user timezone, containing only countries", () => {
    const places = getVisibleMapPlaces(2, "UTC");
    expect(places.length).toBeGreaterThan(10);
    expect(places[0]).toHaveProperty("timeStr");
    expect(places[0]).toHaveProperty("diffStr");
    expect(places.every((p) => p.place.type === "country")).toBe(true);
  });
});
