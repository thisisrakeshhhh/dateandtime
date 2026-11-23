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
  description: string;
}

export interface AudienceBroadcastTime {
  regionLabel: string;
  timezone: string;
  timeFormatted: string;
  dateFormatted: string;
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

  if (!event.isScheduled || !event.scheduledStartIso) {
    return {
      event,
      targetCountry,
      isScheduled: false,
      tentativeMessage: `Official broadcast date and start time have not been announced by event organizers (${event.source || 'governing body'}). Schedule status verified as tentative and pending confirmation on ${event.lastChecked || event.lastUpdated}.`,
      hostStartLocal: null,
      targetCountryStartLocal: null,
      targetCountryTimeFormatted: 'Date not announced',
      targetCountryDateFormatted: 'Date not announced',
      majorAudiences: [],
      lastUpdated: event.lastUpdated,
      lastChecked: event.lastChecked,
      source: event.source,
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
      regionLabel: 'Australia (Sydney)',
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

  return {
    event,
    targetCountry,
    isScheduled: true,
    hostStartLocal,
    targetCountryStartLocal,
    targetCountryTimeFormatted: targetCountryStartLocal.toFormat('h:mm a'),
    targetCountryDateFormatted: targetCountryStartLocal.toFormat('cccc, LLLL d, yyyy'),
    majorAudiences,
    lastUpdated: event.lastUpdated,
    lastChecked: event.lastChecked,
    source: event.source,
  };
}
