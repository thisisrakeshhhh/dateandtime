import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import {
  encodeEventToParams,
  decodeEventFromParams,
  getEventUtcRange,
  generateGoogleCalendarUrl,
  generateIcsContent,
  calculateCountdown,
  EventData,
} from '../lib/events';

describe('Event time links logic', () => {
  const sampleEvent: EventData = {
    title: 'Global Engineering Sync',
    iso: '2026-11-25T14:30',
    zone: 'America/New_York',
    description: 'Quarterly review with US and India engineering leads',
    durationMinutes: 45,
  };

  it('correctly encodes and decodes event URL search params without data loss', () => {
    const encoded = encodeEventToParams(sampleEvent);
    expect(encoded).toContain('t=Global+Engineering+Sync');
    expect(encoded).toContain('z=America%2FNew_York');

    const params = new URLSearchParams(encoded);
    const decoded = decodeEventFromParams(params);

    expect(decoded).not.toBeNull();
    expect(decoded?.title).toBe('Global Engineering Sync');
    expect(decoded?.iso).toBe('2026-11-25T14:30');
    expect(decoded?.zone).toBe('America/New_York');
    expect(decoded?.description).toBe('Quarterly review with US and India engineering leads');
    expect(decoded?.durationMinutes).toBe(45);
  });

  it('computes accurate UTC start and end bounds regardless of daylight saving time', () => {
    const range = getEventUtcRange(sampleEvent);
    expect(range).not.toBeNull();
    // In November, New York is in EST (UTC-5)
    // 14:30 EST = 19:30 UTC
    expect(range?.startUtc.toISO()).toContain('2026-11-25T19:30:00.000Z');
    // +45 mins = 20:15 UTC
    expect(range?.endUtc.toISO()).toContain('2026-11-25T20:15:00.000Z');
  });

  it('generates a valid Google Calendar link', () => {
    const gCalUrl = generateGoogleCalendarUrl(sampleEvent);
    expect(gCalUrl).toContain('https://calendar.google.com/calendar/render');
    expect(gCalUrl).toContain('action=TEMPLATE');
    expect(gCalUrl).toContain('20261125T193000Z%2F20261125T201500Z');
    expect(gCalUrl).toContain('Global+Engineering+Sync');
  });

  it('generates compliant iCalendar .ics content', () => {
    const ics = generateIcsContent(sampleEvent);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Global Engineering Sync');
    expect(ics).toContain('DTSTART:20261125T193000Z');
    expect(ics).toContain('DTEND:20261125T201500Z');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('computes countdown properly for future and past events', () => {
    const futureUtc = DateTime.fromISO('2026-11-25T19:30:00.000Z', { zone: 'utc' });
    const fixedNowUtc = DateTime.fromISO('2026-11-23T15:00:00.000Z', { zone: 'utc' });
    const countdown = calculateCountdown(futureUtc, fixedNowUtc);

    expect(countdown.isPast).toBe(false);
    expect(countdown.days).toBe(2);
    expect(countdown.hours).toBe(4);
    expect(countdown.minutes).toBe(30);

    const pastNowUtc = DateTime.fromISO('2026-11-26T00:00:00.000Z', { zone: 'utc' });
    const pastCountdown = calculateCountdown(futureUtc, pastNowUtc);
    expect(pastCountdown.isPast).toBe(true);
  });
});
