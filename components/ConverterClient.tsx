"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DateTime } from "luxon";
import { AbbreviationInfo, calculateAbbreviationConversion } from "@/lib/abbreviations";
import { Clock, Calendar, ArrowLeftRight, Check, Share2, Sparkles } from "lucide-react";

interface ConverterClientProps {
  fromAbbr: AbbreviationInfo;
  toAbbr: AbbreviationInfo;
  initialDateIso?: string;
  initialTime?: string;
}

const QUICK_TIMES = [
  { label: "9:00 AM", value: "09:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "3:00 PM", value: "15:00" },
  { label: "6:00 PM", value: "18:00" },
  { label: "9:00 PM", value: "21:00" },
];

export default function ConverterClient({
  fromAbbr,
  toAbbr,
  initialDateIso = DateTime.now().toFormat("yyyy-MM-dd"),
  initialTime = "12:00",
}: ConverterClientProps) {
  const [dateIso, setDateIso] = useState<string>(initialDateIso);
  const [timeStr, setTimeStr] = useState<string>(initialTime);
  const [is24Hour, setIs24Hour] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute live conversion using real IANA zone calculations
  const result = useMemo(() => {
    return calculateAbbreviationConversion(fromAbbr.code, toAbbr.code, dateIso, timeStr);
  }, [fromAbbr.code, toAbbr.code, dateIso, timeStr]);

  function handleShare() {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const swapSlug = `${toAbbr.code.toLowerCase()}-to-${fromAbbr.code.toLowerCase()}`;

  return (
    <div className="w-full bg-white dark:bg-[#161616] rounded-2xl border border-neutral-200/90 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E85D4E] shadow-[0_0_10px_rgba(232,93,78,0.7)]" />
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
            Time Converter: {fromAbbr.code} to {toAbbr.code}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIs24Hour(!is24Hour)}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {is24Hour ? "24h format" : "12h format"}
          </button>

          <Link
            href={`/converter/${swapSlug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-white/[0.06] text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors"
            title="Swap conversion direction"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#E85D4E]" />
            <span>Swap</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Copy share link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
        {/* Time Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Select Time in {fromAbbr.code} ({fromAbbr.name}):
          </label>
          <div className="relative flex items-center">
            <Clock className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-200 dark:border-white/[0.08] text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/20 focus:border-[#E85D4E] transition-all"
            />
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Select Calendar Date:
          </label>
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-200 dark:border-white/[0.08] text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D4E]/20 focus:border-[#E85D4E] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Quick Time Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-5">
        <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#E85D4E]" /> Quick:
        </span>
        {QUICK_TIMES.map((qt) => (
          <button
            key={qt.value}
            type="button"
            onClick={() => setTimeStr(qt.value)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              timeStr === qt.value
                ? "bg-[#E85D4E] text-white shadow-2xs"
                : "bg-neutral-100 dark:bg-[#202020] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {qt.label}
          </button>
        ))}
      </div>

      {/* Conversion Result Display */}
      {result && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/60 dark:from-[#202020] dark:to-[#1a1a1a] border border-neutral-200/80 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* From Card */}
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              Source Time ({fromAbbr.code})
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white">
              {is24Hour ? timeStr : result.fromTimeFormatted}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {result.fromDateFormatted} · {result.fromOffsetStr}
            </div>
          </div>

          {/* Indicator Arrow */}
          <div className="flex items-center justify-center shrink-0">
            <span className="w-10 h-10 rounded-full bg-[#E85D4E]/10 dark:bg-[#E85D4E]/20 text-[#E85D4E] flex items-center justify-center font-bold text-base shadow-2xs">
              →
            </span>
          </div>

          {/* To Card */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">
                Converted Time ({toAbbr.code})
              </span>
              {result.dayDifference !== 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  {result.dayDifferenceLabel}
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#E85D4E] dark:text-rose-400">
              {is24Hour
                ? DateTime.fromISO(`${dateIso}T${timeStr}:00`, { zone: fromAbbr.defaultIana })
                    .setZone(toAbbr.defaultIana)
                    .toFormat("HH:mm")
                : result.toTimeFormatted}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {result.toDateFormatted} · {result.toOffsetStr}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
