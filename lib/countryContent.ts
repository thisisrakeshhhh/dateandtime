import { Place } from "./places";
import { computeAnnualDaylightRange } from "./annualSolstice";
import { getCountryPublicHolidays } from "./holidaysData";
import { getNextClockChange } from "./dst";
import { DateTime } from "luxon";

function getSeedHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface CountryArticleReport {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  paragraphs: string[];
  fullText: string;
  wordCount: number;
}

export function generateCountryArticle(country: Place): CountryArticleReport {
  const numZones = country.otherZones && country.otherZones.length > 0 ? 1 + country.otherZones.length : 1;
  const daylight = computeAnnualDaylightRange(country.lat, country.lng);
  const holidays = getCountryPublicHolidays(country.countryIso, country.name);
  const holidayNames = holidays.slice(0, 3).map((h) => `${h.name} (${h.dateStr})`).join(", ");

  const nextChange = getNextClockChange(country.timezone, DateTime.now());
  const v = getSeedHash(country.slug + "-country-art-2026");

  const v1 = v % 4;
  const v2 = Math.floor(v / 4) % 4;
  const v3 = Math.floor(v / 16) % 4;
  const v4 = Math.floor(v / 64) % 4;
  const v5 = Math.floor(v / 256) % 4;

  // Paragraph 1: Time Zone Architecture & National Jurisdiction (4 styles, each ~70-80 words)
  let p1 = "";
  if (numZones > 1) {
    if (v1 === 0) {
      p1 = `${country.name} spans an expansive geographical territory that requires ${numZones} standard time zones to synchronize civil time across its borders. The reference national administrative time operates under the canonical IANA timezone identifier "${country.timezone}", anchored by the capital at ${country.capital || country.name} (coordinates ${country.lat.toFixed(2)}° latitude, ${country.lng.toFixed(2)}° longitude). For business enterprises and public transportation networks navigating interstate commerce, managing transitions across these ${numZones} internal zones is central to daily planning.`;
    } else if (v1 === 1) {
      p1 = `Extending across substantial geographic longitudes, ${country.name} administers ${numZones} official time zones to regulate civil life. Governmental administration and financial coordination reference the primary "${country.timezone}" timezone, centered around the capital city of ${country.capital || country.name} (${country.lat.toFixed(2)}° N/S, ${country.lng.toFixed(2)}° E/W). Managing communication across these ${numZones} separate zones requires deliberate scheduling for multi-regional logistics, public transit systems, and corporate operations across the nation.`;
    } else if (v1 === 2) {
      p1 = `Due to its extensive continental breadth, ${country.name} encompasses ${numZones} distinct standard time zones. Federal agencies, financial markets, and aviation networks reference "${country.timezone}" as the benchmark zone, with geographic center at ${country.capital || country.name} (lat ${country.lat.toFixed(2)}°, lng ${country.lng.toFixed(2)}°). Commercial entities operating across these ${numZones} internal zones rely on synchronized timetables to maintain continuous interstate trade, freight shipments, and business reporting.`;
    } else {
      p1 = `Geographic diversity across ${country.name} necessitates ${numZones} distinct time zones for effective civil governance. Standard national timekeeping centers on the primary identifier "${country.timezone}", coordinated from ${country.capital || country.name} at coordinates (${country.lat.toFixed(2)}°, ${country.lng.toFixed(2)}°). Coordinating cross-country rail, freight, and executive calls across these ${numZones} zones is an integral component of national commerce and day-to-day administrative logistics.`;
    }
  } else {
    if (v1 === 0) {
      p1 = `The sovereign nation of ${country.name} maintains a unified national clock across its entire territory, operating under the primary IANA timezone identifier "${country.timezone}". Centered around the national capital at ${country.capital || country.name} (located at coordinates ${country.lat.toFixed(2)}° latitude, ${country.lng.toFixed(2)}° longitude), citizens and institutions share synchronized civil hours. Having a single standard timezone streamlines internal corporate operations, financial clearinghouses, and educational broadcast schedules without intra-national time disparities.`;
    } else if (v1 === 1) {
      p1 = `Civil life in ${country.name} is governed by a singular, unified time zone under the identifier "${country.timezone}". Centered near the capital city of ${country.capital || country.name} at ${country.lat.toFixed(2)}° lat and ${country.lng.toFixed(2)}° long, the entire country shares identical clock readings. This uniform standard eliminates internal scheduling barriers for national banking, transportation corridors, and telecommunications networks, providing predictable operating hours for all municipal districts.`;
    } else if (v1 === 2) {
      p1 = `Across the entire territory of ${country.name}, civil and commercial schedules run on a single national timezone: "${country.timezone}". Coordinated from the capital at ${country.capital || country.name} (${country.lat.toFixed(2)}° latitude, ${country.lng.toFixed(2)}° longitude), this unified framework facilitates streamlined business operations and seamless public broadcasting without regional time offsets, enabling efficient nationwide administrative coordination.`;
    } else {
      p1 = `Operating under the canonical IANA timezone "${country.timezone}", ${country.name} observes uniform national timekeeping from coast to coast. Anchored by the capital city of ${country.capital || country.name} (coordinates ${country.lat.toFixed(2)}°, ${country.lng.toFixed(2)}°), all public institutions, financial exchanges, and corporate offices share the same civil hour, providing seamless domestic synchronization for enterprises and citizens alike.`;
    }
  }

  // Paragraph 2: Daylight Saving Time Policy & Current-Year Clock Transitions (4 styles, each ~70 words)
  let p2 = "";
  if (nextChange) {
    if (v2 === 0) {
      p2 = `Regarding seasonal clock adjustments, ${country.name} observes Daylight Saving Time (DST) within its primary jurisdiction. For the current calendar year, the next scheduled clock transition is scheduled for ${nextChange.formattedDate} at ${nextChange.formattedTime}, during which clocks will shift ${nextChange.type === "forward" ? "forward by one hour for extended evening sunlight" : "backward by one hour returning to standard astronomical time"}. International travelers, digital remote teams, and global airlines should mark this date to avoid scheduling confusion during cross-border operations.`;
    } else if (v2 === 1) {
      p2 = `Daylight Saving Time policies are actively enforced across ${country.name}. The next upcoming clock change takes place on ${nextChange.formattedDate} at ${nextChange.formattedTime}, moving local time ${nextChange.type === "forward" ? "one hour ahead (+1h)" : "one hour back (-1h)"}. For international business executives and airlines scheduling flights into ${country.name}, keeping note of this upcoming transition ensures uninterrupted logistics and punctual arrivals across all trading partners.`;
    } else if (v2 === 2) {
      p2 = `Statutory regulations in ${country.name} mandate seasonal daylight adjustments twice annually. Local civil time will officially shift on ${nextChange.formattedDate} at ${nextChange.formattedTime}, adjusting clocks ${nextChange.type === "forward" ? "forward 60 minutes for the summer season" : "back 60 minutes to standard astronomical time"}. Telecommunications providers and global remote teams should configure automated calendar adjustments to preserve scheduling integrity and avoid appointment mix-ups.`;
    } else {
      p2 = `Civil clocks in ${country.name} adjust seasonally according to national daylight saving directives. The next scheduled adjustment will occur on ${nextChange.formattedDate} at ${nextChange.formattedTime}, shifting standard time ${nextChange.type === "forward" ? "forward by one hour" : "backward by one hour"}. Organizations conducting business across international borders must prepare for this 60-minute offset change to maintain synchronized meeting windows and logistics timetables.`;
    }
  } else {
    if (v2 === 0) {
      p2 = `Unlike regions that observe bi-annual daylight saving adjustments, ${country.name} adheres to steady permanent standard time throughout all 365 days of the year. Local clocks remain uninterrupted across winter, spring, summer, and autumn, eliminating the circadian disruption and corporate calendar shifts often experienced in daylight-shifting countries. International counterparts can rely on a consistent time delta when scheduling recurring phone calls and virtual conferences.`;
    } else if (v2 === 1) {
      p2 = `Throughout the entire calendar year, ${country.name} maintains permanent standard time without seasonal clock shifts. Citizens experience uninterrupted daily rhythms without the biannual disruption of setting clocks forward or back. Global corporate partners can depend on an invariant local time offset when planning recurring teleconferences, customer support coverage, and joint project deadlines without unexpected shifts.`;
    } else if (v2 === 2) {
      p2 = `By national statute, ${country.name} does not participate in Daylight Saving Time, keeping local time constant in every season. Domestic transportation timetables and enterprise schedules remain fixed year-round. While international counterparts in North America or Europe adjust their clocks, ${country.name} provides a stable, predictable reference point for cross-border commerce and ongoing business operations.`;
    } else {
      p2 = `National legislation in ${country.name} preserves permanent standard time with zero seasonal transitions. This statutory choice protects public transit schedules and health rhythms from biannual clock disruption. Overseas business collaborators can count on a steady baseline offset when establishing long-term service level agreements, call rotations, and cross-border commercial partnerships.`;
    }
  }

  // Paragraph 3: Solar Geometry & Annual Solstice Daylight Fluctuations (4 styles, each ~65-75 words)
  let p3 = "";
  if (v3 === 0) {
    p3 = `Because of ${country.name}'s geographic latitude of ${country.lat.toFixed(2)}°, natural solar daylight shifts over the course of the earth's orbit. At the summer solstice, the nation enjoys peak daylight of roughly ${daylight.longestDayFormatted}, while winter solstice conditions yield a minimum of ${daylight.shortestDayFormatted} (an annual daylight swing of approximately ${daylight.solsticeDiffFormatted}). These seasonal light variations influence regional agriculture, power grid loads, and outdoor commerce rhythms across the country.`;
  } else if (v3 === 1) {
    p3 = `From an astronomical perspective, ${country.name}'s geographic position yields an annual photoperiod ranging from ${daylight.shortestDayFormatted} during the winter solstice to ${daylight.longestDayFormatted} around midsummer. With earliest seasonal sunrise occurring near ${daylight.earliestSunrise} and peak summer sunsets lingering past ${daylight.latestSunset}, regional living habits and daily transit naturally adapt to solar illumination changes and seasonal climate trends.`;
  } else if (v3 === 2) {
    p3 = `Natural illumination in ${country.name} reflects its terrestrial coordinates (${country.lat.toFixed(2)}° N/S). Throughout the four seasons, daylight spans from ${daylight.shortestDayFormatted} on the shortest day up to ${daylight.longestDayFormatted} during the peak summer period, representing a seasonal delta of ${daylight.solsticeDiffFormatted}. Travelers can optimize their itineraries by aligning outdoor excursions with these natural daylight thresholds and solar illumination patterns.`;
  } else {
    p3 = `Solar photoperiod metrics computed for latitude ${country.lat.toFixed(2)}° highlight the annual daylight variation in ${country.name}. Solstice extremes range between ${daylight.shortestDayFormatted} of daylight at midwinter and ${daylight.longestDayFormatted} at midsummer (a swing of ${daylight.solsticeDiffFormatted}). Dawns break as early as ${daylight.earliestSunrise} while summer twilights extend to ${daylight.latestSunset}, setting the environmental tempo for daily commerce and transportation.`;
  }

  // Paragraph 4: Commercial Business Hours, Banking & Public Holidays (4 styles, each ~65-75 words)
  let p4 = "";
  if (v4 === 0) {
    p4 = `Commercial and financial activities in ${country.name} generally follow standard business hours from 9:00 AM to 5:00 PM (or 6:00 PM) local time, Monday through Friday, with banking institutions and government offices operating within this window. Corporate schedules also account for major statutory public holidays, notably ${holidayNames || "statutory holidays"}. During these recognized observances, corporate offices, equity markets, and educational academies observe closures, encouraging advance planning for cross-border deliverables.`;
  } else if (v4 === 1) {
    p4 = `Standard business hours across commercial districts in ${country.name} typically span 09:00 to 17:30 local time on weekdays. Major commercial establishments, public utilities, and financial clearinghouses observe recognized statutory public holidays including ${holidayNames || "national observances"}. Incorporating these dates into international project planning prevents communication bottlenecks and delivery delays during critical operational cycles.`;
  } else if (v4 === 2) {
    p4 = `Workday scheduling in ${country.name} commonly centers around a 9:00 AM to 5:00 PM operating window from Monday to Friday. Organizations also honor significant statutory holidays such as ${holidayNames || "official public holidays"}. Multinational project managers should factor these non-working observances into contractual milestone dates when collaborating with teams based in ${country.name}.`;
  } else {
    p4 = `Enterprise working shifts throughout ${country.name} regularly operate from 09:00 to 18:00 local time on weekdays. Banking centers and federal institutions observe statutory public holidays, with notable occasions including ${holidayNames || "recognized statutory holidays"}. Advance awareness of these dates facilitates smooth cross-border financial transactions, contract negotiations, and executive sign-offs.`;
  }

  // Paragraph 5: Cross-Border Logistics & Precision Timekeeping (4 styles, each ~60-70 words)
  let p5 = "";
  if (v5 === 0) {
    p5 = `Calculations for ${country.name} on TimeBridge are computed directly from authoritative IANA Time Zone Database records, ensuring second-by-second accuracy across statutory legislative changes. When coordinating transatlantic, European, or Asia-Pacific projects with partners in ${country.name}, referencing synchronized timestamps guarantees that commercial contracts, travel arrivals, and remote standups proceed smoothly.`;
  } else if (v5 === 1) {
    p5 = `All time calculations for ${country.name} published on TimeBridge rely on official IANA zone standards, incorporating municipal boundary rules and statutory adjustments. Global enterprises coordinating international trade corridors with ${country.name} can trust these real-time calculations to prevent scheduling missteps and maintain punctual project delivery across all communication channels.`;
  } else if (v5 === 2) {
    p5 = `Powered by the authoritative Olson time zone repository, TimeBridge delivers minute-level precision for all time metrics across ${country.name}. Whether synchronizing distributed cloud systems, international flight manifests, or cross-border conference schedules, using verified zone offsets ensures flawless coordination and reliable data exchange.`;
  } else {
    p5 = `TimeBridge leverages real-time astronomical algorithms and official IANA database parameters for ${country.name}. Remote organizations interfacing with counterparts in ${country.name} benefit from dependable, verified time data that eliminates timezone confusion across all global business channels and travel itineraries.`;
  }

  const paragraphs = [p1, p2, p3, p4, p5];
  const fullText = paragraphs.join(" ");
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return {
    h1: `Current Local Time, Time Zones & Clock Changes in ${country.name}`,
    metaTitle: `Current Local Time in ${country.name} | Time Zones & DST Info`,
    metaDescription: `Live local time in ${country.name} (${country.timezone}). Detailed time zone information, ${numZones} standard zone(s), 2026 clock change dates, daylight range, and business hours.`,
    paragraphs,
    fullText,
    wordCount,
  };
}
