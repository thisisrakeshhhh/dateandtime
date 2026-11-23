'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { CityTimeReport } from '@/lib/cityTime';
import { Sun, Moon, Sunrise, Sunset, Clock, Globe, ArrowRight, ShieldCheck, Thermometer } from 'lucide-react';

interface WeatherData {
  tempC?: number;
  tempF?: number;
  condition?: string;
  label?: string;
  isPlaceholder?: boolean;
  humidity?: number;
  windKmh?: number;
}

export default function CityTimeClient({ report }: { report: CityTimeReport }) {
  const { city, displayName, countryWithZone, utcOffsetStr, isInDst, dstZoneAbbr, sunrise, sunset, solarNoon, differencesFromMajor, relatedLinks, articleSections } = report;

  // Live ticking clock state
  const [liveDt, setLiveDt] = useState<DateTime>(() => DateTime.now().setZone(city.timezone));
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // 1-second interval to keep time live and never frozen
    const timer = setInterval(() => {
      setLiveDt(DateTime.now().setZone(city.timezone));
    }, 1000);

    // Weather fetch
    if (city.lat && city.lng) {
      fetch(`/api/weather?lat=${city.lat}&lng=${city.lng}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.tempC === 'number') {
            setWeather(data);
          }
        })
        .catch(() => {
          // Weather is non-blocking
        });
    }

    return () => clearInterval(timer);
  }, [city.timezone, city.lat, city.lng]);

  const timeFormatted = liveDt.toFormat('hh:mm:ss a');
  const dateFormatted = liveDt.toFormat('cccc, MMMM d, yyyy');
  const hours = liveDt.hour;
  const isDaytime = hours >= 6 && hours < 20;

  return (
    <div className="space-y-8">
      {/* Hero Live Time Card */}
      <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-theme">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              Live City Clock
            </span>
            <span className="text-xs font-medium text-muted">
              {countryWithZone}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Globe className="w-3.5 h-3.5" />
            <span>Zone: {city.timezone}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              What time is it in {displayName}?
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted">
              {dateFormatted}
            </p>
          </div>

          {/* Big Live Clock */}
          <div className="flex items-center gap-4 bg-card border border-theme rounded-2xl px-6 py-4 shadow-inner">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              {isDaytime ? <Sun className="w-8 h-8 text-amber-500" /> : <Moon className="w-8 h-8 text-indigo-400" />}
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-foreground">
                {timeFormatted}
              </div>
              <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-foreground">{dstZoneAbbr}</span>
                <span>({utcOffsetStr})</span>
                <span className="text-accent font-medium">
                  {isInDst ? '• DST Active' : '• Standard Time'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar: Sunrise, Sunset, Solar Noon, Weather */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <div className="p-3.5 rounded-xl bg-card border border-theme">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <Sunrise className="w-4 h-4 text-amber-500" />
              <span>Sunrise</span>
            </div>
            <div className="text-sm font-semibold text-foreground font-mono">{sunrise}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-theme">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <Sunset className="w-4 h-4 text-rose-500" />
              <span>Sunset</span>
            </div>
            <div className="text-sm font-semibold text-foreground font-mono">{sunset}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-theme">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <Sun className="w-4 h-4 text-accent" />
              <span>Solar Noon</span>
            </div>
            <div className="text-sm font-semibold text-foreground font-mono">{solarNoon}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-theme">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <Thermometer className="w-4 h-4 text-sky-500" />
              <span>{weather?.label || (weather?.isPlaceholder ? `Typical weather in ${DateTime.now().toFormat('LLLL')}` : 'Weather')}</span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {weather && typeof weather.tempC === 'number'
                ? `${Math.round(weather.tempC)}°C (${Math.round((weather.tempC * 9) / 5 + 32)}°F)`
                : 'Seasonal baseline'}
            </div>
          </div>
        </div>
      </div>

      {/* Difference from 6 Major Global Cities */}
      <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Time Difference between {city.name} and Major Cities
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Live offset and mutual 9 AM – 5 PM business hour overlap with world financial capitals.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-theme text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="py-3 px-4">Global City</th>
                <th className="py-3 px-4">Their Time</th>
                <th className="py-3 px-4">Difference</th>
                <th className="py-3 px-4">9 AM – 5 PM Office Overlap</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {differencesFromMajor.map((hub) => (
                <tr key={hub.slug} className="hover:bg-card/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    <div>{hub.name}</div>
                    <div className="text-xs text-muted">{hub.country}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-foreground">
                    {hub.currentTimeStr}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                        hub.diffMinutes === 0
                          ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                          : hub.isAhead
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {hub.diffFormatted}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-muted">
                    {hub.overlapOfficeHours}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/time-difference/${city.slug}-to-${hub.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      Compare
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informational Rich Content Sections (> 250 words) */}
      <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <ShieldCheck className="w-4 h-4" />
          <span>Authoritative Local Time Facts & Scheduling Guide</span>
        </div>

        {articleSections.map((sec, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">{sec.heading}</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{sec.body}</p>
          </div>
        ))}
      </div>

      {/* 6 Related Links */}
      {relatedLinks.length > 0 && (
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-4">
            Related Time Corridors and City Clocks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {relatedLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="p-3 rounded-xl bg-card border border-theme hover:border-accent text-xs font-medium text-foreground hover:text-accent transition-all flex items-center justify-between group"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
