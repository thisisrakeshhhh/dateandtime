import { DateTime } from 'luxon';
import { Place, getCities, formatPlaceWithZone } from '@/lib/places';
import { getSolarTimes } from '@/lib/astronomy';
import { calculateIntervalOverlap } from '@/lib/time';

export interface MajorCityDiff {
  name: string;
  country: string;
  slug: string;
  timezone: string;
  currentTimeStr: string;
  diffMinutes: number;
  diffFormatted: string; // e.g. "+5h 00m ahead" or "-5h 00m behind"
  isAhead: boolean;
  overlapOfficeHours: string;
}

export const MAJOR_HUBS = [
  { name: 'London', country: 'United Kingdom', slug: 'london', timezone: 'Europe/London' },
  { name: 'New York', country: 'United States', slug: 'new-york', timezone: 'America/New_York' },
  { name: 'Tokyo', country: 'Japan', slug: 'tokyo', timezone: 'Asia/Tokyo' },
  { name: 'Dubai', country: 'United Arab Emirates', slug: 'dubai', timezone: 'Asia/Dubai' },
  { name: 'Sydney', country: 'Australia', slug: 'sydney', timezone: 'Australia/Sydney' },
  { name: 'Paris', country: 'France', slug: 'paris', timezone: 'Europe/Paris' },
];

export interface CityTimeReport {
  city: Place;
  displayName: string;
  countryWithZone: string;
  localTime: DateTime;
  formattedTime: string;
  formattedDate: string;
  weekday: string;
  utcOffsetStr: string;
  isInDst: boolean;
  dstZoneAbbr: string;
  sunrise: string;
  sunset: string;
  solarNoon: string;
  isDaytime: boolean;
  differencesFromMajor: MajorCityDiff[];
  relatedLinks: Array<{ label: string; href: string }>;
  articleSections: Array<{ heading: string; body: string }>;
  articleText: string;
  wordCount: number;
  isIndexable: boolean;
}

