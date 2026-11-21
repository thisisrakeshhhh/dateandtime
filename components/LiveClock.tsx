"use client";

import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { Sun, Moon } from "lucide-react";
import { isCoordinateDaytime } from "@/lib/time";

interface LiveClockProps {
  timezone: string;
  lat?: number;
  lng?: number;
  placeName: string;
  countryName: string;
  badgeColor?: "emerald" | "indigo";
}

export default function LiveClock({
  timezone,
  lat,
  lng,
  placeName,
  countryName,
  badgeColor = "emerald",
}: LiveClockProps) {
  // Initialize with current time for the given timezone
  const [time, setTime] = useState(() => DateTime.now().setZone(timezone));
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    // Isolated 1-second interval ticking strictly inside this leaf component
    const interval = setInterval(() => {
      setTime(DateTime.now().setZone(timezone));
    }, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  const isDay =
    lat !== undefined && lng !== undefined
      ? isCoordinateDaytime(lat, lng, time)
      : time.hour >= 6 && time.hour < 18;

  const formattedTime = is24Hour
    ? time.toFormat("HH:mm:ss")
    : time.toFormat("hh:mm:ss a");

  const formattedDate = time.toFormat("cccc, MMMM d, yyyy");
  const timeZoneAbbr = time.offsetNameShort || time.toFormat("ZZZZ") || "UTC";
  const offsetString = time.toFormat("ZZZZ");

  const accentColor =
    badgeColor === "emerald"
      ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : "text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/10";

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs flex flex-col justify-between transition-all">
      {/* Header with Place info and Day/Night badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                badgeColor === "emerald" ? "bg-emerald-500" : "bg-indigo-500"
              }`}
            />
            <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white truncate">
              {placeName}
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {countryName}
          </p>
        </div>

        {/* Day / Night Indicator Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isDay
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20"
          }`}
        >
          {isDay ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Daytime</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Nighttime</span>
            </>
          )}
        </div>
      </div>

      {/* Main Digital Clock Display */}
      <div className="my-2">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50 tabular-nums">
            {formattedTime}
          </span>
          <button
            type="button"
            onClick={() => setIs24Hour((prev) => !prev)}
            className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            title="Toggle 12h/24h format"
          >
            {is24Hour ? "24H" : "12H"}
          </button>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
          {formattedDate}
        </p>
      </div>

      {/* Timezone Meta Footer */}
      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span className="font-medium flex items-center gap-1 font-mono text-[11px]">
          <span className={`px-1.5 py-0.5 rounded ${accentColor}`}>
            {timeZoneAbbr}
          </span>
          <span>{offsetString}</span>
        </span>
        {time.isInDST && (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            DST Active
          </span>
        )}
      </div>
    </div>
  );
}
