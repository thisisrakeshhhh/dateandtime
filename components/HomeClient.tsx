"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Place, getPlaceBySlug, getPopularPairs } from "@/lib/places";
import PlaceSearch from "@/components/PlaceSearch";
import WorldMapContainer from "@/components/Map";
import ResultCard from "@/components/ResultCard";
import BestTimeToCallBox from "@/components/BestTimeToCallBox";
import MeetingTable from "@/components/MeetingTable";
import { ArrowLeftRight, Clock, ArrowRight } from "lucide-react";

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

  function handleSwap() {
    setPlaceA(placeB);
    setPlaceB(placeA);
  }

  function handleSelectFromMap(place: Place, target: "A" | "B") {
    if (target === "A") {
      setPlaceA(place);
    } else {
      setPlaceB(place);
    }
  }

  const popularPairs = getPopularPairs().slice(0, 18);

  return (
    <div className="w-full space-y-8">
      {/* Search & Selection Controls Card */}
      <div className="bg-white dark:bg-neutral-900/90 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          <PlaceSearch
            label="Place A (Origin)"
            selectedPlace={placeA}
            onSelectPlace={(p) => setPlaceA(p)}
            badgeColor="emerald"
            placeholder="Search country or city (e.g. India, New York)..."
          />

          <div className="flex md:flex-col items-center justify-center pt-5">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Place A and Place B"
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all shadow-xs active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <PlaceSearch
            label="Place B (Destination)"
            selectedPlace={placeB}
            onSelectPlace={(p) => setPlaceB(p)}
            badgeColor="indigo"
            placeholder="Search country or city (e.g. United Kingdom, London)..."
          />
        </div>

        {/* Selected Pair Permalink Strip */}
        {placeA && placeB && (
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Selected Pair:
              </span>
              <span>
                {placeA.name} ({placeA.countryName}) → {placeB.name} ({placeB.countryName})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/time-difference/${placeA.slug}-to-${placeB.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Dedicated Page
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/best-time-to-call/${placeB.slug}-from-${placeA.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors"
              >
                Best Time to Call
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Map */}
      <div>
        <WorldMapContainer
          placeA={placeA}
          placeB={placeB}
          onSelectPlace={handleSelectFromMap}
          className="h-[520px] w-full"
        />
        <div className="mt-2 px-1 flex flex-wrap items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
          <p>
            💡 Tip: Click any glowing city dot on the night map to instantly select it.
          </p>
          <p>Terminator shadow updates live every 60 seconds.</p>
        </div>
      </div>

      {/* Result Card: Exact Difference, Live Clocks, Distance */}
      {placeA && placeB && (
        <ResultCard
          placeA={placeA}
          placeB={placeB}
          onSwapPlaces={handleSwap}
        />
      )}

      {/* Best Time to Call Box */}
      {placeA && placeB && (
        <BestTimeToCallBox
          fromPlace={placeA}
          toPlace={placeB}
        />
      )}

      {/* 24-Hour Comparison Table */}
      {placeA && placeB && (
        <MeetingTable
          placeA={placeA}
          placeB={placeB}
        />
      )}

      {/* Popular Pairs Quick Navigation */}
      <section className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            Popular Time Difference Corridors
          </h2>
          <span className="text-xs text-neutral-400">
            Frequently tracked corridors
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {popularPairs.map((pair) => {
            const pFrom = getPlaceBySlug(pair.from);
            const pTo = getPlaceBySlug(pair.to);
            if (!pFrom || !pTo) return null;

            return (
              <Link
                key={`${pair.from}-${pair.to}`}
                href={`/time-difference/${pair.from}-to-${pair.to}`}
                className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/50 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                  {pFrom.name}
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-1">
                  <span>to</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {pTo.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
