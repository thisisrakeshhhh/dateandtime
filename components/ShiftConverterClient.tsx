"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  calculateShiftAnalysis,
  encodeShiftToParams,
  decodeShiftFromParams,
  ShiftInput,
} from "@/lib/shifts";
import {
  Calendar,
  Share2,
  Check,
  Briefcase,
  AlertCircle,
  Globe,
} from "lucide-react";

interface ShiftConverterClientProps {
  initialShift?: "us-in-ist" | "uk-in-ist" | "custom";
}

const PRESETS = [
  {
    name: "US Night Shift (IST)",
    start: "18:00",
    end: "03:00",
    zone: "Asia/Kolkata",
    client: "united-states",
  },
  {
    name: "US Late Support (IST)",
    start: "20:00",
    end: "05:00",
    zone: "Asia/Kolkata",
    client: "united-states",
  },
  {
    name: "UK Afternoon (IST)",
    start: "13:30",
    end: "22:30",
    zone: "Asia/Kolkata",
    client: "united-kingdom",
  },
  {
    name: "Australia Morning (IST)",
    start: "04:30",
    end: "13:30",
    zone: "Asia/Kolkata",
    client: "australia",
  },
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ShiftConverterClient({
  initialShift = "custom",
}: ShiftConverterClientProps) {
  // Determine default state based on preset or URL
  const [startTime, setStartTime] = useState<string>(() => {
    if (initialShift === "us-in-ist") return "18:00";
    if (initialShift === "uk-in-ist") return "13:30";
    return "18:00";
  });

  const [endTime, setEndTime] = useState<string>(() => {
    if (initialShift === "us-in-ist") return "03:00";
    if (initialShift === "uk-in-ist") return "22:30";
    return "03:00";
  });

  const [shiftZone, setShiftZone] = useState<string>("Asia/Kolkata");
  const [clientCountry, setClientCountry] = useState<string>(() => {
    if (initialShift === "uk-in-ist") return "united-kingdom";
    return "united-states";
  });

  const [workDays, setWorkDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [dateIso, setDateIso] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Read URL search params on mount if present
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      try {
        const decoded = decodeShiftFromParams(new URLSearchParams(window.location.search));
        if (decoded.startTime) setStartTime(decoded.startTime);
        if (decoded.endTime) setEndTime(decoded.endTime);
        if (decoded.shiftZone) setShiftZone(decoded.shiftZone);
        if (decoded.clientCountrySlug) setClientCountry(decoded.clientCountrySlug);
        if (decoded.workDays && decoded.workDays.length > 0) setWorkDays(decoded.workDays);
        if (decoded.dateIso) setDateIso(decoded.dateIso);
      } catch {}
    }
  }, []);

  const shiftInput: ShiftInput = useMemo(() => ({
    startTime,
    endTime,
    shiftZone,
    clientCountrySlug: clientCountry,
    workDays,
    dateIso,
  }), [startTime, endTime, shiftZone, clientCountry, workDays, dateIso]);

  const analysis = useMemo(() => calculateShiftAnalysis(shiftInput), [shiftInput]);

  function handleShare() {
    if (typeof window === "undefined") return;
    const queryString = encodeShiftToParams(shiftInput);
    const fullUrl = `${window.location.origin}${window.location.pathname}?${queryString}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function toggleDay(day: string) {
    if (workDays.includes(day)) {
      if (workDays.length > 1) {
        setWorkDays(workDays.filter((d) => d !== day));
      }
    } else {
      setWorkDays([...workDays, day]);
    }
  }

  function setPreset(p: typeof PRESETS[0]) {
    setStartTime(p.start);
    setEndTime(p.end);
    setShiftZone(p.zone);
    setClientCountry(p.client);
  }

  function setSeason(season: "winter" | "summer") {
    const currentYear = new Date().getFullYear();
    if (season === "winter") {
      setDateIso(`${currentYear}-01-15`);
    } else {
      setDateIso(`${currentYear}-07-15`);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Interactive Shift Input Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#E85D4E]" />
              Shift Configuration
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Specify your shift hours, time zone, and client destination.
            </p>
          </div>

          <button
            onClick={handleShare}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Shift Link</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Shift Presets */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Popular shift templates
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const isActive =
                startTime === p.start &&
                endTime === p.end &&
                clientCountry === p.client;
              return (
                <button
                  key={p.name}
                  onClick={() => setPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#E85D4E] text-white shadow-xs"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Shift Start Time */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Shift Start Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-mono font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/20 focus:border-[#E85D4E]"
              />
            </div>
          </div>

          {/* Shift End Time */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Shift End Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-mono font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/20 focus:border-[#E85D4E]"
              />
            </div>
          </div>

          {/* Your Time Zone */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Your Time Zone
            </label>
            <select
              value={shiftZone}
              onChange={(e) => setShiftZone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/20 focus:border-[#E85D4E]"
            >
              <option value="Asia/Kolkata">India (IST · UTC+5:30)</option>
              <option value="America/New_York">US Eastern (EST/EDT)</option>
              <option value="America/Chicago">US Central (CST/CDT)</option>
              <option value="America/Los_Angeles">US Pacific (PST/PDT)</option>
              <option value="Europe/London">UK (GMT/BST)</option>
              <option value="Australia/Sydney">Australia (AEST/AEDT)</option>
              <option value="Asia/Dubai">Gulf Standard Time (GST · UTC+4)</option>
              <option value="Asia/Singapore">Singapore (SGT · UTC+8)</option>
            </select>
          </div>

          {/* Client Country */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Client Country
            </label>
            <select
              value={clientCountry}
              onChange={(e) => setClientCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/20 focus:border-[#E85D4E]"
            >
              <option value="united-states">United States</option>
              <option value="united-kingdom">United Kingdom</option>
              <option value="australia">Australia</option>
              <option value="canada">Canada</option>
            </select>
          </div>
        </div>

        {/* Calendar Date & Season Toggles */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Reference Date:
            </span>
            <input
              type="date"
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#E85D4E]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-400 mr-1">Test Season:</span>
            <button
              onClick={() => setSeason("winter")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                dateIso.includes("-01-")
                  ? "bg-neutral-800 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              Winter (Standard Time)
            </button>
            <button
              onClick={() => setSeason("summer")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                dateIso.includes("-07-")
                  ? "bg-neutral-800 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              Summer (Daylight Saving)
            </button>
          </div>
        </div>

        {/* Working Days Selector */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Shift Working Days
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DAYS_OF_WEEK.map((d) => {
              const selected = workDays.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`w-11 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? "bg-[#E85D4E] text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-2xs">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
            Shift Duration
          </span>
          <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
            {analysis.shiftDurationFormatted}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {analysis.crossesMidnight ? "Crosses midnight into next day" : "Single calendar day"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-2xs">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
            Target Client Country
          </span>
          <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
            {analysis.clientCountryName}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Office hours standard: 9:00 AM – 5:00 PM
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-2xs">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
            Primary Office Overlap
          </span>
          <p className="text-xl font-bold text-[#E85D4E] mt-0.5">
            {analysis.targets[0]?.overlapFormatted || "0m"}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {analysis.targets[0]?.overlapWindow}
          </p>
        </div>
      </div>

      {/* 3. Converted Shift Timings Grid Across Major Zones */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#E85D4E]" />
          Shift Hours in Major Client Time Zones
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Showing converted shift hours and overlap with standard 9:00 AM – 5:00 PM local office hours:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {analysis.targets.map((target) => (
            <div
              key={target.label}
              className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-2xs hover:border-[#E85D4E]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {target.label}
                  </h4>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      target.isDST
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {target.abbr} · {target.isDST ? "DST Active" : "Standard"}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                    {target.convertedStartTime} – {target.convertedEndTime}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-500 mt-1">
                  {target.dayOffsetLabel} relative to shift start date
                </p>
              </div>

              {/* Office Overlap Progress Meter */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">9 AM – 5 PM Overlap:</span>
                  <span className="font-bold text-[#E85D4E]">
                    {target.overlapFormatted} ({target.overlapPercent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-[#E85D4E] rounded-full transition-all duration-300"
                    style={{ width: `${target.overlapPercent}%` }}
                  />
                </div>

                <p className="text-[10px] text-neutral-400 font-mono">
                  Window: {target.overlapWindow}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Seasonal DST Impact Box */}
      <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 rounded-2xl space-y-2">
        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          What Changes in Summer vs. Winter (Daylight Saving Impact)
        </h4>
        <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
          {analysis.seasonalComparison.differenceNote}
        </p>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          When client countries switch between Standard Time and Daylight Saving Time (typically in March and November), remote teams in fixed-offset zones (such as India Standard Time) must adjust their working hours by 1 hour to retain the same client overlap.
        </p>
      </div>
    </div>
  );
}
