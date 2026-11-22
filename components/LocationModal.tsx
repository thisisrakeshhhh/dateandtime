"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navigation, X, Search, MapPin } from "lucide-react";
import { Place, formatPlaceDisplayName, searchPlaces } from "@/lib/places";
import FlagIcon from "@/components/FlagIcon";

interface LocationModalProps {
  userPlace: Place | null;
  onRequestLocation: () => void;
  onSetPlace?: (place: Place) => void;
  isLocating?: boolean;
}

export default function LocationModal({
  userPlace,
  onRequestLocation,
  onSetPlace,
  isLocating = false,
}: LocationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
      setSearchQuery("");
      setSearchResults([]);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    window.addEventListener("open-location-modal", handleOpen);
    return () => window.removeEventListener("open-location-modal", handleOpen);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = searchPlaces(searchQuery, 6);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  function handleDismiss() {
    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    try {
      localStorage.setItem("timebridge_location_prompt_dismissed", "true");
    } catch {}
  }

  function handleDetect() {
    handleDismiss();
    onRequestLocation();
  }

  function handleSelectPlace(place: Place) {
    try {
      localStorage.setItem("timebridge_user_place", JSON.stringify(place));
      localStorage.setItem("timebridge_location_prompt_dismissed", "true");
      window.dispatchEvent(new CustomEvent("timebridge-location-updated"));
    } catch {}
    if (onSetPlace) {
      onSetPlace(place);
    }
    handleDismiss();
  }

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Location selection prompt"
      className="fixed inset-0 z-[1050] flex items-center justify-center p-3 sm:p-4 pointer-events-none"
    >
      <div
        className="pointer-events-auto relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 duration-200 text-neutral-800 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close location prompt"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Title & Explanation */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-[#E85D4E] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h2 id="location-modal-title" className="font-semibold text-lg text-neutral-900 dark:text-white leading-tight">
              Where are you?
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              We need your location to calculate real-time time differences, flight distances, and optimal calling hours with any country or city you compare.
            </p>
          </div>
        </div>

        {/* Current Selected Location Indicator */}
        {userPlace && (
          <div className="mb-3.5 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-neutral-400">Current:</span>
              <FlagIcon countryCode={userPlace.countryIso} size="sm" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {formatPlaceDisplayName(userPlace)}
              </span>
            </div>
            <span className="text-[11px] text-[#E85D4E] font-medium shrink-0">Active</span>
          </div>
        )}

        {/* Manual City/Country Search Input */}
        <div className="relative mb-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your city or country..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#242424] border border-neutral-200 dark:border-neutral-700 text-base sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/40 focus:border-[#E85D4E] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-neutral-100 dark:divide-neutral-800 max-h-56 overflow-y-auto">
              {searchResults.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FlagIcon countryCode={place.countryIso} size="sm" />
                    <div className="truncate">
                      <div className="font-medium text-neutral-900 dark:text-white truncate">
                        {formatPlaceDisplayName(place)}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {place.timezone}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#E85D4E]/10 text-[#E85D4E] shrink-0 ml-2">
                    {place.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider / Or */}
        <div className="relative my-3 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <span className="relative px-2 bg-white dark:bg-[#1a1a1a] text-[11px] text-neutral-400 uppercase font-medium">
            or detect automatically
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDetect}
            disabled={isLocating}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#E85D4E] hover:bg-[#d94f40] text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isLocating ? "Detecting location..." : "Detect My Location"}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="py-2.5 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
