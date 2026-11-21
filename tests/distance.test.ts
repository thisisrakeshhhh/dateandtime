import { describe, it, expect } from "vitest";
import { calculateDistance } from "../lib/distance";

describe("Distance Calculations (Haversine)", () => {
  it("calculates accurate distance between New York and London", () => {
    // New York: 40.7128, -74.0060; London: 51.5074, -0.1278
    const result = calculateDistance(40.7128, -74.006, 51.5074, -0.1278);
    // Real-world distance is ~5560 - 5590 km
    expect(result.kilometers).toBeGreaterThan(5500);
    expect(result.kilometers).toBeLessThan(5650);
    expect(result.miles).toBeGreaterThan(3400);
    expect(result.miles).toBeLessThan(3550);
    expect(result.initialBearingDegrees).toBeGreaterThan(45);
    expect(result.initialBearingDegrees).toBeLessThan(65);
    expect(result.formattedKm).toContain("km");
    expect(result.formattedMiles).toContain("miles");
  });

  it("calculates distance between Delhi and London", () => {
    // Delhi: 28.6139, 77.2090; London: 51.5074, -0.1278
    const result = calculateDistance(28.6139, 77.209, 51.5074, -0.1278);
    // Real-world distance is ~6700 km
    expect(result.kilometers).toBeGreaterThan(6600);
    expect(result.kilometers).toBeLessThan(6850);
    expect(result.estimatedFlightHours).toBeGreaterThan(7);
  });

  it("returns zero for identical coordinates", () => {
    const result = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
    expect(result.kilometers).toBe(0);
    expect(result.miles).toBe(0);
  });
});
