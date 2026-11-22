import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getAllAbbreviationPairs, getAllAbbreviations } from "@/lib/abbreviations";
import { siteConfig } from "@/lib/config";
import { Clock, ArrowRight, ShieldCheck, Globe, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Time Zone Converter | Abbreviation Converter Directory",
  description: "Convert between world time zone abbreviations (EST, IST, PST, CST, GMT, BST, UTC, AEST). Minute-accurate IANA conversions with seasonal DST warnings.",
  alternates: {
    canonical: `${siteConfig.siteUrl}/converter`,
  },
  openGraph: {
    title: "Time Zone Converter Directory | TimeBridge",
    description: "Convert between world time zone abbreviations with seasonal daylight saving warnings and common times tables.",
    url: `${siteConfig.siteUrl}/converter`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
};

export default function ConverterHubPage() {
  const pairs = getAllAbbreviationPairs();
  const abbreviations = getAllAbbreviations();

  // Group pairs by category
  const categories: Record<string, typeof pairs> = {};
  pairs.forEach((pair) => {
    if (!categories[pair.category]) {
      categories[pair.category] = [];
    }
    categories[pair.category].push(pair);
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-900 dark:text-white font-medium">
          Time Converters
        </span>
      </nav>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E85D4E]/10 text-[#E85D4E] text-xs font-semibold mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Abbreviation Converters</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Time Zone Abbreviation Converters
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Minute-accurate conversions between global time zone abbreviations using official IANA database rules. Includes seasonal Daylight Saving Time warnings and common times tables.
        </p>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">IANA Time Zones</div>
            <div className="text-[11px] text-neutral-500">Never fixed offsets</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">DST Transitions</div>
            <div className="text-[11px] text-neutral-500">Seasonal clock shifts</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">Interactive Converter</div>
            <div className="text-[11px] text-neutral-500">Pick any time & date</div>
          </div>
        </div>
      </div>

      {/* Categorized Converter Corridors */}
      <div className="space-y-6">
        {Object.entries(categories).map(([category, items]) => (
          <section
            key={category}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
          >
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <span>{category}</span>
              <span className="text-xs font-normal text-neutral-400">{items.length} converters</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/converter/${item.slug}`}
                  className="group p-3 rounded-xl bg-neutral-50 dark:bg-[#202020] hover:bg-neutral-100/90 dark:hover:bg-[#252525] border border-neutral-100 dark:border-neutral-800 transition-all flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-[#E85D4E] transition-colors">
                    {item.from} to {item.to}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Guide to Time Zone Abbreviations */}
      <section className="p-5 sm:p-7 rounded-2xl bg-neutral-50 dark:bg-[#161616] border border-neutral-200/70 dark:border-white/[0.06] space-y-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Common Time Zone Abbreviations Explained
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Understanding standard offsets, daylight saving partners, and ambiguities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {abbreviations.map((abbr) => (
            <div
              key={abbr.code}
              className="p-3.5 rounded-xl bg-white dark:bg-[#1c1c1c] border border-neutral-200/80 dark:border-white/[0.08]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-neutral-900 dark:text-white">
                  {abbr.code} – {abbr.name}
                </span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {abbr.standardOffset}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
                {abbr.seasonalWarning}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
