'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Place } from '@/lib/places';
import { Search, MapPin, ArrowRight, Clock } from 'lucide-react';

export default function CitiesDirectoryClient({ cities }: { cities: Place[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return cities;
    const q = query.toLowerCase();
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.countryName.toLowerCase().includes(q) ||
        c.timezone.toLowerCase().includes(q)
    );
  }, [cities, query]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, Place[]>();
    for (const city of filtered) {
      const letter = city.name.charAt(0).toUpperCase();
      if (!map.has(letter)) {
        map.set(letter, []);
      }
      map.get(letter)!.push(city);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Filter by city, country, or timezone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-card border border-theme rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-accent outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className="text-xs text-muted">
        Showing {filtered.length} of {cities.length} cities
      </div>

      {/* Grouped Alphabetical Grid */}
      <div className="space-y-8">
        {grouped.map(([letter, items]) => (
          <div key={letter} className="space-y-3">
            <div className="text-lg font-bold text-accent border-b border-theme pb-1">
              {letter}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((city) => (
                <Link
                  key={city.slug}
                  href={`/what-time-is-it-in/${city.slug}`}
                  className="p-3.5 rounded-xl bg-surface border border-theme hover:border-accent transition-all group flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="truncate">{city.name}</span>
                    </div>
                    <div className="text-xs text-muted mt-1 truncate">
                      {city.countryName}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-theme/60 flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-accent" />
                      {city.timezone.split('/').pop()?.replace(/_/g, ' ')}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
