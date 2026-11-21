"use client";

import React, { useState, useEffect, useRef } from "react";
import { Place, searchPlaces, formatPlaceDisplayName } from "@/lib/places";
import FlagIcon from "@/components/FlagIcon";
import { Search, X, MapPin, Navigation } from "lucide-react";

interface MapSearchOverlayProps {
  placeA: Place | null;
  placeB: Place | null;
  userPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onClear: () => void;
  onRequestLocation?: () => void;
  isLocating?: boolean;
  isCompareMode: boolean;
}

export default function MapSearchOverlay({
  placeA,
  placeB,
  userPlace,
  onSelectPlace,
  onClear,
  onRequestLocation,
  isLocating = false,
  isCompareMode,
}: MapSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [isPromptDismissed, setIsPromptDismissed] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if location prompt was already dismissed once
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("timebridge_location_prompt_dismissed");
      if (!dismissed) {
        setIsPromptDismissed(false);
      }
    } catch {
      setIsPromptDismissed(false);
    }
  }, []);

  function handleDismissPrompt() {
    setIsPromptDismissed(true);
    try {
      localStorage.setItem("timebridge_location_prompt_dismissed", "true");
    } catch {}
  }

  function handleDetectAndDismiss() {
    handleDismissPrompt();
    if (onRequestLocation) {
      onRequestLocation();
    }
  }

  function handleSetPlaceAndDismiss(place: Place) {
    handleDismissPrompt();
    onSelectPlace(place);
  }

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
            <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
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
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
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

            {/* Email suggestion footer in dropdown */}
            <div className="px-3.5 py-2 bg-neutral-50/90 dark:bg-[#1a1a1a] text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
              <span>Missing a town or city?</span>
              <a
                href="mailto:mickeygorveth@gmail.com?subject=Add%20City%20Suggestion"
                className="text-[#E85D4E] hover:underline font-medium"
              >
                mickeygorveth@gmail.com
              </a>
            </div>
          </div>
        )}

        {/* Empty state when searching and no match found */}
        {isOpen && query.trim().length > 0 && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50 p-3.5 text-xs text-neutral-600 dark:text-neutral-300">
            <p className="font-semibold text-neutral-900 dark:text-white">
              No matching city or country found
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Want us to add this town or city? Send a quick request to{" "}
              <a
                href="mailto:mickeygorveth@gmail.com?subject=Add%20City%20Request"
                className="text-[#E85D4E] font-medium hover:underline"
              >
                mickeygorveth@gmail.com
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Starting Location Prompt (explains time difference & distance calculation) */}
      {!placeA && !placeB && !isPromptDismissed && (
        <div className="mt-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-200/80 dark:border-neutral-800 text-xs relative animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-rose-500/10 text-[#E85D4E] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-neutral-900 dark:text-white text-xs">
                  Your Current Location
                </span>
                {userPlace && (
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium truncate">
                    {formatPlaceDisplayName(userPlace)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                We use your location to calculate real-time time differences and exact distances to any country or city you compare.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                {onRequestLocation && (
                  <button
                    type="button"
                    onClick={handleDetectAndDismiss}
                    disabled={isLocating}
                    className="px-2.5 py-1.5 rounded-lg bg-[#E85D4E] hover:bg-[#d94f40] text-white font-medium text-[11px] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{isLocating ? "Detecting..." : "Detect My Location"}</span>
                  </button>
                )}
                {userPlace && (
                  <button
                    type="button"
                    onClick={() => handleSetPlaceAndDismiss(userPlace)}
                    className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    Set as {userPlace.name}
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismissPrompt}
            aria-label="Dismiss location prompt"
            className="absolute top-2.5 right-2.5 p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
