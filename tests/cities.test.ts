import { describe, it, expect } from 'vitest';
import { generateCityTimeReport } from '../lib/cityTime';
import { getPlaceBySlug } from '../lib/places';
import top300Cities from '../data/top300Cities.json';

describe('City Time Reports and Quality Rules', () => {
  it('generates a complete report for London with accurate offsets and difference to 6 hubs', () => {
    const london = getPlaceBySlug('london');
    expect(london).toBeDefined();
    if (!london) return;

    const report = generateCityTimeReport(london);
    expect(report.displayName).toContain('London');
    expect(report.utcOffsetStr).toMatch(/UTC[+-]\d{2}:\d{2}/);
    expect(report.differencesFromMajor).toHaveLength(6);
    expect(report.relatedLinks.length).toBeGreaterThanOrEqual(1);
    expect(report.relatedLinks.length).toBeLessThanOrEqual(6);
    expect(report.wordCount).toBeGreaterThan(250);
    expect(report.isIndexable).toBe(true);
  });

  it('guarantees every one of the 300 cities has over 250 words of rich content', () => {
    let indexableCount = 0;
    let noindexCount = 0;

    for (const slug of top300Cities) {
      const city = getPlaceBySlug(slug);
      expect(city).toBeDefined();
      if (!city) continue;

      const report = generateCityTimeReport(city);
      if (report.wordCount >= 250) {
        indexableCount++;
      } else {
        noindexCount++;
      }
    }

    expect(indexableCount).toBe(300);
    expect(noindexCount).toBe(0);
  });
});
