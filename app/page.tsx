import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { buildPageMetadata } from "@/lib/seo";
import HomeClient from "@/components/HomeClient";
import { Globe, Clock, Sun, PhoneCall, Compass, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = buildPageMetadata({
  title: `${siteConfig.name} - ${siteConfig.tagline}`,
  description: siteConfig.description,
  canonical: siteConfig.siteUrl,
});

export const revalidate = 60;

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Interactive Leaflet Map & Comparator Client Component */}
      <HomeClient initialPlaceA={null} initialPlaceB={null} />

      {/* Server-Rendered Crawlable SEO Article Section for Crawlers & Readers */}
      <section className="w-full border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#111111] py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#E85D4E]/10 text-[#E85D4E] border border-[#E85D4E]/20">
              <Globe className="w-3.5 h-3.5" />
              World Clock & Timezone Authority
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              What Time Is It There? Real-Time World Clocks & Overlap Planner
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Compare any two places on Earth with minute-accurate precision. Powered by the authoritative IANA Time Zone Database, live astronomical solar positioning, and bilateral calling window analysis.
            </p>
          </div>

          {/* 4 Feature Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Minute-Precise Fractional Time Zones
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Standard round-hour approximations fail for millions of people worldwide. TimeBridge natively calculates fractional 30-minute and 45-minute offsets across India (IST, UTC+05:30), Nepal (NPT, UTC+05:45), South Australia &amp; Northern Territory (ACST, UTC+09:30), Newfoundland (NST, UTC-03:30), and Chatham Islands (CHAST, UTC+12:45).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Astronomical Solar Terminator Night Shadow
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Our interactive global projection renders the real-time day/night dividing line (the solar terminator) computed from celestial mechanics and SunCalc formulas. City markers inside the shadow illuminate with golden night lights, showing at a glance whether international partners are asleep or experiencing daylight.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Bilateral Calling &amp; Office Overlap Windows
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Planning distributed team syncs, client meetings, or family catch-ups requires knowing mutual awake hours. TimeBridge computes the exact intersection of 9:00 AM to 9:00 PM awake windows and standard 9:00 AM to 5:00 PM business office hours, factoring in cross-midnight shifts and daylight saving variance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Great-Circle Geodesics &amp; Flight Duration
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Every selected location pair calculates great-circle geodesic curved flight tracks using Haversine spherical trigonometry. View straight-line distances in kilometers, statute miles, and nautical miles, initial compass bearings, and non-stop cruising flight durations.
              </p>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E85D4E]">
              <ShieldCheck className="w-4 h-4" />
              <span>Explore TimeBridge Directories &amp; Specialized Tools</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <Link
                href="/all-corridors"
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-[#E85D4E] transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-[#E85D4E] transition-colors">
                    All Time Corridors
                  </div>
                  <div className="text-[11px] text-neutral-500">298 Global Route Pairs</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/cities"
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-[#E85D4E] transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-[#E85D4E] transition-colors">
                    World Cities Clocks
                  </div>
                  <div className="text-[11px] text-neutral-500">Live Clocks for Top 300 Cities</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/countries"
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-[#E85D4E] transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-[#E85D4E] transition-colors">
                    National Time Zones
                  </div>
                  <div className="text-[11px] text-neutral-500">Multi-Zone Country Directory</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/converter"
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-[#E85D4E] transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-[#E85D4E] transition-colors">
                    Abbreviation Converters
                  </div>
                  <div className="text-[11px] text-neutral-500">EST, PST, GMT, IST, UTC</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/shift-converter"
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-[#E85D4E] transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-[#E85D4E] transition-colors">
                    Shift Work Converter
                  </div>
                  <div className="text-[11px] text-neutral-500">Cross-Midnight &amp; DST Shifts</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/jet-lag-calculator"
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-[#E85D4E] transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-[#E85D4E] transition-colors">
                    Jet Lag Calculator
                  </div>
                  <div className="text-[11px] text-neutral-500">Circadian Sleep &amp; Light Shift</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
