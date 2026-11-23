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
      tentativeMessage: 'Official broadcast schedule for this event is tentative and awaiting final league and host broadcaster confirmation. Please check back closer to the event date.',
      hostStartLocal: null,
      targetCountryStartLocal: null,
      targetCountryTimeFormatted: 'Schedule Pending',
      targetCountryDateFormatted: 'Date TBA',
      majorAudiences: [],
      lastUpdated: event.lastUpdated,
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
  };
}
