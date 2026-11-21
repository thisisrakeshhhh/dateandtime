import { DateTime } from "luxon";
import { Place, getCountries, getCities } from "@/lib/places";

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

  let candidates: Place[] = [];

  if (zoom <= 3) {
    // Zoom 2-3: Major countries and top global cities
    const countries = getCountries().slice(0, 40);
    const megacities = getCities()
      .filter((c) => (c.population ?? 0) > 6000000)
      .slice(0, 25);
    candidates = [...countries, ...megacities];
  } else if (zoom <= 5) {
    // Zoom 4-5: Prominent cities
    candidates = getCities()
      .filter((c) => (c.population ?? 0) > 1500000)
      .slice(0, 90);
  } else {
    // Zoom 6+: Regional cities
    candidates = getCities().slice(0, 250);
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

  // Map to label item data
  const results: MapLabelItem[] = [];
  const seenZonesAndCoords = new Set<string>();

  for (const place of candidates) {
    // Basic deduplication for close places in same zoom
    const gridKey = `${Math.round(place.lat / 4)}_${Math.round(place.lng / 6)}`;
    if (zoom <= 3 && seenZonesAndCoords.has(gridKey)) {
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
