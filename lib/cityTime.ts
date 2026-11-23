import { DateTime } from 'luxon';
import { Place, formatPlaceWithZone } from '@/lib/places';
import { getSolarTimes } from '@/lib/astronomy';
import { calculateIntervalOverlap } from '@/lib/time';
import { getCountryPublicHolidays } from '@/lib/holidaysData';
import { computeAnnualDaylightRange } from '@/lib/annualSolstice';

export interface MajorCityDiff {
  name: string;
  country: string;
  slug: string;
  timezone: string;
  currentTimeStr: string;
  diffMinutes: number;
  diffFormatted: string;
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
  { name: 'Singapore', country: 'Singapore', slug: 'singapore', timezone: 'Asia/Singapore' },
  { name: 'San Francisco', country: 'United States', slug: 'san-francisco', timezone: 'America/Los_Angeles' },
  { name: 'Berlin', country: 'Germany', slug: 'berlin', timezone: 'Europe/Berlin' },
  { name: 'Toronto', country: 'Canada', slug: 'toronto', timezone: 'America/Toronto' },
  { name: 'Hong Kong', country: 'China', slug: 'hong-kong', timezone: 'Asia/Hong_Kong' },
  { name: 'Amsterdam', country: 'Netherlands', slug: 'amsterdam', timezone: 'Europe/Amsterdam' },
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

function getSeedHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
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

  // Solar times & Annual daylight
  const solar = getSolarTimes(city.lat, city.lng, city.timezone, now.toJSDate());
  const annualDaylight = computeAnnualDaylightRange(city.lat, city.lng);
  const holidays = getCountryPublicHolidays(city.countryIso, city.countryName || city.name);
  const holidaySummary = holidays.slice(0, 3).map((h) => `${h.name} (${h.dateStr})`).join(", ");

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

  // Related links
  const relatedLinks: Array<{ label: string; href: string }> = [];
  const candidateHubs = MAJOR_HUBS.filter((h) => h.timezone !== city.timezone);
  for (const hub of candidateHubs) {
    if (relatedLinks.length >= 6) break;
    relatedLinks.push({
      label: `${city.name} to ${hub.name} time difference`,
      href: `/time-difference/${city.slug}-to-${hub.slug}`,
    });
  }

  const countryWithZone = formatPlaceWithZone(city);
  const displayName = city.countryName ? `${city.name}, ${city.countryName}` : city.name;

  const v = getSeedHash(city.slug + '-city-rep');
  const v1 = v % 6;
  const v2 = Math.floor(v / 6) % 6;
  const v3 = Math.floor(v / 36) % 6;
  const v4 = Math.floor(v / 216) % 6;
  const v5 = Math.floor(v / 1296) % 6;

  // Dynamically select hubs for section 3 based on city seed
  const h1 = MAJOR_HUBS[v % 12];
  const h2 = MAJOR_HUBS[(v + 3) % 12];
  const h3 = MAJOR_HUBS[(v + 7) % 12];
  const h4 = MAJOR_HUBS[(v + 10) % 12];

  const diff1 = differencesFromMajor.find((d) => d.slug === h1.slug) || { name: h1.name, diffFormatted: 'Same time' };
  const diff2 = differencesFromMajor.find((d) => d.slug === h2.slug) || { name: h2.name, diffFormatted: 'Same time' };
  const diff3 = differencesFromMajor.find((d) => d.slug === h3.slug) || { name: h3.name, diffFormatted: 'Same time' };
  const diff4 = differencesFromMajor.find((d) => d.slug === h4.slug) || { name: h4.name, diffFormatted: 'Same time' };

  const distEquatorKm = Math.round(Math.abs(city.lat) * 111);

