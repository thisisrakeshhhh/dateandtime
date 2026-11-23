"use client";

import React, { useEffect, useState } from "react";
import {
  Place,
  formatPlaceDisplayName,
  getCityGoogleMapsInfo,
} from "@/lib/places";
import { siteConfig } from "@/lib/config";
import { getSolarTimes, getDstInfo } from "@/lib/astronomy";
import { formatTimeDifference } from "@/lib/time";
import { calculateDistance } from "@/lib/distance";
import FlagIcon from "@/components/FlagIcon";
import WeatherIcon from "@/components/WeatherIcon";
import {
  X,
  Sunrise,
  Sunset,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Navigation,
  Landmark,
  Maximize2,
  Users,
  Compass,
  Globe2,
} from "lucide-react";
import { DateTime } from "luxon";

interface WeatherData {
  success: boolean;
  isPlaceholder?: boolean;
  label?: string;
  current?: {
    temperature: number;
    feelsLike: number;
    condition: string;
    icon: string;
    isDay: boolean;
  };
  forecast?: Array<{
    date: string;
    day: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    icon: string;
  }>;
  attribution?: string;
}

interface HolidayData {
  isHoliday: boolean;
  holidayName: string | null;
}

interface PlaceDetailsCardProps {
  place: Place;
  userPlace?: Place | null;
  userTimezone: string;
  onCompareWith: (place: Place) => void;
  onClose: () => void;
}

