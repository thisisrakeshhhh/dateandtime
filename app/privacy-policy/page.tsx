import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `Privacy Policy for ${siteConfig.name}. Information on cookie practices, localStorage use, third-party providers, contact form data, and data deletion rights.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/privacy-policy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-[#E85D4E] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">Privacy Policy</span>
      </nav>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E85D4E]/10 border border-[#E85D4E]/20 text-[#E85D4E] text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Transparency &amp; Data Security</span>
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
            1. Overview &amp; Information We Collect
          </h2>
          <p>
            At {siteConfig.name} (accessible from {siteConfig.siteUrl}), safeguarding the privacy
            of our visitors is a core principle. This Privacy Policy outlines what information is
            processed, how it is used, and the choices available to you.
          </p>
          <p>
            {siteConfig.name} is a privacy-first web utility. We do not require account registration,
            passwords, or profile creation to use our world time zone tools, day/night solar maps,
            distance calculators, or calling window planners.
          </p>
          <p>
            When you visit our site, standard server access logs may capture technical diagnostic data:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Browser type, version, language, and operating system</li>
            <li>Referring URL, requested pages, and HTTP response codes</li>
            <li>Date and time stamp of the request</li>
            <li>IP address (used strictly for abuse prevention, rate limiting, and coarse diagnostics)</li>
          </ul>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            2. Cookies &amp; the Consent Banner
          </h2>
          <p>
            We present a Cookie Consent banner upon your first visit. You can choose to accept all
            cookies or restrict usage to essential functional cookies only.
          </p>
          <p>
            <strong>Zero Pre-Consent Tracking:</strong> Our cookie banner does not load any third-party
            advertising, tracking, or analytics scripts before you grant consent. Only strictly
            necessary functional settings are maintained locally in your browser.
          </p>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            3. LocalStorage Usage
          </h2>
          <p>
            To deliver an optimal, responsive experience across sessions without tracking your identity,
            we utilize browser <code>localStorage</code> exclusively for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <code>timebridge_user_place</code>: Stores your chosen or detected home city (e.g. for
              calculating instant time differences relative to your location).
            </li>
            <li>
              <code>timebridge-theme</code>: Stores your visual theme preference (light mode vs. dark mode).
            </li>
            <li>
              <code>timebridge_cookie_consent</code>: Records your response to the Cookie Notice
              (&quot;accepted&quot; or &quot;dismissed&quot;).
            </li>
            <li>
              <code>timebridge_time_format</code>: Remembers your preferred clock format (12-hour AM/PM
              vs. 24-hour military format).
            </li>
          </ul>
          <p>
            LocalStorage data never leaves your device and is not transmitted to our servers or any
            external analytics provider. You can clear this data at any time via your browser settings.
          </p>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            4. Third-Party Services
          </h2>
          <p>
            To deliver global mapping, solar computations, and reliable communication, {siteConfig.name}
            integrates the following vetted third-party infrastructure providers:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>OpenStreetMap &amp; CartoDB (Map Tiles):</strong> Our interactive global projection
              loads geographic base map raster tiles directly from OpenStreetMap and CartoDB tile servers.
              Requests to load tiles transmit standard HTTP headers and IP addresses directly to these
              infrastructure hosts under their respective terms.
            </li>
            <li>
              <strong>Weather Provider (Open-Meteo):</strong> When weather estimates are displayed for
              selected global cities, anonymized latitude/longitude coordinates are queried against the
              weather service. No personal or identifying user information is ever transmitted.
            </li>
            <li>
              <strong>Resend (Contact Email Dispatch):</strong> Submissions sent through our contact form
              are securely processed and dispatched to our administrative inbox via Resend Inc. API
              infrastructure.
            </li>
            <li>
              <strong>Google AdSense (When Enabled):</strong> Once advertising is enabled on the site,
              third-party advertising partners including Google LLC (Google AdSense) may use cookies
              and web beacons to serve personalized or contextual advertisements based on your prior
              visits to this or other websites. You can opt out of personalized Google advertising at{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E85D4E] underline"
              >
                https://policies.google.com/technologies/ads
              </a>.
            </li>
          </ul>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            5. Contact Form Data Collection &amp; Deletion Rights
          </h2>
          <p>
            When you voluntarily submit an inquiry through our{" "}
            <Link href="/contact" className="text-[#E85D4E] underline">
              contact form
            </Link>
            , we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your full name (as provided)</li>
            <li>Your email address (for sending a reply)</li>
            <li>The subject line and message text of your inquiry</li>
          </ul>
          <p>
            We use this information solely to respond to your question, address bug reports, or verify
            suggested city timezone corrections. We do not sell, rent, or monetize contact form data, nor
            do we add your email address to marketing mailing lists.
          </p>
          <p>
            <strong>How to Request Data Deletion:</strong> In accordance with GDPR, CCPA, and global
            data protection regulations, you have the right to request full erasure of any communication
            history. To request permanent deletion of any message you have sent us, email{" "}
            {siteConfig.contactEmail ? (
              <a href={`mailto:${siteConfig.contactEmail}`} className="font-mono text-[#E85D4E] underline">
                {siteConfig.contactEmail}
              </a>
            ) : (
              <span className="font-mono text-[#E85D4E]">our contact address via the contact form</span>
            )}{" "}
            with the subject line &quot;Data Deletion Request&quot; from the email address used in your
            original message. We process all deletion requests within 30 calendar days.
          </p>
        </section>
      </div>
    </div>
  );
}
