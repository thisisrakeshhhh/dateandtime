"use client";

import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

export default function HeaderLocationButton() {
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    function readSavedLocation() {
      try {
        const saved = localStorage.getItem("timebridge_user_place");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name) {
            setLocationName(parsed.name);
            return;
          }
        }
        setLocationName(null);
      } catch {
        setLocationName(null);
      }
    }

    readSavedLocation();
    window.addEventListener("timebridge-location-updated", readSavedLocation);
    return () => window.removeEventListener("timebridge-location-updated", readSavedLocation);
  }, []);

  function handleClick() {
    window.dispatchEvent(new CustomEvent("open-location-modal"));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer shrink-0 shadow-xs active:scale-95 ${
        locationName
          ? "bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
          : "bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:border-[#E85D4E]/40 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
      }`}
      title={locationName ? `Current location: ${locationName}. Click to change.` : "Add your location"}
    >
      <span className="relative flex items-center justify-center">
        <MapPin className="w-3.5 h-3.5 text-[#E85D4E] group-hover:scale-110 transition-transform" />
        {locationName && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#E85D4E] rounded-full ring-2 ring-white dark:ring-[#141414] animate-pulse" />
        )}
      </span>
      <span className="truncate max-w-[85px] sm:max-w-[120px]">
        {locationName ? locationName : "Add location"}
      </span>
    </button>
  );
}
