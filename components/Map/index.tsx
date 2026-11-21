"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Place } from "@/lib/places";

interface MapWrapperProps {
  placeA: Place | null;
  placeB: Place | null;
  onSelectPlace?: (place: Place, target: "A" | "B") => void;
  className?: string;
}

// Dynamic import with SSR disabled to ensure Leaflet runs strictly on the client
const DynamicWorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[480px] rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-3 overflow-hidden animate-pulse">
      <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      <p className="text-xs font-mono text-neutral-400">
        Loading live day/night solar terminator map...
      </p>
    </div>
  ),
});

export default function WorldMapContainer(props: MapWrapperProps) {
  return <DynamicWorldMap {...props} />;
}