  // Section 1: Wall Clock & Timezone Architecture (6 styles)
  let section1Body = '';
  if (v1 === 0) {
    section1Body = `Clocks in ${displayName} are displaying ${formattedTime} on this ${weekday}, ${formattedDate}. The urban center follows the canonical IANA zone definition "${city.timezone}", which holds an active UTC offset of ${utcOffsetStr} (${dstZoneAbbr}). At this point in the year, Daylight Saving Time is ${isInDst ? 'active across the district, advancing local clocks by one full hour for the summer months' : 'inactive or not observed under local statutory regulations, keeping clocks on permanent standard time'}. Maintaining awareness of this specific zone configuration allows digital teams, software engineers recording UTC timestamps in databases, and travelers to sync across international borders without confusion or schedule misalignment.`;
  } else if (v1 === 1) {
    section1Body = `The exact local wall-clock time throughout ${displayName} is currently ${formattedTime} (${weekday}, ${formattedDate}). Governed by the official "${city.timezone}" timezone registry, regional clocks correspond to ${utcOffsetStr} against UTC (${dstZoneAbbr}). Regional daylight shifting is presently ${isInDst ? 'in effect, having advanced standard clocks forward for summer energy conservation' : 'on standard astronomical schedule without daylight saving advancement'}. Situated at latitude ${city.lat.toFixed(2)}° and longitude ${city.lng.toFixed(2)}°, verifying zone nomenclature prevents missed business deadlines, misplaced teleconference links, and flight check-in delays for visitors arriving in ${city.name}.`;
  } else if (v1 === 2) {
    section1Body = `As of ${weekday}, ${formattedDate}, the recorded time in ${displayName} stands at ${formattedTime}. Operating under the internationally recognized "${city.timezone}" timezone identifier, the region applies an offset of ${utcOffsetStr} (${dstZoneAbbr}). Daylight saving adjustments are ${isInDst ? 'currently active for the summer season, moving clocks forward by one hour' : 'not presently active in this territory, preserving steady standard time'}. Accurately tracking these parameters from coordinates ${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}° is vital for remote cross-border collaboration, corporate billing cycles, and global aviation flight operations.`;
  } else if (v1 === 3) {
    section1Body = `Local time in ${displayName} is registered at ${formattedTime} on ${weekday}, ${formattedDate}. The municipality operates within the "${city.timezone}" timezone domain, maintaining a reference offset of ${utcOffsetStr} (${dstZoneAbbr}). At present, daylight saving time is ${isInDst ? 'actively observed, shifting regional clocks forward' : 'not observed or currently suspended during the standard calendar season'}. Located geographically in ${city.countryName || 'the region'}, staying updated on statutory timezone rules ensures accurate calendar management for multinational teams.`;
  } else if (v1 === 4) {
    section1Body = `Standard time observed across ${displayName} currently marks ${formattedTime} on ${weekday}, ${formattedDate}. Anchored to the "${city.timezone}" IANA database zone, local civil time runs at ${utcOffsetStr} relative to Universal Coordinated Time (${dstZoneAbbr}). Seasonal clock shifts are ${isInDst ? 'in operation today, lending extended daylight to evening hours' : 'not active, with local clocks adhering to uninterrupted astronomical time'}. For ${city.name} at coordinates (${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}°), coordinated timestamp tracking avoids costly operational friction.`;
  } else {
    section1Body = `Within ${displayName}, local clocks record ${formattedTime} on ${weekday}, ${formattedDate}. Positioned formally in the "${city.timezone}" zone, the jurisdiction maintains an offset of ${utcOffsetStr} (${dstZoneAbbr}). Daylight saving provisions are ${isInDst ? 'in force across local districts' : 'unobserved or currently dormant for the season'}. Clarifying zone definitions for ${city.name} guarantees reliable telecommunications and flight transfers for cross-border travelers.`;
  }

