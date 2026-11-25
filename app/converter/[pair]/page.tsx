import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { DateTime } from "luxon";
import {
  getAbbreviation,
  getAbbreviationPair,
  getAllAbbreviationPairs,
  calculateAbbreviationConversion,
  generateAbbreviation24HourTable,
  generateAbbreviationFaqs,
} from "@/lib/abbreviations";
import { siteConfig } from "@/lib/config";
import ConverterClient from "@/components/ConverterClient";
import AdSlot from "@/components/AdSlot";
import {
  Clock,
  AlertTriangle,
  Building,
  CheckCircle,
  Briefcase,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";

interface PageProps {
  params: Promise<{ pair: string }>;
}

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const pairs = getAllAbbreviationPairs();
  return pairs.map((p) => ({
    pair: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const pair = getAbbreviationPair(resolved.pair);
  if (!pair) return {};

  const fromAbbr = getAbbreviation(pair.from);
  const toAbbr = getAbbreviation(pair.to);
  if (!fromAbbr || !toAbbr) return {};

  const conv = calculateAbbreviationConversion(fromAbbr.code, toAbbr.code);
  const diffStr = conv ? conv.diffFormatted : "time difference";
  const title = `${fromAbbr.code} to ${toAbbr.code} Time Converter | ${fromAbbr.name} to ${toAbbr.name}`;
  const description = `Convert ${fromAbbr.code} to ${toAbbr.code} with date picker, seasonal daylight saving warnings, and hour-by-hour comparison table. ${fromAbbr.code} vs ${toAbbr.code} time gap: ${diffStr}.`;
  const pageUrl = `${siteConfig.siteUrl}/converter/${pair.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}

export default async function AbbreviationConverterPage({ params }: PageProps) {
  const resolved = await params;
  const pair = getAbbreviationPair(resolved.pair);
  if (!pair) notFound();

  const fromAbbr = getAbbreviation(pair.from);
  const toAbbr = getAbbreviation(pair.to);
  if (!fromAbbr || !toAbbr) notFound();

  const todayIso = DateTime.now().toFormat("yyyy-MM-dd");
  const conversion = calculateAbbreviationConversion(fromAbbr.code, toAbbr.code, todayIso, "12:00");
  const tableRows = generateAbbreviation24HourTable(fromAbbr.code, toAbbr.code, todayIso);
  const faqs = generateAbbreviationFaqs(fromAbbr, toAbbr, todayIso);

  // Schema Markup: FAQPage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  // Schema Markup: BreadcrumbList
  const breadcrumbSchema = {
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
        name: "Time Converters",
        item: `${siteConfig.siteUrl}/converter`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${fromAbbr.code} to ${toAbbr.code}`,
        item: `${siteConfig.siteUrl}/converter/${pair.slug}`,
      },
    ],
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link href="/converter" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Converters
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-900 dark:text-white font-medium">
          {fromAbbr.code} to {toAbbr.code}
        </span>
      </nav>

      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E85D4E]/10 text-[#E85D4E] text-xs font-semibold mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Time Zone Converter</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {fromAbbr.code} to {toAbbr.code} Time Converter
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {fromAbbr.name} ({fromAbbr.standardOffset}) to {toAbbr.name} ({toAbbr.standardOffset})
        </p>
      </div>

      {/* ONE-LINE ANSWER AT THE TOP */}
      {conversion && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181818] border-l-4 border-[#E85D4E] border border-neutral-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#E85D4E] mb-1">
            Quick Answer
          </div>
          <p className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white leading-relaxed">
            {conversion.oneLineAnswer}
          </p>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Offset Difference: <strong className="text-neutral-800 dark:text-neutral-200">{conversion.diffFormatted}</strong>
            </span>
            <span>
              Calculated using official IANA database: <code className="font-mono text-[11px] bg-neutral-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded">{fromAbbr.defaultIana}</code> to <code className="font-mono text-[11px] bg-neutral-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded">{toAbbr.defaultIana}</code>
            </span>
          </div>
        </div>
      )}

      {/* INTERACTIVE TIME CONVERTER WITH DATE PICKER */}
      <ConverterClient fromAbbr={fromAbbr} toAbbr={toAbbr} initialDateIso={todayIso} />

      {/* CLEAR WARNING BLOCK: AMBIGUOUS OR SEASONAL TIME ZONES */}
      <section className="rounded-2xl border border-amber-300/80 dark:border-amber-600/40 bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-orange-500/5 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Seasonal & Ambiguity Notice for {fromAbbr.code} and {toAbbr.code}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* From-Abbreviation Warning */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1a1a1a]/80 border border-amber-200/80 dark:border-amber-700/40 space-y-2">
            <div className="font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
              <span>{fromAbbr.code} ({fromAbbr.name})</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                {fromAbbr.type}
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {fromAbbr.seasonalWarning}
            </p>
            <p className="text-neutral-500 dark:text-neutral-400 text-[11px] border-t border-amber-200/50 dark:border-amber-800/40 pt-1.5">
              <strong>Ambiguity:</strong> {fromAbbr.ambiguityWarning}
            </p>
          </div>

          {/* To-Abbreviation Warning */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1a1a1a]/80 border border-amber-200/80 dark:border-amber-700/40 space-y-2">
            <div className="font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
              <span>{toAbbr.code} ({toAbbr.name})</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                {toAbbr.type}
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {toAbbr.seasonalWarning}
            </p>
            <p className="text-neutral-500 dark:text-neutral-400 text-[11px] border-t border-amber-200/50 dark:border-amber-800/40 pt-1.5">
              <strong>Ambiguity:</strong> {toAbbr.ambiguityWarning}
            </p>
          </div>
        </div>
      </section>

      {/* AD SLOT */}
      <AdSlot slotId="converter-mid" format="horizontal" />

      {/* WHICH CITIES USE EACH ABBREVIATION AND WHEN */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Which Cities Use {fromAbbr.code} and {toAbbr.code}?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Key global metropolitan areas observing these abbreviations and their schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Cities Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-[#E85D4E]" />
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                Cities observing {fromAbbr.code} ({fromAbbr.name})
              </h3>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <strong>When observed:</strong> {fromAbbr.whenObserved}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {fromAbbr.majorCities.map((city) => (
                <div
                  key={city.name}
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800"
                >
                  <div className="font-medium text-neutral-900 dark:text-white">{city.name}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">{city.country}</div>
                </div>
              ))}
            </div>
          </div>

          {/* To Cities Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-[#E85D4E]" />
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                Cities observing {toAbbr.code} ({toAbbr.name})
              </h3>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <strong>When observed:</strong> {toAbbr.whenObserved}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {toAbbr.majorCities.map((city) => (
                <div
                  key={city.name}
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-100 dark:border-neutral-800"
                >
                  <div className="font-medium text-neutral-900 dark:text-white">{city.name}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">{city.country}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMMON TIMES CONVERSION TABLE */}
      <section className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Common Times Table: {fromAbbr.code} to {toAbbr.code}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Hour-by-hour reference table indicating daytime and overlapping working hours.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-[#202020] text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">{fromAbbr.code} Time</th>
                <th className="py-2.5 px-3 font-semibold">{toAbbr.code} Time</th>
                <th className="py-2.5 px-3 font-semibold">Calendar Day</th>
                <th className="py-2.5 px-3 font-semibold text-right">Meeting Suitability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {tableRows.map((row) => (
                <tr
                  key={row.hour24}
                  className={`transition-colors ${
                    row.isOverlapOffice
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 font-medium"
                      : row.isOverlapAwake
                      ? "bg-neutral-50/60 dark:bg-[#1e1e1e]/60"
                      : "hover:bg-neutral-50/40 dark:hover:bg-neutral-800/30"
                  }`}
                >
                  <td className="py-2 px-3 tabular-nums font-mono">
                    <span className="flex items-center gap-1.5">
                      {row.isDayA ? (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{row.fromTime12}</span>
                    </span>
                  </td>
                  <td className="py-2 px-3 tabular-nums font-mono font-semibold text-[#E85D4E] dark:text-rose-400">
                    <span className="flex items-center gap-1.5">
                      {row.isDayB ? (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{row.toTime12}</span>
                    </span>
                  </td>
                  <td className="py-2 px-3 text-neutral-500 dark:text-neutral-400">
                    {row.dayDifference !== 0 ? (
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {row.dayDifferenceLabel}
                      </span>
                    ) : (
                      <span>Same day</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {row.isOverlapOffice ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                        <Briefcase className="w-3 h-3" />
                        Office overlap
                      </span>
                    ) : row.isOverlapAwake ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Awake hours
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">Outside waking hours</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ with Schema) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Frequently Asked Questions: {fromAbbr.code} to {toAbbr.code}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Essential facts, Daylight Saving Time nuances, and conversion guidance.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/[0.08] shadow-xs"
            >
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1.5">
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* RELATED POPULAR CONVERTERS */}
      <section className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#161616] border border-neutral-200/70 dark:border-white/[0.06] space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">
          Related Time Zone Converters
        </h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {getAllAbbreviationPairs()
            .filter((p) => p.slug !== pair.slug && (p.from === fromAbbr.code || p.to === toAbbr.code || p.category === pair.category))
            .slice(0, 10)
            .map((p) => (
              <Link
                key={p.slug}
                href={`/converter/${p.slug}`}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200/80 dark:border-white/[0.08] hover:border-[#E85D4E] text-neutral-700 dark:text-neutral-300 hover:text-[#E85D4E] transition-all font-medium"
              >
                {p.from} to {p.to}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
