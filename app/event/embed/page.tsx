import type { Metadata } from 'next';
import { Suspense } from 'react';
import EventClient from '@/components/EventClient';

export const metadata: Metadata = {
  title: 'Event Time | TimeBridge',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EventEmbedPage() {
  return (
    <div className="bg-background p-2">
      <Suspense fallback={<div className="p-4 text-center text-xs text-muted">Loading event...</div>}>
        <EventClient />
      </Suspense>
    </div>
  );
}
