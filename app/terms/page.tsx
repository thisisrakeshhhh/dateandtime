import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.name}`,
  description: `Terms and conditions for utilizing ${siteConfig.name}'s world time zone converters, astronomical day/night maps, and calculation utilities.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">Terms of Service</span>
      </nav>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <FileText className="w-3.5 h-3.5" />
          <span>User Agreement & Disclaimers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Effective Date: January 1, 2026 · Last Updated: November 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-6">
        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and utilizing {siteConfig.name} ({siteConfig.siteUrl}), you accept and
            agree to be bound by the terms and provisions of this agreement. If you do not agree
            with these terms, please do not use this website.
          </p>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            2. Permitted Use & Information Accuracy
          </h2>
          <p>
            {siteConfig.name} offers time zone comparisons, Daylight Saving Time information,
            solar illumination visualizations, and distance estimations for informational, planning,
            educational, and personal convenience.
          </p>
          <p>
            While every effort is made to maintain up-to-date synchronization with the IANA Time
            Zone Database, OpenStreetMap, and astronomical equations, local government entities may
            alter daylight saving schedules, boundaries, or national policies on short notice.
            Users should not rely solely on this website for safety-critical navigation, legal
            deadlines, or mission-critical astronomical timing.
          </p>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            3. Intellectual Property Rights
          </h2>
          <p>
            All website design, proprietary software code, text, charts, and interface layouts are
            the intellectual property of {siteConfig.name}. Geographic map tiles and boundary data
            remain under respective open source licensing: &copy; OpenStreetMap contributors.
          </p>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            4. Limitation of Liability
          </h2>
          <p>
            Under no circumstances shall {siteConfig.name}, its authors, or operators be liable for
            any indirect, incidental, special, consequential, or punitive damages resulting from the
            use of or inability to use the time conversion services.
          </p>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            5. Contact Information
          </h2>
          <p>
            For any legal inquiries regarding these Terms of Service, please contact:{" "}
            <span className="font-mono text-emerald-600">{siteConfig.contactEmail}</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
