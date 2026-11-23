import { DateTime } from 'luxon';
import eventsData from '@/data/events.json';
import { getCountryBySlug, Place } from '@/lib/places';

export interface SportsEvent {
  slug: string;
  name: string;
  sport: string;
  venueCity: string;
  venueCountry: string;
  hostTimezone: string;
  scheduledStartIso: string;
  status?: 'confirmed' | 'tbc';
  isScheduled: boolean;
  lastUpdated: string;
  lastChecked?: string;
  source?: string;
  sourceUrl?: string;
  description: string;
  overview?: string;
}

export interface AudienceBroadcastTime {
  regionLabel: string;
  timezone: string;
  timeFormatted: string;
  dateFormatted: string;
}

export interface SportsEventFaq {
  question: string;
  answer: string;
}

export interface SportsEventReport {
  event: SportsEvent;
  targetCountry: Place;
  isConfirmed: boolean;
  isScheduled: boolean;
  status: 'confirmed' | 'tbc';
  tentativeMessage?: string;
  hostStartLocal: DateTime | null;
  targetCountryStartLocal: DateTime | null;
  targetCountryTimeFormatted: string;
  targetCountryDateFormatted: string;
  dayDifference: number;
  calendarShiftText: string;
  localBroadcasters: string;
  localViewingAdvice: string;
  majorAudiences: AudienceBroadcastTime[];
  lastUpdated: string;
  lastChecked?: string;
  source?: string;
  sourceUrl?: string;
  faqs: SportsEventFaq[];
  fullText: string;
  wordCount: number;
}

export const TARGET_VIEWER_COUNTRIES = [
  'united-states',
  'united-kingdom',
  'india',
  'australia',
] as const;

export function getAllEvents(): SportsEvent[] {
  return eventsData as SportsEvent[];
}

export function getConfirmedEvents(): SportsEvent[] {
  return getAllEvents().filter(
    (e) =>
      e.status === 'confirmed' &&
      e.isScheduled &&
      Boolean(e.scheduledStartIso) &&
      new Date(e.scheduledStartIso).getTime() > Date.now()
  );
}

export function getEventBySlug(slug: string): SportsEvent | undefined {
  return getAllEvents().find((e) => e.slug === slug);
}

const COUNTRY_BROADCASTERS: Record<string, { networks: string; viewingGuide: string; dstNotice: string }> = {
  'united-states': {
    networks: 'Major broadcast networks including NBC, CBS, FOX, ESPN/ABC, Peacock, and Paramount+.',
    viewingGuide:
      'For viewers in the United States, timing spans Eastern, Central, Mountain, and Pacific zones. Live coverage features comprehensive pre-game analysis, studio breakdowns, and high-definition streaming on national sports apps.',
    dstNotice:
      'Eastern Daylight Time (EDT, UTC-4) or Eastern Standard Time (EST, UTC-5) applies depending on whether Daylight Saving Time is active in the US during the competition date.',
  },
  'united-kingdom': {
    networks: 'Free-to-air BBC Sport and ITV, alongside subscription television on Sky Sports, TNT Sports, and Discovery+.',
    viewingGuide:
      'UK audiences observe broadcasts in British Summer Time (BST, UTC+1) during summer months or Greenwich Mean Time (GMT, UTC+0) in winter. Evening fixtures provide prime-time viewing, while North American late-night events run into early morning.',
    dstNotice:
      'Check whether the UK has advanced clocks to BST on the last Sunday in March or returned to GMT on the last Sunday in October.',
  },
  'india': {
    networks: 'Televised on the Star Sports network and Sony Sports Network, with digital streaming on JioCinema and FanCode.',
    viewingGuide:
      'Indian Standard Time (IST, UTC+5:30) does not observe Daylight Saving Time. Western hemisphere evening matches typically air the following morning in India (between 4:00 AM and 6:30 AM IST), making breakfast watch parties popular.',
    dstNotice:
      'India remains on permanent UTC+5:30 throughout the entire year. However, seasonal clock changes in the host nation will adjust the time gap by one hour in spring and autumn.',
  },
  'australia': {
    networks: 'Free-to-air coverage on Nine Network (9Now), Seven Network, alongside Stan Sport, Optus Sport, and Kayo / Foxtel.',
    viewingGuide:
      'Australian Eastern Time (AEST, UTC+10 or AEDT, UTC+11) puts European afternoon fixtures in late night and American afternoon events in mid-morning of the next calendar day. Fans in Western Australia should subtract 2 to 3 hours.',
    dstNotice:
      'Southern hemisphere daylight saving rules apply in NSW, Victoria, Tasmania, and SA between October and April, while Queensland, WA, and the NT remain on standard time.',
  },
};

