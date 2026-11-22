"use client";

import React, { useState, useEffect, useRef } from "react";
import { Place, searchPlaces, formatPlaceDisplayName, getPlaceBySlug } from "@/lib/places";
import FlagIcon from "@/components/FlagIcon";
import { Search, X, Sparkles, MapPin } from "lucide-react";

interface MapSearchOverlayProps {
  placeA: Place | null;
  placeB: Place | null;
  userPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onClear: () => void;
  isCompareMode: boolean;
}

const POPULAR_SLUGS = [
  "london",
  "new-york",
  "tokyo",
  "dubai",
  "sydney",
  "paris",
];

export default function MapSearchOverlay({
  placeA,
  placeB,
  userPlace,
  onSelectPlace,
  onClear,
  isCompareMode,
}: MapSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      const matches = searchPlaces(query, 10);
      setResults(matches);
      setHighlightIndex(0);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(place: Place) {
    onSelectPlace(place);
    setQuery("");
    setIsOpen(false);
  }

  function handleQuickPick(slug: string) {
    const p = getPlaceBySlug(slug) || searchPlaces(slug, 1)[0];
    if (p) {
      handleSelect(p);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlightIndex]) {
        handleSelect(results[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3"
    >
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-xl group">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 group-focus-within:text-[#E85D4E] transition-colors pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isCompareMode
                ? "Search second place to compare..."
                : "Search any country or city..."
            }
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-neutral-100/90 dark:bg-[#1a1a1a]/90 border border-neutral-200/90 dark:border-white/[0.08] text-neutral-900 dark:text-white placeholder-neutral-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/20 focus:border-[#E85D4E] transition-all shadow-2xs"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-white/[0.12] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.22)] overflow-hidden z-50 divide-y divide-neutral-100 dark:divide-neutral-800">
            <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {results.map((place, index) => {
                const isHighlight = index === highlightIndex;
                return (
                  <button
                    key={place.id}
                    onClick={() => handleSelect(place)}
                    onMouseEnter={() => setHighlightIndex(index)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isHighlight
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FlagIcon countryCode={place.countryIso} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-neutral-900 dark:text-white truncate">
                          {formatPlaceDisplayName(place)}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {place.timezone}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                        place.type === "country"
                          ? "bg-rose-500/10 text-[#E85D4E] dark:bg-rose-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20"
                      }`}
                    >
                      {place.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Pair Chip (if active) OR Popular Quick-Pick Buttons */}
      <div className="flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar py-0.5">
        {(placeA || placeB) ? (
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-white/[0.06] border border-neutral-200/90 dark:border-white/[0.08] px-3 py-1.5 rounded-xl text-xs font-medium shadow-2xs">
            <div className="flex items-center gap-1.5 truncate">
              {placeA && (
                <span className="flex items-center gap-1 text-neutral-900 dark:text-white truncate font-semibold">
                  <FlagIcon countryCode={placeA.countryIso} size="sm" />
                  <span>{formatPlaceDisplayName(placeA)}</span>
                </span>
              )}
              {placeA && placeB && <span className="text-[#E85D4E] px-0.5 font-bold">→</span>}
              {placeB && (
                <span className="flex items-center gap-1 text-neutral-900 dark:text-white truncate font-semibold">
                  <FlagIcon countryCode={placeB.countryIso} size="sm" />
                  <span>{formatPlaceDisplayName(placeB)}</span>
                </span>
              )}
              {placeA && !placeB && isCompareMode && (
                <span className="text-neutral-400 italic text-[11px] ml-1">
                  (select 2nd place)
                </span>
              )}
            </div>

            <button
              onClick={onClear}
              className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors shrink-0 cursor-pointer ml-1"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="text-neutral-400 dark:text-neutral-500 font-medium flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-[#E85D4E]" />
              Popular:
            </span>
            {POPULAR_SLUGS.map((slug) => {
              const label =
                slug === "new-york"
                  ? "New York"
                  : slug.charAt(0).toUpperCase() + slug.slice(1);
              return (
                <button
                  key={slug}
                  onClick={() => handleQuickPick(slug)}
                  className="px-2.5 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-[#1c1c1c] dark:hover:text-white bg-neutral-100/80 dark:bg-white/[0.04] hover:bg-neutral-200/80 dark:hover:bg-white/[0.08] border border-neutral-200/60 dark:border-white/[0.04] transition-all cursor-pointer font-medium text-[11px]"
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
