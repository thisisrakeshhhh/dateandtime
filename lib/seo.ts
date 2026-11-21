import { Place } from "./places";
import { TimeDifferenceResult, BestTimeToCallResult } from "./time";
import { DistanceResult } from "./distance";
import { siteConfig } from "./config";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generates dynamic, data-driven SEO articles (250 - 400 words) tailored to the pair
 */
export function generatePairArticle(
  placeA: Place,
  placeB: Place,
  diff: TimeDifferenceResult,
  bestTime: BestTimeToCallResult,
  dist: DistanceResult
): {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  paragraphs: string[];
} {
  const nameA = placeA.name;
  const nameB = placeB.name;
  const countryA = placeA.countryName;
  const countryB = placeB.countryName;

  const metaTitle = `${nameA} to ${nameB} Time Difference (Live) | Best Time to Call`;
  const metaDescription = `Live time difference between ${nameA} and ${nameB}: exact clock comparison (${diff.relationTextShort}), day/night status, distance (${dist.formattedKm}), and best time to call.`;
  const h1 = `${nameA} to ${nameB} Time Difference & Live World Clock`;

  // Paragraph 1: Core Time Difference and Live Clock Status
  let p1 = "";
  if (diff.isSameTime) {
    p1 = `${nameA} and ${nameB} currently operate within the same local standard time zone, meaning clocks in both locations display the exact same hour and minute. When someone in ${nameA} starts their morning at 9:00 AM, counterparts in ${nameB} are also beginning at 9:00 AM. This alignment completely eliminates time conversion hurdles for teleconferences, remote collaboration, and international travel.`;
  } else if (diff.isToAhead) {
    p1 = `${nameB} is ${diff.hoursPart > 0 ? `${diff.hoursPart} hour${diff.hoursPart > 1 ? "s" : ""}` : ""}${diff.minutesPart > 0 ? ` and ${diff.minutesPart} minutes` : ""} ahead of ${nameA}. When it is 12:00 PM (noon) in ${nameA}, it is already ${diff.toTime.formattedTime} in ${nameB}. Because ${nameB} is situated east of ${nameA}, residents in ${nameB} experience sunrise, working hours, and sunset earlier in the day.`;
  } else {
    p1 = `${nameA} is ${diff.hoursPart > 0 ? `${diff.hoursPart} hour${diff.hoursPart > 1 ? "s" : ""}` : ""}${diff.minutesPart > 0 ? ` and ${diff.minutesPart} minutes` : ""} ahead of ${nameB} (meaning ${nameB} is ${diff.relationTextShort} of ${nameA}). For instance, when clocks in ${nameA} strike 12:00 PM (noon), local time in ${nameB} is ${diff.toTime.formattedTime}. Individuals planning meetings or calls from ${nameA} must account for the earlier hour at the destination.`;
  }

  // Paragraph 2: Daylight Saving Time Variations & Geographic Context
  let p2 = "";
  if (diff.fromTime.isDST && !diff.toTime.isDST) {
    p2 = `Daylight Saving Time (DST) currently influences this corridor: ${nameA} (${diff.fromTime.timeZoneAbbr}) is observing summer daylight saving time, whereas ${nameB} (${diff.toTime.timeZoneAbbr}) is operating on standard time. When clocks shift in either hemisphere during spring or autumn transitions, the gap between ${nameA} and ${nameB} will alter by one hour. Always verify seasonal transition dates when coordinating events across different calendar quarters.`;
  } else if (!diff.fromTime.isDST && diff.toTime.isDST) {
    p2 = `Daylight Saving Time is currently active in ${nameB} (${diff.toTime.timeZoneAbbr}), while ${nameA} (${diff.fromTime.timeZoneAbbr}) remains on standard time throughout the season. Because only one of the two regions observes summer daylight shifts, their time difference expands or contracts by 60 minutes depending on seasonal government clock adjustments.`;
  } else if (diff.fromTime.isDST && diff.toTime.isDST) {
    p2 = `Both ${nameA} and ${nameB} are actively observing Daylight Saving Time. Because both regions have advanced their standard clocks by one hour for the summer months, their net relative difference remains steady. However, because seasonal clock adjustments rarely coincide on the exact same weekend across different nations, brief transitional periods of temporary offset variation can occur during March, April, October, and November.`;
  } else {
    p2 = `Neither ${nameA} nor ${nameB} is currently observing Daylight Saving Time, operating on standard time (${diff.fromTime.utcOffsetString} and ${diff.toTime.utcOffsetString} respectively). Many jurisdictions—including India and several equatorial or East Asian regions—maintain permanent standard time year-round, ensuring this ${diff.relationTextShort} gap remains consistent without unexpected seasonal clock changes.`;
  }

  // Paragraph 3: Distance and Non-Stop Flight Reality
  const p3 = `Separated by a great-circle distance of approximately ${dist.formattedKm} (${dist.formattedMiles}), traveling between ${nameA} (${countryA}) and ${nameB} (${countryB}) involves an estimated non-stop flight duration of roughly ${dist.estimatedFlightHours} hours. The initial compass bearing from ${nameA} heading directly toward ${nameB} is ${dist.initialBearingDegrees}° (${dist.compassDirection}). Long-haul international flights traversing this corridor often cross multiple time zones, requiring passengers to manage circadian jet lag upon arrival.`;

  // Paragraph 4: Best Time to Call & Work Collaboration Strategy
  let p4 = "";
  if (bestTime.hasOverlap) {
    p4 = `For effective communication, the recommended awake calling window (9:00 AM to 9:00 PM in both regions) spans from ${bestTime.recommendedWindowFrom} in ${nameA}, corresponding to ${bestTime.recommendedWindowTo} in ${nameB}. For professional business teams requiring concurrent office hours (9:00 AM to 5:00 PM), there ${bestTime.officeOverlapCount > 0 ? `are ${bestTime.officeOverlapCount} hours of direct overlap (${bestTime.officeWindowFrom} in ${nameA})` : `is limited direct office overlap, making early mornings or late afternoons the most productive sync windows`}.`;
  } else {
    p4 = `Due to the extensive timezone gap between ${nameA} and ${nameB}, normal awake hours (9:00 AM to 9:00 PM) do not directly overlap. To conduct real-time phone calls or urgent meetings without disrupting nighttime sleep, one party typically needs to connect slightly early in the morning (around 7:30 AM to 8:30 AM) or connect in the late evening (around 9:30 PM to 10:30 PM). Asynchronous updates and recorded voice memos often serve as the most courteous communication channels across this schedule gap.`;
  }

  return {
    h1,
    metaTitle,
    metaDescription,
    paragraphs: [p1, p2, p3, p4],
  };
}

