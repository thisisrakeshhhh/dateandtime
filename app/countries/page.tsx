import type { Metadata } from 'next';
import Link from 'next/link';
import { getCountries, formatPlaceWithZone } from '@/lib/places';
import { siteConfig } from '@/lib/config';
import { buildPageMetadata } from '@/lib/seo';
import { ChevronRight, Home, Globe, Layers, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: `World Countries & Time Zones Directory | ${siteConfig.name}`,
  description: 'Authoritative index of countries and national time zones. Identifies multiple time zones across the US, Canada, Australia, Russia and Brazil.',
  canonical: `${siteConfig.siteUrl}/countries`,
});

export default function CountriesHubPage() {
  const countries = getCountries();

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
        name: 'Countries',
        item: `${siteConfig.siteUrl}/countries`,
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
          <span className="text-foreground font-medium">Countries</span>
        </nav>

        {/* Header */}
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            <Globe className="w-3.5 h-3.5" />
            National Time Zones
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
            World Countries & Time Zones Directory
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl">
            Explore national time zones across {countries.length} sovereign states and territories. Countries spanning multiple time zones detail each regional timezone to avoid single-offset errors.
          </p>
        </div>

        {/* Country Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.map((country) => {
            const hasMultipleZones = country.otherZones && country.otherZones.length > 0;
            const allZones = hasMultipleZones
              ? [country.timezone, ...(country.otherZones || [])]
              : [country.timezone];

            return (
              <div
                key={country.slug}
                className="p-5 rounded-2xl bg-surface border border-theme hover:border-accent transition-all flex flex-col justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold text-foreground truncate">
                      {country.name}
                    </h2>
                    {hasMultipleZones && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                        <Layers className="w-3 h-3" />
                        {allZones.length} Zones
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted mt-1">
                    Primary reference: {formatPlaceWithZone(country)}
                  </div>

                  {hasMultipleZones ? (
                    <div className="mt-3 pt-2 border-t border-theme/60 text-xs text-muted">
                      <div className="font-medium text-foreground/80 mb-1">Time zones in {country.name}:</div>
                      <div className="flex flex-wrap gap-1">
                        {allZones.map((z) => (
                          <span
                            key={z}
                            className="inline-block px-1.5 py-0.5 rounded bg-card border border-theme font-mono text-[10px]"
                          >
                            {z.split('/').pop()?.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2 border-t border-theme/60 text-xs font-mono text-muted">
                      Zone: {country.timezone}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-theme/60 text-xs">
                  <Link
                    href={`/country/${country.slug}`}
                    className="font-medium text-accent hover:underline inline-flex items-center gap-1"
                  >
                    View Country Clock
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <span className="text-[11px] text-muted capitalize">{country.continent || 'Global'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
