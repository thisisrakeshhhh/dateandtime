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
}: LiveClockProps) {
  const [time, setTime] = useState(() => DateTime.now().setZone(timezone));
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
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
    : time.toFormat("h:mm:ss a");

  const formattedDate = time.toFormat("cccc, d LLLL yyyy");
  const timeZoneAbbr = time.offsetNameShort || time.toFormat("ZZZZ") || "UTC";
  const offsetString = time.toFormat("ZZZZ");

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white truncate">
            {placeName}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {countryName}
          </p>
        </div>

        {/* Day / Night Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
          {isDay ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Day</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-neutral-400" />
              <span>Night</span>
            </>
          )}
        </div>
      </div>

      {/* Main Clock */}
      <div className="my-2">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white tabular-nums">
            {formattedTime}
          </span>
          <button
            type="button"
            onClick={() => setIs24Hour((prev) => !prev)}
            className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {is24Hour ? "24h" : "12h"}
          </button>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {formattedDate}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span className="font-mono text-[11px] flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-800 dark:text-neutral-200">
            {timeZoneAbbr}
          </span>
          <span>{offsetString}</span>
        </span>
        {time.isInDST && (
          <span className="text-[11px] font-medium text-[#E85D4E] bg-[#E85D4E]/10 px-2 py-0.5 rounded-full">
            DST Active
          </span>
        )}
      </div>
    </div>
  );
}
