import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { buildPageMetadata } from "@/lib/seo";
import ShiftConverterClient from "@/components/ShiftConverterClient";
import AdSlot from "@/components/AdSlot";
import FaqBlock from "@/components/FaqBlock";
import { ChevronRight, AlertTriangle, ShieldCheck } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "US Shift Timings in IST | Typical Hours, DST Changes & Survival Guide",
  description:
    "Comprehensive guide to US shift timings in India (IST): standard Eastern, Central, and Pacific working hours, how Daylight Saving Time (DST) alters your login schedule by 1 hour, and practical tips for night shift wellness.",
  canonical: `${siteConfig.siteUrl}/us-shift-timings-in-ist`,
});

const FAQS = [
  {
    question: "What are the typical US shift timings in India (IST)?",
    answer:
      "Most Indian IT, BPO, and remote teams work one of two primary schedules: the US Eastern Shift (6:30 PM to 3:30 AM IST in winter, shifting to 5:30 PM to 2:30 AM IST in summer) or the US Pacific Shift (8:30 PM to 5:30 AM IST in winter, shifting to 7:30 PM to 4:30 AM IST in summer). Both provide 8 to 9 hours of coverage matching North American business hours.",
  },
  {
    question: "How do US Daylight Saving Time (DST) transitions affect my shift in India?",
    answer:
      "India Standard Time (IST) is fixed at UTC+05:30 all year and does not observe Daylight Saving Time. When the United States transitions to Daylight Saving Time (EDT) on the second Sunday of March ('Spring Forward'), your shift in India starts 1 hour earlier. When the US returns to Standard Time (EST) on the first Sunday of November ('Fall Back'), your shift starts 1 hour later.",
  },
  {
    question: "Does an Indian US shift provide 100% overlap with North American clients?",
    answer:
      "Yes. A standard 6:30 PM to 3:30 AM IST shift aligns directly with 8:00 AM to 5:00 PM US Eastern Time (in winter) and 9:00 AM to 6:00 PM EDT (in summer), guaranteeing full synchronous collaboration during the client's core workday.",
  },
  {
    question: "What are the best habits for maintaining physical health on US night shifts in India?",
    answer:
      "Maintain a consistent sleep window (preferably 5:00 AM to 1:00 PM), install blackout curtains, avoid heavy carbohydrate meals past midnight, wear blue-light blocking glasses during your morning commute, and establish an uninterrupted quiet environment during daytime rest.",
  },
];

export default function UsShiftTimingsInIstPage() {
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
      {
        "@type": "ListItem",
        position: 3,
        name: "US Shift Timings in IST",
        item: `${siteConfig.siteUrl}/us-shift-timings-in-ist`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <Link href="/shift-converter" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Shift Converter
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <span className="text-neutral-900 dark:text-white font-medium">US Shift Timings in IST</span>
      </nav>

      {/* Hero Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E85D4E]/10 text-[#E85D4E]">
            Workplace Guide
          </span>
          <span className="text-xs text-neutral-400">· Updated for 2026 Daylight Saving Transitions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          US Shift Timings in IST: Schedules, DST Shifts & Practical Guide
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          Over 4 million Indian professionals work in offshore engineering, product operations, and customer support catering directly to United States enterprises. Here is an exact breakdown of typical US shift schedules in Indian Standard Time (IST), how Daylight Saving Time (DST) alters your login clock by 60 minutes, and proven strategies to thrive on night shifts.
        </p>
      </div>

      {/* Interactive Tool configured for US in IST */}
      <ShiftConverterClient initialShift="us-in-ist" />

      {/* AdSlot */}
      <div className="my-6">
        <AdSlot slotId="us-shift-mid" format="horizontal" />
      </div>

      {/* Editorial Content 1: Typical US Shift Schedules in IST */}
      <section className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Standard US Working Shifts Mapped to Indian Standard Time
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            Because the United States spans four primary mainland time zones—Eastern (ET), Central (CT), Mountain (MT), and Pacific (PT)—Indian enterprise schedules vary based on client headquarters.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                US Eastern Shift (New York / Atlanta / Boston)
              </h3>
              <p className="text-xs text-neutral-500 mb-2">
                Equivalent to 9:00 AM – 6:00 PM Eastern Time.
              </p>
              <ul className="text-xs space-y-1 font-mono text-neutral-800 dark:text-neutral-200">
                <li>• <strong>Winter (EST):</strong> 6:30 PM – 3:30 AM IST</li>
                <li>• <strong>Summer (EDT):</strong> 5:30 PM – 2:30 AM IST</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                US Pacific Shift (California / Seattle / Silicon Valley)
              </h3>
              <p className="text-xs text-neutral-500 mb-2">
                Equivalent to 9:00 AM – 6:00 PM Pacific Time.
              </p>
              <ul className="text-xs space-y-1 font-mono text-neutral-800 dark:text-neutral-200">
                <li>• <strong>Winter (PST):</strong> 8:30 PM – 5:30 AM IST</li>
                <li>• <strong>Summer (PDT):</strong> 7:30 PM – 4:30 AM IST</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Content 2: What Daylight Saving Time Means for Your Shift */}
      <section className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            The Daylight Saving Shift: Why Your Login Time Moves by 1 Hour
          </h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            One of the most confusing occurrences for professionals new to US accounts is the bi-annual Daylight Saving Time clock shift. India remains strictly on UTC+05:30 all 365 days of the year. The United States, conversely, adjusts its clocks twice annually:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            <li>
              <strong>Spring Forward (Second Sunday in March):</strong> US clocks advance by 1 hour (2:00 AM becomes 3:00 AM). In India, the time difference shrinks from 10h 30m to 9h 30m (Eastern). <em>Your shift starts 1 hour earlier in India (e.g., 5:30 PM instead of 6:30 PM IST).</em>
            </li>
            <li>
              <strong>Fall Back (First Sunday in November):</strong> US clocks move back by 1 hour (2:00 AM becomes 1:00 AM). The time difference expands back to 10h 30m. <em>Your shift starts 1 hour later in India (e.g., 6:30 PM instead of 5:30 PM IST).</em>
            </li>
          </ul>
          <p>
            Managers should always remind their teams two weeks prior to the March and November cutovers to adjust transportation schedules, meal prep, and family commitments accordingly.
          </p>
        </div>
      </section>

      {/* Editorial Content 3: Health & Circadian Wellness */}
      <section className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Science-Backed Tips for Thriving on Night Shifts
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">
              1. Anchor Your Sleep
            </h3>
            <p>
              Commit to the exact same 7-8 hour sleep window every day, including weekends. Inconsistent sleep hours prevent your body from establishing a stable circadian rhythm, causing chronic daytime fatigue.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">
              2. Darken Your Bedroom
            </h3>
            <p>
              Invest in high-grade 100% blackout curtains and an eye mask. Ambient daylight suppresses melatonin production in the pineal gland, interrupting deep REM recovery cycles.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">
              3. Midnight Nutrition
            </h3>
            <p>
              Avoid heavy carb-loaded meals between 1:00 AM and 4:00 AM when digestive metabolic enzymes are lowest. Prefer protein snacks, nuts, and adequate hydration over high-sugar energy drinks.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Block */}
      <FaqBlock faqs={FAQS} />
    </div>
  );
}
