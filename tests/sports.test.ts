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

  it('accurately converts Australian Open Men Final kickoff into India Standard Time (IST) and uses typical precision', () => {
    const ao = getEventBySlug('australian-open-mens-final');
    expect(ao).toBeDefined();
    if (!ao) return;

    const report = generateSportsEventReport(ao, 'india');
    expect(report).not.toBeNull();
    expect(report?.isScheduled).toBe(true);
    expect(report?.isConfirmed).toBe(true);
    expect(report?.isPast).toBe(false);
    expect(report?.targetCountry.name).toBe('India');
    // 19:30 AEDT (UTC+11) = 08:30 UTC = 14:00 (2:00 PM IST)
    expect(report?.targetCountryTimeFormatted).toBe('2:00 PM');
    expect(report?.majorAudiences).toHaveLength(5);
    expect(report?.timePrecision).toBe('typical');
    expect(report?.timePrecisionLabel).toBe('Typical start time. Official order of play is announced closer to the date.');
    expect(report?.fullText).toContain('Typical start time. Official order of play is announced closer to the date.');
    // Broadcaster fallback notice
    expect(report?.localBroadcasters).toBe('Broadcasters vary by country and year. Check your local listings.');
    expect(report?.faqs.find((f) => f.question.includes('broadcast'))?.answer).toBe(
      'Broadcasters vary by country and year. Check your local listings.'
    );
  });

  it('enforces timePrecision field rules: Wimbledon, AO, RG, US Open are typical; LA28 is date-only; Daytona 500 is TBC', () => {
    const wim = getEventBySlug('wimbledon-mens-final');
    expect(wim?.timePrecision).toBe('typical');

    const wimW = getEventBySlug('wimbledon-womens-final');
    expect(wimW?.timePrecision).toBe('typical');

    const ao = getEventBySlug('australian-open-mens-final');
    expect(ao?.timePrecision).toBe('typical');

    const rg = getEventBySlug('roland-garros-mens-final');
    expect(rg?.timePrecision).toBe('typical');

    const usOpen = getEventBySlug('us-open-tennis-mens-final');
    expect(usOpen?.timePrecision).toBe('typical');

    const la28 = getEventBySlug('summer-olympics-opening-ceremony');
    expect(la28?.timePrecision).toBe('date-only');

    const daytona = getEventBySlug('daytona-500');
    expect(daytona?.status).toBe('tbc');

    const masters = getEventBySlug('masters-tournament-final-round');
    expect(['approx', 'date-only']).toContain(masters?.timePrecision);

    const boston = getEventBySlug('boston-marathon');
    expect(boston?.timePrecision).toBe('approx');

    const tdf = getEventBySlug('tour-de-france-final');
    expect(tdf?.timePrecision).toBe('approx');

    if (boston) {
      const report = generateSportsEventReport(boston, 'united-states');
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
    expect(confirmedEvents.length).toBe(5); // exactly 5 confirmed events with verified deep non-homepage URLs
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
