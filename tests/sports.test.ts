import { describe, it, expect } from 'vitest';
import { getAllEvents, getEventBySlug, generateSportsEventReport, getConfirmedEvents } from '../lib/sports';

describe('Sports and Global Events Start Times', () => {
  it('contains recurring sporting events with finished events removed', () => {
    const events = getAllEvents();
    expect(events.length).toBe(18);
    // Verified: finished events (FIFA World Cup 2026, Milano Cortina 2026) are deleted
    expect(getEventBySlug('fifa-world-cup-final')).toBeUndefined();
    expect(getEventBySlug('winter-olympics-opening-ceremony')).toBeUndefined();
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
    expect(report?.majorAudiences).toHaveLength(5);
    expect(report?.dayDifference).toBe(1);
    expect(report?.calendarShiftText).toContain('Next-Day Calendar Shift');
    expect(report?.lastUpdated).toBe(sb.lastUpdated);
  });

  it('handles tentative or unscheduled events with a clear TBC message and no guesswork', () => {
    const unscheduledEvent = {
      slug: 'tba-event',
      name: 'Unscheduled Test Cup',
      sport: 'Motorsport',
      venueCity: 'Tokyo',
      venueCountry: 'Japan',
      hostTimezone: 'Asia/Tokyo',
      scheduledStartIso: '',
      status: 'tbc' as const,
      isScheduled: false,
      lastUpdated: '2026-11-20',
      description: 'Test event awaiting confirmation',
    };

    const report = generateSportsEventReport(unscheduledEvent, 'united-kingdom');
    expect(report?.isScheduled).toBe(false);
    expect(report?.isConfirmed).toBe(false);
    expect(report?.tentativeMessage).toContain('TBC');
    expect(report?.targetCountryTimeFormatted).toBe('Schedule TBC');
  });

  it('confirms TBC status for IPL, NBA Finals Game 1, ICC CWC and Monaco GP', () => {
    const ipl = getEventBySlug('ipl-final');
    expect(ipl?.status).toBe('tbc');
    expect(ipl?.isScheduled).toBe(false);

    const nba = getEventBySlug('nba-finals-game-1');
    expect(ipl?.status).toBe('tbc');
    expect(nba?.isScheduled).toBe(false);

    const cwc = getEventBySlug('icc-cricket-world-cup-final');
    expect(cwc?.status).toBe('tbc');
    expect(cwc?.isScheduled).toBe(false);

    const monaco = getEventBySlug('monaco-grand-prix');
    expect(monaco?.status).toBe('tbc');
    expect(monaco?.isScheduled).toBe(false);
  });
});
