import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';
import { getCountries, getPopularPairs } from '@/lib/places';
import { getAllAbbreviationPairs } from '@/lib/abbreviations';
import { getAllEvents } from '@/lib/sports';
import top300Cities from '@/data/top300Cities.json';

export async function generateSitemaps() {
  return [
    { id: 'core' },
    { id: 'corridors' },
    { id: 'cities' },
    { id: 'countries' },
    { id: 'converters' },
    { id: 'shifts' },
    { id: 'sports' },
  ];
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl;
  const now = new Date();

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

  // 2. Corridors (Time Difference & Best Time to Call)
  if (id === 'corridors') {
    const popularPairs = getPopularPairs();
    const timeDiffs: MetadataRoute.Sitemap = popularPairs.map((pair) => ({
      url: `${baseUrl}/time-difference/${pair.from}-to-${pair.to}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    }));
    const callPlanners: MetadataRoute.Sitemap = popularPairs.map((pair) => ({
      url: `${baseUrl}/best-time-to-call/${pair.to}-from-${pair.from}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    }));
    return [...timeDiffs, ...callPlanners];
  }

  // 3. Top 300 Cities (What Time Is It In)
  if (id === 'cities') {
    return top300Cities.map((slug) => ({
      url: `${baseUrl}/what-time-is-it-in/${slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  }

  // 4. Countries and Daylight Saving Time
  if (id === 'countries') {
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

  // 7. Sports Events
  if (id === 'sports') {
    const events = getAllEvents();
    const topCountries = ['united-states', 'united-kingdom', 'india', 'australia', 'canada', 'germany', 'france', 'japan'];
    const sportsPages: MetadataRoute.Sitemap = [];

    for (const e of events) {
      for (const c of topCountries) {
        sportsPages.push({
          url: `${baseUrl}/sports/${e.slug}-time-in-${c}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
    return sportsPages;
  }

  return [];
}
