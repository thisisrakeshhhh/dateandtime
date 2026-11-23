import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getPlaceBySlug,
  getPopularPairs,
  getRelatedPairs,
  formatPlaceWithZone,
} from "@/lib/places";
import { calculateTimeDifference, calculateBestTimeToCall, getPlaceTimeInfo } from "@/lib/time";
import { calculateDistance } from "@/lib/distance";
import {
  generatePairArticle,
  generatePairFaqs,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/config";
import PairClientView from "@/components/PairClientView";
import FaqBlock from "@/components/FaqBlock";
import AdSlot from "@/components/AdSlot";
import FlagIcon from "@/components/FlagIcon";
import { ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ pair: string }>;
}

export const revalidate = 60;

function parsePairParam(pairParam: string): { fromSlug: string; toSlug: string } | null {
  const parts = pairParam.split("-to-");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { fromSlug: parts[0], toSlug: parts[1] };
}

export async function generateStaticParams() {
  const popular = getPopularPairs();
  return popular.map((p) => ({
    pair: `${p.from}-to-${p.to}`,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const slugs = parsePairParam(resolved.pair);
  if (!slugs) return {};

  const placeA = getPlaceBySlug(slugs.fromSlug);
  const placeB = getPlaceBySlug(slugs.toSlug);
  if (!placeA || !placeB) return {};

  const diff = calculateTimeDifference(
    placeA.timezone,
    placeB.timezone,
    placeA.lat,
    placeA.lng,
    placeB.lat,
    placeB.lng,
    undefined,
    placeA.name,
    placeB.name
  );
  const bestTime = calculateBestTimeToCall(
    placeA.timezone,
    placeB.timezone,
    placeA.name,
    placeB.name,
    placeA.lat,
    placeA.lng,
    placeB.lat,
    placeB.lng
  );
  const dist = calculateDistance(placeA.lat, placeA.lng, placeB.lat, placeB.lng);

  const article = generatePairArticle(placeA, placeB, diff, bestTime, dist);

  const popular = getPopularPairs();
  const pairEntry = popular.find((p) => p.from === slugs.fromSlug && p.to === slugs.toSlug);
  const canonicalPair = pairEntry?.canonicalPair || `${placeA.slug}-to-${placeB.slug}`;
  const pageUrl = `${siteConfig.siteUrl}/time-difference/${canonicalPair}`;

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
    },
  };
}

export default async function TimeDifferencePage({ params }: PageProps) {
  const resolved = await params;
  const slugs = parsePairParam(resolved.pair);
  if (!slugs) notFound();

  const placeA = getPlaceBySlug(slugs.fromSlug);
  const placeB = getPlaceBySlug(slugs.toSlug);
  if (!placeA || !placeB) notFound();

  const diff = calculateTimeDifference(
    placeA.timezone,
    placeB.timezone,
    placeA.lat,
    placeA.lng,
    placeB.lat,
    placeB.lng,
    undefined,
    placeA.name,
    placeB.name
  );
  const bestTime = calculateBestTimeToCall(
    placeA.timezone,
    placeB.timezone,
    placeA.name,
    placeB.name,
    placeA.lat,
    placeA.lng,
    placeB.lat,
    placeB.lng
  );
  const dist = calculateDistance(placeA.lat, placeA.lng, placeB.lat, placeB.lng);

  const article = generatePairArticle(placeA, placeB, diff, bestTime, dist);
  const faqs = generatePairFaqs(placeA, placeB, diff, bestTime, dist);
  const relatedPairs = getRelatedPairs(placeA.slug, placeB.slug, 6);

  const shortA = placeA.name;
  const shortB = placeB.name;

  // Breadcrumbs
  const breadcrumbItems = [
    { name: "Home", url: siteConfig.siteUrl },
    { name: "Time Difference", url: `${siteConfig.siteUrl}/all-corridors` },
    { name: `${shortA} to ${shortB}`, url: `${siteConfig.siteUrl}/time-difference/${placeA.slug}-to-${placeB.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Slim Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
        <Link href="/" className="hover:text-[#222222] dark:hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/all-corridors" className="hover:text-[#222222] dark:hover:text-white transition-colors">
          Time difference
        </Link>
        <span>/</span>
        <span className="text-[#222222] dark:text-white font-medium">
          {shortA} to {shortB}
        </span>
      </nav>

      {/* Title & Human Summary */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#222222] dark:text-white">
          {article.h1}
        </h1>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1.5 leading-relaxed">
          {diff.verbalSummary}
        </p>
      </div>

      {/* 1. Tool First: Interactive Map & Compare Card */}
      <PairClientView placeA={placeA} placeB={placeB} />

      {/* AdSlot */}
      <div className="my-6">
        <AdSlot slotId="pair-mid" format="horizontal" />
      </div>

      {/* 2. Comprehensive Pair-Specific Editorial Guide (>300 words) */}
      <section className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-7 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-[#222222] dark:text-white">
          Time Difference &amp; Daylight Saving Guide
        </h2>
        {article.paragraphs.map((para, i) => (
          <p key={i} className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A0A0A0] leading-relaxed">
            {para}
          </p>
        ))}
      </section>

      {/* Multi-Timezone Country Breakdown: Other zones in Place A or Place B */}
      {(placeA.otherZones && placeA.otherZones.length > 0) && (
        <section className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#222222] dark:text-white mb-2">
            Other time zones in {placeA.name}
          </h2>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] mb-4">
            {placeA.name} covers multiple standard time zones. The primary calculation above references {placeA.timezone} ({formatPlaceWithZone(placeA)}):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {placeA.otherZones.map((zone) => {
              const zoneTime = getPlaceTimeInfo(zone);
              return (
                <div
                  key={zone}
                  className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono text-xs font-medium text-neutral-900 dark:text-white">
                      {zone.split("/").pop()?.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {zoneTime.timeZoneAbbr} ({zoneTime.utcOffsetString})
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-white">
                    {zoneTime.formattedTime}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(placeB.otherZones && placeB.otherZones.length > 0) && (
        <section className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#222222] dark:text-white mb-2">
            Other time zones in {placeB.name}
          </h2>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] mb-4">
            {placeB.name} covers multiple standard time zones. The primary calculation above references {placeB.timezone} ({formatPlaceWithZone(placeB)}):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {placeB.otherZones.map((zone) => {
              const zoneTime = getPlaceTimeInfo(zone);
              return (
                <div
                  key={zone}
                  className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono text-xs font-medium text-neutral-900 dark:text-white">
                      {zone.split("/").pop()?.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {zoneTime.timeZoneAbbr} ({zoneTime.utcOffsetString})
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-white">
                    {zoneTime.formattedTime}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. FAQ as a clean list with a small down arrow */}
      <FaqBlock faqs={faqs} />

      {/* 4. Related routes */}
      {relatedPairs.length > 0 && (
        <section className="pt-2">
          <h2 className="text-base font-semibold text-[#222222] dark:text-white mb-3">
            Related comparisons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {relatedPairs.map((rel, idx) => (
              <Link
                key={idx}
                href={rel.url}
                className="p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 hover:border-[#E85D4E]/60 hover:shadow-sm transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate text-xs font-medium text-[#222222] dark:text-white">
                  <FlagIcon countryCode={rel.from.countryIso} size="sm" />
                  <span className="truncate">{rel.from.name}</span>
                  <span className="text-neutral-400">→</span>
                  <FlagIcon countryCode={rel.to.countryIso} size="sm" />
                  <span className="truncate">{rel.to.name}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Server-Rendered Plain HTML for SEO Bots (Google indexable without JS) */}
      <noscript>
        <div className="p-4 bg-neutral-100 rounded-xl text-xs space-y-2">
          <p>Time difference between {placeA.name} and {placeB.name}: {diff.verbalSummary}</p>
          <p>Distance: {dist.formattedKm} ({dist.formattedMiles}).</p>
          <p>Calling window: {bestTime.overlapHoursCount} hours of daylight overlap.</p>
        </div>
      </noscript>
    </div>
  );
}
