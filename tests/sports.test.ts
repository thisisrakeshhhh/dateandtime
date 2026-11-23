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
    // Broadcaster fallback notice
    expect(report?.localBroadcasters).toBe('Broadcasters vary by country and year. Check your local listings.');
    expect(report?.faqs.find((f) => f.question.includes('broadcast'))?.answer).toBe(
      'Broadcasters vary by country and year. Check your local listings.'
    );
  });

  it('enforces timePrecision field rules: Masters, Kentucky Derby, Boston Marathon, Tour de France, and LA28 must be approx or date-only', () => {
    const masters = getEventBySlug('masters-tournament-final-round');
    expect(['approx', 'date-only']).toContain(masters?.timePrecision);

    const derby = getEventBySlug('kentucky-derby');
    expect(['approx', 'date-only']).toContain(derby?.timePrecision);

    const boston = getEventBySlug('boston-marathon');
    expect(['approx', 'date-only']).toContain(boston?.timePrecision);

    const tdf = getEventBySlug('tour-de-france-final');
    expect(['approx', 'date-only']).toContain(tdf?.timePrecision);

    const la28 = getEventBySlug('summer-olympics-opening-ceremony');
    expect(['approx', 'date-only']).toContain(la28?.timePrecision);

    if (masters) {
      const report = generateSportsEventReport(masters, 'united-states');
      expect(report?.timePrecisionLabel).toBe('Start time is approximate');
      expect(report?.calendarShiftText).toContain('Start time is approximate');
      expect(report?.faqs[0].answer).toContain('Start time is approximate');
    }
  });

  it('verifies ICC Cricket World Cup Final and Monaco Grand Prix are set to TBC (noindex)', () => {
    const monaco = getEventBySlug('monaco-grand-prix');
    expect(monaco?.status).toBe('tbc');
    expect(monaco?.isScheduled).toBe(false);
    expect(monaco?.scheduledStartIso).toBe('');
    expect(monaco?.evidence?.found).toBe(false);

    const cwc = getEventBySlug('icc-cricket-world-cup-final');
    expect(cwc?.status).toBe('tbc');
    expect(cwc?.isScheduled).toBe(false);
    expect(cwc?.scheduledStartIso).toBe('');
    expect(cwc?.evidence?.found).toBe(false);

    const monacoReport = generateSportsEventReport(monaco!, 'united-states');
    expect(monacoReport?.isConfirmed).toBe(false);
    expect(monacoReport?.targetCountryTimeFormatted).toBe('Schedule TBC');

    const cwcReport = generateSportsEventReport(cwc!, 'india');
    expect(cwcReport?.isConfirmed).toBe(false);
    expect(cwcReport?.targetCountryTimeFormatted).toBe('Schedule TBC');
  });

  it('requires official date evidence to be confirmed and indexed', () => {
    const confirmedEvents = getConfirmedEvents();
    expect(confirmedEvents.length).toBe(13); // exactly 13 confirmed events
    for (const ev of confirmedEvents) {
      expect(ev.status).toBe('confirmed');
      expect(ev.isScheduled).toBe(true);
      expect(ev.evidence).toBeDefined();
      expect(ev.evidence.found).toBe(true);
      expect(ev.evidence.dateText.length).toBeGreaterThan(0);
      expect(ev.evidence.pageUrl.startsWith('https://')).toBe(true);
    }
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
      timePrecision: 'exact',
      status: 'confirmed',
      isScheduled: true,
      evidence: {
        found: true,
        dateText: '12 July 2026',
        pageUrl: 'https://example.com/archive',
        checkDate: '2026-11-23',
      },
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
});
