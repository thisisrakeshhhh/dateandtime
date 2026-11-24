'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error internally without exposing sensitive details
    console.error('Handled application error:', error.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Something Went Wrong</h1>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            We encountered an unexpected error calculating time difference data. You can try refreshing the page or return to the main map.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E85D4E] text-white text-xs sm:text-sm font-semibold hover:bg-[#d94f40] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-theme text-foreground text-xs sm:text-sm font-semibold hover:border-[#E85D4E] transition-colors"
          >
            <Home className="w-4 h-4 text-[#E85D4E]" />
            <span>Return to Map</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
