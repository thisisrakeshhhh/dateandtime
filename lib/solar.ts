/**
 * Solar terminator and subsolar coordinates computation
 * Generates exact lat/lng polygon coordinates for the Earth's night shadow
 */

export interface SubsolarPoint {
  lat: number;
  lng: number;
}

export interface SolarTerminatorData {
  subsolarPoint: SubsolarPoint;
  declinationDegrees: number;
  // Leaflet expects array of [lat, lng] coordinates
  nightPolygonLatLngs: [number, number][];
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Calculates subsolar latitude and longitude for a given date
 */
export function getSubsolarPoint(date: Date = new Date()): SubsolarPoint {
  const utc = date.getTime();
  const jd = utc / 86400000 + 2440587.5;
  const d = jd - 2451545.0; // Days since J2000.0

  // Mean solar longitude
  const L = (280.46 + 0.9856474 * d) % 360;
  // Mean anomaly
  const g = ((357.528 + 0.9856003 * d) % 360) * DEG_TO_RAD;

  // Ecliptic longitude
  const lambda =
    (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG_TO_RAD;

  // Obliquity of the ecliptic
  const epsilon = (23.439 - 0.0000004 * d) * DEG_TO_RAD;

  // Sun declination (subsolar latitude)
  const sinDec = Math.sin(epsilon) * Math.sin(lambda);
  const declination = Math.asin(sinDec) * RAD_TO_DEG;

  // Equation of time approximation (minutes)
  const y = Math.tan(epsilon / 2) ** 2;
  const e = 0.0167086; // Earth eccentricity
  const sin2L = Math.sin(2 * lambda);
  const sinG = Math.sin(g);
  const cos2L = Math.cos(2 * lambda);
  const sin4L = Math.sin(4 * lambda);
  const sin2G = Math.sin(2 * g);

  const eotMinutes =
    4 *
    RAD_TO_DEG *
    (y * sin2L -
      2 * e * sinG +
      4 * e * y * sinG * cos2L -
      0.5 * y * y * sin4L -
      1.25 * e * e * sin2G);

  // UTC time of day in hours
  const hoursUtc =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;

  // Subsolar longitude (Greenwich hour angle)
  // Solar noon at Greenwich occurs at 12:00 - EoT/60
  let subsolarLng = -((hoursUtc - 12) * 15 + (eotMinutes / 60) * 15);
  // Normalize to [-180, 180]
  subsolarLng = ((((subsolarLng + 180) % 360) + 360) % 360) - 180;

  return {
    lat: declination,
    lng: subsolarLng,
  };
}

/**
 * Computes the solar terminator polygon (night area) for Leaflet
 */
export function computeSolarTerminator(date: Date = new Date()): SolarTerminatorData {
  const subsolar = getSubsolarPoint(date);
  const decRad = subsolar.lat * DEG_TO_RAD;
  const subsolarLngRad = subsolar.lng * DEG_TO_RAD;

  const points: [number, number][] = [];
  const step = 2; // Step in degrees for smooth curve

  // Calculate terminator latitude for each longitude from -180 to +180
  const tanDec = Math.tan(decRad);

  for (let lon = -180; lon <= 180; lon += step) {
    const lonRad = lon * DEG_TO_RAD;
    const deltaLon = lonRad - subsolarLngRad;

    let lat: number;
    if (Math.abs(tanDec) < 0.00001) {
      // Equinox: terminator follows meridians
      lat = Math.cos(deltaLon) >= 0 ? 0 : 0;
    } else {
      // General formula for the zero solar elevation line:
      // tan(lat) = - cos(deltaLon) / tan(dec)
      lat = Math.atan(-Math.cos(deltaLon) / tanDec) * RAD_TO_DEG;
    }

    // Clamp within valid map latitudes (-85 to +85 for Web Mercator)
    lat = Math.max(-85, Math.min(85, lat));
    points.push([lat, lon]);
  }

  // To close the night polygon, we need to wrap around the unilluminated pole:
  // If dec > 0 (Northern summer), North Pole is in continuous day, South Pole is in night.
  // So night polygon encompasses the South Pole (lat = -85).
  // If dec < 0 (Northern winter), North Pole is in night (lat = +85).
  const darkPoleLat = subsolar.lat >= 0 ? -85 : 85;

  // Close the polygon
  points.push([darkPoleLat, 180]);
  points.push([darkPoleLat, -180]);
  // Return to the first point
  points.push(points[0]);

  return {
    subsolarPoint: subsolar,
    declinationDegrees: subsolar.lat,
    nightPolygonLatLngs: points,
  };
}
