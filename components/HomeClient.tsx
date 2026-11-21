"use client";

import React, { useState, useEffect } from "react";
import { Place, getPlaceByTimezone, getPopularPairs } from "@/lib/places";
import WorldMapContainer from "@/components/Map";
import MapSearchOverlay from "@/components/MapSearchOverlay";
import PlaceDetailsCard from "@/components/PlaceDetailsCard";
import CompareCard from "@/components/CompareCard";
import PopularRoutesRow from "@/components/PopularRoutesRow";
import AdSlot from "@/components/AdSlot";

interface HomeClientProps {
  initialPlaceA: Place | null;
  initialPlaceB: Place | null;
}

export default function HomeClient({
  initialPlaceA,
  initialPlaceB,
}: HomeClientProps) {
  const [placeA, setPlaceA] = useState<Place | null>(initialPlaceA);
  const [placeB, setPlaceB] = useState<Place | null>(initialPlaceB);
  const [userPlace, setUserPlace] = useState<Place | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>("UTC");
  const [isComparing, setIsComparing] = useState<boolean>(!!(initialPlaceA && initialPlaceB));
  const [showSidePanel, setShowSidePanel] = useState<boolean>(true);

  // Auto-detect user's timezone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setUserTimezone(detected);
        const matched = getPlaceByTimezone(detected);
        if (matched) {
          setUserPlace(matched);
          // If no initial places were provided via URL, set user's place as placeA
          if (!initialPlaceA && !initialPlaceB) {
            setPlaceA(matched);
          }
        }
      }
    } catch {
      // Fallback silently to UTC
    }
  }, [initialPlaceA, initialPlaceB]);

  // Update URL seamlessly when comparison changes
  useEffect(() => {
    if (placeA && placeB) {
      const targetUrl = `/time-difference/${placeA.slug}-to-${placeB.slug}`;
      if (typeof window !== "undefined" && window.location.pathname !== targetUrl) {
        window.history.pushState(null, "", targetUrl);
      }
    }
  }, [placeA, placeB]);

  function handleSelectPlace(selected: Place) {
    if (isComparing || (placeA && !placeB)) {
      if (!placeA) {
        setPlaceA(selected);
      } else if (selected.slug === placeA.slug) {
        // Clicked the same place again
        setPlaceA(selected);
      } else {
        setPlaceB(selected);
        setIsComparing(true);
      }
    } else {
      setPlaceA(selected);
    }
    setShowSidePanel(true);
  }

  function handleCompareWith(selected: Place) {
    setPlaceA(selected);
    setPlaceB(null);
    setIsComparing(true);
  }

  function handleSwap() {
    if (placeA && placeB) {
      const tempA = placeA;
      setPlaceA(placeB);
      setPlaceB(tempA);
      window.history.pushState(null, "", `/time-difference/${placeB.slug}-to-${tempA.slug}`);
    }
  }

  function handleClear() {
    if (placeB) {
      setPlaceB(null);
      setIsComparing(false);
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", "/");
      }
    } else {
      setPlaceA(userPlace);
      setShowSidePanel(false);
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", "/");
      }
    }
  }

  const popularPairs = getPopularPairs();

  return (
    <div className="w-full flex flex-col">
      {/* Hero Fullscreen Google-Maps-Style Section */}
      <div className="relative w-full h-[calc(100vh-56px)] min-h-[580px] bg-neutral-100 dark:bg-[#141414] overflow-hidden">
        {/* Fullscreen Interactive Leaflet Map */}
        <WorldMapContainer
          placeA={placeA}
          placeB={placeB}
          userTimezone={userTimezone}
          onSelectPlace={handleSelectPlace}
          className="w-full h-full"
        />

        {/* Floating Top-Left Search Overlay */}
        <div className="absolute top-4 left-4 z-[1001] max-w-[calc(100vw-32px)] sm:max-w-md">
          <MapSearchOverlay
            placeA={placeA}
            placeB={placeB}
            userPlace={userPlace}
            onSelectPlace={handleSelectPlace}
            onClear={handleClear}
            isCompareMode={isComparing && !placeB}
          />
        </div>

        {/* Floating Side Panel on Desktop / Bottom Sheet on Mobile */}
        {showSidePanel && (
          <div className="absolute z-[1001] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-4 sm:bottom-auto max-h-[85vh] overflow-y-auto max-w-full sm:max-w-[420px] transition-transform duration-300">
            {placeA && placeB ? (
              <CompareCard
                placeA={placeA}
                placeB={placeB}
                onSwap={handleSwap}
                onClear={handleClear}
              />
            ) : placeA ? (
              <PlaceDetailsCard
                place={placeA}
                userTimezone={userTimezone}
                onCompareWith={handleCompareWith}
                onClose={() => setShowSidePanel(false)}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Popular Routes Section */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <PopularRoutesRow pairs={popularPairs} />

        {/* AdSense Placement */}
        <div className="my-8">
          <AdSlot slotId="home-bottom" format="horizontal" />
        </div>

        {/* Clean Human SEO Section */}
        <section className="pt-6 border-t border-[#E5E5E5] dark:border-[#262626] text-xs leading-relaxed text-[#6B6B6B] dark:text-[#A0A0A0] max-w-3xl">
          <h2 className="text-sm font-semibold text-[#222222] dark:text-white mb-2">
            Accurate world time difference and calling overlap
          </h2>
          <p className="mb-2">
            TimeBridge calculates real-time time differences between any two countries or cities
            using the official IANA time zone database. Daylight Saving Time transitions,
            half-hour and 45-minute offsets (such as India Standard Time, Nepal, and Newfoundland),
            and solar day/night boundaries are handled dynamically without guesswork.
          </p>
          <p>
            Click any location on the map to see its live local time, sunrise and sunset,
            current weather, and upcoming clock changes. Pick a second destination to calculate
            the exact calling overlap between 9:00 AM and 9:00 PM in both locations.
          </p>
        </section>
      </div>
    </div>
  );
}
