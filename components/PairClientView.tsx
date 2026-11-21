"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Place } from "@/lib/places";
import WorldMapContainer from "@/components/Map";
import CompareCard from "@/components/CompareCard";

interface PairClientViewProps {
  placeA: Place;
  placeB: Place;
}

export default function PairClientView({ placeA, placeB }: PairClientViewProps) {
  const router = useRouter();
  const [currentA, setCurrentA] = useState<Place>(placeA);
  const [currentB, setCurrentB] = useState<Place>(placeB);

  function handleSwap() {
    const nextA = currentB;
    const nextB = currentA;
    setCurrentA(nextA);
    setCurrentB(nextB);
    router.push(`/time-difference/${nextA.slug}-to-${nextB.slug}`);
  }

  function handleClear() {
    router.push("/");
  }

  return (
    <div className="w-full space-y-6">
      {/* Interactive Map */}
      <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        <WorldMapContainer
          placeA={currentA}
          placeB={currentB}
          userTimezone={currentA.timezone}
          className="w-full h-full"
        />
      </div>

      {/* Compare Card with Clocks, Timeline and Hour-by-Hour Table */}
      <CompareCard
        placeA={currentA}
        placeB={currentB}
        onSwap={handleSwap}
        onClear={handleClear}
      />
    </div>
  );
}
