import { Place } from "@/lib/places";
import { computeAnnualDaylightRange } from "@/lib/annualSolstice";
import { getCountryPublicHolidays } from "@/lib/holidaysData";
import { getNextClockChange, getDstSummaryForCountry } from "@/lib/dst";
import { DateTime } from "luxon";

interface DSTReportSection {
  title: string;
  body: string;
}

export interface DSTReport {
  countryName: string;
  code: string;
  hasDst: boolean;
  sections: DSTReportSection[];
  wordCount: number;
}

function getSeedHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateDSTReport(country: Place): DSTReport {
  const primaryZone = country.timezone || "UTC";
  const numZones = country.otherZones && country.otherZones.length > 0 ? 1 + country.otherZones.length : 1;
  const daylight = computeAnnualDaylightRange(country.lat, country.lng);
  const holidays = getCountryPublicHolidays(country.countryIso, country.name);
  const nextChange = getNextClockChange(primaryZone, DateTime.now());
  const dstSummary = getDstSummaryForCountry(primaryZone, country.name);
  const hasDst = dstSummary.observesDst;
  const v = getSeedHash(country.slug + "-dst-base5-2026");

  const v1 = v % 5;
  const v2 = Math.floor(v / 5) % 5;
  const v3 = Math.floor(v / 25) % 5;
  const v4 = Math.floor(v / 125) % 5;

  const sections: DSTReportSection[] = [];

  // Section 1: Overview and statutory policy (each branch ~80 words)
  const schedTitle = `Daylight Saving Time Regulations & 2026 Schedule in ${country.name}`;
  let schedText = "";
  if (hasDst && nextChange) {
    if (v1 === 0) {
      schedText = `Under civil statute in ${country.name} (ISO ${country.countryIso}), Daylight Saving Time is actively utilized during summer months to maximize natural illumination for commerce and civic life. The next scheduled transition occurs on ${nextChange.formattedDate} at ${nextChange.formattedTime}, adjusting standard civil time ${nextChange.type === "forward" ? "forward by one hour (+1h)" : "backward by one hour (-1h)"}. With ${country.name} administering ${numZones} standard ${numZones === 1 ? "time zone" : "time zones"} anchored by ${primaryZone}, transport agencies, commercial airlines, and financial market operators coordinate national timetables to ensure synchronized cross-border connections.`;
    } else if (v1 === 1) {
      schedText = `National legislation in ${country.name} mandates biannual clock adjustments to harmonize social activity and industrial energy consumption with seasonal daylight. Civil clocks are scheduled to transition on ${nextChange.formattedDate} at ${nextChange.formattedTime}, shifting ${nextChange.type === "forward" ? "one hour ahead for extended evening light" : "one hour back returning to astronomical standard time"}. Across the country's ${numZones} official standard ${numZones === 1 ? "zone" : "zones"}, government departments, stock exchanges, and domestic railways execute this change concurrently to prevent administrative disruption.`;
    } else if (v1 === 2) {
      schedText = `The statutory timekeeping code of ${country.name} incorporates seasonal Daylight Saving Time across its sovereign territory. The upcoming clock change is set for ${nextChange.formattedDate} at ${nextChange.formattedTime}, when regional clocks will move ${nextChange.type === "forward" ? "forward 60 minutes for the summer cycle" : "backward 60 minutes returning to winter standard time"}. Coordinating across ${numZones} distinct ${numZones === 1 ? "time zone" : "time zones"} (reference zone "${primaryZone}"), public utilities, civil aviation authorities, and telecommunications providers synchronize operations to avoid scheduling bottlenecks.`;
    } else if (v1 === 3) {
      schedText = `Operating under established national directives, ${country.name} observes Daylight Saving Time during the local warm season. Local civil time will advance or fall back on ${nextChange.formattedDate} at ${nextChange.formattedTime}, altering standard time by exactly ${nextChange.type === "forward" ? "+1 hour" : "-1 hour"}. Multinational enterprises, logistics handlers, and commercial airlines operating within ${country.name} rely on this published timetable to preserve operational accuracy across all ${numZones} internal standard regions from coast to coast.`;
    } else {
      schedText = `Civil timekeeping throughout ${country.name} adjusts in accordance with seasonal Daylight Saving Time mandates enacted by national parliament. On ${nextChange.formattedDate} at ${nextChange.formattedTime}, standard clocks will adjust ${nextChange.type === "forward" ? "forward by one hour" : "backward by one hour"}. Regulating time across ${numZones} official ${numZones === 1 ? "zone" : "zones"} under primary IANA designation ${primaryZone}, regional governments oversee transition protocols to maintain continuity in trade, digital infrastructure, and public transportation.`;
    }
  } else if (hasDst) {
    schedText = `Statutory regulations in ${country.name} provide for seasonal Daylight Saving Time adjustments during the local summer season. Clocks advance one hour in spring and return to standard astronomical time during autumn. Across ${country.name}'s administrative territory (${primaryZone}), public utilities, rail operators, financial trading floors, and aviation authorities observe these transition periods to optimize power consumption and civic operations across all ${numZones} domestic regions.`;
  } else {
    if (v1 === 0) {
      schedText = `${country.name} (country code ${country.countryIso}) maintains invariant permanent standard time throughout all twelve months of the year, avoiding seasonal daylight transitions entirely. Public transport networks, civil administrations, and banking systems operate uninterrupted on the canonical ${primaryZone} offset without artificial clock manipulation. Consequently, time gaps between ${country.name} and daylight-shifting nations in North America or Europe fluctuate solely due to external international calendar adjustments enacted by foreign partners.`;
    } else if (v1 === 1) {
      schedText = `Civil time in ${country.name} does not shift for Daylight Saving Time, keeping local clocks constant across all four seasons of the year. Operating across ${numZones} time ${numZones === 1 ? "zone" : "zones"} under the primary reference identifier ${primaryZone}, citizens and institutions experience zero circadian disruption from artificial clock changes. Cross-border business partners, software developers, and logistics coordinators must independently adjust recurring meeting invitations whenever their own local clocks shift.`;
    } else if (v1 === 2) {
      schedText = `By statutory policy and parliamentary decree, ${country.name} follows steady standard time with no seasonal clock changes. All public services, transport timetables, educational facilities, and commercial markets in ${country.name} remain anchored to permanent UTC offsets without spring or autumn interventions. This consistency offers predictable operating hours for global trade, even as overseas counterparties alter their shifts during seasonal changeovers.`;
    } else if (v1 === 3) {
      schedText = `The legislative framework in ${country.name} preserves constant standard time year-round. Refraining from bi-annual daylight adjustments protects domestic supply chains, agricultural schedules, power grid management, and health rhythms from artificial temporal shocks. International trading partners operating with ${country.name} can count on an unchanging base offset across all seasons, simplifying recurring contractual agreements.`;
    } else {
      schedText = `Throughout all 365 days of the year, ${country.name} operates on fixed astronomical standard time under official IANA identifier ${primaryZone}. Municipalities and industrial sectors share an invariant clock schedule without seasonal shifts. While counterparts abroad adjust their clocks twice annually, ${country.name} serves as an unvarying anchor for international scheduling, global shipping, and digital telecommunications.`;
    }
  }
  sections.push({ title: schedTitle, body: schedText });

  // Section 2: Photoperiod & Solstice Analysis (each branch ~75-85 words)
  const solsticeTitle = `Solar Photoperiod & Solstice Day Length Extremes in ${country.name}`;
  let solsticeText = "";
  if (v2 === 0) {
    solsticeText = `Calculations based on ${country.name}'s latitude of ${country.lat.toFixed(2)}° reveal distinct solar photoperiod variations throughout the year. At the summer solstice, peak daylight expands to approximately ${daylight.longestDayFormatted}, with earliest dawn breaking near ${daylight.earliestSunrise} and latest dusk lingering past ${daylight.latestSunset}. During the winter solstice, daylight contracts to ${daylight.shortestDayFormatted}, generating an annual photoperiod swing of ${daylight.solsticeDiffFormatted} between extremes. Understanding these solar cycles provides valuable context for national debates surrounding seasonal time policies.`;
  } else if (v2 === 1) {
    solsticeText = `Astronomical solar patterns at latitude ${country.lat.toFixed(2)}° govern daily illumination cycles in ${country.name}. Natural day length fluctuates between a winter minimum of ${daylight.shortestDayFormatted} and a summer peak of ${daylight.longestDayFormatted}, representing a seasonal delta of approximately ${daylight.solsticeDiffFormatted}. Earliest morning sunrise arrives around ${daylight.earliestSunrise}, while latest evening sunset takes place near ${daylight.latestSunset}. These natural milestones dictate agricultural rhythms and regional energy consumption patterns throughout the calendar year.`;
  } else if (v2 === 2) {
    solsticeText = `Natural solar illumination in ${country.name} reflects its geographic position at coordinates ${country.lat.toFixed(2)}° lat, ${country.lng.toFixed(2)}° lng. Throughout the orbital cycle, daylight spans from ${daylight.shortestDayFormatted} on the shortest day to ${daylight.longestDayFormatted} around midsummer. With seasonal dawn at ${daylight.earliestSunrise} and dusk at ${daylight.latestSunset}, this ${daylight.solsticeDiffFormatted} variance shapes energy consumption, public recreation, and daily commuting patterns across metropolitan centers.`;
  } else if (v2 === 3) {
    solsticeText = `Positioned at latitude ${country.lat.toFixed(2)}°, ${country.name} undergoes an annual solar trajectory ranging from ${daylight.shortestDayFormatted} at the winter solstice to ${daylight.longestDayFormatted} during the height of summer. This represents an annual daylight swing of ${daylight.solsticeDiffFormatted}. First light in midsummer begins near ${daylight.earliestSunrise}, while twilight concludes past ${daylight.latestSunset}, establishing the environmental boundaries for regional business, power infrastructure, and transport systems.`;
  } else {
    solsticeText = `Sunlight duration across ${country.name} shifts naturally across the calendar year due to its terrestrial position (${country.lat.toFixed(2)}° latitude). Winter solstice daylight contracts to ${daylight.shortestDayFormatted}, whereas midsummer yields a maximum of ${daylight.longestDayFormatted} (a swing of ${daylight.solsticeDiffFormatted}). Dawns as early as ${daylight.earliestSunrise} and sunsets as late as ${daylight.latestSunset} guide regional power consumption, retail footfall, and outdoor economic activities.`;
  }
  sections.push({ title: solsticeTitle, body: solsticeText });

  // Section 3: Impact on Cross-Border Corridors (each branch ~75-85 words)
  const corridorTitle = `Cross-Border Business & International Collaboration`;
  let corridorText = "";
  if (hasDst) {
    if (v3 === 0) {
      corridorText = `Because ${country.name} observes Daylight Saving Time, bilateral time differences with overseas trading partners shift twice annually. When clocks advance in spring, the time gap relative to non-shifting regions (like India, Singapore, and Japan) alters by exactly one hour. Multinational enterprises, remote software teams, and logistics contractors must verify scheduling calendars in late March and late October/November when international switch dates diverge across global trade routes.`;
    } else if (v3 === 1) {
      corridorText = `Seasonal clock adjustments in ${country.name} directly influence global corporate communication windows. When clocks shift, overlap with international financial capitals expands or contracts by 60 minutes. Remote engineering teams, cross-border dispatchers, and global logistics planners should account for these transition dates to avoid early-morning or late-evening meeting misunderstandings during critical product launches.`;
    } else if (v3 === 2) {
      corridorText = `Operating across international borders from ${country.name} requires careful monitoring of daylight transition windows. As clocks move, synchronous working overlap with overseas clients in Asia, Europe, and the Americas shifts by an hour. Establishing proactive calendar alerts and publishing shared timezone tables ensures business meetings, executive reviews, and project milestones remain fully synchronized.`;
    } else if (v3 === 3) {
      corridorText = `Commercial coordination between ${country.name} and international markets requires vigilance during seasonal shift periods. As domestic clocks advance or fall back, the time difference relative to global supply chain partners changes by 60 minutes. Corporate leaders should publish internal reminders ahead of seasonal transition weekends to protect client deliverables and prevent transaction delays.`;
    } else {
      corridorText = `Biannual time changes in ${country.name} dynamically reshape cross-border collaboration slots. While domestic business hours remain 09:00 to 17:00 local time, their international UTC equivalents move twice a year. Cross-border teams should structure their sprint reviews, daily standups, and customer handoff calls around these seasonal boundary shifts to maintain seamless execution.`;
    }
  } else {
    if (v3 === 0) {
      corridorText = `Even though ${country.name} stays on steady standard time, international communication windows alter twice yearly when counterparties in London, New York, or Sydney adjust their clocks. Remote software engineering teams, offshore customer support, and financial settlement desks must accommodate a 1-hour change in mutual overlap each March and October without any local clock shift occurring within ${country.name}.`;
    } else if (v3 === 1) {
      corridorText = `The invariant clock in ${country.name} provides domestic stability, yet cross-border schedules fluctuate whenever daylight saving begins or ends overseas. During transatlantic or transpacific shift windows, collaborative overlap with North American and European partners expands or narrows by 60 minutes, requiring adjustments in international teleconference slots and project schedules.`;
    } else if (v3 === 2) {
      corridorText = `For organizations in ${country.name}, working with global clients involves managing foreign seasonal clock changes. While domestic operations proceed on consistent schedules, collaboration windows with trading partners in the Northern or Southern Hemispheres shift twice per year, underscoring the practical value of automated timezone scheduling tools for enterprise workflows.`;
    } else if (v3 === 3) {
      corridorText = `Maintaining constant standard time in ${country.name} delivers predictable internal schedules, yet overseas meetings require dynamic adjustment. When foreign trading partners implement daylight saving adjustments, mutual working hours shift by an hour. Distributed teams should verify meeting times during international transition weeks to prevent missed calls or late handoffs.`;
    } else {
      corridorText = `While domestic clocks in ${country.name} remain unchanged, international commercial partners experience seasonal clock shifts. These foreign daylight changes alter mutual business overlap by 60 minutes each spring and autumn. Tracking these international shifts ensures seamless execution of bilateral transactions, contract sign-offs, and client communications.`;
    }
  }
  sections.push({ title: corridorTitle, body: corridorText });

  // Section 4: Public Holidays and Civil Calendar (each branch ~70-80 words)
  const holidayTitle = `Public Holidays & Enterprise Business Hours`;
  const holidaySummary = holidays.slice(0, 3).map((h) => `${h.name} (${h.dateStr})`).join(", ");
  let holidayText = "";
  const precisionNote = ` All time difference and daylight calculations for ${country.name} are benchmarked against official IANA Olson zone database releases to ensure continuous scheduling accuracy across statutory calendar changes.`;

  if (v4 === 0) {
    holidayText = `Civil planning in ${country.name} balances statutory holidays with regular commercial schedules. Key public observances on the national calendar include ${holidaySummary || "national statutory holidays"}. Typical enterprise business hours run from 09:00 to 17:00 or 18:00 local time Monday through Friday, establishing reliable collaboration slots for multinational teams coordinating across time zones.${precisionNote}`;
  } else if (v4 === 1) {
    holidayText = `Enterprise operations in ${country.name} observe standard business hours typically spanning 9:00 AM to 5:00 PM local time on weekdays. Commercial operations also pause for major statutory observances such as ${holidaySummary || "recognized public holidays"}, providing structured parameters for international supply chains, joint ventures, and client deliverables.${precisionNote}`;
  } else if (v4 === 2) {
    holidayText = `Corporate commerce across ${country.name} generally conducts business between 09:00 and 17:30 local time. Scheduling cross-border meetings requires accounting for both seasonal time differences and recognized national holidays including ${holidaySummary || "statutory civil holidays"}, ensuring timely executive sign-offs, financial clearing, and project continuity.${precisionNote}`;
  } else if (v4 === 3) {
    holidayText = `Standard corporate hours across ${country.name} run from 09:00 to 18:00 local time on weekdays, during which banking and civil services operate. International partners should also observe major statutory public holidays such as ${holidaySummary || "national statutory holidays"} when coordinating project timelines, executive briefings, and contractual milestone deliveries.${precisionNote}`;
  } else {
    holidayText = `Commercial establishments and public offices in ${country.name} follow standard weekday schedules from 9:00 AM to 5:30 PM. Factoring in official public holidays including ${holidaySummary || "statutory holidays"} guarantees that cross-border communications, bank transfers, and freight deliveries proceed without unexpected local delays or schedule conflicts.${precisionNote}`;
  }
  sections.push({ title: holidayTitle, body: holidayText });

  const fullText = sections.map((s) => `${s.title} ${s.body}`).join(" ");
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return {
    countryName: country.name,
    code: country.countryIso,
    hasDst,
    sections,
    wordCount,
  };
}
