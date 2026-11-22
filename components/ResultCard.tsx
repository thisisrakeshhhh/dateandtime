"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Place } from "@/lib/places";
import { calculateTimeDifference, formatHourMinuteDiff } from "@/lib/time";
import { calculateDistance } from "@/lib/distance";
import { ArrowLeftRight, Plane, Clock, Info } from "lucide-react";

// Client-only dynamic import for LiveClock to prevent SSR time hydration mismatch
const LiveClock = dynamic(() => import("@/components/LiveClock"), {
  ssr: false,
  loading: () => (
    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs h-[180px] animate-pulse flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
      </div>
      <div className="h-9 w-48 bg-neutral-200 dark:bg-neutral-800 rounded my-2" />
      <div className="h-3.5 w-36 bg-neutral-200 dark:bg-neutral-800 rounded" />
    </div>
  ),
});

interface ResultCardProps {
  placeA: Place;
  placeB: Place;
  onSwapPlaces?: () => void;
}

export default function ResultCard({
  placeA,
  placeB,
  onSwapPlaces,
}: ResultCardProps) {
  const timeDiff = calculateTimeDifference(
    placeA.timezone,
    placeB.timezone,
    placeA.lat,
    placeA.lng,
    placeB.lat,
    placeB.lng
  );

  const distance = calculateDistance(
    placeA.lat,
    placeA.lng,
    placeB.lat,
    placeB.lng
  );

  // Determine lead summary
  let diffHeadline = "";
  const diffStr = formatHourMinuteDiff(timeDiff.hoursPart, timeDiff.minutesPart);
  if (timeDiff.isSameTime) {
    diffHeadline = `${placeA.name} and ${placeB.name} have the exact same time`;
  } else if (timeDiff.isToAhead) {
    diffHeadline = `${placeB.name} is ${diffStr} ahead of ${placeA.name}`;
  } else {
    diffHeadline = `${placeA.name} is ${diffStr} ahead of ${placeB.name}`;
  }

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-5 sm:p-7 shadow-sm">
      {/* Top Banner: Time Difference Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Clock className="w-4 h-4" />
            <span>Live Time Difference</span>
          </div>
          <h2
            suppressHydrationWarning
            className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight"
          >
            {diffHeadline}
          </h2>
          <p
            suppressHydrationWarning
            className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed"
          >
            {timeDiff.verbalSummary}
          </p>
        </div>

        {onSwapPlaces && (
          <button
            type="button"
            onClick={onSwapPlaces}
            className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors shrink-0 shadow-xs active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Reverse</span>
          </button>
        )}
      </div>

      {/* Clocks Grid: Place A and Place B Live Clocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-6">
        <LiveClock
          placeName={placeA.name}
          countryName={placeA.countryName}
          timezone={placeA.timezone}
          lat={placeA.lat}
          lng={placeA.lng}
          badgeColor="emerald"
        />

        <LiveClock
          placeName={placeB.name}
          countryName={placeB.countryName}
          timezone={placeB.timezone}
          lat={placeB.lat}
          lng={placeB.lng}
          badgeColor="indigo"
        />
      </div>

      {/* Distance and Quick Facts Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Distance Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-950/60 border border-neutral-200/70 dark:border-neutral-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-medium">Distance</p>
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 font-mono">
              {distance.formattedKm} ({distance.formattedMiles})
            </p>
          </div>
        </div>

        {/* Flight Duration */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-950/60 border border-neutral-200/70 dark:border-neutral-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-medium">Est. Non-Stop Flight</p>
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 font-mono">
              ~{distance.estimatedFlightHours} hours
            </p>
          </div>
        </div>

        {/* Compass Bearing */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-950/60 border border-neutral-200/70 dark:border-neutral-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-medium">Flight Direction</p>
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 font-mono">
              {distance.initialBearingDegrees}° ({distance.compassDirection})
            </p>
          </div>
        </div>
      </div>

      {/* Daylight Saving Notice */}
      {timeDiff.dstNotice && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{timeDiff.dstNotice}</span>
        </div>
      )}

      {/* SEO Server-Rendered Plain HTML Fallback */}
      <noscript>
        <div className="mt-4 p-4 rounded-xl bg-neutral-100 text-neutral-900 text-xs">
          <p>
            <strong>Time Difference Summary:</strong> {timeDiff.relationText}.
          </p>
          <p>
            Current Time in {placeA.name}: {timeDiff.fromTime.formattedTime} (
            {timeDiff.fromTime.timeZoneAbbr}, {timeDiff.fromTime.utcOffsetString}).
          </p>
          <p>
            Current Time in {placeB.name}: {timeDiff.toTime.formattedTime} (
            {timeDiff.toTime.timeZoneAbbr}, {timeDiff.toTime.utcOffsetString}).
          </p>
          <p>
            Great-Circle Distance: {distance.formattedKm} ({distance.formattedMiles}).
          </p>
        </div>
      </noscript>
    </div>
  );
}
