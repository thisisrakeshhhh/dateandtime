"use client";

import React, { useState } from "react";
import { Place } from "@/lib/places";
import { generate24HourTable, OverlapHour } from "@/lib/time";
import { Sun, Moon, Briefcase, PhoneCall, ChevronDown, ChevronUp } from "lucide-react";

interface MeetingTableProps {
  placeA: Place;
  placeB: Place;
  defaultExpanded?: boolean;
}

export default function MeetingTable({ placeA, placeB, defaultExpanded = false }: MeetingTableProps) {
  const [is24Hour, setIs24Hour] = useState(false);
  const [selectedHourIndex, setSelectedHourIndex] = useState<number | null>(9);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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
    <div className="w-full bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-sm">
      {/* Header with expand/collapse toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            Hour-by-hour comparison
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            When it is 9:00 AM in {placeA.name}, what time is it in {placeB.name}?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIs24Hour(!is24Hour)}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {is24Hour ? "24h format" : "12h format"}
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors flex items-center gap-1.5"
          >
            <span>{isExpanded ? "Hide table" : "See full table"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Selected Hour Highlight Banner */}
      {selectedHourIndex !== null && (
        <div className="mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-200/60 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-[#E85D4E]"></span>
            <span>
              When it is{" "}
              <strong>
                {is24Hour ? slots[selectedHourIndex].timeA24 : slots[selectedHourIndex].timeAFormatted}
              </strong>{" "}
              in {placeA.name}, it is{" "}
              <strong className="text-[#E85D4E]">
                {is24Hour ? slots[selectedHourIndex].timeB24 : slots[selectedHourIndex].timeBFormatted}
              </strong>{" "}
              in {placeB.name}
              {slots[selectedHourIndex].dayDifference !== 0 && (
                <span className="ml-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  ({slots[selectedHourIndex].dayDifferenceLabel})
                </span>
              )}
            </span>
          </div>

          <span className="text-[11px] text-neutral-500 font-medium">
            {slots[selectedHourIndex].isOverlapBothOffice
              ? "Optimal work hours overlap"
              : slots[selectedHourIndex].isOverlapBothCalling
              ? "Convenient awake overlap"
              : "Outside waking hours"}
          </span>
        </div>
      )}

      {/* Collapsible Table Content */}
      {isExpanded && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-[#202020] text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th scope="col" className="py-2.5 px-3 font-semibold">{placeA.name} Time</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">{placeB.name} Time</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Status</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-right">Suitable For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {slots.map((slot, index) => {
                const isSelected = selectedHourIndex === index;
                return (
                  <tr
                    key={index}
                    onClick={() => setSelectedHourIndex(index)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#E85D4E]/10"
                        : slot.isOverlapBothOffice
                        ? "bg-neutral-50/60 dark:bg-neutral-800/20 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                    }`}
                  >
                    <td className="py-2 px-3 font-mono font-medium text-neutral-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        {slot.isDayA ? (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Moon className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                        <span>{is24Hour ? slot.timeA24 : slot.timeAFormatted}</span>
                      </div>
                    </td>

                    <td className="py-2 px-3 font-mono font-medium text-neutral-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        {slot.isDayB ? (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Moon className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                        <span>{is24Hour ? slot.timeB24 : slot.timeBFormatted}</span>
                        {slot.dayDifference !== 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 ml-1">
                            {slot.dayDifferenceLabel}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      {slot.isOverlapBothOffice ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#E85D4E]/15 text-[#E85D4E]">
                          <Briefcase className="w-3 h-3" />
                          Work Overlap
                        </span>
                      ) : slot.isOverlapBothCalling ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          <PhoneCall className="w-3 h-3" />
                          Awake Overlap
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Sleep hours</span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-right text-neutral-500 text-[11px]">
                      {slot.isOverlapBothOffice
                        ? "Meetings & Calls"
                        : slot.isOverlapBothCalling
                        ? "Personal Calls"
                        : "Emergency Only"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
