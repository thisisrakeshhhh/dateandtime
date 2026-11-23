import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/config';
import { getActiveWave } from '@/app/sitemap';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = siteConfig.siteUrl;
  const wave = getActiveWave();

  const subSitemaps = [
    `${baseUrl}/sitemap/core.xml`,
    `${baseUrl}/sitemap/corridors.xml`,
    `${baseUrl}/sitemap/converters.xml`,
    `${baseUrl}/sitemap/shifts.xml`,
    `${baseUrl}/sitemap/sports.xml`,
  ];

  if (wave >= 2) {
    subSitemaps.push(`${baseUrl}/sitemap/cities.xml`);
  }
  if (wave >= 3) {
    subSitemaps.push(`${baseUrl}/sitemap/countries.xml`);
  }

  const nowIso = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${subSitemaps
  .map(
    (url) => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${nowIso}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
