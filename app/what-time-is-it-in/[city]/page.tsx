import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPlaceBySlug, formatPlaceWithZone } from '@/lib/places';
import { generateCityTimeReport } from '@/lib/cityTime';
import top300Cities from '@/data/top300Cities.json';
import CityTimeClient from '@/components/CityTimeClient';
import { ChevronRight, Home } from 'lucide-react';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return top300Cities.map((slug) => ({
    city: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const place = getPlaceBySlug(citySlug);
  if (!place || place.type !== 'city') {
    return { title: 'City Time Not Found | TimeBridge' };
  }

  const report = generateCityTimeReport(place);
  const locationLabel = formatPlaceWithZone(place);

  return {
    title: `What Time is it in ${locationLabel}? Live Clock & Time Difference`,
    description: `Current local time in ${locationLabel}. Exact sunrise, sunset, UTC offset (${report.utcOffsetStr}), daylight saving status, and time differences to London, New York and Tokyo.`,
    robots: {
      index: report.isIndexable,
      follow: true,
    },
    alternates: {
      canonical: `https://timebridge.app/what-time-is-it-in/${place.slug}`,
    },
  };
}

export default async function WhatTimeIsInCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const place = getPlaceBySlug(citySlug);
  if (!place || place.type !== 'city') {
    notFound();
  }

  const report = generateCityTimeReport(place);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://timebridge.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cities',
        item: 'https://timebridge.app/cities',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: place.name,
        item: `https://timebridge.app/what-time-is-it-in/${place.slug}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted">
          <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <Link href="/cities" className="hover:text-foreground transition-colors">
            Cities
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <span className="text-foreground font-medium">{place.name}</span>
        </nav>

        {/* Client Live Time Component */}
        <CityTimeClient report={report} />
      </div>
    </main>
  );
}
