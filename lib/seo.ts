import { Place } from "./places";
import { TimeDifferenceResult, BestTimeToCallResult } from "./time";
import { DistanceResult } from "./distance";
import { analyzePairSeasonalDst } from "./dstPair";
import { DateTime } from "luxon";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Calculates a mathematically consistent 12:00 PM reference translation:
 * "When it is 12:00 PM in New York, it is 5:00 PM in London."
 */
export function getConsistentExampleSentence(placeA: Place, placeB: Place, diff: TimeDifferenceResult): {
  timeAStr: string;
  timeBStr: string;
  sentence: string;
} {
  const shortA = placeA.name;
  const shortB = placeB.name;
  const timeAStr = "12:00 PM";

  if (diff.isSameTime) {
    return {
      timeAStr,
      timeBStr: "12:00 PM",
      sentence: `When it is 12:00 PM in ${shortA}, it is also 12:00 PM in ${shortB}. Both locations share the exact same local clock time.`,
    };
  }

  // Base 12:00 PM on a standard non-DST reference date
  const baseA = DateTime.fromObject({ year: 2026, month: 1, day: 15, hour: 12, minute: 0 }, { zone: placeA.timezone });
  // Offset of B minus offset of A on reference date
  const offsetA = baseA.offset;
  const offsetB = DateTime.fromObject({ year: 2026, month: 1, day: 15, hour: 12, minute: 0 }, { zone: placeB.timezone }).offset;
  const diffMins = offsetB - offsetA;

  const baseB = baseA.plus({ minutes: diffMins });
  const timeBStr = baseB.toFormat("h:mm a");

  const diffAbs = Math.abs(diffMins);
  const h = Math.floor(diffAbs / 60);
  const m = diffAbs % 60;
  const durStr = `${h} hour${h !== 1 ? "s" : ""}${m > 0 ? ` and ${m} minutes` : ""}`;

  let sentence = "";
  if (diffMins > 0) {
    sentence = `When it is 12:00 PM in ${shortA}, it is ${timeBStr} in ${shortB} (${shortB} is ${durStr} ahead).`;
  } else {
    sentence = `When it is 12:00 PM in ${shortA}, it is ${timeBStr} in ${shortB} (${shortB} is ${durStr} behind).`;
  }

  return { timeAStr, timeBStr, sentence };
}

/**
 * Generates dynamic, data-driven SEO articles (at least 300 words) tailored to the pair
 * using short names exclusively ("New York", "London").
 */
function getSeedHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

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
  wordCount: number;
} {
  const shortA = placeA.name;
  const shortB = placeB.name;

  const example = getConsistentExampleSentence(placeA, placeB, diff);
  const seasonal = analyzePairSeasonalDst(placeA, placeB);

  const metaTitle = `${shortA} to ${shortB} Time Difference | Best Time to Call`;
  const metaDescription = `Time difference between ${shortA} and ${shortB}. ${example.sentence} View calling hours, flight distance (${dist.formattedKm}), and daylight saving schedule.`;
  const h1 = `${shortA} to ${shortB} Time Difference & World Clock`;

  const v = getSeedHash(`${placeA.slug}-${placeB.slug}`);

  // Paragraph 1: Core Time Difference and Consistent Example Sentence
  let p1 = "";
  if (diff.isSameTime) {
    if (v % 2 === 0) {
      p1 = `${shortA} and ${shortB} currently operate within the exact same time zone, meaning local clocks display identical hours and minutes throughout the day. ${example.sentence} Because neither city has a time lead or deficit over the other, cross-border teams and travelers enjoy frictionless communication without adjusting for time deltas.`;
    } else {
      p1 = `Both ${shortA} and ${shortB} share identical local clock readings at all times. ${example.sentence} Without any time zone difference between the two destinations, synchronous phone calls, client deliverables, and distributed team check-ins occur seamlessly without timezone conversions.`;
    }
  } else if (diff.isToAhead) {
    const h = diff.hoursPart;
    const m = diff.minutesPart;
    const dur = `${h > 0 ? `${h} hour${h > 1 ? "s" : ""}` : ""}${m > 0 ? ` and ${m} minutes` : ""}`.trim();
    if (v % 3 === 0) {
      p1 = `${shortB} is ${dur} ahead of ${shortA}. ${example.sentence} Because ${shortB} lies further east in longitude, daylight, working shifts, and market openings take place earlier in the day compared to ${shortA}. Anyone coordinating bilateral activities should keep this directional offset in mind when scheduling deadlines.`;
    } else if (v % 3 === 1) {
      p1 = `Clocks in ${shortB} are positioned ${dur} ahead of ${shortA}. ${example.sentence} As the sun rises earlier across ${shortB}, standard morning office hours and trading sessions are already well underway while ${shortA} is just beginning its working day. Being mindful of this forward gap prevents late-day communication bottlenecks.`;
    } else {
      p1 = `Local time in ${shortB} runs ${dur} ahead of ${shortA}. ${example.sentence} Since ${shortB} sits eastward along global time meridians, business hours conclude sooner there than in ${shortA}. Planning time-sensitive interactions around this offset ensures prompt turnarounds.`;
    }
  } else {
    const h = diff.hoursPart;
    const m = diff.minutesPart;
    const dur = `${h > 0 ? `${h} hour${h > 1 ? "s" : ""}` : ""}${m > 0 ? ` and ${m} minutes` : ""}`.trim();
    if (v % 3 === 0) {
      p1 = `${shortA} is ${dur} ahead of ${shortB} (making ${shortB} ${dur} behind ${shortA}). ${example.sentence} When individuals in ${shortA} reach the midpoint of their business day at 12:00 PM, colleagues or family members in ${shortB} are experiencing the earlier morning hour of ${example.timeBStr}.`;
    } else if (v % 3 === 1) {
      p1 = `From the perspective of ${shortA}, ${shortB} sits ${dur} behind. ${example.sentence} While professionals in ${shortA} are actively progressing through mid-day projects, counterparts in ${shortB} are just beginning their morning routines at ${example.timeBStr}. Keeping this trailing difference in mind helps avoid premature early calls.`;
    } else {
      p1 = `There is a ${dur} offset between the two locations, with ${shortB} trailing ${shortA}. ${example.sentence} As midday arrives in ${shortA}, clocks in ${shortB} read ${example.timeBStr}. Aligning shared workflows with this offset ensures both parties connect at mutually agreeable times.`;
    }
  }

  // Paragraph 2: Pair-Specific Daylight Saving Time Interaction Computed From IANA Data
  const p2 = seasonal.summaryText;

  // Paragraph 3: Distance, Great-Circle Geodesic Flight Route & Compass Bearing
  let p3 = "";
  if (v % 3 === 0) {
    p3 = `Separated by a straight-line great-circle distance of approximately ${dist.formattedKm} (${dist.formattedMiles}), traveling between ${shortA} and ${shortB} requires an estimated non-stop flight duration of roughly ${dist.estimatedFlightHours} hours at commercial cruising speeds. The initial flight bearing leaving ${shortA} directly toward ${shortB} is ${dist.initialBearingDegrees}° (${dist.compassDirection}). Across this distance, crossing multiple longitude lines induces circadian fatigue, so scheduling rest breaks and planning meetings around local sleep cycles helps optimize personal alertness.`;
  } else if (v % 3 === 1) {
    p3 = `The straight-line geodesic distance between ${shortA} and ${shortB} spans approximately ${dist.formattedKm} (${dist.formattedMiles}), translating to roughly ${dist.estimatedFlightHours} hours of commercial air travel under typical cruising conditions. Navigating directly toward ${shortB} sets an initial compass bearing of ${dist.initialBearingDegrees}° (${dist.compassDirection}). Long-haul transitions across multiple meridians can disrupt internal body clocks, making strategic daylight exposure and hydration vital for travelers and remote teams alike.`;
  } else {
    p3 = `Measuring across the globe, ${shortA} and ${shortB} are separated by an air distance of approximately ${dist.formattedKm} (${dist.formattedMiles}), which corresponds to an estimated flight time of ${dist.estimatedFlightHours} hours. Heading from ${shortA} towards ${shortB} begins with an initial compass heading of ${dist.initialBearingDegrees}° (${dist.compassDirection}). When coordinating across this expanse, keeping travel fatigue and diurnal rhythms in mind ensures productive bilateral collaboration.`;
  }

  // Paragraph 4: Best Time to Call & Practical Meeting Collaboration Scenarios
  let p4 = "";
  if (bestTime.hasOverlap) {
    p4 = `For productive telephone calls, virtual interviews, or remote standups, the optimal awake calling window (9:00 AM to 9:00 PM in both cities) spans between ${bestTime.recommendedWindowFrom} in ${shortA}, which matches ${bestTime.recommendedWindowTo} in ${shortB}. For enterprise teams seeking synchronous office hours (9:00 AM to 5:00 PM), there ${bestTime.hasOfficeOverlap ? `is ${bestTime.officeFormattedDuration} of direct business overlap (${bestTime.officeWindowFrom} in ${shortA})` : `is limited direct business overlap, recommending early morning or late afternoon sync slots`}.`;
  } else {
    p4 = `Because of the wide geographical separation between ${shortA} and ${shortB}, standard 9:00 AM to 9:00 PM awake hours do not directly intersect. To conduct real-time calls without disrupting sleep, one side usually connects during their early morning (around 7:30 AM to 8:30 AM) while the other connects during late evening (around 9:30 PM to 10:30 PM). For ongoing business relationships, asynchronous collaboration and shared project dashboards provide the most practical communication solution.`;
  }

  // Paragraph 5: Workflow Coordination, Asynchronous Handoffs & Meeting Etiquette
  let p5 = "";
  if (diff.isSameTime || Math.abs(diff.diffMinutes) <= 120) {
    p5 = `Because ${shortA} and ${shortB} share nearly identical working schedules with negligible time delta, distributed teams can collaborate in real time throughout normal business hours. Urgent messages, instant messaging pings, and agile sprint ceremonies can occur spontaneously without risk of contacting counterparts outside their standard workday. To maximize focus, teams can designate shared synchronous collaboration blocks in the mid-morning and reserve early afternoons for uninterrupted deep work.`;
  } else if (Math.abs(diff.diffMinutes) <= 420) {
    p5 = `Navigating a moderate time difference between ${shortA} and ${shortB} requires strategic daily calendar management. With working hours partially overlapping, morning hours in one location naturally align with afternoon or end-of-day wrap-ups in the other. Successful cross-border operations typically schedule all synchronous video calls and critical status reviews during this golden overlap window, utilizing the remaining solo hours for focused execution and autonomous task completion.`;
  } else {
    p5 = `Operating across an extensive time divide between ${shortA} and ${shortB} necessitates an asynchronous-first communication strategy. Rather than forcing late-night or dawn meetings that induce fatigue, high-performing organizations rely on structured documentation, recorded loom briefs, and clear end-of-day handoff logs. Work finished in ${shortA} can be reviewed and advanced in ${shortB} while the initial team sleeps, creating a resilient 24-hour continuous development cycle when managed effectively.`;
  }

  // Paragraph 6: Precision Timekeeping Standards & IANA Zone Identifiers
  let p6 = "";
  if (v % 3 === 0) {
    p6 = `Calculations for the ${shortA} to ${shortB} corridor are derived from the official IANA Time Zone Database (using identifiers ${placeA.timezone} and ${placeB.timezone}). This dynamic timekeeping engine accounts for municipal boundary definitions, national legislative changes, and seasonal daylight shifts, delivering minute-by-minute accuracy across historical, current, and future dates.`;
  } else if (v % 3 === 1) {
    p6 = `All delta metrics and scheduling recommendations between ${shortA} and ${shortB} are powered by the authoritative IANA Olson database (zones ${placeA.timezone} and ${placeB.timezone}). By evaluating statutory changes and local daylight adjustments automatically, TimeBridge ensures enterprise-grade precision for global operations.`;
  } else {
    p6 = `Time computations for ${shortA} and ${shortB} reference the global IANA time repository (${placeA.timezone} and ${placeB.timezone}). This dynamic calculation framework prevents scheduling oversights by accounting for leap intervals, municipal boundaries, and governmental daylight rules in real time.`;
  }

  const paragraphs = [p1, p2, p3, p4, p5, p6];
  const fullText = paragraphs.join(" ");
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return {
    h1,
    metaTitle,
    metaDescription,
    paragraphs,
    wordCount,
  };
}

