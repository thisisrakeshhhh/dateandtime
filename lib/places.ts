import countriesData from "@/data/countries.json";
import citiesData from "@/data/cities.json";
import popularPairsData from "@/data/popular-pairs.json";

export type PlaceType = "country" | "city";

export interface Place {
  id: string;
  name: string;
  slug: string;
  type: PlaceType;
  countryName: string;
  countrySlug: string;
  countryIso: string;
  capital?: string;
  lat: number;
  lng: number;
  timezone: string;
  otherZones?: string[];
  continent?: string;
  population?: number;
}

export interface PopularPair {
  from: string;
  to: string;
  category: "Country" | "City";
}

// Transform raw country data into Place items
const countries: Place[] = countriesData.map((c) => ({
  id: `country-${c.slug}`,
  name: c.name,
  slug: c.slug,
  type: "country",
  countryName: c.name,
  countrySlug: c.slug,
  countryIso: c.iso,
  capital: c.capital,
  lat: c.lat,
  lng: c.lng,
  timezone: c.mainZone,
  otherZones: c.otherZones,
  continent: c.continent,
}));

// Transform raw city data into Place items
const cities: Place[] = citiesData.map((c) => ({
  id: `city-${c.slug}`,
  name: c.name,
  slug: c.slug,
  type: "city",
  countryName: c.country,
  countrySlug: c.countrySlug,
  countryIso: c.countryIso,
  lat: c.lat,
  lng: c.lng,
  timezone: c.timezone,
  population: c.population,
}));

// Slug index maps for instant O(1) lookups
const placeBySlug = new Map<string, Place>();
const countryBySlug = new Map<string, Place>();
const cityBySlug = new Map<string, Place>();

for (const c of countries) {
  countryBySlug.set(c.slug, c);
  placeBySlug.set(c.slug, c);
}

for (const c of cities) {
  cityBySlug.set(c.slug, c);
  // If no collision with country slug, index as place
  if (!placeBySlug.has(c.slug)) {
    placeBySlug.set(c.slug, c);
  } else {
    // If collision, index as city-{slug} as well
    placeBySlug.set(`city-${c.slug}`, c);
  }
}

export function formatPlaceDisplayName(place: Place): string {
  if (place.type === "country") {
    return place.name;
  }
  if (place.countryName && place.name.toLowerCase() !== place.countryName.toLowerCase()) {
    return `${place.name}, ${place.countryName}`;
  }
  return place.name;
}

export function getPlaceByTimezone(ianaZone: string): Place | undefined {
  if (!ianaZone) return undefined;
  const all = getAllPlaces();
  const match = all.find((p) => p.timezone === ianaZone);
  if (match) return match;
  const otherMatch = all.find((p) => p.otherZones?.includes(ianaZone));
  if (otherMatch) return otherMatch;
  const cityPart = ianaZone.split("/").pop()?.replace(/_/g, " ").toLowerCase();
  if (cityPart) {
    const cityMatch = all.find((p) => p.name.toLowerCase() === cityPart);
    if (cityMatch) return cityMatch;
  }
  return undefined;
}

export function getAllPlaces(): Place[] {
  return [...countries, ...cities];
}

export function getCountries(): Place[] {
  return countries;
}

export function getCities(): Place[] {
  return cities;
}

export function getPlaceBySlug(slug: string): Place | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  return (
    placeBySlug.get(normalized) ||
    cityBySlug.get(normalized) ||
    countryBySlug.get(normalized)
  );
}

export function getCountryBySlug(slug: string): Place | undefined {
  if (!slug) return undefined;
  return countryBySlug.get(slug.toLowerCase().trim());
}

export function getCityBySlug(slug: string): Place | undefined {
  if (!slug) return undefined;
  return cityBySlug.get(slug.toLowerCase().trim());
}

export function getPopularPairs(): PopularPair[] {
  return popularPairsData as PopularPair[];
}

/**
 * Fast search and autocomplete function matching prefix, words, and country name
 */
export function searchPlaces(query: string, limit = 8): Place[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  const exactMatches: Place[] = [];
  const startsWithMatches: Place[] = [];
  const containsMatches: Place[] = [];

  for (const place of getAllPlaces()) {
    const nameLower = place.name.toLowerCase();
    const countryLower = place.countryName.toLowerCase();

    if (nameLower === q) {
      exactMatches.push(place);
    } else if (nameLower.startsWith(q)) {
      startsWithMatches.push(place);
    } else if (nameLower.includes(q) || countryLower.includes(q)) {
      containsMatches.push(place);
    }

    if (exactMatches.length + startsWithMatches.length >= limit) {
      break;
    }
  }

  return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, limit);
}

/**
 * Returns 6 related pairs for SEO internal linking
 */
export function getRelatedPairs(
  currentFromSlug: string,
  currentToSlug: string,
  limit = 6
): Array<{ from: Place; to: Place; url: string }> {
  const currentFrom = getPlaceBySlug(currentFromSlug);
  const currentTo = getPlaceBySlug(currentToSlug);
  if (!currentFrom || !currentTo) return [];

  const results: Array<{ from: Place; to: Place; url: string }> = [];
  const popular = getPopularPairs();

  for (const p of popular) {
    // Avoid current pair or direct reverse
    if (
      (p.from === currentFromSlug && p.to === currentToSlug) ||
      (p.from === currentToSlug && p.to === currentFromSlug)
    ) {
      continue;
    }

    // Matches from or to location
    if (p.from === currentFromSlug || p.to === currentToSlug || p.from === currentToSlug || p.to === currentFromSlug) {
      const fromPlace = getPlaceBySlug(p.from);
      const toPlace = getPlaceBySlug(p.to);
      if (fromPlace && toPlace) {
        results.push({
          from: fromPlace,
          to: toPlace,
          url: `/time-difference/${p.from}-to-${p.to}`,
        });
      }
    }

    if (results.length >= limit) break;
  }

  // If still fewer than limit, add other popular pairs
  if (results.length < limit) {
    for (const p of popular) {
      if (results.length >= limit) break;
      const fromPlace = getPlaceBySlug(p.from);
      const toPlace = getPlaceBySlug(p.to);
      if (
        fromPlace &&
        toPlace &&
        !results.some((r) => r.from.slug === p.from && r.to.slug === p.to)
      ) {
        results.push({
          from: fromPlace,
          to: toPlace,
          url: `/time-difference/${p.from}-to-${p.to}`,
        });
      }
    }
  }

  return results.slice(0, limit);
}
