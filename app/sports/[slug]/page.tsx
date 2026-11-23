import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllEvents, getEventBySlug, generateSportsEventReport } from '@/lib/sports';
import { getCountryBySlug } from '@/lib/places';
import SportsEventClient from '@/components/SportsEventClient';
import { ChevronRight, Home } from 'lucide-react';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TOP_COUNTRIES = [
  'united-states',
  'united-kingdom',
  'india',
  'australia',
  'canada',
  'germany',
  'france',
  'japan',
];

export async function generateStaticParams() {
  const events = getAllEvents();
  const params: Array<{ slug: string }> = [];

  for (const event of events) {
    for (const countrySlug of TOP_COUNTRIES) {
      params.push({
        slug: `${event.slug}-time-in-${countrySlug}`,
      });
    }
  }

  return params;
}

function parseSportsSlug(slug: string): { eventSlug: string; countrySlug: string } | null {
  const marker = '-time-in-';
  const idx = slug.lastIndexOf(marker);
  if (idx === -1) return null;

  const eventSlug = slug.substring(0, idx);
  const countrySlug = slug.substring(idx + marker.length);
  return { eventSlug, countrySlug };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSportsSlug(slug);
  if (!parsed) return { title: 'Sports Event Time | TimeBridge' };

  const event = getEventBySlug(parsed.eventSlug);
  const country = getCountryBySlug(parsed.countrySlug);
  if (!event || !country) return { title: 'Event Not Found | TimeBridge' };

  return {
    title: `What Time is ${event.name} in ${country.name}? Broadcast Schedule`,
    description: `Official start time for ${event.name} converted to ${country.name} local time (${country.timezone}). Includes auto-detected viewer countdown and major audience TV schedule.`,
    alternates: {
      canonical: `https://timebridge.app/sports/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SportsEventPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseSportsSlug(slug);
  if (!parsed) notFound();

  const event = getEventBySlug(parsed.eventSlug);
  const country = getCountryBySlug(parsed.countrySlug);
  if (!event || !country) notFound();

  const report = generateSportsEventReport(event, country.slug);
  if (!report) notFound();

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
        name: 'Sports & Events',
        item: 'https://timebridge.app/sports',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${event.name} in ${country.name}`,
        item: `https://timebridge.app/sports/${slug}`,
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
          <Link href="/sports" className="hover:text-foreground transition-colors">
            Sports
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <span className="text-foreground font-medium truncate">{event.name}</span>
        </nav>

        {/* Sports Client Component */}
        <SportsEventClient report={report} />
      </div>
    </main>
  );
}
