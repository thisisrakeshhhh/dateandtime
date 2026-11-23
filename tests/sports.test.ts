import { describe, it, expect } from 'vitest';
import { getAllEvents, getEventBySlug, generateSportsEventReport } from '../lib/sports';

describe('Sports and Global Events Start Times', () => {
  it('contains exactly 20 recurring sporting events', () => {
    const events = getAllEvents();
    expect(events.length).toBe(20);
  });

  it('accurately converts Super Bowl kickoff into India Standard Time (IST)', () => {
    const sb = getEventBySlug('super-bowl');
    expect(sb).toBeDefined();
    if (!sb) return;

    const report = generateSportsEventReport(sb, 'india');
    expect(report).not.toBeNull();
    expect(report?.isScheduled).toBe(true);
    expect(report?.targetCountry.name).toBe('India');
    // 15:30 PST = 23:30 UTC = 05:00 AM IST next morning
    expect(report?.targetCountryTimeFormatted).toBe('5:00 AM');
    expect(report?.majorAudiences).toHaveLength(6);
    expect(report?.lastUpdated).toBe(sb.lastUpdated);
  });

  it('handles tentative or unscheduled events with a clear message and no guesswork', () => {
    const unscheduledEvent = {
      slug: 'tba-event',
      name: 'Unscheduled Test Cup',
      sport: 'Motorsport',
      venueCity: 'Tokyo',
      venueCountry: 'Japan',
      hostTimezone: 'Asia/Tokyo',
      scheduledStartIso: '',
      isScheduled: false,
      lastUpdated: '2026-11-20',
      description: 'Test event awaiting confirmation',
    };

    const report = generateSportsEventReport(unscheduledEvent, 'united-kingdom');
    expect(report?.isScheduled).toBe(false);
    expect(report?.tentativeMessage).toContain('tentative');
    expect(report?.targetCountryTimeFormatted).toBe('Date not announced');
  });
});