/**
 * Generates tailored FAQs for the pair
 */
export function generatePairFaqs(
  placeA: Place,
  placeB: Place,
  diff: TimeDifferenceResult,
  bestTime: BestTimeToCallResult,
  dist: DistanceResult
): FaqItem[] {
  const nameA = placeA.name;
  const nameB = placeB.name;

  return [
    {
      question: `What is the time difference between ${nameA} and ${nameB}?`,
      answer: diff.isSameTime
        ? `${nameA} and ${nameB} share the exact same local time (${diff.fromTime.timeZoneAbbr}). There is zero time difference.`
        : diff.isToAhead
        ? `${nameB} is ${diff.relationTextShort} of ${nameA}. When it is 12:00 PM in ${nameA}, it is ${diff.toTime.formattedTime} in ${nameB}.`
        : `${nameA} is ${diff.relationTextShort.replace("behind", "ahead of")} ${nameB} (meaning ${nameB} is ${diff.relationTextShort} of ${nameA}).`,
    },
    {
      question: `What is the best time to call someone in ${nameB} from ${nameA}?`,
      answer: bestTime.hasOverlap
        ? `The best time to call ${nameB} from ${nameA} is between ${bestTime.recommendedWindowFrom} in ${nameA}, which corresponds to ${bestTime.recommendedWindowTo} in ${nameB}. Both parties will be awake and within convenient daytime hours.`
        : `Because of the wide time separation, there is no direct 9 AM – 9 PM overlap. The best compromise is calling early morning in ${nameA} (around 8:00 AM) or late evening (around 9:00 PM) when ${nameB} is in normal awake hours.`,
    },
    {
      question: `Do ${nameA} or ${nameB} observe Daylight Saving Time (DST)?`,
      answer:
        diff.fromTime.isDST && diff.toTime.isDST
          ? `Yes, both ${nameA} and ${nameB} are currently observing Daylight Saving Time (summer time).`
          : diff.fromTime.isDST
          ? `Only ${nameA} is currently observing Daylight Saving Time. ${nameB} is on standard time.`
          : diff.toTime.isDST
          ? `Only ${nameB} is currently observing Daylight Saving Time. ${nameA} is on standard time.`
          : `Neither ${nameA} nor ${nameB} is currently observing Daylight Saving Time. Both locations are on standard local time.`,
    },
    {
      question: `How far is ${nameA} from ${nameB} and what is the flight time?`,
      answer: `The great-circle distance between ${nameA} and ${nameB} is approximately ${dist.formattedKm} (${dist.formattedMiles}). An estimated non-stop commercial flight takes roughly ${dist.estimatedFlightHours} hours.`,
    },
    {
      question: `What are the overlapping working hours for a business meeting between ${nameA} and ${nameB}?`,
      answer:
        bestTime.officeOverlapCount > 0
          ? `There are ${bestTime.officeOverlapCount} hours of concurrent standard business hours (9:00 AM – 5:00 PM): from ${bestTime.officeWindowFrom} in ${nameA} (${bestTime.officeWindowTo} in ${nameB}).`
          : `There is no direct standard 9:00 AM – 5:00 PM office hours overlap. Remote teams typically schedule cross-time-zone meetings at the start or end of the respective workdays.`,
    },
  ];
}

/**
 * Creates valid FAQPage JSON-LD schema markup
 */
export function generateFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Creates valid BreadcrumbList JSON-LD schema markup
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${siteConfig.siteUrl}${item.url}`,
    })),
  };
}