export function generateSportsEventReport(event: SportsEvent, targetCountrySlug: string): SportsEventReport | null {
  const targetCountry = getCountryBySlug(targetCountrySlug);
  if (!targetCountry) return null;

  const isConfirmed =
    event.status === 'confirmed' &&
    Boolean(event.isScheduled) &&
    Boolean(event.scheduledStartIso) &&
    Boolean(event.sourceUrl) &&
    new Date(event.scheduledStartIso).getTime() > Date.now();

  const countryInfo = COUNTRY_BROADCASTERS[targetCountry.slug] || {
    networks: `Official domestic rights-holding channels and digital streaming apps in ${targetCountry.name}.`,
    viewingGuide: `Viewers in ${targetCountry.name} can follow the competition live across certified terrestrial and digital broadcast platforms.`,
    dstNotice: `Calculated using official IANA time zone data for ${targetCountry.timezone}.`,
  };

  if (!isConfirmed) {
    const tentativeMsg = `Official broadcast date and start time for ${event.name} have not been confirmed by organizers (${event.source || 'governing body'}). Schedule status is TBC pending calendar publication.`;
    const fullText = `${event.name} in ${targetCountry.name}. ${event.sport} competition hosted in ${event.venueCity}, ${event.venueCountry}. ${event.description} ${event.overview || ''} ${tentativeMsg} ${countryInfo.networks} ${countryInfo.viewingGuide} Source: ${event.source} (${event.sourceUrl || ''}). Last checked: ${event.lastChecked || event.lastUpdated}.`;
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    return {
      event,
      targetCountry,
      isConfirmed: false,
      isScheduled: false,
      status: 'tbc',
      tentativeMessage: tentativeMsg,
      hostStartLocal: null,
      targetCountryStartLocal: null,
      targetCountryTimeFormatted: 'Schedule TBC',
      targetCountryDateFormatted: 'Date not announced',
      dayDifference: 0,
      calendarShiftText: 'Exact match schedule and broadcast timetable are pending formal federation announcement.',
      localBroadcasters: countryInfo.networks,
      localViewingAdvice: countryInfo.viewingGuide,
      majorAudiences: [],
      lastUpdated: event.lastUpdated,
      lastChecked: event.lastChecked,
      source: event.source,
      sourceUrl: event.sourceUrl,
      faqs: [
        {
          question: `When will the official date for ${event.name} be announced?`,
          answer: `Organizers at ${event.source || 'the governing body'} publish official timetables several months in advance. Our schedule verification is checked regularly.`,
        },
      ],
      fullText,
      wordCount,
    };
  }

  // Parse host start time
  const hostStartLocal = DateTime.fromISO(event.scheduledStartIso, { zone: event.hostTimezone });
  const startUtc = hostStartLocal.toUTC();
  const targetCountryStartLocal = startUtc.setZone(targetCountry.timezone);

  // Compute calendar day difference
  const hostDateStr = hostStartLocal.toFormat('yyyy-MM-dd');
  const targetDateStr = targetCountryStartLocal.toFormat('yyyy-MM-dd');
  const hostDateDt = DateTime.fromISO(hostDateStr);
  const targetDateDt = DateTime.fromISO(targetDateStr);
  const dayDifference = Math.round(targetDateDt.diff(hostDateDt, 'days').days);

  let calendarShiftText = `Same-Day Broadcast: The event starts on ${targetCountryStartLocal.toFormat('cccc, LLLL d, yyyy')} in both ${targetCountry.name} and the venue location in ${event.venueCity}.`;
  if (dayDifference > 0) {
    calendarShiftText = `Next-Day Calendar Shift: Due to the international time difference across the globe, ${event.name} takes place on ${targetCountryStartLocal.toFormat('cccc, LLLL d')} in ${targetCountry.name}, while starting on ${hostStartLocal.toFormat('cccc, LLLL d')} at the venue in ${event.venueCity}.`;
  } else if (dayDifference < 0) {
    calendarShiftText = `Previous-Day Calendar Shift: Because of time zone variance, viewers in ${targetCountry.name} will watch on ${targetCountryStartLocal.toFormat('cccc, LLLL d')}, prior to the local venue calendar day in ${event.venueCity}.`;
  }

  const targetCountryTimeFormatted = targetCountryStartLocal.toFormat('h:mm a');
  const targetCountryDateFormatted = targetCountryStartLocal.toFormat('cccc, LLLL d, yyyy');

  const majorAudiences: AudienceBroadcastTime[] = [
    {
      regionLabel: 'United States (Eastern - ET)',
      timezone: 'America/New_York',
      timeFormatted: startUtc.setZone('America/New_York').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('America/New_York').toFormat('cccc, LLLL d'),
    },
    {
      regionLabel: 'United States (Pacific - PT)',
      timezone: 'America/Los_Angeles',
      timeFormatted: startUtc.setZone('America/Los_Angeles').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('America/Los_Angeles').toFormat('cccc, LLLL d'),
    },
    {
      regionLabel: 'United Kingdom (London - GMT/BST)',
      timezone: 'Europe/London',
      timeFormatted: startUtc.setZone('Europe/London').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('Europe/London').toFormat('cccc, LLLL d'),
    },
    {
      regionLabel: 'India (New Delhi - IST)',
      timezone: 'Asia/Kolkata',
      timeFormatted: startUtc.setZone('Asia/Kolkata').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('Asia/Kolkata').toFormat('cccc, LLLL d'),
    },
    {
      regionLabel: 'Australia (Sydney - AEST/AEDT)',
      timezone: 'Australia/Sydney',
      timeFormatted: startUtc.setZone('Australia/Sydney').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('Australia/Sydney').toFormat('cccc, LLLL d'),
    },
  ];

  const faqs: SportsEventFaq[] = [
    {
      question: `What time does ${event.name} start in ${targetCountry.name}?`,
      answer: `In ${targetCountry.name} (${targetCountry.timezone}), ${event.name} begins at ${targetCountryTimeFormatted} on ${targetCountryDateFormatted}. Local time at the venue in ${event.venueCity}, ${event.venueCountry} is ${hostStartLocal.toFormat('h:mm a')} (${event.hostTimezone}).`,
    },
    {
      question: `Does the calendar date change for viewers in ${targetCountry.name}?`,
      answer: calendarShiftText,
    },
    {
      question: `Which television channels and streaming platforms broadcast the event in ${targetCountry.name}?`,
      answer: `${countryInfo.networks} Please check regional listings for subscription packages and verified streaming availability.`,
    },
    {
      question: `How does Daylight Saving Time affect start times between ${event.venueCity} and ${targetCountry.name}?`,
      answer: `${countryInfo.dstNotice} Venue local time is governed by ${event.hostTimezone}. Use our live clock and automatic countdown to monitor the exact kickoff moment without manual offset calculations.`,
    },
  ];

  const fullText = [
    `What time is ${event.name} in ${targetCountry.name}?`,
    `${event.name} is a premier ${event.sport} competition hosted in ${event.venueCity}, ${event.venueCountry}.`,
    event.description,
    event.overview || '',
    `Official Start Time in ${targetCountry.name}: ${targetCountryTimeFormatted} on ${targetCountryDateFormatted} (${targetCountry.timezone}).`,
    `Local venue time in ${event.venueCity}: ${hostStartLocal.toFormat('h:mm a')} (${event.hostTimezone}).`,
    calendarShiftText,
    `Broadcasting in ${targetCountry.name}: ${countryInfo.networks}`,
    `Viewing Guide for ${targetCountry.name}: ${countryInfo.viewingGuide}`,
    `Daylight Saving Notice: ${countryInfo.dstNotice}`,
    majorAudiences.map((a) => `${a.regionLabel}: ${a.timeFormatted} on ${a.dateFormatted}`).join('. '),
    faqs.map((f) => `${f.question} ${f.answer}`).join(' '),
    `Official Source: ${event.source} (${event.sourceUrl || ''}). Verified on ${event.lastChecked || event.lastUpdated}.`,
  ].join(' ');

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return {
    event,
    targetCountry,
    isConfirmed: true,
    isScheduled: true,
    status: 'confirmed',
    hostStartLocal,
    targetCountryStartLocal,
    targetCountryTimeFormatted,
    targetCountryDateFormatted,
    dayDifference,
    calendarShiftText,
    localBroadcasters: countryInfo.networks,
    localViewingAdvice: countryInfo.viewingGuide,
    majorAudiences,
    lastUpdated: event.lastUpdated,
    lastChecked: event.lastChecked,
    source: event.source,
    sourceUrl: event.sourceUrl,
    faqs,
    fullText,
    wordCount,
  };
}
