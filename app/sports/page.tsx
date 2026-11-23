import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllEvents } from '@/lib/sports';
import { ChevronRight, Home, Calendar, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Global Sports & Championship Broadcast Times | TimeBridge',
  description: 'Find official local broadcast start times for 20 premier recurring sports events, including Super Bowl, UEFA Champions League, FIFA World Cup, and Wimbledon.',
  alternates: {
    canonical: 'https://timebridge.app/sports',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const POPULAR_COUNTRIES = [
  { name: 'United States', slug: 'united-states' },
  { name: 'United Kingdom', slug: 'united-kingdom' },
  { name: 'India', slug: 'india' },
  { name: 'Australia', slug: 'australia' },
  { name: 'Canada', slug: 'canada' },
];

export default function SportsHubPage() {
  const events = getAllEvents();

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
        name: 'Sports',
        item: 'https://timebridge.app/sports',
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
          <span className="text-foreground font-medium">Sports & Events</span>
        </nav>

        {/* Header */}
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            <Calendar className="w-3.5 h-3.5" />
            Global Event Kickoffs
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
            Sports & Major Events Broadcast Schedule
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl">
            Live start time conversions across US, UK, India, Australia and European time zones for major global finals and championship ceremonies.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.slug}
              className="p-5 rounded-2xl bg-surface border border-theme hover:border-accent transition-all flex flex-col justify-between gap-3 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {event.sport}
                  </span>
                  <span className="text-xs text-muted">
                    Venue: {event.venueCity}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-foreground mt-1">
                  {event.name}
                </h2>
                <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                  {event.description}
                </p>
              </div>

              <div className="pt-3 border-t border-theme/60">
                <div className="text-xs font-semibold text-muted mb-2">View start time in:</div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_COUNTRIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/sports/${event.slug}-time-in-${c.slug}`}
                      className="px-2.5 py-1 rounded-lg bg-card border border-theme hover:border-accent hover:text-accent text-xs font-medium text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      <span>{c.name}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
