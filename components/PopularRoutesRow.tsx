"use client";

import React from "react";
import Link from "next/link";
import { getPlaceBySlug, PopularPair } from "@/lib/places";
import { formatTimeDifference } from "@/lib/time";
import FlagIcon from "@/components/FlagIcon";
import { ArrowRight } from "lucide-react";

interface PopularRoutesRowProps {
  pairs: PopularPair[];
}

export default function PopularRoutesRow({ pairs }: PopularRoutesRowProps) {
  const top8 = pairs.slice(0, 8);

  return (
    <section className="w-full py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#222222] dark:text-white">
            Popular comparisons
          </h2>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
            Frequently checked time differences and call windows
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
        {top8.map((pair, index) => {
          const fromPlace = getPlaceBySlug(pair.from);
          const toPlace = getPlaceBySlug(pair.to);
          if (!fromPlace || !toPlace || !fromPlace.timezone || !toPlace.timezone) return null;

          const diff = formatTimeDifference(fromPlace.timezone, toPlace.timezone);
          const diffText = diff.isSameTime
            ? "Same time"
            : `${diff.hoursPart}h ${diff.minutesPart > 0 ? `${diff.minutesPart}m ` : ""}${
                diff.isAhead ? "ahead" : "behind"
              }`;

          return (
            <Link
              key={index}
              href={`/time-difference/${pair.from}-to-${pair.to}`}
              className="snap-start shrink-0 w-64 p-3.5 rounded-2xl bg-white dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626] hover:border-[#E85D4E]/60 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#E85D4E]">
                    {diffText}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#222222] dark:text-white truncate">
                    <FlagIcon countryCode={fromPlace.countryIso} size="sm" />
                    <span className="truncate">{fromPlace.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#222222] dark:text-white truncate">
                    <FlagIcon countryCode={toPlace.countryIso} size="sm" />
                    <span className="truncate">{toPlace.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
                <span>{fromPlace.timezone.split("/")[1]?.replace(/_/g, " ") || fromPlace.name}</span>
                <span>→</span>
                <span>{toPlace.timezone.split("/")[1]?.replace(/_/g, " ") || toPlace.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
