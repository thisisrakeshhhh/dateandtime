import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import ShiftConverterClient from "@/components/ShiftConverterClient";
import AdSlot from "@/components/AdSlot";
import { ChevronRight } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Work Shift Time Zone Converter | Convert Shifts Across US, UK, Australia",
  description:
    "Convert work shifts to client time zones in US Eastern, Central, Pacific, UK, and Australia. Calculate exact 9 AM to 5 PM office hours overlap, track midnight crossings, and simulate summer/winter daylight saving changes.",
  alternates: {
    canonical: `${siteConfig.siteUrl}/shift-converter`,
  },
  openGraph: {
    title: "Work Shift Time Zone Converter | TimeBridge",
    description:
      "Accurately convert your work shift hours to US, UK, and Australian client time zones. Calculate minute-accurate office hour overlap and daylight saving impacts.",
    url: `${siteConfig.siteUrl}/shift-converter`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function ShiftConverterPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shift Converter",
        item: `${siteConfig.siteUrl}/shift-converter`,
      },
    ],
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <span className="text-neutral-900 dark:text-white font-medium">Shift Converter</span>
      </nav>

      {/* Hero Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E85D4E]/10 text-[#E85D4E]">
            Workplace Time Tool
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Work Shift Time Zone Converter
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          Input your shift hours and select a client region to calculate concurrent office overlap across US Eastern, Central, Pacific, UK, and Australian working hours. Tested with minute-accurate Luxon interval math and seasonal Daylight Saving Time adjustments.
        </p>
      </div>

      {/* Interactive Tool */}
      <ShiftConverterClient />

      {/* AdSlot */}
      <div className="my-6">
        <AdSlot slotId="shift-mid" format="horizontal" />
      </div>

      {/* Editorial Content: How Shift Conversion Works */}
      <section className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Understanding Remote Shift Alignments and Office Hours Overlap
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            When managing offshore development teams, remote customer support desks, or global consulting corridors, aligning working hours requires more than adding fixed offsets. Most corporate contracts specify core collaboration hours—conventionally 9:00 AM to 5:00 PM local client time—during which synchronous communications, standups, and customer handoffs occur.
          </p>
          <p>
            Shifts that cross midnight (such as night shifts starting at 6:00 PM or 8:00 PM in India or the Philippines) roll over into the subsequent calendar day. Concurrently, destinations situated west of the International Date Line operate in yesterday&apos;s calendar day or earlier hours of the same day. Our calculator models both calendar day rollovers and minute-level office hour intersections so project managers never miss a sprint ceremony or shift handover.
          </p>
        </div>
      </section>

      {/* Popular Landing Pages Hub */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
          Dedicated Regional Shift Guides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/us-shift-timings-in-ist"
            className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] hover:border-[#E85D4E]/60 hover:shadow-sm transition-all group flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-[#E85D4E] transition-colors">
                US Shift Timings in IST Guide
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Typical Eastern and Pacific shift schedules in India, DST changes, and night shift health tips.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
          </Link>

          <Link
            href="/uk-shift-timings-in-ist"
            className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] hover:border-[#E85D4E]/60 hover:shadow-sm transition-all group flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-[#E85D4E] transition-colors">
                UK Shift Timings in IST Guide
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                British afternoon and evening shift hours in India, BST seasonal transitions, and London overlap.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
