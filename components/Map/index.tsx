"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Place } from "@/lib/places";

interface MapWrapperProps {
  placeA: Place | null;
  placeB: Place | null;
  userTimezone: string;
  userPlace?: Place | null;
  onSelectPlace?: (place: Place) => void;
  className?: string;
}

// Dynamic import with SSR disabled to ensure Leaflet runs strictly on the client
const DynamicWorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full min-h-[460px] bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#E85D4E] border-t-transparent animate-spin" />
      <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
        Loading interactive map...
      </p>
    </div>
  ),
});

export default function WorldMapContainer(props: MapWrapperProps) {
  return <DynamicWorldMap {...props} />;
}
