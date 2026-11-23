"use client";

import React, { useState, useEffect, useRef } from "react";
import { Place, searchPlaces } from "@/lib/places";
import FlagIcon from "@/components/FlagIcon";
import { Search, X } from "lucide-react";

interface MapSearchOverlayProps {
  placeA: Place | null;
  placeB: Place | null;
  userPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onClear: () => void;
  isCompareMode: boolean;
}

export default function MapSearchOverlay({
  placeA,
  placeB,
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
      const matches = searchPlaces(query, 12);
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
      className="w-full flex items-center justify-between gap-2"
    >
      {/* Search Input Box */}
      <div className="relative flex-1 group">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-neutral-400 group-focus-within:text-[#E85D4E] transition-colors pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            aria-label={
              isCompareMode
                ? "Search second place to compare"
                : "Search country or city"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isCompareMode
                ? "Search second place to compare..."
                : "Search country or city..."
            }
            className="w-full pl-9 pr-8 py-1.5 sm:py-2 rounded-xl bg-neutral-100/95 dark:bg-[#1c1c1c]/95 border border-neutral-200/90 dark:border-white/[0.1] text-neutral-900 dark:text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/20 focus:border-[#E85D4E] transition-all shadow-xs"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search input"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/98 dark:bg-[#181818]/98 backdrop-blur-2xl border border-neutral-200/90 dark:border-white/[0.12] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden z-[1005] divide-y divide-neutral-100 dark:divide-neutral-800">
            <div className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {results.map((place, index) => {
                const isHighlight = index === highlightIndex;
                return (
                  <button
                    key={place.id}
                    onClick={() => handleSelect(place)}
                    onMouseEnter={() => setHighlightIndex(index)}
                    className={`w-full px-3 py-2 sm:py-2.5 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isHighlight
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FlagIcon countryCode={place.countryIso} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-neutral-900 dark:text-white truncate text-xs sm:text-sm">
                          {place.name}
                          {place.type === "city" && place.countryName && (
                            <span className="text-[11px] font-normal text-neutral-500 dark:text-neutral-400 ml-1.5">
                              {place.countryName}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {place.timezone}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
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

      {/* Selected Pair Chip (compact, if placeA or placeB active) */}
      {(placeA || placeB) && (
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-white/[0.06] border border-neutral-200/90 dark:border-white/[0.08] px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-2xs shrink-0 max-w-[50%] sm:max-w-xs truncate">
          <div className="flex items-center gap-1 truncate text-xs">
            {placeA && (
              <span className="flex items-center gap-1 text-neutral-900 dark:text-white truncate font-semibold">
                <FlagIcon countryCode={placeA.countryIso} size="sm" />
                <span className="truncate">{placeA.name}</span>
              </span>
            )}
            {placeA && placeB && <span className="text-[#E85D4E] font-bold shrink-0">→</span>}
            {placeB && (
              <span className="flex items-center gap-1 text-neutral-900 dark:text-white truncate font-semibold">
                <FlagIcon countryCode={placeB.countryIso} size="sm" />
                <span className="truncate">{placeB.name}</span>
              </span>
            )}
            {placeA && !placeB && isCompareMode && (
              <span className="text-neutral-400 italic text-[10px] ml-1 shrink-0">
                (2nd)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors shrink-0 cursor-pointer"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
