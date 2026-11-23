import type { Metadata } from 'next';
import Link from 'next/link';
import { getCorridorPairsGrouped } from '@/lib/corridors';
import { ChevronRight, Home, ArrowRight, PhoneCall, Clock, Compass } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Global Time Corridors Directory (298 Routes) | TimeBridge',
  description: 'Explore the authoritative directory of 298 international time corridors. Compare time differences, calling overlap windows and flight hours grouped by global region.',
  alternates: {
    canonical: 'https://timebridge.app/all-corridors',
  },
};

export default function AllCorridorsPage() {
  const groups = getCorridorPairsGrouped();
  const totalPairs = groups.reduce((acc, g) => acc + g.pairs.length, 0);

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
        name: 'All Corridors',
        item: 'https://timebridge.app/all-corridors',
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
          <span className="text-foreground font-medium">All Corridors</span>
        </nav>

        {/* Page Header */}
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            <Compass className="w-3.5 h-3.5" />
            Global Route Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
            All Time Corridors ({totalPairs} Routes)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted max-w-3xl">
            Browse our curated catalog of premier cross-border time corridors. Every corridor features minute-precise timezone differences, mutual calling hours, sun positions and flight time estimations.
          </p>
        </div>

        {/* Regional Groups */}
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.regionName} className="space-y-4">
              <div className="border-b border-theme pb-2">
                <h2 className="text-xl font-bold text-foreground">
                  {group.regionName}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {group.description} ({group.pairs.length} routes)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.pairs.map((p) => (
                  <div
                    key={`${p.fromSlug}-to-${p.toSlug}`}
                    className="p-4 rounded-xl bg-surface border border-theme hover:border-accent transition-all flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <span className="truncate">{p.fromLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span className="truncate">{p.toLabel}</span>
                      </div>
                      <div className="text-xs text-muted mt-1">
                        IANA: {p.fromPlace.timezone} ↔ {p.toPlace.timezone}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-theme/60 text-xs">
                      <Link
                        href={p.timeDiffUrl}
                        className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Time Difference
                      </Link>
                      <span className="text-muted/40">•</span>
                      <Link
                        href={p.callPlannerUrl}
                        className="inline-flex items-center gap-1 font-medium text-foreground/80 hover:text-accent transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Best Time to Call
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