export default function PlaceDetailsCard({
  place,
  userPlace,
  userTimezone,
  onCompareWith,
  onClose,
}: PlaceDetailsCardProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [utcOffsetStr, setUtcOffsetStr] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [holiday, setHoliday] = useState<HolidayData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Live clock
  useEffect(() => {
    function updateClock() {
      const dt = DateTime.now().setZone(place.timezone);
      setCurrentTime(dt.toFormat("h:mm:ss a"));
      setCurrentDate(dt.toFormat("cccc, d LLLL yyyy"));
      setUtcOffsetStr(dt.toFormat("ZZZZ")); // e.g. "GMT+5:30"
    }

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [place.timezone]);

  // Fetch Weather & Holidays
  useEffect(() => {
    let active = true;
    setLoadingWeather(true);

    // Weather fetch
    fetch(`/api/weather?lat=${place.lat}&lng=${place.lng}`)
      .then((res) => (res.ok ? res.json().catch(() => null) : null))
      .then((data: WeatherData | null) => {
        if (active && data) {
          setWeather(data);
          setLoadingWeather(false);
        }
      })
      .catch(() => {
        if (active) setLoadingWeather(false);
      });

    // Holiday fetch
    if (place.countryIso) {
      const today = DateTime.now().setZone(place.timezone).toFormat("yyyy-MM-dd");
      fetch(`/api/holidays?countryCode=${place.countryIso}&date=${today}`)
        .then((res) => (res.ok ? res.json().catch(() => null) : null))
        .then((data) => {
          if (active && data && data.success) {
            setHoliday({
              isHoliday: data.isHoliday,
              holidayName: data.holidayName,
            });
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [place.lat, place.lng, place.countryIso, place.timezone]);

  // Astronomical calculations
  const solarTimes = getSolarTimes(place.lat, place.lng, place.timezone);
  const dstInfo = getDstInfo(place.timezone);

  // Difference from user
  const diffFromUser = formatTimeDifference(userTimezone, place.timezone);

  // Google Maps info when city is selected
  const cityInfo =
    place.type === "city"
      ? getCityGoogleMapsInfo(place, userPlace, userTimezone)
      : null;

  // Country coordinates formatting
  const latDir = place.lat >= 0 ? "N" : "S";
  const lngDir = place.lng >= 0 ? "E" : "W";
  const formattedCoords = `${Math.abs(place.lat).toFixed(2)}° ${latDir}, ${Math.abs(place.lng).toFixed(2)}° ${lngDir}`;

  // Distance from user for countries
  const countryDistFromUser =
    userPlace && userPlace.slug !== place.slug
      ? calculateDistance(userPlace.lat, userPlace.lng, place.lat, place.lng)
      : null;

  return (
    <aside
      aria-label="Location details"
      className="w-full bg-white dark:bg-[#181818] rounded-t-2xl md:rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 text-neutral-900 dark:text-neutral-100 transition-all duration-200"
    >
      {/* Mobile Drag Indicator Bar */}
      <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full mx-auto -mt-0.5 mb-1 md:hidden shrink-0" />

      {/* Header with Name, Flag and Close */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <FlagIcon countryCode={place.countryIso} size="md" />
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight leading-tight truncate">
              {formatPlaceDisplayName(place)}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
              {place.timezone} ({utcOffsetStr || "UTC"})
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Public Holiday Banner if active */}
      {holiday?.isHoliday && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="font-medium">
            Public Holiday today: <strong>{holiday.holidayName}</strong>
          </span>
        </div>
      )}

      {/* Live Time & Date */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/70 dark:from-[#202020] dark:to-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-2xs">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-400 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#E85D4E]" />
            <span>Local Time</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white tabular-nums">
          {currentTime || "--:--:--"}
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>{currentDate || "Loading date..."}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs">
          {diffFromUser.isSameTime ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Same time as your location</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E85D4E]/10 dark:bg-[#E85D4E]/15 text-[#E85D4E] dark:text-rose-400 font-semibold text-[11px]">
              {diffFromUser.aheadOrBehindText} ({diffFromUser.hoursPart}h {diffFromUser.minutesPart}m {diffFromUser.isAhead ? "ahead" : "behind"})
            </span>
          )}
        </div>
      </div>

      {/* Google Maps City Information (shown when a city is selected) */}
      {cityInfo && (
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800 text-xs flex flex-col gap-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>City Profile</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-700/60 font-semibold text-neutral-700 dark:text-neutral-300">
              Maps Info
            </span>
          </div>

          {/* Within Country / Distance to Capital */}
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-rose-500/10 text-[#E85D4E] flex items-center justify-center shrink-0 mt-0.5">
              {cityInfo.isCapital ? (
                <Landmark className="w-3 h-3" />
              ) : (
                <Navigation className="w-3 h-3" />
              )}
            </div>
            <div>
              <div className="text-[10px] text-neutral-400 font-medium">
                {cityInfo.isCapital ? "National Status" : "Within Country"}
              </div>
              <div className="font-medium text-neutral-800 dark:text-neutral-200">
                {cityInfo.formattedDistanceToCapital}
              </div>
            </div>
          </div>

          {/* Distance from User Location */}
          {cityInfo.formattedDistanceFromUser && (
            <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-800">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3 h-3" />
              </div>
              <div>
                <div className="text-[10px] text-neutral-400 font-medium">
                  Distance from You
                </div>
                <div className="font-medium text-neutral-800 dark:text-neutral-200">
                  {cityInfo.formattedDistanceFromUser}
                </div>
              </div>
            </div>
          )}

          {/* Area & Population in grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-800">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Maximize2 className="w-3 h-3" />
              </div>
              <div>
                <div className="text-[10px] text-neutral-400 font-medium">City Area</div>
                <div className="font-medium text-neutral-800 dark:text-neutral-200">
                  {cityInfo.formattedArea}
                </div>
              </div>
            </div>

            {cityInfo.formattedPopulation && (
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-3 h-3" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 font-medium">Population</div>
                  <div className="font-medium text-neutral-800 dark:text-neutral-200">
                    {cityInfo.formattedPopulation}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Exact Coordinates */}
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-800">
            <div className="w-5 h-5 rounded-full bg-neutral-500/10 text-neutral-500 flex items-center justify-center shrink-0">
              <Compass className="w-3 h-3" />
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Coordinates: <span className="font-medium text-neutral-800 dark:text-neutral-200">{cityInfo.coordinatesFormatted}</span>
            </div>
          </div>
        </div>
      )}

      {/* Country Overview (when country is selected) */}
      {!cityInfo && (
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800 text-xs flex flex-col gap-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Country Geography</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-700/60 font-semibold text-neutral-700 dark:text-neutral-300">
              Country Info
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {place.capital && (
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-rose-500/10 text-[#E85D4E] flex items-center justify-center shrink-0 mt-0.5">
                  <Landmark className="w-3 h-3" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 font-medium">Capital</div>
                  <div className="font-medium text-neutral-800 dark:text-neutral-200">
                    {place.capital}
                  </div>
                </div>
              </div>
            )}

            {place.continent && (
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe2 className="w-3 h-3" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 font-medium">Continent</div>
                  <div className="font-medium text-neutral-800 dark:text-neutral-200">
                    {place.continent}
                  </div>
                </div>
              </div>
            )}
          </div>

          {countryDistFromUser && (
            <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-800">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3 h-3" />
              </div>
              <div>
                <div className="text-[10px] text-neutral-400 font-medium">Distance from You</div>
                <div className="font-medium text-neutral-800 dark:text-neutral-200">
                  {countryDistFromUser.formattedKm} ({countryDistFromUser.formattedMiles}) from your location
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-800">
            <div className="w-5 h-5 rounded-full bg-neutral-500/10 text-neutral-500 flex items-center justify-center shrink-0">
              <Compass className="w-3 h-3" />
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Coordinates: <span className="font-medium text-neutral-800 dark:text-neutral-200">{formattedCoords}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sun Times & DST */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 mb-1">
            <Sunrise className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px]">Sunrise</span>
          </div>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {solarTimes.sunrise}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 mb-1">
            <Sunset className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px]">Sunset</span>
          </div>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {solarTimes.sunset}
          </span>
        </div>
      </div>

      {/* Daylight Saving Info */}
      <div className="px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800 text-xs">
        <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
          Daylight Saving Time
        </div>
        <div className="text-neutral-800 dark:text-neutral-200 mt-0.5 font-medium">
          {dstInfo.nextTransition}
        </div>
      </div>

      {/* Weather Section */}
      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800 text-xs">
        <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-400 mb-2">
          {weather?.isPlaceholder
            ? (weather.label || `Typical weather in ${new Date().toLocaleDateString('en-US', { month: 'long' })}`)
            : 'Live Weather'}
        </div>

        {loadingWeather ? (
          <div className="text-xs text-neutral-400 py-2">Loading weather...</div>
        ) : weather?.success && weather.current ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <WeatherIcon
                  icon={weather.current.icon}
                  isDay={weather.current.isDay}
                  className="w-5 h-5 text-neutral-700 dark:text-neutral-300"
                />
                <span className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {weather.current.temperature}°C
                </span>
                <span className="text-xs text-neutral-400">
                  (Feels {weather.current.feelsLike}°C)
                </span>
              </div>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                {weather.current.condition}
              </span>
            </div>

            {/* 3-Day Forecast */}
            {weather.forecast && weather.forecast.length > 0 && (
              <div className="pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800 grid grid-cols-3 gap-1 text-center">
                {weather.forecast.map((f, i) => (
                  <div key={i} className="py-1">
                    <div className="text-[10px] text-neutral-400 font-medium">{f.day}</div>
                    <div className="my-1 flex justify-center">
                      <WeatherIcon icon={f.icon} className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                    <div className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                      {f.maxTemp}° / {f.minTemp}°
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 text-[10px] text-neutral-400 text-right">
              {weather.attribution}
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-400">Weather data temporarily unavailable</div>
        )}
      </div>

      {/* Primary Compare Action Button */}
      <button
        onClick={() => onCompareWith(place)}
        className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#E85D4E] to-[#d94f40] hover:from-[#d94f40] hover:to-[#c84335] shadow-[0_4px_16px_rgba(232,93,78,0.3)] hover:shadow-[0_6px_22px_rgba(232,93,78,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#E85D4E]/25"
      >
        <span>Compare with another place</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Suggest a city / feedback */}
      <div className="text-center text-[11px] text-neutral-400 dark:text-neutral-500 pt-0.5">
        Feedback or add a missing city?{" "}
        <a
          href={`mailto:${siteConfig.contactEmail}?subject=TimeBridge%20Suggestion`}
          className="text-[#E85D4E] hover:underline font-medium"
        >
          {siteConfig.contactEmail}
        </a>
      </div>
    </aside>
  );
}