  // Section 2: Photoperiod, Annual Solstice Extremes & Coordinates (6 styles)
  let section2Body = '';
  if (v2 === 0) {
    section2Body = `Positioned at latitude ${city.lat.toFixed(2)}° and longitude ${city.lng.toFixed(2)}°, ${city.name} experiences dawn at ${solar.sunrise} and dusk near ${solar.sunset}, with solar midday at ${solar.solarNoon}. Annually, the solar photoperiod spans from ${annualDaylight.shortestDayFormatted} on the winter solstice to ${annualDaylight.longestDayFormatted} at midsummer (an annual daylight variation of ${annualDaylight.solsticeDiffFormatted}). First light in peak summer arrives as early as ${annualDaylight.earliestSunrise}, while latest evening sunsets extend past ${annualDaylight.latestSunset}.`;
  } else if (v2 === 1) {
    section2Body = `With coordinates of ${city.lat.toFixed(2)}° latitude and ${city.lng.toFixed(2)}° longitude, daily solar progression in ${city.name} charts sunrise at ${solar.sunrise} and sunset at ${solar.sunset}. Over the course of the year, daylight length expands and contracts between a minimum of ${annualDaylight.shortestDayFormatted} and a summer peak of ${annualDaylight.longestDayFormatted}, representing a seasonal delta of ${annualDaylight.solsticeDiffFormatted}. Travelers can leverage these natural daylight markers to recalibrate their body clocks.`;
  } else if (v2 === 2) {
    section2Body = `Geographically situated at coordinates ${city.lat.toFixed(2)}° N/S and ${city.lng.toFixed(2)}° E/W, ${city.name} experiences solar noon at ${solar.solarNoon}, bounded by morning sunrise at ${solar.sunrise} and evening sunset at ${solar.sunset}. Across the seasons, daylight varies by roughly ${annualDaylight.solsticeDiffFormatted}, spanning between ${annualDaylight.shortestDayFormatted} at midwinter and ${annualDaylight.longestDayFormatted} around midsummer, directly influencing civic activity.`;
  } else if (v2 === 3) {
    section2Body = `Located ${distEquatorKm} km from the equator at ${city.lat.toFixed(2)}° latitude, ${city.name} observes daily dawn at ${solar.sunrise} and sunset at ${solar.sunset}. The annual solar swing encompasses ${annualDaylight.solsticeDiffFormatted} of daylight change, moving from ${annualDaylight.shortestDayFormatted} on the shortest winter day to ${annualDaylight.longestDayFormatted} at the summer solstice. Midsummer dawn breaks near ${annualDaylight.earliestSunrise}, providing extensive evening twilight until ${annualDaylight.latestSunset}.`;
  } else if (v2 === 4) {
    section2Body = `At geographic location (${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}°), ${city.name} registers solar noon at ${solar.solarNoon}, with today's sunrise at ${solar.sunrise} and sunset at ${solar.sunset}. Throughout the calendar year, the natural photoperiod fluctuates between ${annualDaylight.shortestDayFormatted} during the winter solstice and ${annualDaylight.longestDayFormatted} during the summer solstice, a seasonal change of ${annualDaylight.solsticeDiffFormatted}.`;
  } else {
    section2Body = `Spanning coordinates ${city.lat.toFixed(2)}° lat, ${city.lng.toFixed(2)}° long, ${city.name} greets the morning sun at ${solar.sunrise} and concludes evening twilight around ${solar.sunset}. Annual daylight ranges from ${annualDaylight.shortestDayFormatted} at midwinter to ${annualDaylight.longestDayFormatted} at the summer peak (a variance of ${annualDaylight.solsticeDiffFormatted}), shaping urban transportation and energy consumption rhythms.`;
  }

