/**
 * Distance utilities using Haversine formula
 */

export interface DistanceResult {
  km: number;
  kilometers: number;
  miles: number;
  nauticalMiles: number;
  initialBearingDegrees: number;
  compassDirection: string;
  estimatedFlightHours: number;
  formattedKm: string;
  formattedMiles: string;
}

const EARTH_RADIUS_KM = 6371;
const KM_TO_MILES = 0.621371;
const KM_TO_NAUTICAL_MILES = 0.539957;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function formatDistanceKm(km?: number): string {
  if (km === undefined || isNaN(km)) return "0 km";
  return `${km.toLocaleString("en-US")} km`;
}

export function formatDistanceMiles(miles?: number): string {
  if (miles === undefined || isNaN(miles)) return "0 mi";
  return `${miles.toLocaleString("en-US")} mi`;
}

export function estimateFlightTime(km: number): { hours: number; minutes: number } {
  const totalMinutes = Math.round((km / 850) * 60 + 30);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}

/**
 * Calculates great-circle distance between two coordinates using the Haversine formula.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): DistanceResult {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = Math.round(EARTH_RADIUS_KM * c);
  const miles = Math.round(km * KM_TO_MILES);
  const nauticalMiles = Math.round(km * KM_TO_NAUTICAL_MILES);

  // Initial compass bearing
  const y = Math.sin(dLon) * Math.cos(rLat2);
  const x =
    Math.cos(rLat1) * Math.sin(rLat2) -
    Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLon);
  let bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;
  bearing = Math.round(bearing);

  const compassPoints = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
  ];
  const compassIndex = Math.round(bearing / 22.5) % 16;
  const compassDirection = compassPoints[compassIndex];

  // Estimated non-stop flight duration (~850 km/h cruising + 0.5h taxi/takeoff/landing)
  const flightHours = km > 0 ? Number((km / 850 + 0.5).toFixed(1)) : 0;

  return {
    km,
    kilometers: km,
    miles,
    nauticalMiles,
    initialBearingDegrees: bearing,
    compassDirection,
    estimatedFlightHours: flightHours,
    formattedKm: `${km.toLocaleString("en-US")} km`,
    formattedMiles: `${miles.toLocaleString("en-US")} miles`,
  };
}
