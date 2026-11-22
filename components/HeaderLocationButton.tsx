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
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700/80 hover:border-[#E85D4E]/50 hover:bg-[#E85D4E]/5 dark:hover:bg-[#E85D4E]/10 text-[#222222] dark:text-neutral-200 transition-colors cursor-pointer text-xs sm:text-sm font-medium"
      title={locationName ? `Current location: ${locationName}. Click to change.` : "Add your location"}
    >
      <MapPin className="w-3.5 h-3.5 text-[#E85D4E] shrink-0" />
      <span className="truncate max-w-[110px]">
        {locationName ? locationName : "Add location"}
      </span>
    </button>
  );
}
