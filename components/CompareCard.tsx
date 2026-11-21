"use client";

import React, { useEffect, useState } from "react";
import { Place, formatPlaceDisplayName } from "@/lib/places";
import { formatTimeDifference, isCoordinateDaytime } from "@/lib/time";
import { calculateDistance, formatDistanceKm, formatDistanceMiles, estimateFlightTime } from "@/lib/distance";
import FlagIcon from "@/components/FlagIcon";
import WeatherIcon from "@/components/WeatherIcon";
import CallTimeline from "@/components/CallTimeline";
import MeetingTable from "@/components/MeetingTable";
import {
  ArrowLeftRight,
  Share2,
  X,
  Plane,
  MapPin,
  Check,
  Sun,
  Moon,
} from "lucide-react";
import { DateTime } from "luxon";

interface CompareCardProps {
  placeA: Place;
  placeB: Place;
  onSwap: () => void;
  onClear: () => void;
}

interface PlaceWeather {
  temp: number;
  condition: string;
  icon: string;
  isDay: boolean;
}

export default function CompareCard({
  placeA,
  placeB,
  onSwap,
  onClear,
}: CompareCardProps) {
  const [timeA, setTimeA] = useState("");
  const [dateA, setDateA] = useState("");
  const [timeB, setTimeB] = useState("");
  const [dateB, setDateB] = useState("");
  const [copied, setCopied] = useState(false);

  const [weatherA, setWeatherA] = useState<PlaceWeather | null>(null);
  const [weatherB, setWeatherB] = useState<PlaceWeather | null>(null);

  // Live ticking clocks
  useEffect(() => {
    function updateClocks() {
      const dtA = DateTime.now().setZone(placeA.timezone);
      const dtB = DateTime.now().setZone(placeB.timezone);
      setTimeA(dtA.toFormat("h:mm:ss a"));
      setDateA(dtA.toFormat("ccc, d LLL yyyy"));
      setTimeB(dtB.toFormat("h:mm:ss a"));
      setDateB(dtB.toFormat("ccc, d LLL yyyy"));
    }

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [placeA.timezone, placeB.timezone]);

  // Weather fetch for both places
  useEffect(() => {
    let active = true;

    fetch(`/api/weather?lat=${placeA.lat}&lng=${placeA.lng}`)
      .then((res) => (res.ok ? res.json().catch(() => null) : null))
      .then((d) => {
        if (active && d && d.success && d.current) {
          setWeatherA({
            temp: d.current.temperature,
            condition: d.current.condition,
            icon: d.current.icon,
            isDay: d.current.isDay,
          });
        }
      })
      .catch(() => {});

    fetch(`/api/weather?lat=${placeB.lat}&lng=${placeB.lng}`)
      .then((res) => (res.ok ? res.json().catch(() => null) : null))
      .then((d) => {
        if (active && d && d.success && d.current) {
          setWeatherB({
            temp: d.current.temperature,
            condition: d.current.condition,
            icon: d.current.icon,
            isDay: d.current.isDay,
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [placeA.lat, placeA.lng, placeB.lat, placeB.lng]);

  // Calculations
  const diff = formatTimeDifference(placeB.timezone, placeA.timezone);
  const distance = calculateDistance(placeA.lat, placeA.lng, placeB.lat, placeB.lng);
  const flightTime = estimateFlightTime(distance.km);

  const isDayA = isCoordinateDaytime(placeA.lat, placeA.lng);
  const isDayB = isCoordinateDaytime(placeB.lat, placeB.lng);

  // Copy share URL
  function handleShare() {
    const url = `${window.location.origin}/time-difference/${placeA.slug}-to-${placeB.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  }

  // Headline calculation
  const headlineText = diff.isSameTime
    ? "Same time zone"
    : `${diff.hoursPart}h ${diff.minutesPart > 0 ? `${diff.minutesPart}m ` : ""}${
        diff.isAhead ? "ahead" : "behind"
      }`;

  const sublineText = diff.isSameTime
    ? `${placeA.name} and ${placeB.name} share the same local time.`
    : `${placeA.name} is ${diff.hoursPart} hour${diff.hoursPart !== 1 ? "s" : ""}${
        diff.minutesPart > 0 ? ` and ${diff.minutesPart} minutes` : ""
      } ${diff.isAhead ? "ahead of" : "behind"} ${placeB.name}.`;

  return (
    <div className="w-full bg-white dark:bg-[#181818] rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-7 flex flex-col gap-6 text-neutral-900 dark:text-neutral-100">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          <span>{formatPlaceDisplayName(placeA)}</span>
          <span className="text-neutral-400">→</span>
          <span>{formatPlaceDisplayName(placeB)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwap}
            title="Swap places"
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Swap</span>
          </button>

          <button
            onClick={handleShare}
            title="Copy share link"
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          <button
            onClick={onClear}
            title="Clear comparison"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Time Difference Headline */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {headlineText}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {sublineText}
        </p>
      </div>

      {/* Two Place Columns: Time, Day/Night, Weather */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Column Place A */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlagIcon countryCode={placeA.countryIso} size="md" />
              <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                {formatPlaceDisplayName(placeA)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              {isDayA ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>{isDayA ? "Day" : "Night"}</span>
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              {timeA || "--:--:--"}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {dateA || "Loading date..."}
            </div>
          </div>

          {weatherA && (
            <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <WeatherIcon icon={weatherA.icon} isDay={weatherA.isDay} className="w-3.5 h-3.5" />
                <span className="font-medium">{weatherA.temp}°C</span>
              </div>
              <span className="text-neutral-400 text-[11px]">{weatherA.condition}</span>
            </div>
          )}
        </div>

        {/* Column Place B */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlagIcon countryCode={placeB.countryIso} size="md" />
              <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                {formatPlaceDisplayName(placeB)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              {isDayB ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>{isDayB ? "Day" : "Night"}</span>
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              {timeB || "--:--:--"}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {dateB || "Loading date..."}
            </div>
          </div>

          {weatherB && (
            <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <WeatherIcon icon={weatherB.icon} isDay={weatherB.isDay} className="w-3.5 h-3.5" />
                <span className="font-medium">{weatherB.temp}°C</span>
              </div>
              <span className="text-neutral-400 text-[11px]">{weatherB.condition}</span>
            </div>
          )}
        </div>
      </div>

      {/* Distance & Flight Time Stat blocks */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Distance</div>
            <div className="font-semibold text-neutral-900 dark:text-white mt-0.5">
              {formatDistanceKm(distance.km)} ({formatDistanceMiles(distance.miles)})
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center shrink-0">
            <Plane className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Flight Time</div>
            <div className="font-semibold text-neutral-900 dark:text-white mt-0.5">
              ~{flightTime.hours}h {flightTime.minutes > 0 ? `${flightTime.minutes}m` : ""} direct
            </div>
          </div>
        </div>
      </div>

      {/* Best Time to Call Timeline */}
      <div className="pt-2">
        <CallTimeline placeA={placeA} placeB={placeB} />
      </div>

      {/* Collapsible Hour-by-Hour Table */}
      <div className="pt-2">
        <MeetingTable placeA={placeA} placeB={placeB} defaultExpanded={false} />
      </div>
    </div>
  );
}
