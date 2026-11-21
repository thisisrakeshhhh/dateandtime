"use client";

import React from "react";
import { siteConfig } from "@/lib/config";

export type AdSlotType = "top-banner" | "in-content" | "sidebar" | "footer-banner";

interface AdSlotProps {
  type?: AdSlotType;
  slotId?: string;
  format?: string;
  className?: string;
}

const slotDimensions: Record<AdSlotType, { height: string; label: string }> = {
  "top-banner": {
    height: "min-h-[90px] sm:min-h-[100px]",
    label: "Advertisement · Top Banner (728x90 / Responsive)",
  },
  "in-content": {
    height: "min-h-[250px] sm:min-h-[280px]",
    label: "Advertisement · Content Slot (336x280 / Responsive)",
  },
  sidebar: {
    height: "min-h-[600px]",
    label: "Advertisement · Sidebar (300x600)",
  },
  "footer-banner": {
    height: "min-h-[90px] sm:min-h-[100px]",
    label: "Advertisement · Footer Banner (728x90)",
  },
};

export default function AdSlot({ type = "in-content", className = "" }: AdSlotProps) {
  const dim = slotDimensions[type] || slotDimensions["in-content"];
  const { height, label } = dim;

  if (!siteConfig.ads.enabled) {
    return null;
  }

  return (
    <div
      className={`w-full my-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-2 overflow-hidden ${height} ${className}`}
      data-ad-type={type}
    >
      <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1">
        {label}
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={siteConfig.ads.client}
        data-ad-slot={siteConfig.ads.slots.inContent || "0000000000"}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