  // Section 3: Business Hours and International Calling Overlap (6 styles)
  let section3Body = '';
  if (v3 === 0) {
    section3Body = `Aligning business operations between ${city.name} and top international hubs depends on standard business schedules. When cross-referencing with ${h1.name}, ${city.name} is ${diff1.diffFormatted}. Relative to ${h2.name}, the time delta is ${diff2.diffFormatted}. Across other major financial hubs, local clocks are ${diff3.diffFormatted} compared to ${h3.name}, and ${diff4.diffFormatted} against ${h4.name}. Shared working windows are most effective when scheduled during matching daytime blocks, avoiding disruptive late-night or dawn meetings for distributed counterparts.`;
  } else if (v3 === 1) {
    section3Body = `For multinational firms conducting business in ${city.name}, syncing with global markets requires navigating diverse time offsets. Local clocks are ${diff1.diffFormatted} relative to ${h1.name}, ${diff2.diffFormatted} compared to ${h2.name}, ${diff3.diffFormatted} against ${h3.name}, and ${diff4.diffFormatted} relative to ${h4.name}. Structuring calls around these offsets ensures seamless conference schedules, predictable executive handoffs, and consistent project velocity without team fatigue.`;
  } else if (v3 === 2) {
    section3Body = `Scheduling cross-border meetings with partners in ${city.name} involves monitoring regional differences with key financial epicenters: ${diff1.diffFormatted} against ${h1.name}, ${diff2.diffFormatted} versus ${h2.name}, ${diff3.diffFormatted} relative to ${h3.name}, and ${diff4.diffFormatted} compared to ${h4.name}. Remote teams frequently reserve early mornings or late afternoons for synchronous check-ins, relying on clear written documentation during asynchronous hours to keep progress continuous.`;
  } else if (v3 === 3) {
    section3Body = `Enterprise workflows involving ${city.name} require coordinating hours with primary trading hubs: ${diff1.diffFormatted} compared to ${h1.name}, ${diff2.diffFormatted} against ${h2.name}, ${diff3.diffFormatted} for ${h3.name}, and ${diff4.diffFormatted} relative to ${h4.name}. Identifying mutual working windows between 9:00 AM and 5:00 PM enables effective sprint planning and client engagement across international borders.`;
  } else if (v3 === 4) {
    section3Body = `Coordinating telephone and video schedules with ${city.name} means managing distinct geographic time gaps: ${diff1.diffFormatted} to ${h1.name}, ${diff2.diffFormatted} to ${h2.name}, ${diff3.diffFormatted} to ${h3.name}, and ${diff4.diffFormatted} to ${h4.name}. Establishing structured calendar overlap prevents cross-timezone friction and respects international boundaries.`;
  } else {
    section3Body = `Global organizations interfacing with ${city.name} navigate standard time offsets: ${diff1.diffFormatted} with ${h1.name}, ${diff2.diffFormatted} with ${h2.name}, ${diff3.diffFormatted} with ${h3.name}, and ${diff4.diffFormatted} with ${h4.name}. Aligning bilateral calls with common awake intervals creates sustainable collaboration without unnecessary overtime.`;
  }

  // Section 4: Precision Timekeeping and Holidays (6 styles)
  let section4Body = '';
  if (v4 === 0) {
    section4Body = `All timestamps provided for ${city.name} on TimeBridge reference live astronomical data and official IANA rules for ${city.timezone}. When coordinating transatlantic or transpacific engagements with ${city.name}, checking these figures prevents scheduling mix-ups caused by statutory clock shifts. Digital professionals can rely on these verified metrics for calendar planning and synchronized workflows. Local civic scheduling also accounts for public observances including ${holidaySummary || "national statutory holidays"}, which guide regional office and banking availability.`;
  } else if (v4 === 1) {
    section4Body = `TimeBridge calculates all regional standards for ${city.name} using authoritative Olson database parameters for ${city.timezone}. Teams relying on accurate calendar invitations can depend on these verified records for frictionless international logistics, event coordination, and cross-border client deliverables involving ${city.name} without time ambiguity. Factoring in regional public holidays such as ${holidaySummary || "recognized civil holidays"} further elevates the effectiveness of international partnerships.`;
  } else if (v4 === 2) {
    section4Body = `Calculations for ${city.name} are derived directly from global timezone data structures, maintaining precision across municipal and statutory shifts so your cross-border projects, corporate communications, and travel schedules in ${city.name} remain on schedule. Incorporating awareness of local public holidays like ${holidaySummary || "statutory non-working days"} prevents misaligned milestones and respects local operational customs.`;
  } else if (v4 === 3) {
    section4Body = `Operating from verified astronomical algorithms and the canonical IANA zone definition for ${city.name}, TimeBridge delivers exact second-level accuracy for local clocks at ${utcOffsetStr}. Relying on this data guarantees that international conference links, webinars, and travel arrangements proceed flawlessly. Cross-referencing daylight saving transition dates alongside public holidays (${holidaySummary || "regional holidays"}) ensures that appointments never conflict with local closures.`;
  } else if (v4 === 4) {
    section4Body = `By benchmarking directly against verified IANA Olson specifications (${city.timezone}), TimeBridge maintains precision timekeeping standards for ${city.name}. Ensuring digital timestamp synchronicity across distributed cloud infrastructures prevents transaction conflicts for enterprise operations in ${displayName}, especially during recognized statutory observances like ${holidaySummary || "public holidays"}.`;
  } else {
    section4Body = `Data for ${city.name} incorporates official timezone definitions (${city.timezone}) and national legislation updates. Cross-checking these values alongside statutory holidays (${holidaySummary || "national holidays"}) guarantees that international appointments, logistics freight deliveries, and remote standups with ${city.name} proceed smoothly without calendar confusion.`;
  }

