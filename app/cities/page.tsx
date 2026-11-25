import type { Metadata } from 'next';
import Link from 'next/link';
import { getCities } from '@/lib/places';
import { siteConfig } from '@/lib/config';
import { buildPageMetadata } from '@/lib/seo';
import CitiesDirectoryClient from '@/components/CitiesDirectoryClient';
import { ChevronRight, Home, Globe } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: `World Cities Live Clocks Directory | ${siteConfig.name}`,
  description: 'Search and browse live local times, weather, UTC offsets, and sunset hours across hundreds of major international cities.',
  canonical: `${siteConfig.siteUrl}/cities`,
});

export default function CitiesHubPage() {
  const cities = getCities();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cities',
        item: `${siteConfig.siteUrl}/cities`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted">
          <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <span className="text-foreground font-medium">Cities</span>
        </nav>

        {/* Header */}
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            <Globe className="w-3.5 h-3.5" />
            City Clocks
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
            World Cities Directory
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl">
            Look up real-time clocks, sun position, local weather, and mutual calling overlaps for global metropolitan centers.
          </p>
        </div>

        {/* Directory Client */}
        <CitiesDirectoryClient cities={cities} />
      </div>
    </main>
  );
}
