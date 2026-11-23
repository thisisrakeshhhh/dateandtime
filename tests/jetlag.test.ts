import { describe, it, expect } from 'vitest';
import { calculateJetLagPlan } from '../lib/jetlag';
import { getPlaceBySlug } from '../lib/places';

describe('Jet Lag Calculator', () => {
  it('correctly calculates flight time, arrival time and adaptation tips for New York to London', () => {
    const ny = getPlaceBySlug('new-york');
    const london = getPlaceBySlug('london');
    expect(ny).toBeDefined();
    expect(london).toBeDefined();
    if (!ny || !london) return;

    // Depart New York at 18:00 (6:00 PM) with 7-hour flight
    const plan = calculateJetLagPlan(ny, london, '2026-11-20T18:00', 7);

    // 18:00 NY = 23:00 UTC. +7h flight = 06:00 UTC next day = 06:00 AM London
    expect(plan.arrivalLocal.toFormat('hh:mm a')).toBe('06:00 AM');
    expect(plan.arrivalLocal.day).toBe(21);
    expect(plan.isEastward).toBe(true);
    expect(plan.timeDiffFormatted).toContain('ahead');
    expect(plan.adaptationDays).toBeGreaterThanOrEqual(3);
    expect(plan.tips.preFlight.length).toBeGreaterThan(0);
    expect(plan.tips.postFlightDay1[0]).toContain('morning');
  });

  it('correctly calculates westward travel (London to New York)', () => {
    const ny = getPlaceBySlug('new-york');
    const london = getPlaceBySlug('london');
    if (!ny || !london) return;

    // Depart London at 10:00 AM with 8-hour flight
    const plan = calculateJetLagPlan(london, ny, '2026-11-20T10:00', 8);

    // 10:00 GMT + 8h flight = 18:00 GMT = 13:00 (1:00 PM) NY time
    expect(plan.arrivalLocal.toFormat('hh:mm a')).toBe('01:00 PM');
    expect(plan.isEastward).toBe(false);
    expect(plan.timeDiffFormatted).toContain('behind');
    expect(plan.tips.postFlightDay1[0]).toContain('afternoon');
  });
});
