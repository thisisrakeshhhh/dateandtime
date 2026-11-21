"use client";

import React from "react";
import { Place } from "@/lib/places";
import { calculateBestTimeToCall } from "@/lib/time";
import { PhoneCall, Briefcase, CheckCircle, AlertCircle } from "lucide-react";

interface BestTimeToCallBoxProps {
  fromPlace: Place;
  toPlace: Place;
}

export default function BestTimeToCallBox({
  fromPlace,
  toPlace,
}: BestTimeToCallBoxProps) {
  const result = calculateBestTimeToCall(
    fromPlace.timezone,
    toPlace.timezone,
    fromPlace.name,
    toPlace.name,
    fromPlace.lat,
    fromPlace.lng,
    toPlace.lat,
    toPlace.lng
  );

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-5 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
        <PhoneCall className="w-4 h-4" />
        <span>Optimal Calling Window</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
        Best Time to Call {toPlace.name} from {fromPlace.name}
      </h2>

      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
        {result.description}
      </p>

      {/* Recommended Windows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {/* Awake Calling Window (9 AM - 9 PM) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              General Awake Window (9 AM – 9 PM)
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
              {result.overlapHoursCount}h overlap
            </span>
          </div>

          <div className="space-y-2 my-2">
            <div>
              <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                In {fromPlace.name} (Your Time):
              </p>
              <p className="font-mono text-lg font-bold text-neutral-900 dark:text-white">
                {result.recommendedWindowFrom}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                In {toPlace.name} (Their Time):
              </p>
              <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {result.recommendedWindowTo}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 pt-2 border-t border-emerald-500/10">
            Ideal for family calls, friends, personal syncs, and flexible work meetings.
          </p>
        </div>

        {/* Business Office Window (9 AM - 5 PM) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              Business Hours Overlap (9 AM – 5 PM)
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
              {result.officeOverlapCount}h overlap
            </span>
          </div>

          <div className="space-y-2 my-2">
            {result.officeOverlapCount > 0 ? (
              <>
                <div>
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                    In {fromPlace.name} (Office Time):
                  </p>
                  <p className="font-mono text-lg font-bold text-neutral-900 dark:text-white">
                    {result.officeWindowFrom}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                    In {toPlace.name} (Their Office Time):
                  </p>
                  <p className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {result.officeWindowTo}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-3 text-xs text-neutral-500 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  No direct overlap within standard 9 AM – 5 PM office hours.
                  Consider scheduling in early morning or evening outside regular hours.
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
            Best for client meetings, video conferences, and live workplace collaboration.
          </p>
        </div>
      </div>
    </div>
  );
}
