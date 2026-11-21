"use client";

import React, { useState, useRef, useMemo } from "react";
import { Place } from "@/lib/places";
import { calculateBestTimeToCall } from "@/lib/time";
import { DateTime } from "luxon";

interface CallTimelineProps {
  placeA: Place;
  placeB: Place;
}

export default function CallTimeline({ placeA, placeB }: CallTimelineProps) {
  // Current time in Place A in minutes from start of day (0 to 1439)
  const initialMinuteA = useMemo(() => {
    const dt = DateTime.now().setZone(placeA.timezone);
    return dt.hour * 60 + dt.minute;
  }, [placeA.timezone]);

  const [selectedMinuteA, setSelectedMinuteA] = useState<number>(initialMinuteA);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Minute-accurate best call calculation
  const bestTime = useMemo(() => {
    return calculateBestTimeToCall(placeA.timezone, placeB.timezone);
  }, [placeA.timezone, placeB.timezone]);

  // Compute selected time in Place B
  const selectedTimeA = useMemo(() => {
    const h = Math.floor(selectedMinuteA / 60);
    const m = selectedMinuteA % 60;
    return DateTime.now()
      .setZone(placeA.timezone)
      .set({ hour: h, minute: m, second: 0 });
  }, [selectedMinuteA, placeA.timezone]);

  const selectedTimeB = useMemo(() => {
    return selectedTimeA.setZone(placeB.timezone);
  }, [selectedTimeA, placeB.timezone]);

  // Drag handler
  function handlePointer(clientX: number) {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const fraction = x / rect.width;
    const minute = Math.round(fraction * 1439);
    setSelectedMinuteA(minute);
  }

  function onMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    handlePointer(e.clientX);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (isDragging) {
      handlePointer(e.clientX);
    }
  }

  function onMouseUp() {
    setIsDragging(false);
  }

  function onTouchStart(e: React.TouchEvent) {
    setIsDragging(true);
    if (e.touches[0]) handlePointer(e.touches[0].clientX);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (isDragging && e.touches[0]) {
      handlePointer(e.touches[0].clientX);
    }
  }

  function onTouchEnd() {
    setIsDragging(false);
  }

  // Calculate overlap range on Place A's 24h timeline
  const overlapPercentA = useMemo(() => {
    if (!bestTime.hasOverlap || bestTime.fromStartMinute === undefined || bestTime.fromEndMinute === undefined) {
      return null;
    }
    const startM = bestTime.fromStartMinute;
    const endM = bestTime.fromEndMinute;
    const left = (startM / 1440) * 100;
    const width = Math.max(2, ((endM - startM) / 1440) * 100);
    return { left, width };
  }, [bestTime]);

  return (
    <div
      className="w-full flex flex-col gap-4 select-none"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Best time to call
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Drag the slider to compare times across the day
          </p>
        </div>

        {/* Current Scrubber Value readout */}
        <div className="flex items-center gap-3 text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700">
          <div>
            <span className="text-neutral-400 mr-1">{placeA.name}:</span>
            <span className="text-neutral-900 dark:text-white font-semibold">
              {selectedTimeA.toFormat("h:mm a")}
            </span>
          </div>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <div>
            <span className="text-neutral-400 mr-1">{placeB.name}:</span>
            <span className="text-[#E85D4E] font-semibold">
              {selectedTimeB.toFormat("h:mm a")}
            </span>
          </div>
        </div>
      </div>

      {/* 24-Hour Dual Timeline Container */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className="relative cursor-ew-resize py-2 touch-none"
      >
        {/* Hour tick labels: 0, 3, 6, 9, 12, 15, 18, 21, 24 */}
        <div className="flex justify-between text-[10px] text-neutral-400 mb-1.5 px-1 font-mono">
          <span>12 AM</span>
          <span>4 AM</span>
          <span>8 AM</span>
          <span>12 PM</span>
          <span>4 PM</span>
          <span>8 PM</span>
          <span>12 AM</span>
        </div>

        <div className="flex flex-col gap-2 relative">
          {/* Timeline Place A */}
          <div className="relative h-7 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center">
            {/* Awake hours 9 AM - 9 PM (37.5% to 87.5%) */}
            <div
              className="absolute top-0 bottom-0 bg-neutral-200/80 dark:bg-neutral-700"
              style={{ left: "37.5%", width: "50%" }}
              title="Awake hours (9 AM - 9 PM)"
            />
            {/* Working hours 9 AM - 5 PM (37.5% to 70.8%) */}
            <div
              className="absolute top-0 bottom-0 bg-neutral-300/80 dark:bg-neutral-600"
              style={{ left: "37.5%", width: "33.33%" }}
              title="Working hours (9 AM - 5 PM)"
            />
            {/* Overlap Window Highlight */}
            {overlapPercentA && (
              <div
                className="absolute top-0 bottom-0 bg-[#E85D4E]/30 border-y border-[#E85D4E]"
                style={{
                  left: `${overlapPercentA.left}%`,
                  width: `${overlapPercentA.width}%`,
                }}
                title="Optimal calling overlap"
              />
            )}
            <span className="relative z-10 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 px-2.5">
              {placeA.name}
            </span>
          </div>

          {/* Timeline Place B */}
          <div className="relative h-7 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center">
            {/* Computed overlap highlight on bar B */}
            {overlapPercentA && (
              <div
                className="absolute top-0 bottom-0 bg-[#E85D4E]/30 border-y border-[#E85D4E]"
                style={{
                  left: `${overlapPercentA.left}%`,
                  width: `${overlapPercentA.width}%`,
                }}
              />
            )}
            <span className="relative z-10 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 px-2.5">
              {placeB.name}
            </span>
          </div>

          {/* Interactive Draggable Scrubber Cursor Line */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
            style={{
              left: `${(selectedMinuteA / 1440) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-[#E85D4E] shadow-md border-2 border-white dark:border-neutral-900 -mt-1" />
            <div className="w-0.5 flex-1 bg-[#E85D4E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#E85D4E] shadow-sm -mb-0.5" />
          </div>
        </div>
      </div>

      {/* Summary Sentence */}
      <div className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 leading-relaxed">
        {bestTime.hasOverlap ? (
          <div>
            <span className="font-semibold text-neutral-900 dark:text-white">
              Best window:{" "}
            </span>
            <span>
              {bestTime.recommendedWindowFrom} {placeA.name} time{" "}
              ({bestTime.recommendedWindowTo} in {placeB.name}).
            </span>
            <span className="block text-[11px] text-neutral-400 mt-1">
              Provides {bestTime.formattedDuration} of overlapping waking hours.
            </span>
          </div>
        ) : (
          <div>
            <span className="font-semibold text-neutral-900 dark:text-white">
              Limited overlap:{" "}
            </span>
            <span>
              There are no overlapping waking hours (9 AM – 9 PM) on the same workday.
              Early morning in {placeA.name} corresponds to late night in {placeB.name}.
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-neutral-300 dark:bg-neutral-600" />
          <span>Work hours (9–17)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
          <span>Awake hours (9–21)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#E85D4E]/40 border border-[#E85D4E]" />
          <span>Overlap window</span>
        </div>
      </div>
    </div>
  );
}