/**
 * Generates tailored FAQs for the pair with short names and complete answers
 */
export function generatePairFaqs(
  placeA: Place,
  placeB: Place,
  diff: TimeDifferenceResult,
  bestTime: BestTimeToCallResult,
  dist: DistanceResult
): FaqItem[] {
  const shortA = placeA.name;
  const shortB = placeB.name;
  const example = getConsistentExampleSentence(placeA, placeB, diff);
  const seasonal = analyzePairSeasonalDst(placeA, placeB);

  return [
    {
      question: `What is the time difference between ${shortA} and ${shortB}?`,
      answer: example.sentence,
    },
    {
      question: `What is the best time to call someone in ${shortB} from ${shortA}?`,
      answer: bestTime.hasOverlap
        ? `The best time to call ${shortB} from ${shortA} is between ${bestTime.recommendedWindowFrom} in ${shortA}, which corresponds to ${bestTime.recommendedWindowTo} in ${shortB}. Both parties will be awake and within convenient daytime hours.`
        : `Because of the wide time separation, there is no direct 9 AM – 9 PM overlap. The best compromise is calling early morning in ${shortA} (around 8:00 AM) or late evening (around 9:00 PM) when ${shortB} is in normal awake hours.`,
    },
    {
      question: `Does the time difference between ${shortA} and ${shortB} change throughout the year?`,
      answer: seasonal.isConstantYearRound
        ? `No, the time difference between ${shortA} and ${shortB} remains constant at ${seasonal.minDiffFormatted} every single day of the year because neither location observes seasonal clock shifts.`
        : `Yes, the time difference changes seasonally between ${seasonal.minDiffFormatted} and ${seasonal.maxDiffFormatted} due to Daylight Saving Time adjustments in ${seasonal.whichChangesFirst || 'one or both locations'}.`,
    },
    {
      question: `How far is ${shortA} from ${shortB} and how long is the flight?`,
      answer: `The great-circle air distance between ${shortA} and ${shortB} is approximately ${dist.formattedKm} (${dist.formattedMiles}). An estimated non-stop flight takes roughly ${dist.estimatedFlightHours} hours.`,
    },
  ];
}

export function generateFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
