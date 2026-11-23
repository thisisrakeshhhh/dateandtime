import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCountryBySlug, getCountries, formatPlaceWithZone } from '@/lib/places';
import { getDstSummaryForCountry } from '@/lib/dst';
import { siteConfig } from '@/lib/config';
import { ChevronRight, Home, Clock, Calendar, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  const countries = getCountries();
  return countries.map((c) => ({
    country: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const country = getCountryBySlug(countrySlug);
  if (!country) {
    return { title: 'Daylight Saving Time Info | TimeBridge' };
  }

  const countryLabel = formatPlaceWithZone(country);

  return {
    title: `Daylight Saving Time in ${countryLabel} - Next Clock Change Dates`,
    description: `Does ${countryLabel} have Daylight Saving Time? See the next clock change date, last transition, and seasonal time difference effects on major flight and business corridors.`,
    alternates: {
      canonical: `${siteConfig.siteUrl}/daylight-saving-time/${country.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function DaylightSavingCountryPage({ params }: PageProps) {
  const { country: countrySlug } = await params;
  const country = getCountryBySlug(countrySlug);
  if (!country) {
    notFound();
  }

  const countryLabel = formatPlaceWithZone(country);
  const dst = getDstSummaryForCountry(country.timezone, country.name);
  const hasMultipleZones = country.otherZones && country.otherZones.length > 0;
  const allZones = hasMultipleZones ? [country.timezone, ...(country.otherZones || [])] : [country.timezone];

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
      {
        '@type': 'ListItem',
        position: 3,
        name: `${country.name} DST`,
        item: `${siteConfig.siteUrl}/daylight-saving-time/${country.slug}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted">
          <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <Link href="/countries" className="hover:text-foreground transition-colors">
            Countries
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <span className="text-foreground font-medium">{country.name} DST</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-theme">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <Clock className="w-3.5 h-3.5" />
              Seasonal Timekeeping
            </span>
            <span className="text-xs text-muted">
              Reference Zone: {country.timezone}
            </span>
          </div>

          <div className="mt-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Daylight Saving Time in {countryLabel}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl">
              {dst.observesDst
                ? `${country.name} observes Daylight Saving Time (DST). Clocks shift by 1 hour twice annually to optimize seasonal daylight.`
                : `${country.name} does not observe Daylight Saving Time. Standard time remains constant year-round.`}
            </p>
          </div>

          {/* Current Status Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-card border border-theme">
              <div className="text-xs text-muted font-medium mb-1">Current Clock Status</div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2">
                {dst.currentStatus === 'Daylight Saving Time' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-400" />
                )}
                {dst.currentStatus}
              </div>
              <div className="text-xs text-muted mt-1 font-mono">{dst.currentOffsetStr}</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-theme">
              <div className="text-xs text-muted font-medium mb-1">Next Clock Change</div>
              <div className="text-base font-bold text-foreground">
                {dst.nextChange ? dst.nextChange.formattedDate : 'No scheduled change'}
              </div>
              <div className="text-xs text-accent mt-1">
                {dst.nextChange ? dst.nextChange.description : 'Static timezone year-round'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-theme">
              <div className="text-xs text-muted font-medium mb-1">Previous Clock Change</div>
              <div className="text-base font-bold text-foreground">
                {dst.lastChange ? dst.lastChange.formattedDate : 'None in past 12 months'}
              </div>
              <div className="text-xs text-muted mt-1">
                {dst.lastChange ? dst.lastChange.description : 'Maintains constant offset'}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-timezone Section if applicable */}
        {hasMultipleZones && (
          <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm mt-8">
            <h2 className="text-lg font-bold text-foreground mb-2">
              Other Time Zones in {country.name}
            </h2>
            <p className="text-xs sm:text-sm text-muted mb-4">
              Because {country.name} spans multiple jurisdictions, regional clock policies vary. Primary reference zone used above is {country.timezone}.
            </p>
            <div className="flex flex-wrap gap-2">
              {allZones.map((z) => (
                <span
                  key={z}
                  className="px-3 py-1.5 rounded-lg bg-card border border-theme font-mono text-xs text-foreground"
                >
                  {z}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3 Popular Pair Effects */}
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm mt-8 space-y-6">
          <div className="border-b border-theme pb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Effect of Daylight Saving on Popular Corridors
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1">
              How seasonal clock changes alter meeting overlap and time differences with major trade partners.
            </p>
          </div>

          <div className="space-y-4">
            {dst.popularPairEffects.map((effect, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-card border border-theme space-y-2 hover:border-accent/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground">{effect.pairLabel}</h3>
                  <Link
                    href={effect.routeUrl}
                    className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
                  >
                    Compare Route
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-surface border border-theme">
                    <span className="font-semibold text-muted block">Standard Period:</span>
                    <span className="text-foreground">{effect.standardDifference}</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface border border-theme">
                    <span className="font-semibold text-accent block">During Transition / DST:</span>
                    <span className="text-foreground">{effect.dstDifference}</span>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed pt-1">
                  {effect.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/country/${country.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-foreground hover:bg-surface transition-colors"
          >
            <Calendar className="w-4 h-4 text-accent" />
            View {country.name} Country Clock
          </Link>
          <Link
            href="/countries"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-muted hover:text-foreground transition-colors"
          >
            Browse all countries
          </Link>
        </div>
      </div>
    </main>
  );
}
