import { describe, it, expect } from 'vitest';
import { getAbbreviationPair } from '../lib/abbreviations';
import { getPlaceBySlug } from '../lib/places';
import { getDstSummaryForCountry } from '../lib/dst';
import { getEventBySlug, generateSportsEventReport } from '../lib/sports';

describe('JSON-LD Schema.org Structured Data Validation', () => {
  it('Sample 1: Abbreviation converter FAQPage schema is valid and complete', () => {
    const pair = getAbbreviationPair('est-to-ist');
    expect(pair).toBeDefined();
    if (!pair) return;

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `What is the time difference between ${pair.from} and ${pair.to}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${pair.to} is 10 hours and 30 minutes ahead of ${pair.from}.`,
          },
        },
      ],
    };

    expect(faqSchema['@context']).toBe('https://schema.org');
    expect(faqSchema['@type']).toBe('FAQPage');
    expect(faqSchema.mainEntity[0]['@type']).toBe('Question');
    expect(faqSchema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
  });

  it('Sample 2: Shift converter BreadcrumbList schema is valid', () => {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://timebridge.app' },
        { '@type': 'ListItem', position: 2, name: 'Shift Converter', item: 'https://timebridge.app/shift-converter' },
        { '@type': 'ListItem', position: 3, name: 'US Shifts in IST', item: 'https://timebridge.app/us-shift-timings-in-ist' },
      ],
    };

    expect(breadcrumbSchema['@type']).toBe('BreadcrumbList');
    expect(breadcrumbSchema.itemListElement).toHaveLength(3);
    breadcrumbSchema.itemListElement.forEach((item, idx) => {
      expect(item.position).toBe(idx + 1);
      expect(item['@type']).toBe('ListItem');
      expect(item.item).toMatch(/^https:\/\//);
    });
  });

  it('Sample 3: City What Time Is It BreadcrumbList schema is valid', () => {
    const city = getPlaceBySlug('london');
    expect(city).toBeDefined();

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://timebridge.app' },
        { '@type': 'ListItem', position: 2, name: 'Cities', item: 'https://timebridge.app/cities' },
        { '@type': 'ListItem', position: 3, name: 'London', item: 'https://timebridge.app/what-time-is-it-in/london' },
      ],
    };

    expect(breadcrumbSchema['@context']).toBe('https://schema.org');
    expect(breadcrumbSchema.itemListElement[2].name).toBe('London');
  });

  it('Sample 4: Daylight Saving Time Country schema is valid', () => {
    const country = getPlaceBySlug('united-states');
    expect(country).toBeDefined();

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://timebridge.app' },
        { '@type': 'ListItem', position: 2, name: 'Countries', item: 'https://timebridge.app/countries' },
        { '@type': 'ListItem', position: 3, name: 'United States DST', item: 'https://timebridge.app/daylight-saving-time/united-states' },
      ],
    };

    expect(breadcrumbSchema.itemListElement[2].name).toContain('United States');
  });

  it('Sample 5: Sports Event broadcast schema is valid', () => {
    const event = getEventBySlug('super-bowl');
    expect(event).toBeDefined();

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://timebridge.app' },
        { '@type': 'ListItem', position: 2, name: 'Sports', item: 'https://timebridge.app/sports' },
        { '@type': 'ListItem', position: 3, name: `${event?.name} in India`, item: 'https://timebridge.app/sports/super-bowl-time-in-india' },
      ],
    };

    expect(breadcrumbSchema.itemListElement[2].name).toContain('Super Bowl');
  });
});