  // Section 5: Circadian Health and Cross-Border Collaboration Tips (6 styles)
  let section5Body = '';
  if (v5 === 0) {
    section5Body = `For travelers arriving in ${city.name} from distant continents, adjusting to the ${utcOffsetStr} timezone can require conscious circadian adaptation. Spending time in natural sunlight following today's ${solar.sunrise} sunrise in ${city.name} helps suppress melatonin production and encourages local wakefulness. Health professionals recommend hydrating thoroughly, consuming balanced meals aligned with local dining hours, and avoiding prolonged daytime naps during the initial 48 hours in the region.`;
  } else if (v5 === 1) {
    section5Body = `Managing circadian well-being when visiting or collaborating with ${city.name} begins with active light management. Because dusk falls at ${solar.sunset} in ${city.name}, adjusting evening screen brightness and winding down activities as natural darkness settles promotes restorative sleep. For business travelers attending high-stakes negotiations, aligning sleep routines to ${city.name}'s diurnal timetable before departure substantially mitigates acute jet lag.`;
  } else if (v5 === 2) {
    section5Body = `Effective international collaboration with colleagues in ${city.name} flourishes when teams practice disciplined asynchronous communication. Providing comprehensive context in written briefs, recording short audio walk-throughs, and setting realistic response windows of 12 to 24 hours respects local working rhythms in ${displayName} while driving continuous 24-hour project throughput across opposing hemispheres.`;
  } else if (v5 === 3) {
    section5Body = `Distributed organizations engaging with counterparts in ${city.name} thrive by establishing transparent overlap protocols. Identifying core shared collaboration hours between morning and afternoon shifts in ${city.name} enables critical decisions to occur synchronously, while standard documentation and ticket backlogs handle independent progress during solo hours.`;
  } else if (v5 === 4) {
    section5Body = `Cross-border communication with teams in ${city.name} is most productive when anchored by structured documentation. Recording decision trees and project updates in shared repositories reduces the necessity for live meetings across disparate time zones, allowing local contributors in ${displayName} to focus without interruption.`;
  } else {
    section5Body = `Navigating travel or remote work schedules tied to ${city.name} calls for mindful energy management. Aligning meal times with local dining schedules upon arrival and scheduling key meetings around solar noon (${solar.solarNoon}) ensures both wellness and professional focus throughout your stay in ${city.name}.`;
  }

  const articleSections: Array<{ heading: string; body: string }> = [
    {
      heading: `Local Time and Timezone Identity in ${city.name}`,
      body: section1Body,
    },
    {
      heading: `Solar Cycle, Solstice Daylight Range & Coordinates`,
      body: section2Body,
    },
    {
      heading: `Business Hours and International Calling Overlap`,
      body: section3Body,
    },
    {
      heading: `Precision Timekeeping and Public Holidays`,
      body: section4Body,
    },
    {
      heading: `Circadian Health and Cross-Border Collaboration Tips`,
      body: section5Body,
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
    differencesFromMajor: differencesFromMajor.slice(0, 6),
    relatedLinks: relatedLinks.slice(0, 6),
    articleSections,
    articleText: fullText,
    wordCount,
    isIndexable,
  };
}
