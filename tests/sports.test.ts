import { describe, it, expect } from 'vitest';
import {
  getAllEvents,
  getEventBySlug,
  generateSportsEventReport,
  getConfirmedEvents,
  isEventPast,
  SportsEvent,
} from '../lib/sports';

describe('Sports and Global Events Start Times', () => {
  it('contains recurring sporting events with finished events removed', () => {
    const events = getAllEvents();
    expect(events.length).toBe(18);
    // Finished events from prior years are deleted
    expect(getEventBySlug('fifa-world-cup-final')).toBeUndefined();
    expect(getEventBySlug('winter-olympics-opening-ceremony')).toBeUndefined();
  });

  it('accurately converts Super Bowl kickoff into India Standard Time (IST) and uses fallback broadcaster note', () => {
    const sb = getEventBySlug('super-bowl');
    expect(sb).toBeDefined();
    if (!sb) return;

    const report = generateSportsEventReport(sb, 'india');
    expect(report).not.toBeNull();
    expect(report?.isScheduled).toBe(true);
    expect(report?.isConfirmed).toBe(true);
    expect(report?.isPast).toBe(false);
    expect(report?.targetCountry.name).toBe('India');
    // 15:30 PST = 23:30 UTC = 05:00 AM IST next morning
    expect(report?.targetCountryTimeFormatted).toBe('5:00 AM');
    expect(report?.majorAudiences).toHaveLength(5);
    expect(report?.dayDifference).toBe(1);
    expect(report?.calendarShiftText).toContain('Next-Day Calendar Shift');
    // Requirement 4: Broadcaster fallback notice
    expect(report?.localBroadcasters).toBe('Broadcasters vary by country and year. Check your local listings.');
    expect(report?.faqs.find((f) => f.question.includes('broadcast'))?.answer).toBe(
      'Broadcasters vary by country and year. Check your local listings.'
    );
  });

  it('handles tentative or unscheduled events with a clear TBC message and no guesswork', () => {
    const unscheduledEvent: SportsEvent = {
      slug: 'tba-event',
      name: 'Unscheduled Test Cup',
      sport: 'Motorsport',
      venueCity: 'Tokyo',
      venueCountry: 'Japan',
      hostTimezone: 'Asia/Tokyo',
      scheduledStartIso: '',
      status: 'tbc',
      isScheduled: false,
      lastUpdated: '2026-11-20',
      description: 'Test event awaiting confirmation',
    };

    const report = generateSportsEventReport(unscheduledEvent, 'united-kingdom');
    expect(report?.isScheduled).toBe(false);
    expect(report?.isConfirmed).toBe(false);
    expect(report?.isPast).toBe(false);
    expect(report?.tentativeMessage).toContain('TBC');
    expect(report?.targetCountryTimeFormatted).toBe('Schedule TBC');
    expect(report?.localBroadcasters).toBe('Broadcasters vary by country and year. Check your local listings.');
  });

  it('automatically classifies past events as finished, excludes them from sitemap and marks noindex', () => {
    // Reference date: November 23, 2026
    const today = new Date('2026-11-23T12:00:00Z');

    const pastEvent: SportsEvent = {
      slug: 'past-championship-2026',
      name: 'Past World Championship 2026',
      sport: 'Tennis',
      venueCity: 'London',
      venueCountry: 'United Kingdom',
      hostTimezone: 'Europe/London',
      scheduledStartIso: '2026-07-12T14:00:00', // Past event (July 2026 is before November 2026)
      status: 'confirmed',
      isScheduled: true,
      lastUpdated: '2026-07-13',
      lastChecked: '2026-07-13',
      source: 'Official Archive',
      sourceUrl: 'https://example.com/archive',
      description: 'The concluded 2026 championship final.',
    };

    // 1. isEventPast rule in code detects past date
    expect(isEventPast(pastEvent, today)).toBe(true);

    // 2. Report marks isPast: true, isConfirmed: false, isScheduled: false
    const report = generateSportsEventReport(pastEvent, 'united-states', today);
    expect(report).not.toBeNull();
    expect(report?.isPast).toBe(true);
    expect(report?.isConfirmed).toBe(false);
    expect(report?.isScheduled).toBe(false);

    // 3. Renders clear "This event has finished" note
    expect(report?.finishedMessage).toContain('This event has finished');
    expect(report?.calendarShiftText).toContain('This event has finished');
    expect(report?.faqs[0].answer).toContain('This event has finished');

    // 4. Broadcasters note applied
    expect(report?.localBroadcasters).toBe('Broadcasters vary by country and year. Check your local listings.');
  });

  it('confirms TBC status for IPL, NBA Finals Game 1, and ICC T20 World Cup', () => {
    const ipl = getEventBySlug('ipl-final');
    expect(ipl?.status).toBe('tbc');
    expect(ipl?.isScheduled).toBe(false);

    const nba = getEventBySlug('nba-finals-game-1');
    expect(nba?.status).toBe('tbc');
    expect(nba?.isScheduled).toBe(false);

    const t20 = getEventBySlug('icc-t20-world-cup-final');
    expect(t20?.status).toBe('tbc');
    expect(t20?.isScheduled).toBe(false);
  });

  it('confirms scheduled dates and verified sources for Monaco GP and ICC Cricket World Cup Final', () => {
    const monaco = getEventBySlug('monaco-grand-prix');
    expect(monaco?.status).toBe('confirmed');
    expect(monaco?.isScheduled).toBe(true);
    expect(monaco?.scheduledStartIso).toBe('2027-06-06T15:00:00');
    expect(monaco?.sourceUrl).toBe('https://www.formula1.com/');

    const cwc = getEventBySlug('icc-cricket-world-cup-final');
    expect(cwc?.status).toBe('confirmed');
    expect(cwc?.isScheduled).toBe(true);
    expect(cwc?.scheduledStartIso).toBe('2027-11-21T13:30:00');
    expect(cwc?.sourceUrl).toBe('https://www.icc-cricket.com/');
  });
});
