/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";

interface FlagIconProps {
  countryCode: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function FlagIcon({ countryCode, className = "", size = "sm" }: FlagIconProps) {
  const [hasError, setHasError] = useState(false);
  const code = (countryCode || "").toLowerCase().trim();

  const sizeClasses = {
    sm: "w-4 h-3 text-[9px]",
    md: "w-5 h-3.5 text-[10px]",
    lg: "w-6 h-4.5 text-[11px]",
  }[size];

  if (!code || hasError || code.length !== 2) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center font-bold tracking-wider rounded-[3px] bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 select-none ${sizeClasses} ${className}`}
      >
        {(countryCode || "??").slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={`${countryCode} flag`}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`inline-block object-cover rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${sizeClasses} ${className}`}
    />
  );
}
