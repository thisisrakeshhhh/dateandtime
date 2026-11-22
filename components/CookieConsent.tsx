"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      // Check if consent was previously recorded
      const consent = localStorage.getItem("timebridge_cookie_consent");
      if (!consent) {
        // One-time popup after gentle delay
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem("timebridge_cookie_consent", "accepted");
    } catch {}
    setIsVisible(false);
  }

  function handleDismiss() {
    try {
      localStorage.setItem("timebridge_cookie_consent", "dismissed");
    } catch {}
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 right-4 z-40 max-w-sm p-3.5 rounded-xl bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-lg text-xs text-neutral-600 dark:text-neutral-300 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Cookie className="w-4 h-4 text-[#E85D4E] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            We use essential cookies for accurate time calculations and site functionality.{" "}
            <Link href="/privacy-policy" className="underline hover:text-neutral-900 dark:hover:text-white">
              Privacy Policy
            </Link>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
          aria-label="Dismiss cookie notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleAccept}
          className="px-2.5 py-1 rounded-lg bg-[#E85D4E] text-white text-[10px] font-medium hover:bg-[#d94f40] transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
