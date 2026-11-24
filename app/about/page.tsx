import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Clock, Globe, ShieldCheck, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: `About ${siteConfig.name} | World Time & Day/Night Solar Mapping`,
  description: `Learn about ${siteConfig.name}, our mission to provide accurate world time difference calculations, live solar terminator tracking, and international calling overlap windows.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">About</span>
      </nav>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Our Mission & Technology</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          About {siteConfig.name}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
          Connecting time, distance, and people across time zones with astronomical accuracy
          and intuitive visualization.
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-6">
        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            Who We Are
          </h2>
          <p>
            {siteConfig.name} was established to solve a universal challenge in our hyper-connected
            global economy: determining the exact local time and convenient communication window
            between two different corners of the Earth without confusion over daylight saving
            transitions, fractional offsets, or unexpected schedule clashes.
          </p>
          <p>
            Whether coordinating distributed software engineering squads across Silicon Valley,
            London, and Bengaluru, checking in with family in Sydney from New York, or booking
            long-haul flights across international datelines, {siteConfig.name} provides
            transparent, reliable, real-time intelligence.
          </p>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-500" />
            Astronomical Accuracy & Scientific Standards
          </h2>
          <p>
            Unlike superficial calculators that rely on hardcoded, outdated UTC values, our engine
            is architected upon gold-standard open data:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>IANA Time Zone Database (tzdata):</strong> The worldwide definitive repository
              of historical, present, and scheduled political time zone rules and Daylight Saving
              Time (DST) laws maintained by Paul Eggert and the Internet Assigned Numbers Authority.
            </li>
            <li>
              <strong>Real-Time Solar Terminator Mechanics:</strong> Our interactive map runs
              astronomical solar equations (declination, solar hour angle, and equation of time) to
              compute the exact curve of sunlight and darkness over the planet, updated every sixty seconds.
            </li>
            <li>
              <strong>Haversine Geodetic Formulation:</strong> Great-circle distances and initial
              compass bearings are mathematically derived using the spherical Earth radius model,
              providing realistic non-stop flight estimates.
            </li>
          </ul>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-500" />
            Operator &amp; Contact Information
          </h2>
          <p>
            {siteConfig.name} is owned, developed, and maintained by <strong>{"{{OWNER_NAME}}"}</strong> as an
            independent web utility dedicated to accurate world time calculation and astronomical visualization.
            We do not represent a multinational corporation or create fictitious executive credentials.
          </p>
          <p>
            All computations rely transparently on the public IANA Time Zone Database (tzdata), celestial
            mechanics, and open geographic standards. For suggestions, corrections to municipal daylight
            saving practices, or partnership inquiries, you can reach out directly via our{" "}
            <Link href="/contact" className="text-[#E85D4E] hover:underline font-medium">
              Contact Page
            </Link>
            {siteConfig.contactEmail ? (
              <>
                {" "}or by email at{" "}
                <a href={`mailto:${siteConfig.contactEmail}`} className="font-mono text-[#E85D4E] hover:underline">
                  {siteConfig.contactEmail}
                </a>
              </>
            ) : null}
            .
          </p>
        </section>
      </div>
    </div>
  );
}