export function generateCityTimeReport(city: Place, now: DateTime = DateTime.now()): CityTimeReport {
  const localTime = now.setZone(city.timezone);
  const formattedTime = localTime.toFormat('hh:mm a');
  const formattedDate = localTime.toFormat('MMMM d, yyyy');
  const weekday = localTime.toFormat('cccc');
  const utcOffsetMinutes = localTime.offset;
  const offsetHours = Math.floor(Math.abs(utcOffsetMinutes) / 60);
  const offsetMins = Math.abs(utcOffsetMinutes) % 60;
  const sign = utcOffsetMinutes >= 0 ? '+' : '-';
  const utcOffsetStr = `UTC${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;

  const isInDst = localTime.isInDST;
  const dstZoneAbbr = localTime.offsetNameShort || localTime.zoneName || 'UTC';

  // Solar times
  const solar = getSolarTimes(city.lat, city.lng, city.timezone, now.toJSDate());

  // Comparison with 6 major global cities
  const differencesFromMajor: MajorCityDiff[] = MAJOR_HUBS.map((hub) => {
    const hubTime = now.setZone(hub.timezone);
    const diffMinutes = localTime.offset - hubTime.offset;
    const absDiff = Math.abs(diffMinutes);
    const h = Math.floor(absDiff / 60);
    const m = absDiff % 60;
    const diffFormatted =
      diffMinutes === 0
        ? 'Same time'
        : diffMinutes > 0
        ? `+${h}h ${m > 0 ? `${m}m ` : ''}ahead`
        : `-${h}h ${m > 0 ? `${m}m ` : ''}behind`;

    // Overlap for 9 AM - 5 PM office hours
    const overlap = calculateIntervalOverlap(city.timezone, hub.timezone, 9, 17, 9, 17, localTime);
    const overlapOfficeHours = overlap && overlap.overlapMinutes > 0
      ? `${overlap.fromStartFormatted} - ${overlap.fromEndFormatted} local (${(overlap.overlapMinutes / 60).toFixed(1)} hrs)`
      : 'No standard overlap';

    return {
      name: hub.name,
      country: hub.country,
      slug: hub.slug,
      timezone: hub.timezone,
      currentTimeStr: hubTime.toFormat('hh:mm a'),
      diffMinutes,
      diffFormatted,
      isAhead: diffMinutes > 0,
      overlapOfficeHours,
    };
  });

  // 6 Related links
  const allCities = getCities();
  const sameCountry = allCities.filter((c) => c.countrySlug === city.countrySlug && c.slug !== city.slug).slice(0, 3);
  const candidateHubs = MAJOR_HUBS.filter((h) => h.slug !== city.slug);

  const relatedLinks: Array<{ label: string; href: string }> = [];

  for (const sc of sameCountry) {
    relatedLinks.push({
      label: `Time in ${sc.name}`,
      href: `/what-time-is-it-in/${sc.slug}`,
    });
  }

  for (const hub of candidateHubs) {
    if (relatedLinks.length >= 6) break;
    relatedLinks.push({
      label: `${city.name} to ${hub.name} time difference`,
      href: `/time-difference/${city.slug}-to-${hub.slug}`,
    });
  }

  // Multi-timezone country name format
  const countryWithZone = formatPlaceWithZone(city);
  const displayName = city.countryName ? `${city.name}, ${city.countryName}` : city.name;

  const londonDiff = differencesFromMajor.find((d) => d.slug === 'london');
  const nyDiff = differencesFromMajor.find((d) => d.slug === 'new-york');
  const tokyoDiff = differencesFromMajor.find((d) => d.slug === 'tokyo');
  const sydneyDiff = differencesFromMajor.find((d) => d.slug === 'sydney');

  const articleSections: Array<{ heading: string; body: string }> = [
    {
      heading: `Local Time and Timezone Identity in ${city.name}`,
      body: `The current local time in ${displayName} is ${formattedTime} on ${weekday}, ${formattedDate}. The metropolitan region operates under the authoritative IANA identifier "${city.timezone}", which presently maintains a UTC offset of ${utcOffsetStr} (${dstZoneAbbr}). Whether Daylight Saving Time is currently observed depends on the jurisdiction's seasonal statutory calendar; as of today, daylight saving protocol is ${isInDst ? 'active in this zone' : 'not actively observed or currently in standard winter time'}. Keeping track of standard time transitions is essential for multinational enterprises, software teams syncing database timestamps, and cross-border project managers.`,
    },
    {
      heading: `Solar Cycle, Daylight and Geographic Coordinates`,
      body: `Geographically situated at coordinates latitude ${city.lat.toFixed(2)}° and longitude ${city.lng.toFixed(2)}°, ${city.name} follows a distinct natural daylight progression. Today's sunrise took place at approximately ${solar.sunrise}, while sunset occurs at ${solar.sunset}, culminating around solar noon at ${solar.solarNoon}. These solar milestones define the physical rhythm of the city, affecting commute patterns, outdoor events, and regional energy load profiles. For international travelers arriving on long-haul flights, aligning daily activities with local solar daylight is one of the most effective methods to quickly reset circadian rhythms and minimize acute jet lag fatigue.`,
    },
    {
      heading: `Business Hours and International Calling Overlap`,
      body: `Coordinating real-time communications between ${city.name} and key commercial capitals requires careful alignment of standard 9:00 AM to 5:00 PM business hours. Relative to London (GMT/BST), clocks in ${city.name} are ${londonDiff?.diffFormatted}. When syncing with New York and the US Eastern Seaboard, ${city.name} is ${nyDiff?.diffFormatted}. Looking towards the Asia-Pacific economy, clocks in ${city.name} are ${tokyoDiff?.diffFormatted} relative to Tokyo, and ${sydneyDiff?.diffFormatted} compared to Sydney, Australia. For seamless corporate collaboration, remote standups and client presentations, distributed teams frequently leverage early morning or late afternoon meeting slots to maximize awake, bilateral overlap without placing unfair burdens on international partners.`,
    },
    {
      heading: `Precision Timekeeping and Practical Guidelines`,
      body: `All calculations rendered on TimeBridge reflect the latest IANA Time Zone Database specifications, guaranteeing accuracy down to the minute without rounding approximations. When setting up calendar invites, virtual interviews, or asynchronous team workflows involving ${city.name}, always confirm whether upcoming daylight saving switches will alter your time delta. Utilizing digital timezone converters that account for leap adjustments, daylight transitions, and municipal boundaries ensures that critical business transactions and travel connections proceed without friction.`,
    },
  ];

  const fullText = articleSections.map((s) => `${s.heading}. ${s.body}`).join(' ');
  const words = fullText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isIndexable = wordCount >= 250;

  return {
    city,
    displayName,
    countryWithZone,
    localTime,
    formattedTime,
    formattedDate,
    weekday,
    utcOffsetStr,
    isInDst,
    dstZoneAbbr,
    sunrise: solar.sunrise,
    sunset: solar.sunset,
    solarNoon: solar.solarNoon,
    isDaytime: solar.isDaytime,
    differencesFromMajor,
    relatedLinks: relatedLinks.slice(0, 6),
    articleSections,
    articleText: fullText,
    wordCount,
    isIndexable,
  };
}
