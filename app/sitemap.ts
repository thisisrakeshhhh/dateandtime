import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';
import { getCountries, getPopularPairs } from '@/lib/places';
import { getAllAbbreviationPairs } from '@/lib/abbreviations';
import { getAllEvents } from '@/lib/sports';
import top300Cities from '@/data/top300Cities.json';

export function getActiveWave(): number {
  const envVal = process.env.INDEX_WAVE;
  const parsed = parseInt(envVal || '1', 10);
  return isNaN(parsed) || parsed < 1 ? 1 : parsed > 3 ? 3 : parsed;
}

export async function generateSitemaps() {
  const wave = getActiveWave();
  // Wave 1 includes: pair (corridors), converter, shift, confirmed sports, core
  const sitemaps: Array<{ id: string }> = [
    { id: 'core' },
    { id: 'corridors' },
    { id: 'converters' },
    { id: 'shifts' },
    { id: 'sports' },
  ];

  // Wave 2 adds cities
  if (wave >= 2) {
    sitemaps.push({ id: 'cities' });
  }

  // Wave 3 adds countries and DST pages
  if (wave >= 3) {
    sitemaps.push({ id: 'countries' });
  }

  return sitemaps;
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl;
  const now = new Date();
  const wave = getActiveWave();

  // Wave filtering guard: pages outside current wave return empty array
  if (id === 'cities' && wave < 2) return [];
  if (id === 'countries' && wave < 3) return [];

  // 1. Core & Hub Pages
  if (id === 'core') {
    return [
      { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/all-corridors`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/cities`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/countries`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/converter`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/shift-converter`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/jet-lag-calculator`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/sports`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    ];
  }

  // 2. Corridors (Tier 1 Primary Direction Only)
  if (id === 'corridors') {
    const popularPairs = getPopularPairs();
    const tier1Pairs = popularPairs.filter((p) => p.tier === 1);
    return tier1Pairs.map((pair) => ({
      url: `${baseUrl}/time-difference/${pair.from}-to-${pair.to}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    }));
  }

  // 3. Top 300 Cities (What Time Is It In) - Wave 2+
  if (id === 'cities' && wave >= 2) {
    return top300Cities.map((slug) => ({
      url: `${baseUrl}/what-time-is-it-in/${slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  }

  // 4. Countries and Daylight Saving Time - Wave 3
  if (id === 'countries' && wave >= 3) {
    const countries = getCountries();
    const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
      url: `${baseUrl}/country/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    const dstPages: MetadataRoute.Sitemap = countries.map((c) => ({
      url: `${baseUrl}/daylight-saving-time/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    return [...countryPages, ...dstPages];
  }

  // 5. Abbreviation Converters
  if (id === 'converters') {
    const abbreviationPairs = getAllAbbreviationPairs();
    return abbreviationPairs.map((pair) => ({
      url: `${baseUrl}/converter/${pair.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  }

  // 6. Shifts
  if (id === 'shifts') {
    return [
      { url: `${baseUrl}/us-shift-timings-in-ist`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/uk-shift-timings-in-ist`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ];
  }

  // 7. Sports Events (Confirmed Schedules with Verified Sources Only)
  if (id === 'sports') {
    const events = getAllEvents().filter(
      (e) =>
        Boolean(e.isScheduled) &&
        Boolean(e.scheduledStartIso) &&
        Boolean(e.sourceUrl) &&
        new Date(e.scheduledStartIso).getTime() > Date.now()
    );
    return events.map((e) => ({
      url: `${baseUrl}/sports/${e.slug}-time-in-united-states`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  }

  return [];
}
