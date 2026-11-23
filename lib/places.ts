import countriesData from "@/data/countries.json";
import citiesData from "@/data/cities.json";
import popularPairsData from "@/data/popular-pairs.json";
import { calculateDistance } from "@/lib/distance";

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
  areaKm2?: number;
}

export interface PopularPair {
  from: string;
  to: string;
  category: "Country" | "City";
  tier?: 1 | 2;
  canonicalPair?: string;
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
const cities: Place[] = (citiesData as Array<{
  name: string;
  slug: string;
  country: string;
  countrySlug: string;
  countryIso: string;
  lat: number;
  lng: number;
  timezone: string;
  population?: number;
  areaKm2?: number;
}>).map((c) => ({
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
  areaKm2: c.areaKm2,
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

export function getZoneCityLabel(ianaZone: string): string {
  if (!ianaZone) return "";
  const parts = ianaZone.split("/");
  const cityRaw = parts[parts.length - 1];
  return cityRaw.replace(/_/g, " ");
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

/**
 * For countries spanning multiple time zones (e.g. US, Canada, Australia, Russia, Brazil,
 * Mexico, Indonesia, Kazakhstan), names the primary reference city/zone (e.g. "United States (New York)"),
 * avoiding misleading single-offset assumptions.
 */
export function formatPlaceWithZone(place: Place): string {
  if (place.type === "country" && place.otherZones && place.otherZones.length > 0) {
    const zoneCity = getZoneCityLabel(place.timezone);
    return `${place.name} (${zoneCity})`;
  }
  return formatPlaceDisplayName(place);
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
 * Prioritizes exact matches, starts-with matches, and higher-population cities/countries.
 */
export function searchPlaces(query: string, limit = 10): Place[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  const exactMatches: Place[] = [];
  const nameStartsWithMatches: Place[] = [];
  const nameContainsMatches: Place[] = [];
  const countryMatches: Place[] = [];

  const seenIds = new Set<string>();

  for (const place of getAllPlaces()) {
    const nameLower = place.name.toLowerCase();
    const countryLower = place.countryName.toLowerCase();

    if (nameLower === q) {
      if (!seenIds.has(place.id)) {
        exactMatches.push(place);
        seenIds.add(place.id);
      }
    } else if (nameLower.startsWith(q)) {
      if (!seenIds.has(place.id)) {
        nameStartsWithMatches.push(place);
        seenIds.add(place.id);
      }
    } else if (nameLower.includes(q)) {
      if (!seenIds.has(place.id)) {
        nameContainsMatches.push(place);
        seenIds.add(place.id);
      }
    } else if (countryLower.startsWith(q) || countryLower.includes(q)) {
      if (!seenIds.has(place.id)) {
        countryMatches.push(place);
        seenIds.add(place.id);
      }
    }
  }

  const sortFn = (a: Place, b: Place) => {
    return (b.population ?? 0) - (a.population ?? 0);
  };

  nameStartsWithMatches.sort(sortFn);
  nameContainsMatches.sort(sortFn);
  countryMatches.sort(sortFn);

  return [...exactMatches, ...nameStartsWithMatches, ...nameContainsMatches, ...countryMatches].slice(0, limit);
}

export interface CityGoogleMapsInfo {
  isCapital: boolean;
  countryName: string;
  capitalName?: string;
  distanceToCapitalKm?: number;
  distanceToCapitalMiles?: number;
  formattedDistanceToCapital?: string;
  distanceFromUserKm?: number;
  distanceFromUserMiles?: number;
  formattedDistanceFromUser?: string;
  areaKm2: number;
  areaSqMi: number;
  formattedArea: string;
  population?: number;
  formattedPopulation?: string;
  coordinatesFormatted: string;
}

export function getCityGoogleMapsInfo(
  city: Place,
  userPlace?: Place | null,
  userTimezone?: string
): CityGoogleMapsInfo {
  const country = getCountryBySlug(city.countrySlug);
  const countryName = city.countryName || country?.name || "";
  const capitalName = country?.capital || "";
  const isCapital = Boolean(
    capitalName &&
      (city.name.toLowerCase() === capitalName.toLowerCase() ||
        city.slug === capitalName.toLowerCase().replace(/\s+/g, "-"))
  );

  let distanceToCapitalKm: number | undefined;
  let distanceToCapitalMiles: number | undefined;
  let formattedDistanceToCapital: string | undefined;

  if (isCapital) {
    formattedDistanceToCapital = `Capital city of ${countryName}`;
  } else if (capitalName) {
    // Find capital city in cities list or fallback to country coordinates
    const capitalCity = cities.find(
      (c) =>
        c.countrySlug === city.countrySlug &&
        c.name.toLowerCase() === capitalName.toLowerCase()
    );
    const targetLat = capitalCity ? capitalCity.lat : country?.lat;
    const targetLng = capitalCity ? capitalCity.lng : country?.lng;

    if (targetLat !== undefined && targetLng !== undefined) {
      const dist = calculateDistance(city.lat, city.lng, targetLat, targetLng);
      distanceToCapitalKm = dist.km;
      distanceToCapitalMiles = dist.miles;
      formattedDistanceToCapital = `${dist.km.toLocaleString("en-US")} km (${dist.miles.toLocaleString("en-US")} mi) to capital (${capitalName})`;
    }
  }

  // Distance from user location
  let distanceFromUserKm: number | undefined;
  let distanceFromUserMiles: number | undefined;
  let formattedDistanceFromUser: string | undefined;

  let effectiveUserPlace = userPlace;
  if (!effectiveUserPlace && userTimezone) {
    effectiveUserPlace = getPlaceByTimezone(userTimezone) || null;
  }

  if (effectiveUserPlace && effectiveUserPlace.slug !== city.slug) {
    const userDist = calculateDistance(
      effectiveUserPlace.lat,
      effectiveUserPlace.lng,
      city.lat,
      city.lng
    );
    distanceFromUserKm = userDist.km;
    distanceFromUserMiles = userDist.miles;
    formattedDistanceFromUser = `${userDist.km.toLocaleString("en-US")} km (${userDist.miles.toLocaleString("en-US")} mi) from your location`;
  }

  // City Area: from data or estimated based on population
  const areaKm2 =
    city.areaKm2 && city.areaKm2 > 0
      ? city.areaKm2
      : city.population && city.population > 0
      ? Math.max(30, Math.round(city.population / 1800))
      : 150;
  const areaSqMi = Math.round(areaKm2 * 0.386102);
  const formattedArea = `${areaKm2.toLocaleString("en-US")} km² (${areaSqMi.toLocaleString("en-US")} sq mi)`;

  // Population
  let formattedPopulation: string | undefined;
  if (city.population && city.population > 0) {
    if (city.population >= 1_000_000) {
      formattedPopulation = `${(city.population / 1_000_000).toFixed(2).replace(/\.00$/, "")} million residents`;
    } else {
      formattedPopulation = `${city.population.toLocaleString("en-US")} residents`;
    }
  }

  // Coordinates
  const latDir = city.lat >= 0 ? "N" : "S";
  const lngDir = city.lng >= 0 ? "E" : "W";
  const coordinatesFormatted = `${Math.abs(city.lat).toFixed(2)}° ${latDir}, ${Math.abs(city.lng).toFixed(2)}° ${lngDir}`;

  return {
    isCapital,
    countryName,
    capitalName,
    distanceToCapitalKm,
    distanceToCapitalMiles,
    formattedDistanceToCapital,
    distanceFromUserKm,
    distanceFromUserMiles,
    formattedDistanceFromUser,
    areaKm2,
    areaSqMi,
    formattedArea,
    population: city.population,
    formattedPopulation,
    coordinatesFormatted,
  };
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
