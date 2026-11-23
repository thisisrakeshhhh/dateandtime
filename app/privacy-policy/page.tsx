import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `Privacy Policy for ${siteConfig.name}. Information on cookie practices, Google AdSense compliance, data collection, and GDPR/CCPA consumer rights.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/privacy-policy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">Privacy Policy</span>
      </nav>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Transparency & Data Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Effective Date: January 1, 2026 · Last Updated: November 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-6">
        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            1. Overview & Information We Collect
          </h2>
          <p>
            At {siteConfig.name} (accessible from {siteConfig.siteUrl}), safeguarding the privacy
            of our visitors is one of our utmost priorities. This Privacy Policy document outlines
            the types of information collected and how it is utilized.
          </p>
          <p>
            {siteConfig.name} does not demand account creation, passwords, or personal identifying
            data to utilize our world time zone tools, day/night maps, or distance calculators.
            When you browse our website, standard web server access logs may capture non-personally
            identifiable details including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Browser type, language, and operating system</li>
            <li>Referring URLs and pages visited</li>
            <li>Date and timestamp of request</li>
            <li>Internet Protocol (IP) address (anonymized for analytics)</li>
          </ul>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            2. Google AdSense & Third-Party Advertising
          </h2>
          <p>
            We may partner with third-party advertising vendors, specifically Google LLC (Google AdSense),
            to display advertisements when you visit our website.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Google DoubleClick DART Cookies:</strong> Google, as a third-party vendor, uses
              cookies to serve ads on our site based upon a user&apos;s visit to our site and other
              sites across the Internet.
            </li>
            <li>
              <strong>Opt-Out of DART Cookies:</strong> Users may opt out of personalized advertising
              by visiting the Google Ad and Content Network Privacy Policy at:{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline"
              >
                https://policies.google.com/technologies/ads
              </a>.
            </li>
            <li>
              You can also manage generic personalized advertising preferences via the Network
              Advertising Initiative opt-out page at:{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline"
              >
                https://www.aboutads.info/choices/
              </a>.
            </li>
          </ul>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            3. Cookies & Local Storage
          </h2>
          <p>
            {siteConfig.name} uses minimal client cookies and localStorage to remember user UI
            preferences, such as:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>12-Hour vs. 24-Hour digital clock selection</li>
            <li>Recently selected origin or destination place</li>
            <li>Acknowledgment of our Cookie Consent notification banner</li>
          </ul>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is
            being sent. If you disable cookies, our core time calculations and day/night maps will
            continue to function without hindrance.
          </p>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            4. GDPR (General Data Protection Regulation) & CCPA Compliance
          </h2>
          <p>
            If you are a resident of the European Economic Area (EEA), the United Kingdom, or
            California (CCPA), you are entitled to statutory data protection rights, including the
            right to access, rectify, or request deletion of personal information. Because we do not
            maintain customer accounts or store identifiable customer profiles, we process zero
            identifiable consumer databases. For questions, please reach out via our{" "}
            <Link href="/contact" className="text-emerald-600 underline">
              contact form
            </Link>
            {siteConfig.contactEmail ? (
              <>
                {" "}
                or directly by email at:{" "}
                <a href={`mailto:${siteConfig.contactEmail}`} className="font-mono text-emerald-600 underline">
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
