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
  isScheduled: boolean;
  lastUpdated: string;
  lastChecked?: string;
  source?: string;
  sourceUrl?: string;
  description: string;
  overview?: string;
  broadcastInfo?: string;
  timingAdvice?: string;
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
  isScheduled: boolean;
  tentativeMessage?: string;
  hostStartLocal: DateTime | null;
  targetCountryStartLocal: DateTime | null;
  targetCountryTimeFormatted: string;
  targetCountryDateFormatted: string;
  majorAudiences: AudienceBroadcastTime[];
  lastUpdated: string;
  lastChecked?: string;
  source?: string;
  sourceUrl?: string;
  overview: string;
  broadcastInfo: string;
  timingAdvice: string;
  faqs: SportsEventFaq[];
  fullText: string;
  wordCount: number;
}

export function getAllEvents(): SportsEvent[] {
  return eventsData as SportsEvent[];
}

export function getEventBySlug(slug: string): SportsEvent | undefined {
  return getAllEvents().find((e) => e.slug === slug);
}

export function generateSportsEventReport(event: SportsEvent, targetCountrySlug: string): SportsEventReport | null {
  const targetCountry = getCountryBySlug(targetCountrySlug);
  if (!targetCountry) return null;

  const isConfirmed =
    Boolean(event.isScheduled) &&
    Boolean(event.scheduledStartIso) &&
    new Date(event.scheduledStartIso).getTime() > Date.now();

  const overview = event.overview || event.description;
  const broadcastInfo =
    event.broadcastInfo ||
    `Official global broadcast feeds for ${event.name} are distributed through certified television networks and verified streaming platforms in the host nation (${event.venueCountry}) and international partner territories.`;
  const timingAdvice =
    event.timingAdvice ||
    `Event starts in time zone ${event.hostTimezone}. Use our auto-detected countdown and viewer clock to synchronize local viewing with your home country without missing kickoff.`;

  if (!isConfirmed) {
    const tentativeMsg = `Official broadcast date and start time have not been announced by event organizers (${event.source || 'governing body'}). Schedule status verified as tentative or concluded on ${event.lastChecked || event.lastUpdated}.`;
    const fullText = `${event.name} ${event.sport} in ${targetCountry.name}. ${event.description} ${overview} ${tentativeMsg} ${broadcastInfo} ${timingAdvice}`;
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    return {
      event,
      targetCountry,
      isScheduled: false,
      tentativeMessage: tentativeMsg,
      hostStartLocal: null,
      targetCountryStartLocal: null,
      targetCountryTimeFormatted: 'Date not announced',
      targetCountryDateFormatted: 'Date not announced',
      majorAudiences: [],
      lastUpdated: event.lastUpdated,
      lastChecked: event.lastChecked,
      source: event.source,
      sourceUrl: event.sourceUrl,
      overview,
      broadcastInfo,
      timingAdvice,
      faqs: [
        {
          question: `When is the next ${event.name}?`,
          answer: `Official schedule dates are currently pending announcement by the governing federation (${event.source || 'official organizers'}). Check back following the next schedule release.`,
        },
      ],
      fullText,
      wordCount,
    };
  }

  // Parse host start time
  const hostStartLocal = DateTime.fromISO(event.scheduledStartIso, { zone: event.hostTimezone });
  const startUtc = hostStartLocal.toUTC();

  // Target country time
  const targetCountryStartLocal = startUtc.setZone(targetCountry.timezone);

  // Key global broadcast audiences
  const majorAudiences: AudienceBroadcastTime[] = [
    {
      regionLabel: 'United States (Eastern - ET)',
      timezone: 'America/New_York',
      timeFormatted: startUtc.setZone('America/New_York').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('America/New_York').toFormat('cccc, LLLL d, yyyy'),
    },
    {
      regionLabel: 'United States (Pacific - PT)',
      timezone: 'America/Los_Angeles',
      timeFormatted: startUtc.setZone('America/Los_Angeles').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('America/Los_Angeles').toFormat('cccc, LLLL d, yyyy'),
    },
    {
      regionLabel: 'United Kingdom (London)',
      timezone: 'Europe/London',
      timeFormatted: startUtc.setZone('Europe/London').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('Europe/London').toFormat('cccc, LLLL d, yyyy'),
    },
    {
      regionLabel: 'India (IST)',
      timezone: 'Asia/Kolkata',
      timeFormatted: startUtc.setZone('Asia/Kolkata').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('Asia/Kolkata').toFormat('cccc, LLLL d, yyyy'),
    },
    {
      regionLabel: 'Australia (Sydney - AEST/AEDT)',
      timezone: 'Australia/Sydney',
      timeFormatted: startUtc.setZone('Australia/Sydney').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('Australia/Sydney').toFormat('cccc, LLLL d, yyyy'),
    },
    {
      regionLabel: 'Central Europe (Berlin/Paris)',
      timezone: 'Europe/Berlin',
      timeFormatted: startUtc.setZone('Europe/Berlin').toFormat('h:mm a'),
      dateFormatted: startUtc.setZone('Europe/Berlin').toFormat('cccc, LLLL d, yyyy'),
    },
  ];

  const targetCountryTimeFormatted = targetCountryStartLocal.toFormat('h:mm a');
  const targetCountryDateFormatted = targetCountryStartLocal.toFormat('cccc, LLLL d, yyyy');

  const faqs: SportsEventFaq[] = [
    {
      question: `What time does ${event.name} start in ${targetCountry.name}?`,
      answer: `In ${targetCountry.name} (${targetCountry.timezone}), ${event.name} is scheduled to begin at ${targetCountryTimeFormatted} on ${targetCountryDateFormatted}. Venue local start time in ${event.venueCity}, ${event.venueCountry} is ${hostStartLocal.toFormat('h:mm a')} (${event.hostTimezone}).`,
    },
    {
      question: `Where is ${event.name} being held this year?`,
      answer: `The competition is hosted in ${event.venueCity}, ${event.venueCountry} within the ${event.hostTimezone} time zone.`,
    },
    {
      question: `What official television channels and digital streams broadcast the event?`,
      answer: `${broadcastInfo} Check with regional program guides to verify local subscription and cable availability.`,
    },
    {
      question: `How can international viewers convert the start time to their local clock?`,
      answer: `${timingAdvice} Use our auto-detected live countdown and timezone converter to accurately track start times without manual UTC offset calculations.`,
    },
  ];

  const audiencesText = majorAudiences.map((a) => `${a.regionLabel} ${a.timeFormatted} ${a.dateFormatted}`).join(' ');
  const faqsText = faqs.map((f) => `${f.question} ${f.answer}`).join(' ');
  const fullText = `${event.name} in ${targetCountry.name}. ${event.sport} competition hosted in ${event.venueCity}, ${event.venueCountry}. ${event.description} ${overview} ${broadcastInfo} ${timingAdvice} Official start time: ${targetCountryTimeFormatted} ${targetCountryDateFormatted} in ${targetCountry.timezone}. Global broadcast audience schedule: ${audiencesText}. Frequently asked questions: ${faqsText} Source: ${event.source} ${event.sourceUrl || ''}. Last verified: ${event.lastChecked || event.lastUpdated}.`;

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return {
    event,
    targetCountry,
    isScheduled: true,
    hostStartLocal,
    targetCountryStartLocal,
    targetCountryTimeFormatted,
    targetCountryDateFormatted,
    majorAudiences,
    lastUpdated: event.lastUpdated,
    lastChecked: event.lastChecked,
    source: event.source,
    sourceUrl: event.sourceUrl,
    overview,
    broadcastInfo,
    timingAdvice,
    faqs,
    fullText,
    wordCount,
  };
}
