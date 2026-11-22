import { describe, it, expect } from "vitest";
import { formatOffsetDiff, getVisibleMapPlaces } from "@/lib/mapLabels";

describe("mapLabels utils", () => {
  it("formats offset diff properly", () => {
    expect(formatOffsetDiff(0)).toBe("0h");
    expect(formatOffsetDiff(330)).toBe("+5h 30m");
    expect(formatOffsetDiff(-300)).toBe("-5h");
    expect(formatOffsetDiff(-210)).toBe("-3h 30m");
  });

  it("computes exact real-time distance from user coordinates (e.g. Chandigarh) for map country pills", () => {
    // Chandigarh coordinates
    const chandigarhCoords = { lat: 30.7333, lng: 76.7794 };
    const places = getVisibleMapPlaces(2, "Asia/Kolkata", undefined, chandigarhCoords);
    expect(places.length).toBeGreaterThan(10);

    // US should have a distance calculated from Chandigarh (> 10,000 km)
    const usPlace = places.find((p) => p.place.slug === "united-states");
    expect(usPlace).toBeDefined();
    expect(usPlace?.distanceKm).toBeGreaterThan(10000);
    expect(usPlace?.distanceStr).toContain("km");

    // UK should have a distance calculated from Chandigarh (~ 6,700 km)
    const ukPlace = places.find((p) => p.place.slug === "united-kingdom");
    expect(ukPlace).toBeDefined();
    expect(ukPlace?.distanceKm).toBeGreaterThan(6000);
    expect(ukPlace?.distanceKm).toBeLessThan(8000);
    expect(ukPlace?.distanceStr).toContain("km");
  });
});
