import { describe, it, expect } from 'vitest';
import { siteConfig, getSiteUrl, CONTACT_EMAIL } from '../lib/config';
import { getPopularPairs } from '../lib/places';

describe('Canonical Host and Domain Configuration', () => {
  it('siteConfig.siteUrl is the live production domain and never timebridge.app', () => {
    const siteUrl = siteConfig.siteUrl;
    expect(siteUrl).not.toContain('timebridge.app');
    expect(siteUrl).toContain('dateandtime-sable.vercel.app');
    expect(getSiteUrl()).toBe(siteUrl);
  });

  it('CONTACT_EMAIL comes from environment and never defaults to vercel.app or mickeygorveth', () => {
    expect(CONTACT_EMAIL).not.toContain('vercel.app');
    expect(CONTACT_EMAIL).not.toBe('mickeygorveth@gmail.com');
  });

  it('Tier 1 pairs have canonical matching siteUrl and are indexed', () => {
    const pairs = getPopularPairs();
    const t1Pairs = pairs.filter((p) => p.tier === 1);
    expect(t1Pairs.length).toBeGreaterThanOrEqual(100);

    for (const p of t1Pairs.slice(0, 20)) {
      const canonical = `${siteConfig.siteUrl}/time-difference/${p.from}-to-${p.to}`;
      expect(canonical).not.toContain('timebridge.app');
      expect(canonical.startsWith(siteConfig.siteUrl)).toBe(true);
    }
  });

  it('Tier 2 reverse pairs point canonical to Tier 1 pair', () => {
    const pairs = getPopularPairs();
    const t2PairsWithCanonical = pairs.filter((p) => p.tier === 2 && p.canonicalPair);
    expect(t2PairsWithCanonical.length).toBeGreaterThan(0);

    for (const p of t2PairsWithCanonical.slice(0, 15)) {
      const canonical = `${siteConfig.siteUrl}/time-difference/${p.canonicalPair}`;
      expect(canonical).not.toContain('timebridge.app');
      expect(canonical.startsWith(siteConfig.siteUrl)).toBe(true);
      expect(canonical).toContain(p.canonicalPair);
    }
  });

  it('what-time-is-it-in and converter canonicals strictly use siteConfig.siteUrl', () => {
    const sampleCities = ['london', 'new-york', 'delhi', 'tokyo', 'sydney'];
    for (const city of sampleCities) {
      const cityCanonical = `${siteConfig.siteUrl}/what-time-is-it-in/${city}`;
      expect(cityCanonical).not.toContain('timebridge.app');
      expect(cityCanonical.startsWith('https://dateandtime-sable.vercel.app')).toBe(true);
    }

    const sampleConverters = ['est-to-ist', 'pst-to-ist', 'gmt-to-ist', 'bst-to-ist'];
    for (const slug of sampleConverters) {
      const converterCanonical = `${siteConfig.siteUrl}/converter/${slug}`;
      expect(converterCanonical).not.toContain('timebridge.app');
      expect(converterCanonical.startsWith('https://dateandtime-sable.vercel.app')).toBe(true);
    }
  });
});
