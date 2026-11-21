"use client";

import React, { useState, useEffect, useRef } from "react";
import { Place, searchPlaces } from "@/lib/places";
import { Search, MapPin, Globe, X, Check } from "lucide-react";

interface PlaceSearchProps {
  label: string;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  placeholder?: string;
  badgeColor?: "emerald" | "indigo";
}

export default function PlaceSearch({
  label,
  selectedPlace,
  onSelectPlace,
  placeholder = "Search country or city...",
  badgeColor = "emerald",
}: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      const matches = searchPlaces(query, 8);
      setResults(matches);
      setHighlightIndex(0);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Handle outside clicks to close dropdown
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

  const badgeStyles =
    badgeColor === "emerald"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              badgeColor === "emerald" ? "bg-emerald-500" : "bg-indigo-500"
            }`}
          />
          {label}
        </label>
        {selectedPlace && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeStyles}`}
          >
            {selectedPlace.type === "city" ? `${selectedPlace.name}, ${selectedPlace.countryIso}` : selectedPlace.name}
          </span>
        )}
      </div>

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
          placeholder={selectedPlace ? `${selectedPlace.name} (${selectedPlace.countryName})` : placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all shadow-xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-0.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl max-h-72 overflow-y-auto overflow-x-hidden py-1">
          {results.map((place, idx) => {
            const isSelected = selectedPlace?.id === place.id;
            const isHighlighted = idx === highlightIndex;

            return (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelect(place)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-sm transition-colors ${
                  isHighlighted
                    ? "bg-neutral-100 dark:bg-neutral-800/70"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 shrink-0">
                    {place.type === "city" ? (
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {place.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {place.type === "city"
                        ? `${place.countryName} · ${place.timezone}`
                        : `Country · ${place.timezone}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {place.type}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
