import { describe, it, expect } from "vitest";
import {
  getPlaceBySlug,
  getCityBySlug,
  searchPlaces,
  getAllPlaces,
  getPopularPairs,
  getRelatedPairs,
  getCityGoogleMapsInfo,
} from "../lib/places";

describe("Places Dataset & Lookup Utilities", () => {
  it("loads countries and cities properly", () => {
    const all = getAllPlaces();
    expect(all.length).toBeGreaterThan(500);
  });

  it("finds India and United Kingdom by slug", () => {
    const india = getPlaceBySlug("india");
    expect(india).toBeDefined();
    expect(india?.name).toBe("India");
    expect(india?.timezone).toBe("Asia/Kolkata");
    expect(india?.type).toBe("country");

    const uk = getPlaceBySlug("united-kingdom");
    expect(uk).toBeDefined();
    expect(uk?.name).toBe("United Kingdom");
    expect(uk?.timezone).toBe("Europe/London");
  });

  it("finds major cities by slug", () => {
    const ny = getPlaceBySlug("new-york");
    expect(ny).toBeDefined();
    expect(ny?.name).toBe("New York");
    expect(ny?.timezone).toBe("America/New_York");
    expect(ny?.type).toBe("city");

    const london = getCityBySlug("london");
    expect(london).toBeDefined();
    expect(london?.name).toBe("London");

    const sydney = getCityBySlug("sydney");
    expect(sydney).toBeDefined();
    expect(sydney?.timezone).toBe("Australia/Sydney");
  });

  it("performs search and autocomplete accurately", () => {
    const results = searchPlaces("lon", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.toLowerCase().includes("london"))).toBe(true);

    const indiaResults = searchPlaces("delhi", 5);
    expect(indiaResults.length).toBeGreaterThan(0);
    expect(indiaResults[0].name).toBe("Delhi");
  });

  it("loads at least 200 popular pairs", () => {
    const popular = getPopularPairs();
    expect(popular.length).toBeGreaterThanOrEqual(200);

    // Verify first 5 pairs resolve to real places
    for (let i = 0; i < 5; i++) {
      const p = popular[i];
      const fromPlace = getPlaceBySlug(p.from);
      const toPlace = getPlaceBySlug(p.to);
      expect(fromPlace).toBeDefined();
      expect(toPlace).toBeDefined();
    }
  });

  it("returns 6 related pairs for internal SEO linking", () => {
    const related = getRelatedPairs("india", "united-kingdom", 6);
    expect(related.length).toBe(6);
    for (const r of related) {
      expect(r.from).toBeDefined();
      expect(r.to).toBeDefined();
      expect(r.url).toContain("/time-difference/");
    }
  });

  describe("Google Maps city info helper", () => {
    it("detects capital city and formats info correctly", () => {
      const london = getCityBySlug("london")!;
      expect(london).toBeDefined();
      const info = getCityGoogleMapsInfo(london);
      expect(info.isCapital).toBe(true);
      expect(info.formattedDistanceToCapital).toContain("Capital city of United Kingdom");
      expect(info.areaKm2).toBeGreaterThan(0);
      expect(info.formattedArea).toContain("km²");
      expect(info.formattedArea).toContain("sq mi");
      expect(info.coordinatesFormatted).toBeDefined();
    });

    it("calculates distance to capital and user location for non-capital city", () => {
      const losAngeles = getCityBySlug("los-angeles")!;
      expect(losAngeles).toBeDefined();
      const ny = getCityBySlug("new-york")!;
      const info = getCityGoogleMapsInfo(losAngeles, ny);
      expect(info.isCapital).toBe(false);
      expect(info.formattedDistanceToCapital).toBeDefined();
      expect(info.distanceToCapitalKm).toBeGreaterThan(0);
      expect(info.distanceFromUserKm).toBeGreaterThan(0);
      expect(info.formattedDistanceFromUser).toContain("from your location");
      expect(info.formattedPopulation).toBeDefined();
    });
  });
});
