import type { Metadata } from 'next';
import { Suspense } from 'react';
import EventClient from '@/components/EventClient';

export const metadata: Metadata = {
  title: 'Share Event Time in Any Timezone | TimeBridge',
  description: "Share a global meeting or event time with a live countdown and one-click calendar sync in every recipient's local timezone.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EventPage() {
  return (
    <main className="min-h-screen bg-background py-8">
      <Suspense fallback={<div className="max-w-4xl mx-auto p-8 text-center text-muted">Loading event details...</div>}>
        <EventClient />
      </Suspense>
    </main>
  );
}
