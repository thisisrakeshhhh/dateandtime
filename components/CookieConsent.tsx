"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("timebridge_cookie_consent");
      if (!consent) {
        // Appears first when user visits the site
        const timer = setTimeout(() => setIsVisible(true), 250);
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
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-4 sm:bottom-6 z-[1100] flex justify-center px-4 pointer-events-none"
    >
      <div className="pointer-events-auto relative w-full max-w-lg rounded-2xl bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800 p-4 sm:p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 text-neutral-800 dark:text-neutral-100">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Close cookie notice"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-500/10 text-[#E85D4E] flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white leading-tight">
              Cookie & Privacy Notice
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
              We use essential cookies to calculate accurate time differences, store your location preferences, and ensure optimal website functionality.{" "}
              <Link
                href="/privacy-policy"
                className="text-[#E85D4E] hover:underline font-medium inline-block"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-xl bg-[#E85D4E] hover:bg-[#d94f40] text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
