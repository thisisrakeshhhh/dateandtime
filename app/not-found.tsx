import React from 'react';
import Link from 'next/link';
import { Compass, Clock, Home, Globe } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-background text-foreground">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#E85D4E]/10 text-[#E85D4E] mb-2">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">404</h1>
          <h2 className="text-xl font-bold text-foreground">Time Zone or Route Not Found</h2>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            The page or time corridor you requested does not exist or has moved. Explore our global time tools below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <Link
            href="/"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-theme hover:border-[#E85D4E] transition-all shadow-xs group"
          >
            <Home className="w-5 h-5 text-[#E85D4E] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Home</span>
            <span className="text-[11px] text-muted">World map</span>
          </Link>

          <Link
            href="/converter"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-theme hover:border-[#E85D4E] transition-all shadow-xs group"
          >
            <Clock className="w-5 h-5 text-[#E85D4E] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Converter</span>
            <span className="text-[11px] text-muted">Time offsets</span>
          </Link>

          <Link
            href="/all-corridors"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-theme hover:border-[#E85D4E] transition-all shadow-xs group"
          >
            <Globe className="w-5 h-5 text-[#E85D4E] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Corridors</span>
            <span className="text-[11px] text-muted">All route pairs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
