"use client";

import React, { useState } from "react";
import { Place } from "@/lib/places";
import { generate24HourTable, OverlapHour } from "@/lib/time";
import { Clock, Sun, Moon, Briefcase, PhoneCall, Check } from "lucide-react";

interface MeetingTableProps {
  placeA: Place;
  placeB: Place;
}

export default function MeetingTable({ placeA, placeB }: MeetingTableProps) {
  const [is24Hour, setIs24Hour] = useState(false);
  const [selectedHourIndex, setSelectedHourIndex] = useState<number | null>(9); // Default to 9 AM selected

  // Generate 24 hours starting at 0:00 or 9:00 AM
  const slots: OverlapHour[] = generate24HourTable(
    placeA.timezone,
    placeB.timezone,
    placeA.lat,
    placeA.lng,
    placeB.lat,
    placeB.lng,
    0
  );

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-5 sm:p-7 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Clock className="w-4 h-4" />
            <span>24-Hour Comparison</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
            When It Is 9 AM in {placeA.name}, What Time Is It in {placeB.name}?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Full hour-by-hour cross reference for planning meetings and personal calls.
          </p>
        </div>

        {/* Legend & 12h/24h Switch */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              9 AM–9 PM
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Office
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIs24Hour(!is24Hour)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {is24Hour ? "Format: 24h" : "Format: 12h"}
          </button>
        </div>
      </div>

      {/* Selected Hour Highlight Banner */}
      {selectedHourIndex !== null && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-900 dark:text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              When it is{" "}
              <strong>
                {is24Hour
                  ? slots[selectedHourIndex].timeA24
                  : slots[selectedHourIndex].timeAFormatted}
              </strong>{" "}
              in {placeA.name}, it is{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {is24Hour
                  ? slots[selectedHourIndex].timeB24
                  : slots[selectedHourIndex].timeBFormatted}
              </strong>{" "}
              in {placeB.name}
              {slots[selectedHourIndex].dayDifference !== 0 && (
                <span className="ml-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  ({slots[selectedHourIndex].dayDifferenceLabel})
                </span>
              )}
            </span>
          </div>

          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
            {slots[selectedHourIndex].isOverlapBothOffice
              ? "💼 Optimal Office Hours Overlap"
              : slots[selectedHourIndex].isOverlapBothCalling
              ? "📞 Convenient Awake Overlap"
              : "🌙 Outside Standard Awake Hours"}
          </span>
        </div>
      )}

      {/* Responsive Conversion Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
              <th className="py-3 px-3 sm:px-4 font-semibold uppercase tracking-wider text-[11px]">
                {placeA.name} Time
              </th>
              <th className="py-3 px-3 sm:px-4 font-semibold uppercase tracking-wider text-[11px]">
                {placeB.name} Time
              </th>
              <th className="py-3 px-3 sm:px-4 font-semibold uppercase tracking-wider text-[11px]">
                Calling Window
              </th>
              <th className="py-3 px-3 sm:px-4 font-semibold uppercase tracking-wider text-[11px] text-right">
                Select
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono">
            {slots.map((slot, index) => {
              const isSelected = selectedHourIndex === index;

              let rowClass = "hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors";
              if (isSelected) {
                rowClass = "bg-emerald-500/10 dark:bg-emerald-500/15 font-semibold";
              } else if (slot.isOverlapBothOffice) {
                rowClass += " bg-indigo-50/50 dark:bg-indigo-950/20";
              } else if (slot.isOverlapBothCalling) {
                rowClass += " bg-emerald-50/30 dark:bg-emerald-950/10";
              }

              return (
                <tr
                  key={slot.hourA}
                  onClick={() => setSelectedHourIndex(index)}
                  className={rowClass}
                >
                  {/* Time A */}
                  <td className="py-2.5 px-3 sm:px-4 text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {slot.isDayA ? (
                        <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      )}
                      <span>{is24Hour ? slot.timeA24 : slot.timeAFormatted}</span>
                      {slot.hourA === 9 && (
                        <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                          9 AM
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Time B */}
                  <td className="py-2.5 px-3 sm:px-4 text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {slot.isDayB ? (
                        <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      )}
                      <span className={slot.isOverlapBothCalling ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                        {is24Hour ? slot.timeB24 : slot.timeBFormatted}
                      </span>
                      {slot.dayDifference !== 0 && (
                        <span
                          className={`text-[10px] font-sans px-1.5 py-0.5 rounded font-medium ${
                            slot.dayDifference > 0
                              ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                              : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {slot.dayDifferenceLabel}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Overlap Status Badge */}
                  <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap font-sans">
                    {slot.isOverlapBothOffice ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        <Briefcase className="w-3 h-3 text-indigo-500" />
                        Office Overlap
                      </span>
                    ) : slot.isOverlapBothCalling ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <PhoneCall className="w-3 h-3 text-emerald-500" />
                        Awake Overlap
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-400">
                        Off Hours
                      </span>
                    )}
                  </td>

                  {/* Row Select Action */}
                  <td className="py-2.5 px-3 sm:px-4 text-right">
                    <button
                      type="button"
                      aria-label={`Select ${slot.timeAFormatted}`}
                      className={`p-1 rounded-md transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
