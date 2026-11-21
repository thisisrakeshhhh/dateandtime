"use client";

import React, { useState, useEffect, useRef } from "react";
import { Place, searchPlaces, formatPlaceDisplayName } from "@/lib/places";
import FlagIcon from "@/components/FlagIcon";
import { Search, X, MapPin } from "lucide-react";

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
      const matches = searchPlaces(query, 7);
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
      className="w-full max-w-md bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md rounded-2xl shadow-lg border border-neutral-200/80 dark:border-neutral-800 p-4 transition-all duration-200"
    >
      {/* Headings */}
      <div className="mb-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          What time is it there?
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Pick two places to see the time difference, weather and best time to call.
        </p>
      </div>

      {/* Selected Pair Chip (if active) */}
      {(placeA || placeB) && (
        <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1.5 rounded-xl text-xs font-medium mb-3">
          <div className="flex items-center gap-1.5 truncate">
            {placeA && (
              <span className="flex items-center gap-1 text-neutral-900 dark:text-white truncate">
                <FlagIcon countryCode={placeA.countryIso} size="sm" />
                <span>{formatPlaceDisplayName(placeA)}</span>
              </span>
            )}
            {placeA && placeB && <span className="text-neutral-400 px-1">→</span>}
            {placeB && (
              <span className="flex items-center gap-1 text-neutral-900 dark:text-white truncate">
                <FlagIcon countryCode={placeB.countryIso} size="sm" />
                <span>{formatPlaceDisplayName(placeB)}</span>
              </span>
            )}
          </div>

          <button
            onClick={onClear}
            className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors shrink-0"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Input Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
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
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/40 focus:border-[#E85D4E] transition-all"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-neutral-100 dark:divide-neutral-800">
            {results.map((place, index) => {
              const isHighlight = index === highlightIndex;
              return (
                <button
                  key={place.id}
                  onClick={() => handleSelect(place)}
                  onMouseEnter={() => setHighlightIndex(index)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs transition-colors ${
                    isHighlight
                      ? "bg-neutral-100 dark:bg-neutral-800"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FlagIcon countryCode={place.countryIso} size="sm" />
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {formatPlaceDisplayName(place)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {place.timezone}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">
                    {place.type}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User Default Location Tag */}
      {userPlace && !placeA && !placeB && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-[#E85D4E]" />
            <span>Your location: </span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {formatPlaceDisplayName(userPlace)}
            </span>
          </div>
          <button
            onClick={() => onSelectPlace(userPlace)}
            className="text-[#E85D4E] hover:underline font-medium text-[11px] shrink-0 ml-2"
          >
            Select
          </button>
        </div>
      )}
    </div>
  );
}
