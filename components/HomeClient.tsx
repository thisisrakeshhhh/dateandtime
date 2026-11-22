"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Place,
  getPlaceByTimezone,
  getAllPlaces,
} from "@/lib/places";
import { calculateDistance } from "@/lib/distance";
import WorldMapContainer from "@/components/Map";
import MapSearchOverlay from "@/components/MapSearchOverlay";
import PlaceDetailsCard from "@/components/PlaceDetailsCard";
import CompareCard from "@/components/CompareCard";
import LocationModal from "@/components/LocationModal";

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
  const [isLocating, setIsLocating] = useState<boolean>(false);

  function handleRequestGeolocation() {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const all = getAllPlaces();
          let closest: Place | null = null;
          let minKm = Infinity;

          for (const p of all) {
            const d = calculateDistance(latitude, longitude, p.lat, p.lng);
            if (d.km < minKm) {
              minKm = d.km;
              closest = p;
            }
          }

          if (closest) {
            setUserPlace(closest);
            setUserTimezone(closest.timezone);
            try {
              localStorage.setItem("timebridge_user_place", JSON.stringify(closest));
              window.dispatchEvent(new CustomEvent("timebridge-location-updated"));
            } catch {}
          }
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 8000 }
      );
    }
  }

  // Auto-detect user's timezone on mount (or use saved location if exists)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("timebridge_user_place");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          setUserPlace(parsed);
          setUserTimezone(parsed.timezone);
          return;
        }
      }
    } catch {}

    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setUserTimezone(detected);
        const matched = getPlaceByTimezone(detected);
        if (matched) {
          setUserPlace(matched);
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

  return (
    <div className="w-full flex flex-col">
      {/* Intro & Search Bar Header */}
      <div className="w-full bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] shadow-xs z-30 transition-colors">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1c1c1c] dark:text-white">
                What time is it there?
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pick two places to see the time difference, weather and best time to call.
              </p>
            </div>
            <Link
              href="/converter"
              className="self-start sm:self-auto text-xs font-semibold text-[#E85D4E] hover:underline flex items-center gap-1 transition-colors"
            >
              Time zone converters →
            </Link>
          </div>

          <MapSearchOverlay
            placeA={placeA}
            placeB={placeB}
            userPlace={userPlace}
            onSelectPlace={handleSelectPlace}
            onClear={handleClear}
            isCompareMode={isComparing && !placeB}
          />
        </div>
      </div>

      {/* Hero Fullscreen Google-Maps-Style Section */}
      <div className="relative w-full h-[calc(100vh-56px-53px)] min-h-[500px] bg-neutral-100 dark:bg-[#141414] overflow-hidden">
        {/* Fullscreen Interactive Leaflet Map */}
        <WorldMapContainer
          placeA={placeA}
          placeB={placeB}
          userTimezone={userTimezone}
          userPlace={userPlace}
          onSelectPlace={handleSelectPlace}
          className="w-full h-full"
        />

        {/* One-Time Location Modal Popup */}
        <LocationModal
          userPlace={userPlace}
          onRequestLocation={handleRequestGeolocation}
          onSetPlace={handleSelectPlace}
          isLocating={isLocating}
        />

        {/* Floating Side Panel on Desktop / Bottom Sheet on Mobile */}
        {showSidePanel && (
          <div className="fixed md:absolute z-[1002] inset-x-0 bottom-0 md:inset-auto md:top-4 md:right-6 max-h-[80vh] md:max-h-[85vh] overflow-y-auto w-full md:w-[400px] md:max-w-[420px] transition-all duration-300 rounded-t-2xl md:rounded-2xl shadow-2xl">
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
                userPlace={userPlace}
                userTimezone={userTimezone}
                onCompareWith={handleCompareWith}
                onClose={() => setShowSidePanel(false)}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
