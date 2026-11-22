import { describe, it, expect } from "vitest";
import { formatOffsetDiff, getVisibleMapPlaces } from "@/lib/mapLabels";
import { formatPlaceWithZone, getPlaceBySlug } from "@/lib/places";

describe("mapLabels utils", () => {
  it("formats offset diff properly", () => {
    expect(formatOffsetDiff(0)).toBe("0h");
    expect(formatOffsetDiff(330)).toBe("+5h 30m");
    expect(formatOffsetDiff(-300)).toBe("-5h");
    expect(formatOffsetDiff(-210)).toBe("-3h 30m");
  });

  it("names the zone used for multi-timezone countries", () => {
    const us = getPlaceBySlug("united-states");
    expect(us).toBeDefined();
    expect(formatPlaceWithZone(us!)).toBe("United States (New York)");

    const australia = getPlaceBySlug("australia");
    expect(australia).toBeDefined();
    expect(formatPlaceWithZone(australia!)).toBe("Australia (Sydney)");

    const canada = getPlaceBySlug("canada");
    expect(canada).toBeDefined();
    expect(formatPlaceWithZone(canada!)).toBe("Canada (Toronto)");

    const india = getPlaceBySlug("india");
    expect(india).toBeDefined();
    expect(formatPlaceWithZone(india!)).toBe("India");
  });

  it("returns country pills showing local time and time difference from user place (e.g. +5h 30m)", () => {
    // When user is in India (Asia/Kolkata, UTC+5:30)
    const places = getVisibleMapPlaces(2, "Asia/Kolkata");
    expect(places.length).toBeGreaterThan(10);

    // Every item has valid local timeStr (HH:mm) and diffStr (+5h 30m or -5h)
    places.forEach((p) => {
      expect(p.timeStr).toMatch(/^\d{2}:\d{2}$/);
      expect(p.diffStr).toBeDefined();
    });

    // UK from India in winter is -5h 30m
    const uk = places.find((p) => p.place.slug === "united-kingdom");
    expect(uk).toBeDefined();
    expect(uk?.diffStr).toMatch(/-(4h 30m|5h 30m)/);

    // Japan from India is +3h 30m
    const japan = places.find((p) => p.place.slug === "japan");
    expect(japan).toBeDefined();
    expect(japan?.diffStr).toBe("+3h 30m");
  });
});
