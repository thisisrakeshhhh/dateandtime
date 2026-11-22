import { DateTime } from "luxon";
import { Place, getCountries } from "@/lib/places";
import { calculateDistance } from "@/lib/distance";

export interface MapLabelItem {
  place: Place;
  timeStr: string;
  diffStr: string;
  isDiffDay: boolean;
  dayStr: string;
  isNight: boolean;
  distanceKm?: number;
  distanceStr?: string;
}

export function formatOffsetDiff(diffMinutes: number): string {
  if (diffMinutes === 0) return "0h";
  const sign = diffMinutes > 0 ? "+" : "-";
  const abs = Math.abs(diffMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

// Priority anchor countries across continents to evaluate first for clean global distribution
const priorityCountrySlugs = [
  "united-states",
  "india",
  "united-kingdom",
  "japan",
  "brazil",
  "australia",
  "germany",
  "china",
  "south-africa",
  "egypt",
  "canada",
  "united-arab-emirates",
  "indonesia",
  "mexico",
  "france",
  "argentina",
  "singapore",
  "nigeria",
  "italy",
  "spain",
  "saudi-arabia",
  "south-korea",
  "new-zealand",
  "turkey",
  "sweden",
  "kenya",
  "switzerland",
  "colombia",
  "thailand",
  "vietnam",
  "chile",
  "peru",
  "poland",
  "netherlands",
  "norway",
];

/**
 * Filter places based on map zoom and bounding box for high-performance collision-free map labels.
 * Map displays ONLY countries to keep the view clean, uncluttered, and readable.
 */
export function getVisibleMapPlaces(
  zoom: number,
  userTimezone: string,
  bounds?: { north: number; south: number; east: number; west: number },
  userCoordinates?: { lat: number; lng: number }
): MapLabelItem[] {
  const now = DateTime.now();
  const userNow = now.setZone(userTimezone);
  const userOffset = userNow.offset;
  const userDateStr = userNow.toFormat("yyyy-MM-dd");

  // Show ONLY country names on the map
  const allCountries = getCountries();
  let candidates: Place[] = [...allCountries];

  // Sort candidates by priority anchor order
  candidates.sort((a, b) => {
    const idxA = priorityCountrySlugs.indexOf(a.slug);
    const idxB = priorityCountrySlugs.indexOf(b.slug);
    const scoreA = idxA !== -1 ? idxA : 999;
    const scoreB = idxB !== -1 ? idxB : 999;
    return scoreA - scoreB;
  });

  // Filter by bounding box if provided
  if (bounds) {
    candidates = candidates.filter((p) => {
      const latOk = p.lat >= bounds.south && p.lat <= bounds.north;
      // Handle bounds wrapping over 180/-180 meridian if needed
      let lngOk = true;
      if (bounds.west <= bounds.east) {
        lngOk = p.lng >= bounds.west && p.lng <= bounds.east;
      } else {
        lngOk = p.lng >= bounds.west || p.lng <= bounds.east;
      }
      return latOk && lngOk;
    });
  }

  // Map to label item data
  const results: MapLabelItem[] = [];

  for (const place of candidates) {
    const placeNow = now.setZone(place.timezone);
    if (!placeNow.isValid) continue;

    const diffMinutes = placeNow.offset - userOffset;
    const diffStr = formatOffsetDiff(diffMinutes);
    const placeDateStr = placeNow.toFormat("yyyy-MM-dd");
    const isDiffDay = placeDateStr !== userDateStr;
    const dayStr = placeNow.toFormat("ccc d LLL");
    const hour = placeNow.hour;
    const isNight = hour < 6 || hour >= 19;

    let distanceKm: number | undefined;
    let distanceStr: string | undefined;

    if (userCoordinates) {
      const d = calculateDistance(userCoordinates.lat, userCoordinates.lng, place.lat, place.lng);
      const km = Math.round(d.km);
      if (km > 50) {
        distanceKm = km;
        distanceStr = `${km.toLocaleString()} km`;
      }
    }

    results.push({
      place,
      timeStr: placeNow.toFormat("HH:mm"),
      diffStr,
      isDiffDay,
      dayStr,
      isNight,
      distanceKm,
      distanceStr,
    });
  }

  return results;
}
