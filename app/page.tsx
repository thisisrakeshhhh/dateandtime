import React from "react";
import { siteConfig } from "@/lib/config";
import { getPlaceBySlug } from "@/lib/places";
import HomeClient from "@/components/HomeClient";
import { Sun, Globe, Clock, Compass } from "lucide-react";

export default function HomePage() {
  const defaultPlaceA = getPlaceBySlug(siteConfig.defaultFromSlug) || null;
  const defaultPlaceB = getPlaceBySlug(siteConfig.defaultToSlug) || null;

  return (
    <div className="space-y-10">
      {/* Hero Intro */}
      <section className="text-center max-w-3xl mx-auto pt-2 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <Globe className="w-3.5 h-3.5" />
          <span>Real-Time World Time & Solar Day/Night Tracker</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
          Connect Time Across The Globe
        </h1>

        <p className="mt-3 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Select any two countries or cities to compare live local times, daylight and
          night status, great-circle flight distance, and the optimal awake calling window.
        </p>
      </section>

      {/* Main Interactive Tool & Map */}
      <HomeClient initialPlaceA={defaultPlaceA} initialPlaceB={defaultPlaceB} />

      {/* Value Proposition & Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 pb-8 border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Sun className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            Live Solar Day & Night Terminator
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Visualizes Earth&apos;s live solar terminator shadow updating every minute.
            Observe the night curve and glowing city lights across North America, Europe, Asia,
            and Australasia in real time.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            Automated Daylight Saving Accuracy
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Never second-guess time shifts. Powered by the authoritative IANA database,
            handling fractional offsets (India +5:30, Nepal +5:45, Adelaide +9:30) and
            DST transitions automatically.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            Best Time to Call Overlap
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Computes the exact overlapping awake hours (9:00 AM to 9:00 PM) and office
            hours (9:00 AM to 5:00 PM) for frictionless international calls and remote team syncs.
          </p>
        </div>
      </section>
    </div>
  );
}
