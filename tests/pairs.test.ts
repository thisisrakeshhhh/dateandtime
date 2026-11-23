import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { getPlaceBySlug, getPopularPairs } from '../lib/places';
import { calculateTimeDifference, calculateBestTimeToCall } from '../lib/time';
import { calculateDistance } from '../lib/distance';
import { generatePairArticle, generatePairFaqs, getConsistentExampleSentence } from '../lib/seo';

describe('Pair Page Time Logic and Example Sentence Consistency', () => {
  it('example sentence matches the calculated time difference exactly', () => {
    const testPairs = [
      { from: 'new-york', to: 'london' },
      { from: 'london', to: 'tokyo' },
      { from: 'san-francisco', to: 'new-york' },
      { from: 'delhi', to: 'london' },
      { from: 'london', to: 'delhi' },
      { from: 'sydney', to: 'auckland' },
      { from: 'paris', to: 'berlin' },
      { from: 'dubai', to: 'singapore' },
      { from: 'los-angeles', to: 'tokyo' },
      { from: 'chicago', to: 'london' },
    ];

    for (const item of testPairs) {
      const placeA = getPlaceBySlug(item.from);
      const placeB = getPlaceBySlug(item.to);
      expect(placeA).toBeDefined();
      expect(placeB).toBeDefined();
      if (!placeA || !placeB) continue;

      const diff = calculateTimeDifference(
        placeA.timezone,
        placeB.timezone,
        placeA.lat,
        placeA.lng,
        placeB.lat,
        placeB.lng,
        undefined,
        placeA.name,
        placeB.name
      );

      const example = getConsistentExampleSentence(placeA, placeB, diff);
      expect(example.sentence).toContain(`When it is 12:00 PM in ${placeA.name}, it is`);
      expect(example.sentence).toContain(`in ${placeB.name}`);

      // Verify mathematical time difference:
      // Reference time in A is 12:00 PM on reference date
      const refA = DateTime.fromObject({ year: 2026, month: 1, day: 15, hour: 12, minute: 0 }, { zone: placeA.timezone });
      const offsetA = refA.offset;
      const offsetB = DateTime.fromObject({ year: 2026, month: 1, day: 15, hour: 12, minute: 0 }, { zone: placeB.timezone }).offset;
      const expectedDiffMins = offsetB - offsetA;
      const expectedTimeB = refA.plus({ minutes: expectedDiffMins }).toFormat('h:mm a');

      expect(example.timeBStr).toBe(expectedTimeB);
      if (diff.isSameTime) {
        expect(example.sentence).toContain(`When it is 12:00 PM in ${placeA.name}, it is also 12:00 PM in ${placeB.name}`);
      } else {
        expect(example.sentence).toContain(`When it is 12:00 PM in ${placeA.name}, it is ${expectedTimeB} in ${placeB.name}`);
      }
    }
  });

  it('pair articles have >= 300 words of content and no Place A / Place B placeholders', () => {
    const pairs = getPopularPairs().filter((p) => p.tier === 1).slice(0, 20);

    for (const p of pairs) {
      const placeA = getPlaceBySlug(p.from);
      const placeB = getPlaceBySlug(p.to);
      if (!placeA || !placeB) continue;

      const diff = calculateTimeDifference(
        placeA.timezone,
        placeB.timezone,
        placeA.lat,
        placeA.lng,
        placeB.lat,
        placeB.lng,
        undefined,
        placeA.name,
        placeB.name
      );
      const bestTime = calculateBestTimeToCall(
        placeA.timezone,
        placeB.timezone,
        placeA.name,
        placeB.name,
        placeA.lat,
        placeA.lng,
        placeB.lat,
        placeB.lng
      );
      const dist = calculateDistance(placeA.lat, placeA.lng, placeB.lat, placeB.lng);

      const article = generatePairArticle(placeA, placeB, diff, bestTime, dist);
      expect(article.wordCount).toBeGreaterThanOrEqual(300);

      const fullText = article.paragraphs.join(' ');
      expect(fullText).not.toContain('Place A');
      expect(fullText).not.toContain('Place B');
      expect(fullText).not.toContain('(United States)');
      expect(fullText).not.toContain('(India)');
    }
  });

  it('pair FAQs have valid non-empty questions and complete answers', () => {
    const placeA = getPlaceBySlug('new-york')!;
    const placeB = getPlaceBySlug('london')!;
    const diff = calculateTimeDifference(
      placeA.timezone,
      placeB.timezone,
      placeA.lat,
      placeA.lng,
      placeB.lat,
      placeB.lng,
      undefined,
      placeA.name,
      placeB.name
    );
    const bestTime = calculateBestTimeToCall(
      placeA.timezone,
      placeB.timezone,
      placeA.name,
      placeB.name,
      placeA.lat,
      placeA.lng,
      placeB.lat,
      placeB.lng
    );
    const dist = calculateDistance(placeA.lat, placeA.lng, placeB.lat, placeB.lng);

    const faqs = generatePairFaqs(placeA, placeB, diff, bestTime, dist);
    expect(faqs.length).toBeGreaterThanOrEqual(4);

    for (const faq of faqs) {
      expect(faq.question.trim().length).toBeGreaterThan(10);
      expect(faq.answer.trim().length).toBeGreaterThan(20);
      expect(faq.question).not.toContain('Place A');
      expect(faq.answer).not.toContain('Place B');
    }
  });
});
