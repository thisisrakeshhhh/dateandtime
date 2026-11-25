import type { Metadata } from 'next';
import { Suspense } from 'react';
import EventClient from '@/components/EventClient';
import { siteConfig } from '@/lib/config';
import { buildPageMetadata } from '@/lib/seo';

interface Props {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = searchParams ? await searchParams : {};
  const isSharedLink = params && Object.keys(params).length > 0 && Boolean(params.title || params.start || params.e || params.t);

  return buildPageMetadata({
    title: `Share Event Time in Any Timezone | ${siteConfig.name}`,
    description: "Share a global meeting or event time with a live countdown and one-click calendar sync in every recipient's local timezone.",
    canonical: `${siteConfig.siteUrl}/event`,
    robots: isSharedLink
      ? { index: false, follow: true }
      : { index: true, follow: true },
  });
}

export default function EventPage() {
  return (
    <main className="min-h-screen bg-background py-8">
      <Suspense fallback={<div className="max-w-4xl mx-auto p-8 text-center text-muted">Loading event details...</div>}>
        <EventClient />
      </Suspense>
    </main>
  );
}
