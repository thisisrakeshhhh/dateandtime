"use client";

import React, { useState, useEffect } from "react";
import { Navigation, X } from "lucide-react";
import { Place, formatPlaceDisplayName } from "@/lib/places";

interface LocationModalProps {
  userPlace: Place | null;
  onRequestLocation: () => void;
  onSetPlace?: (place: Place) => void;
  isLocating?: boolean;
}

export default function LocationModal({
  userPlace,
  onRequestLocation,
  onSetPlace,
  isLocating = false,
}: LocationModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
    }
    window.addEventListener("open-location-modal", handleOpen);
    return () => window.removeEventListener("open-location-modal", handleOpen);
  }, []);

  function handleDismiss() {
    setIsOpen(false);
    try {
      localStorage.setItem("timebridge_location_prompt_dismissed", "true");
    } catch {}
  }

  function handleDetect() {
    handleDismiss();
    onRequestLocation();
  }

  function handleSetPlace(place: Place) {
    handleDismiss();
    if (onSetPlace) {
      onSetPlace(place);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Location permission prompt"
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4 pointer-events-none"
    >
      <div
        className="pointer-events-auto relative w-full max-w-sm rounded-2xl bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 p-5 shadow-2xl animate-in zoom-in-95 duration-200 text-neutral-800 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close location prompt"
          className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-[#E85D4E] flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h2 id="location-modal-title" className="font-semibold text-base text-neutral-900 dark:text-white leading-tight">
              Your Current Location
            </h2>
            {userPlace && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate mt-0.5">
                {formatPlaceDisplayName(userPlace)}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-2 mb-4">
          We use your location to calculate real-time time differences and exact distances to any country or city you compare.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleDetect}
            disabled={isLocating}
            className="flex-1 py-2 px-3.5 rounded-xl bg-[#E85D4E] hover:bg-[#d94f40] text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isLocating ? "Detecting..." : "Detect My Location"}</span>
          </button>

          {userPlace && (
            <button
              type="button"
              onClick={() => handleSetPlace(userPlace)}
              className="py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Set as {userPlace.name}
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="py-2 px-3 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium text-xs transition-colors text-center cursor-pointer"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
