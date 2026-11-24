import { DateTime } from 'luxon';

import { siteConfig } from '@/lib/config';

export interface EventData {
  title: string;
  iso: string; // ISO string without zone or with zone, e.g. 2026-12-31T18:00
  zone: string; // IANA timezone e.g. "Asia/Kolkata", "America/New_York"
  description?: string;
  durationMinutes?: number; // default 60
}

/**
 * Encodes event details into URL search params
 */
export function encodeEventToParams(event: EventData): string {
  const params = new URLSearchParams();
  params.set('t', event.title.trim());
  params.set('d', event.iso.trim());
  params.set('z', event.zone.trim());
  if (event.description && event.description.trim().length > 0) {
    params.set('desc', event.description.trim());
  }
  if (event.durationMinutes && event.durationMinutes !== 60) {
    params.set('dur', event.durationMinutes.toString());
  }
  return params.toString();
}

/**
 * Decodes event details from URL search params
 */
export function decodeEventFromParams(params: URLSearchParams | Record<string, string | undefined>): EventData | null {
  const getParam = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key) || undefined;
    }
    return params[key];
  };

  const title = getParam('t');
  const d = getParam('d');
  const z = getParam('z');
  const desc = getParam('desc');
  const durStr = getParam('dur');

  if (!title || !d || !z) {
    return null;
  }

  // Validate timezone with Luxon
  const testDt = DateTime.now().setZone(z);
  if (!testDt.isValid) {
    return null;
  }

  const durationMinutes = durStr ? parseInt(durStr, 10) || 60 : 60;

  return {
    title,
    iso: d,
    zone: z,
    description: desc || '',
    durationMinutes: Math.max(15, Math.min(1440, durationMinutes)),
  };
}

/**
 * Parses event start as UTC DateTime
 */
export function getEventUtcRange(event: EventData): { startUtc: DateTime; endUtc: DateTime } | null {
  // ISO can be YYYY-MM-DDTHH:mm
  const startLocal = DateTime.fromISO(event.iso, { zone: event.zone });
  if (!startLocal.isValid) {
    return null;
  }
  const startUtc = startLocal.toUTC();
  const endUtc = startUtc.plus({ minutes: event.durationMinutes || 60 });
  return { startUtc, endUtc };
}

/**
 * Generates a Google Calendar event creation URL
 */
export function generateGoogleCalendarUrl(event: EventData): string {
  const range = getEventUtcRange(event);
  if (!range) return '#';

  const fmt = (dt: DateTime) => dt.toFormat("yyyyLLdd'T'HHmmss'Z'");
  const dates = `${fmt(range.startUtc)}/${fmt(range.endUtc)}`;
  
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', event.title);
  url.searchParams.set('dates', dates);
  if (event.description) {
    url.searchParams.set('details', event.description);
  }
  return url.toString();
}

/**
 * Generates an iCalendar (.ics) string for direct download
 */
export function generateIcsContent(event: EventData): string {
  const range = getEventUtcRange(event);
  if (!range) return '';

  const fmt = (dt: DateTime) => dt.toFormat("yyyyLLdd'T'HHmmss'Z'");
  const nowUtc = DateTime.now().toUTC();

  // Escape special chars according to RFC 5545
  const escapeIcs = (str: string) =>
    str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const cleanTitle = escapeIcs(event.title);
  const cleanDesc = escapeIcs(event.description || '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TimeBridge//Event Share//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:timebridge-${Date.now()}-${Math.floor(Math.random() * 100000)}@${siteConfig.domain || 'timebridge.com'}`,
    `DTSTAMP:${fmt(nowUtc)}`,
    `DTSTART:${fmt(range.startUtc)}`,
    `DTEND:${fmt(range.endUtc)}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Calculates countdown units
 */
export function calculateCountdown(targetUtc: DateTime, nowUtc: DateTime = DateTime.now().toUTC()) {
  const diff = targetUtc.diff(nowUtc, ['days', 'hours', 'minutes', 'seconds']).toObject();
  const totalSeconds = targetUtc.diff(nowUtc, 'seconds').seconds;

  const isPast = totalSeconds <= 0;
  if (isPast) {
    return {
      isPast: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: 'Event started or ended',
    };
  }

  const days = Math.floor(diff.days || 0);
  const hours = Math.floor(diff.hours || 0);
  const minutes = Math.floor(diff.minutes || 0);
  const seconds = Math.floor(diff.seconds || 0);

  return {
    isPast: false,
    days,
    hours,
    minutes,
    seconds,
    formatted: `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`,
  };
}
