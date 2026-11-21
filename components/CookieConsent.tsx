"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent was previously recorded
    const consent = localStorage.getItem("timebridge_cookie_consent");
    if (!consent) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("timebridge_cookie_consent", "accepted");
    setIsVisible(false);
  }

  function handleDecline() {
    localStorage.setItem("timebridge_cookie_consent", "declined");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="text-xs text-neutral-600 dark:text-neutral-300">
          <p className="font-bold text-sm text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
            Privacy & Cookie Preferences
          </p>
          <p className="leading-relaxed">
            We use essential cookies and anonymous analytics to calculate accurate local times,
            power our interactive day/night world map, and deliver relevant features in
            accordance with GDPR and privacy standards.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors"
            >
              Decline
            </button>
            <Link
              href="/privacy-policy"
              className="text-[11px] text-neutral-500 hover:underline ml-1"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
