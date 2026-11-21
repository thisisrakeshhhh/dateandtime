import { DateTime } from "luxon";
import { Place, getCountries } from "@/lib/places";

export interface MapLabelItem {
  place: Place;
  timeStr: string;
  diffStr: string;
  isDiffDay: boolean;
  dayStr: string;
  isNight: boolean;
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

/**
 * Filter places based on map zoom and bounding box for high-performance collision-free map labels.
 * Map displays ONLY countries to keep the view clean, uncluttered, and readable.
 */
export function getVisibleMapPlaces(
  zoom: number,
  userTimezone: string,
  bounds?: { north: number; south: number; east: number; west: number }
): MapLabelItem[] {
  const now = DateTime.now();
  const userNow = now.setZone(userTimezone);
  const userOffset = userNow.offset;
  const userDateStr = userNow.toFormat("yyyy-MM-dd");

  // Show ONLY country names on the map
  const allCountries = getCountries();
  let candidates: Place[] = [];

  if (zoom <= 3) {
    // Zoom 2-3: Major countries spaced globally
    candidates = allCountries.slice(0, 50);
  } else {
    // Zoom 4+: All countries
    candidates = allCountries;
  }

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

  // Map to label item data with collision prevention
  const results: MapLabelItem[] = [];
  const seenZonesAndCoords = new Set<string>();

  for (const place of candidates) {
    // Grid-based deduplication for label collision prevention
    const gridDivLat = zoom <= 3 ? 8 : 4;
    const gridDivLng = zoom <= 3 ? 12 : 6;
    const gridKey = `${Math.round(place.lat / gridDivLat)}_${Math.round(place.lng / gridDivLng)}`;
    if (seenZonesAndCoords.has(gridKey)) {
      continue;
    }
    seenZonesAndCoords.add(gridKey);

    const placeNow = now.setZone(place.timezone);
    if (!placeNow.isValid) continue;

    const diffMinutes = placeNow.offset - userOffset;
    const diffStr = formatOffsetDiff(diffMinutes);
    const placeDateStr = placeNow.toFormat("yyyy-MM-dd");
    const isDiffDay = placeDateStr !== userDateStr;
    const dayStr = placeNow.toFormat("ccc d LLL");
    const hour = placeNow.hour;
    const isNight = hour < 6 || hour >= 19;

    results.push({
      place,
      timeStr: placeNow.toFormat("HH:mm"),
      diffStr,
      isDiffDay,
      dayStr,
      isNight,
    });

    if (results.length >= 60) break;
  }

  return results;
}
