import type { Metadata } from 'next';
import Link from 'next/link';
import JetLagClient from '@/components/JetLagClient';
import { siteConfig } from '@/lib/config';
import { ChevronRight, Home, Plane } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Jet Lag Calculator & Adaptation Schedule | TimeBridge',
  description: 'Calculate time difference, flight duration, local arrival time, and scientific light and sleep shift plans to minimize jet lag fatigue across any global flight route.',
  alternates: {
    canonical: `${siteConfig.siteUrl}/jet-lag-calculator`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function JetLagPage() {
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
        name: 'Jet Lag Calculator',
        item: `${siteConfig.siteUrl}/jet-lag-calculator`,
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
          <span className="text-foreground font-medium">Jet Lag Calculator</span>
        </nav>

        {/* Header */}
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            <Plane className="w-3.5 h-3.5" />
            Travel Time & Adaptation
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
            Jet Lag Calculator & Sleep Shift Planner
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl">
            Input your departure and destination to calculate flight duration, local arrival time, and a step-by-step circadian light and sleep adaptation timeline.
          </p>
        </div>

        {/* Client Interactive Calculator */}
        <JetLagClient />
      </div>
    </main>
  );
}
