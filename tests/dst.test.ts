import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { getNextClockChange, getLastClockChange, getDstSummaryForCountry } from '../lib/dst';

describe('Daylight Saving Time (DST) Transitions calculation', () => {
  it('correctly detects US Eastern DST transitions', () => {
    // Reference date: Jan 15, 2026 (Winter EST)
    const winterRef = DateTime.fromISO('2026-01-15T12:00:00Z');
    const nextChange = getNextClockChange('America/New_York', winterRef);

    expect(nextChange).not.toBeNull();
    expect(nextChange?.type).toBe('forward'); // Spring forward in March
    expect(nextChange?.date).toContain('2026-03');
    expect(nextChange?.shiftMinutes).toBe(60);

    // Reference date: July 15, 2026 (Summer EDT)
    const summerRef = DateTime.fromISO('2026-07-15T12:00:00Z');
    const fallBack = getNextClockChange('America/New_York', summerRef);
    expect(fallBack).not.toBeNull();
    expect(fallBack?.type).toBe('backward'); // Fall back in Nov
    expect(fallBack?.date).toContain('2026-11');
    expect(fallBack?.shiftMinutes).toBe(-60);
  });

  it('reports null transitions for non-DST countries (e.g. India, Japan)', () => {
    const ref = DateTime.fromISO('2026-05-01T12:00:00Z');
    const nextIndia = getNextClockChange('Asia/Kolkata', ref);
    expect(nextIndia).toBeNull();

    const summary = getDstSummaryForCountry('Asia/Kolkata', 'India', ref);
    expect(summary.observesDst).toBe(false);
    expect(summary.nextChange).toBeNull();
  });

  it('computes 3 popular pair seasonal effects', () => {
    const summary = getDstSummaryForCountry('America/New_York', 'United States');
    expect(summary.popularPairEffects).toHaveLength(3);
    expect(summary.popularPairEffects[0].pairLabel).toContain('United Kingdom');
    expect(summary.popularPairEffects[1].pairLabel).toContain('India');
    expect(summary.popularPairEffects[2].pairLabel).toContain('Australia');
  });
});
