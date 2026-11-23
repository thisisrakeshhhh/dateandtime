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

  const v1 = getSeedHash(city.slug + '-1');
  const v2 = getSeedHash(city.slug + '-2');
  const v3 = getSeedHash(city.slug + '-3');
  const v4 = getSeedHash(city.slug + '-4');
  const v5 = getSeedHash(city.slug + '-5');

  const hubCandidates = candidateHubs.length > 0 ? candidateHubs : MAJOR_HUBS;
  const hubIdx = v3 % hubCandidates.length;
  const h1 = hubCandidates[hubIdx];
  const h2 = hubCandidates[(hubIdx + 2) % hubCandidates.length];
  const h3 = hubCandidates[(hubIdx + 4) % hubCandidates.length];
  const h4 = hubCandidates[(hubIdx + 6) % hubCandidates.length];

  const diff1 = differencesFromMajor.find((d) => d.slug === h1.slug) || { name: h1.name, diffFormatted: 'Same time' };
  const diff2 = differencesFromMajor.find((d) => d.slug === h2.slug) || { name: h2.name, diffFormatted: 'Same time' };
  const diff3 = differencesFromMajor.find((d) => d.slug === h3.slug) || { name: h3.name, diffFormatted: 'Same time' };
  const diff4 = differencesFromMajor.find((d) => d.slug === h4.slug) || { name: h4.name, diffFormatted: 'Same time' };

  // Dynamic varied text sections (6 variants for maximal variety across regional neighbors)
  let section1Body = '';
  const m1 = v1 % 6;
  if (m1 === 0) {
    section1Body = `Clocks in ${displayName} are displaying ${formattedTime} on this ${weekday}, ${formattedDate}. The urban center follows the canonical IANA zone definition "${city.timezone}", which holds an active UTC offset of ${utcOffsetStr} (${dstZoneAbbr}). At this point in the year, Daylight Saving Time is ${isInDst ? 'active across the district, advancing local clocks by one full hour for the summer months' : 'inactive or not observed under local statutory regulations, keeping clocks on permanent standard time'}. Maintaining awareness of this specific zone configuration allows digital teams, software engineers recording UTC timestamps in databases, and travelers to sync across international borders without confusion or schedule misalignment.`;
  } else if (m1 === 1) {
    section1Body = `The exact local wall-clock time throughout ${displayName} is currently ${formattedTime} (${weekday}, ${formattedDate}). Governed by the official "${city.timezone}" timezone registry, regional clocks correspond to ${utcOffsetStr} against UTC (${dstZoneAbbr}). Regional daylight shifting is presently ${isInDst ? 'in effect, having advanced standard clocks forward for summer energy conservation' : 'on standard astronomical schedule without daylight saving advancement'}. Situated at latitude ${city.lat.toFixed(2)}° and longitude ${city.lng.toFixed(2)}°, verifying zone nomenclature prevents missed business deadlines, misplaced teleconference links, and flight check-in delays for visitors arriving in ${city.name}.`;
  } else if (m1 === 2) {
    section1Body = `As of ${weekday}, ${formattedDate}, the recorded time in ${displayName} stands at ${formattedTime}. Operating under the internationally recognized "${city.timezone}" timezone identifier, the region applies an offset of ${utcOffsetStr} (${dstZoneAbbr}). Daylight saving adjustments are ${isInDst ? 'currently active for the summer season, moving clocks forward by one hour' : 'not presently active in this territory, preserving steady standard time'}. Accurately tracking these parameters from coordinates ${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}° is vital for remote cross-border collaboration, corporate billing cycles, and global aviation flight operations.`;
  } else if (m1 === 3) {
    section1Body = `Local time in ${displayName} is registered at ${formattedTime} on ${weekday}, ${formattedDate}. The municipality operates within the "${city.timezone}" timezone domain, maintaining a reference offset of ${utcOffsetStr} (${dstZoneAbbr}). At present, daylight saving time is ${isInDst ? 'actively observed, shifting regional clocks forward' : 'not observed or currently suspended during the standard calendar season'}. Located geographically in ${city.countryName || 'the region'}, staying updated on statutory timezone rules ensures accurate calendar management for multinational teams.`;
  } else if (m1 === 4) {
    section1Body = `Standard time observed across ${displayName} currently marks ${formattedTime} on ${weekday}, ${formattedDate}. Anchored to the "${city.timezone}" IANA database zone, local civil time runs at ${utcOffsetStr} relative to Universal Coordinated Time (${dstZoneAbbr}). Seasonal clock shifts are ${isInDst ? 'in operation today, lending extended daylight to evening hours' : 'not active, with local clocks adhering to uninterrupted astronomical time'}. For ${city.name} at coordinates (${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}°), coordinated timestamp tracking avoids costly operational friction.`;
  } else {
    section1Body = `Within ${displayName}, local clocks record ${formattedTime} on ${weekday}, ${formattedDate}. Positioned formally in the "${city.timezone}" zone, the jurisdiction maintains an offset of ${utcOffsetStr} (${dstZoneAbbr}). Daylight saving provisions are ${isInDst ? 'in force across local districts' : 'unobserved or currently dormant for the season'}. Clarifying zone definitions for ${city.name} guarantees reliable telecommunications and flight transfers for cross-border travelers.`;
  }

  let section2Body = '';
  const m2 = v2 % 6;
  if (m2 === 0) {
    section2Body = `Positioned at latitude ${city.lat.toFixed(2)}° and longitude ${city.lng.toFixed(2)}°, ${city.name} experiences a solar cycle where morning dawn broke at ${solar.sunrise} and evening dusk arrives around ${solar.sunset}. The sun reaches its peak zenith at solar noon (${solar.solarNoon}), providing an overall photoperiod shaped by regional geography. These celestial timings dictate daily routines, commuting windows, and energy consumption across the city. For international visitors, timing daylight exposure helps reset circadian rhythms and alleviate acute jet lag symptoms rapidly.`;
  } else if (m2 === 1) {
    section2Body = `With geographic coordinates of ${city.lat.toFixed(2)}° latitude and ${city.lng.toFixed(2)}° longitude, the daylight trajectory in ${city.name} begins with sunrise at ${solar.sunrise} and concludes with sunset at ${solar.sunset}. Midday solar transit is reached at approximately ${solar.solarNoon}. Travelers adjusting to local life can leverage these natural daylight markers to recalibrate their body clocks, plan sightseeing itineraries, and stay energized throughout their stay in the ${city.name} metropolitan area.`;
  } else if (m2 === 2) {
    section2Body = `Located geographically at ${city.lat.toFixed(2)}° N/S and ${city.lng.toFixed(2)}° E/W, ${city.name}'s daily solar rhythm features sunrise at ${solar.sunrise}, solar noon at ${solar.solarNoon}, and nightfall following sunset at ${solar.sunset}. Knowing today's day-night transition helps optimize travel itineraries, outdoor events, commercial filming schedules, and personal rest periods for anyone arriving from disparate time zones into ${city.name}.`;
  } else if (m2 === 3) {
    section2Body = `Situated at ${city.lat.toFixed(2)}° latitude and ${city.lng.toFixed(2)}° longitude, ${city.name} charts a diurnal path from dawn at ${solar.sunrise} to dusk at ${solar.sunset}, culminating at solar noon (${solar.solarNoon}). Understanding local solar hours assists photographers, logistics operators, and long-haul passengers in planning productive daylight activities and adjusting sleep schedules effectively.`;
  } else if (m2 === 4) {
    section2Body = `Spanning coordinates ${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}°, ${city.name} welcomes morning daylight at ${solar.sunrise} while twilight concludes at ${solar.sunset}. Solar midday in ${city.name} arrives around ${solar.solarNoon}. These natural environmental milestones establish the pace of urban transit and market activity across the surrounding district.`;
  } else {
    section2Body = `At geographic location ${city.lat.toFixed(2)}° lat and ${city.lng.toFixed(2)}° long, ${city.name} experiences dawn at ${solar.sunrise} and dusk at ${solar.sunset}, with zenith reached at ${solar.solarNoon}. Awareness of solar timing provides useful context for travelers syncing bodily sleep-wake rhythms with local ambient light in ${displayName}.`;
  }

  let section3Body = '';
  const m3 = v3 % 6;
  if (m3 === 0) {
    section3Body = `Aligning business operations between ${city.name} and top international hubs depends on standard business schedules. When cross-referencing with ${h1.name}, ${city.name} is ${diff1.diffFormatted}. Relative to ${h2.name}, the time delta is ${diff2.diffFormatted}. Across other major financial hubs, local clocks are ${diff3.diffFormatted} compared to ${h3.name}, and ${diff4.diffFormatted} against ${h4.name}. Shared working windows are most effective when scheduled during matching daytime blocks, avoiding disruptive late-night or dawn meetings for distributed counterparts.`;
  } else if (m3 === 1) {
    section3Body = `For multinational firms conducting business in ${city.name}, syncing with global markets requires navigating diverse time offsets. Local clocks are ${diff1.diffFormatted} relative to ${h1.name}, ${diff2.diffFormatted} compared to ${h2.name}, ${diff3.diffFormatted} against ${h3.name}, and ${diff4.diffFormatted} relative to ${h4.name}. Structuring calls around these offsets ensures seamless conference schedules, predictable executive handoffs, and consistent project velocity without team fatigue.`;
  } else if (m3 === 2) {
    section3Body = `Scheduling cross-border meetings with partners in ${city.name} involves monitoring regional differences with key financial epicenters: ${diff1.diffFormatted} against ${h1.name}, ${diff2.diffFormatted} versus ${h2.name}, ${diff3.diffFormatted} relative to ${h3.name}, and ${diff4.diffFormatted} compared to ${h4.name}. Remote teams frequently reserve early mornings or late afternoons for synchronous check-ins, relying on clear written documentation during asynchronous hours to keep progress continuous.`;
  } else if (m3 === 3) {
    section3Body = `Enterprise workflows involving ${city.name} require coordinating hours with primary trading hubs: ${diff1.diffFormatted} compared to ${h1.name}, ${diff2.diffFormatted} against ${h2.name}, ${diff3.diffFormatted} for ${h3.name}, and ${diff4.diffFormatted} relative to ${h4.name}. Identifying mutual working windows between 9:00 AM and 5:00 PM enables effective sprint planning and client engagement across international borders.`;
  } else if (m3 === 4) {
    section3Body = `Coordinating telephone and video schedules with ${city.name} means managing distinct geographic time gaps: ${diff1.diffFormatted} to ${h1.name}, ${diff2.diffFormatted} to ${h2.name}, ${diff3.diffFormatted} to ${h3.name}, and ${diff4.diffFormatted} to ${h4.name}. Establishing structured calendar overlap prevents cross-timezone friction and respects international boundaries.`;
  } else {
    section3Body = `Global organizations interfacing with ${city.name} navigate standard time offsets: ${diff1.diffFormatted} with ${h1.name}, ${diff2.diffFormatted} with ${h2.name}, ${diff3.diffFormatted} with ${h3.name}, and ${diff4.diffFormatted} with ${h4.name}. Aligning bilateral calls with common awake intervals creates sustainable collaboration without unnecessary overtime.`;
  }

  let section4Body = '';
  const m4 = v4 % 6;
  if (m4 === 0) {
    section4Body = `All timestamps provided for ${city.name} on TimeBridge reference live astronomical data and official IANA rules for ${city.timezone}. When coordinating transatlantic or transpacific engagements with ${city.name}, checking these figures prevents scheduling mix-ups caused by statutory clock shifts. Digital professionals can rely on these verified metrics for calendar planning and synchronized workflows across global enterprises. Furthermore, tracking local public holidays and regional business customs in ${city.name} alongside timezone data ensures cross-border initiatives maintain steady operational momentum.`;
  } else if (m4 === 1) {
    section4Body = `TimeBridge calculates all regional standards for ${city.name} using authoritative Olson database parameters for ${city.timezone}. Teams relying on accurate calendar invitations can depend on these verified records for frictionless international logistics, event coordination, and cross-border client deliverables involving ${city.name} without time ambiguity. Factoring in regional communication styles and preferred working rhythms further elevates the effectiveness of international business partnerships.`;
  } else if (m4 === 2) {
    section4Body = `Calculations for ${city.name} are derived directly from global timezone data structures, maintaining precision across municipal and statutory shifts so your cross-border projects, corporate communications, and travel schedules in ${city.name} remain on schedule without error or unexpected calendar shifts. Employing cloud-based scheduling tools calibrated to exact IANA zone definitions eliminates manual timezone conversion errors.`;
  } else if (m4 === 3) {
    section4Body = `Operating from verified astronomical algorithms and the canonical IANA zone definition for ${city.name}, TimeBridge delivers exact second-level accuracy for local clocks at ${utcOffsetStr}. Relying on this data guarantees that international conference links, webinars, and travel arrangements proceed flawlessly. Cross-referencing daylight saving transition dates ensures that recurring appointments never conflict with international office hours.`;
  } else if (m4 === 4) {
    section4Body = `By benchmarking directly against verified IANA Olson specifications (${city.timezone}), TimeBridge maintains precision timekeeping standards for ${city.name}. Ensuring digital timestamp synchronicity across distributed cloud infrastructures prevents transaction conflicts and audit discrepancies for enterprise applications operating in ${displayName}.`;
  } else {
    section4Body = `Data for ${city.name} incorporates official timezone definitions (${city.timezone}) and national legislation updates. Cross-checking these values guarantees that international appointments, logistics freight deliveries, and remote standups with ${city.name} proceed smoothly without calendar confusion.`;
  }

  let section5Body = '';
  const m5 = v5 % 6;
  if (m5 === 0) {
    section5Body = `For travelers arriving in ${city.name} from distant continents, adjusting to the ${utcOffsetStr} timezone can require conscious circadian adaptation. Spending time in natural sunlight following today's ${solar.sunrise} sunrise in ${city.name} helps suppress melatonin production and encourages local wakefulness. Health professionals recommend hydrating thoroughly, consuming balanced meals aligned with local dining hours, and avoiding prolonged daytime naps during the initial 48 hours in the region.`;
  } else if (m5 === 1) {
    section5Body = `Managing circadian well-being when visiting or collaborating with ${city.name} begins with active light management. Because dusk falls at ${solar.sunset} in ${city.name}, adjusting evening screen brightness and winding down activities as natural darkness settles promotes restorative sleep. For business travelers attending high-stakes negotiations, aligning sleep routines to ${city.name}'s diurnal timetable before departure substantially mitigates acute jet lag.`;
  } else if (m5 === 2) {
    section5Body = `Effective international collaboration with colleagues in ${city.name} flourishes when teams practice disciplined asynchronous communication. Providing comprehensive context in written briefs, recording short audio walk-throughs, and setting realistic response windows of 12 to 24 hours respects local working rhythms in ${displayName} while driving continuous 24-hour project throughput across opposing hemispheres.`;
  } else if (m5 === 3) {
    section5Body = `Distributed organizations engaging with counterparts in ${city.name} thrive by establishing transparent overlap protocols. Identifying core shared collaboration hours between morning and afternoon shifts in ${city.name} enables critical decisions to occur synchronously, while standard documentation and ticket backlogs handle independent progress during solo hours.`;
  } else if (m5 === 4) {
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
      heading: `Solar Cycle, Daylight and Geographic Coordinates`,
      body: section2Body,
    },
    {
      heading: `Business Hours and International Calling Overlap`,
      body: section3Body,
    },
    {
      heading: `Precision Timekeeping and Practical Guidelines`,
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
