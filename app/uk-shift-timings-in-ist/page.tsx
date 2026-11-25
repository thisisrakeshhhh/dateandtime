import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { buildPageMetadata } from "@/lib/seo";
import ShiftConverterClient from "@/components/ShiftConverterClient";
import AdSlot from "@/components/AdSlot";
import FaqBlock from "@/components/FaqBlock";
import { ChevronRight, Briefcase } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "UK Shift Timings in IST | British Shift Hours, BST Shifts & Guide",
  description:
    "Complete reference for UK shift timings in India (IST): standard working hours, how British Summer Time (BST) shifts your work day by 1 hour, London office overlap, and handover best practices.",
  canonical: `${siteConfig.siteUrl}/uk-shift-timings-in-ist`,
});

const FAQS = [
  {
    question: "What are the standard UK shift timings in Indian Standard Time (IST)?",
    answer:
      "A standard UK shift in India spans 9 hours: in winter (Greenwich Mean Time / GMT), it runs from 1:30 PM to 10:30 PM IST. In summer (British Summer Time / BST), it shifts forward by 1 hour to 2:30 PM to 11:30 PM IST.",
  },
  {
    question: "How does British Summer Time (BST) affect UK shift timings in India?",
    answer:
      "The UK advances its clocks forward by 1 hour on the last Sunday of March (GMT becomes BST, UTC+01:00) and moves them back on the last Sunday of October. Because India does not observe Daylight Saving Time, the difference between the UK and India contracts from 5h 30m in winter to 4h 30m in summer. Consequently, your shift in India starts and finishes 1 hour later during summer months.",
  },
  {
    question: "Why is the UK shift popular among Indian IT and financial service teams?",
    answer:
      "Unlike US night shifts which require staying awake past 3:00 AM or 5:00 AM, the UK shift (afternoon to late evening) aligns with normal daylight hours in India. Employees enjoy morning personal time, experience less severe circadian disruption, and can wrap up work around 10:30 PM or 11:30 PM.",
  },
  {
    question: "What is the best window for synchronous meetings between India and the UK?",
    answer:
      "The ideal meeting overlap window is between 1:30 PM and 6:30 PM IST (which corresponds to 8:00 AM to 1:00 PM GMT in winter, and 9:00 AM to 2:00 PM BST in summer). This enables both sides to hold standups, sprint planning, and client reviews during comfortable business hours.",
  },
];

export default function UkShiftTimingsInIstPage() {
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
        name: "UK Shift Timings in IST",
        item: `${siteConfig.siteUrl}/uk-shift-timings-in-ist`,
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
        <span className="text-neutral-900 dark:text-white font-medium">UK Shift Timings in IST</span>
      </nav>

      {/* Hero Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E85D4E]/10 text-[#E85D4E]">
            Workplace Guide
          </span>
          <span className="text-xs text-neutral-400">· Updated for 2026 GMT & BST Changes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          UK Shift Timings in IST: Schedules, BST Impact & Overlap Guide
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          The UK afternoon corridor is one of the most prominent operational partnerships in the IT, banking, and professional services sectors. Here is an in-depth breakdown of standard British shift hours in Indian Standard Time (IST), how British Summer Time (BST) affects your daily schedule, and strategies for seamless cross-border handoffs.
        </p>
      </div>

      {/* Interactive Tool configured for UK in IST */}
      <ShiftConverterClient initialShift="uk-in-ist" />

      {/* AdSlot */}
      <div className="my-6">
        <AdSlot slotId="uk-shift-mid" format="horizontal" />
      </div>

      {/* Editorial Content 1: Seasonal Differences (GMT vs BST) */}
      <section className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Understanding the GMT vs. BST Seasonal Transition
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            Unlike North American shifts that often reverse your night and day, the UK corridor operates comfortably across European business hours. However, remote employees must track the UK&apos;s twice-yearly daylight saving switch:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                Winter Shift: Greenwich Mean Time (GMT · UTC+00:00)
              </h3>
              <p className="text-xs text-neutral-500 mb-2">
                Active from the last Sunday of October to the last Sunday of March.
              </p>
              <ul className="text-xs space-y-1 font-mono text-neutral-800 dark:text-neutral-200">
                <li>• Difference: <strong>India is 5h 30m ahead of UK</strong></li>
                <li>• IST Shift Hours: <strong>1:30 PM – 10:30 PM IST</strong></li>
                <li>• Equivalent UK Hours: <strong>8:00 AM – 5:00 PM GMT</strong></li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                Summer Shift: British Summer Time (BST · UTC+01:00)
              </h3>
              <p className="text-xs text-neutral-500 mb-2">
                Active from the last Sunday of March to the last Sunday of October.
              </p>
              <ul className="text-xs space-y-1 font-mono text-neutral-800 dark:text-neutral-200">
                <li>• Difference: <strong>India is 4h 30m ahead of UK</strong></li>
                <li>• IST Shift Hours: <strong>2:30 PM – 11:30 PM IST</strong></li>
                <li>• Equivalent UK Hours: <strong>10:00 AM – 7:00 PM BST</strong> (or 1:30 PM – 10:30 PM IST for 9 AM – 6 PM BST)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Content 2: Handover Optimization & Collaboration */}
      <section className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#E85D4E]" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Optimizing the UK-India Handover Workflow
          </h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            The major advantage of the UK-India corridor is the substantial afternoon overlap. When London staff arrive at their desks between 8:30 AM and 9:00 AM local time, Indian teams have already spent 4 to 5 hours completing morning engineering sprints, triaging tickets, and preparing daily deliverables.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            <li>
              <strong>Daily Standup Window:</strong> Schedule team syncs between 2:00 PM and 3:30 PM IST (9:30 AM to 11:00 AM London). This allows London leads to review the morning&apos;s progress immediately upon arrival.
            </li>
            <li>
              <strong>London Lunch Break Consideration:</strong> Be mindful that UK teams typically break for lunch between 1:00 PM and 2:00 PM GMT/BST (6:30 PM – 7:30 PM IST in winter). Avoid placing mission-critical escalations or all-hands calls during this hour.
            </li>
            <li>
              <strong>Evening Asynchronous Closeout:</strong> Before wrapping up at 10:30 PM or 11:30 PM IST, document blockers and status logs in Jira or Slack. Because UK counterparts remain active until approximately 5:00 PM or 6:00 PM London time, they can approve pull requests and review code before their own day concludes.
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ Block */}
      <FaqBlock faqs={FAQS} />
    </div>
  );
}
