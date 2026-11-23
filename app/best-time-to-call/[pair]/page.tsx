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

function parseFromParam(pairParam: string): { toSlug: string; fromSlug: string } | null {
  const parts = pairParam.split("-from-");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { toSlug: parts[0], fromSlug: parts[1] };
}

export async function generateStaticParams() {
  const popular = getPopularPairs();
  return popular.map((p) => ({
    pair: `${p.to}-from-${p.from}`,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const slugs = parseFromParam(resolved.pair);
  if (!slugs) return {};

  const placeTo = getPlaceBySlug(slugs.toSlug);
  const placeFrom = getPlaceBySlug(slugs.fromSlug);
  if (!placeTo || !placeFrom) return {};

  const bestTime = calculateBestTimeToCall(
    placeFrom.timezone,
    placeTo.timezone,
    placeFrom.name,
    placeTo.name,
    placeFrom.lat,
    placeFrom.lng,
    placeTo.lat,
    placeTo.lng
  );

  const title = `Best Time to Call ${placeTo.name} from ${placeFrom.name} | Calling Hours Guide`;
  const description = `Find the best time to call ${placeTo.name} from ${placeFrom.name}: optimal 9 AM - 9 PM awake overlap (${bestTime.formattedDuration}), office hours overlap (${bestTime.officeFormattedDuration}), and interactive 24h timeline.`;
  const matchingDiffUrl = `${siteConfig.siteUrl}/time-difference/${placeFrom.slug}-to-${placeTo.slug}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: matchingDiffUrl,
    },
    openGraph: {
      title,
      description,
      url: matchingDiffUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BestTimeToCallPage({ params }: PageProps) {
  const resolved = await params;
  const slugs = parseFromParam(resolved.pair);
  if (!slugs) notFound();

  const placeTo = getPlaceBySlug(slugs.toSlug);
  const placeFrom = getPlaceBySlug(slugs.fromSlug);
  if (!placeTo || !placeFrom) notFound();

  const diff = calculateTimeDifference(
    placeFrom.timezone,
    placeTo.timezone,
    placeFrom.lat,
    placeFrom.lng,
    placeTo.lat,
    placeTo.lng
  );
  const bestTime = calculateBestTimeToCall(
    placeFrom.timezone,
    placeTo.timezone,
    placeFrom.name,
    placeTo.name,
    placeFrom.lat,
    placeFrom.lng,
    placeTo.lat,
    placeTo.lng
  );
  const dist = calculateDistance(placeFrom.lat, placeFrom.lng, placeTo.lat, placeTo.lng);

  const article = generatePairArticle(placeFrom, placeTo, diff, bestTime, dist);
  const faqs = generatePairFaqs(placeFrom, placeTo, diff, bestTime, dist);
  const relatedPairs = getRelatedPairs(placeFrom.slug, placeTo.slug, 6);

  const nameTo = formatPlaceWithZone(placeTo);
  const nameFrom = formatPlaceWithZone(placeFrom);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Best Time to Call", url: "/" },
    { name: `${nameTo} from ${nameFrom}`, url: `/best-time-to-call/${placeTo.slug}-from-${placeFrom.slug}` },
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
        <span className="text-neutral-400">Best time to call</span>
        <span>/</span>
        <span className="text-[#222222] dark:text-white font-medium">
          {nameTo} from {nameFrom}
        </span>
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#222222] dark:text-white">
          Best time to call {nameTo} from {nameFrom}
        </h1>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1.5 leading-relaxed">
          Based on 9:00 AM to 9:00 PM waking hours in both locations.
        </p>
      </div>

      {/* 1. Tool First: Interactive Map & Compare Card with timeline */}
      <PairClientView placeA={placeFrom} placeB={placeTo} />

      {/* AdSlot */}
      <div className="my-6">
        <AdSlot slotId="bttc-mid" format="horizontal" />
      </div>

      {/* 2. Good to know */}
      <section className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-7 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-[#222222] dark:text-white">
          Good to know
        </h2>
        {article.paragraphs.slice(0, 3).map((para, i) => (
          <p key={i} className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A0A0A0] leading-relaxed">
            {para}
          </p>
        ))}
      </section>

      {/* Multi-Timezone Country Breakdown: Other zones in Place From or Place To */}
      {(placeFrom.otherZones && placeFrom.otherZones.length > 0) && (
        <section className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#222222] dark:text-white mb-2">
            Other time zones in {placeFrom.name}
          </h2>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] mb-4">
            {placeFrom.name} covers multiple standard time zones. The primary calculation above references {placeFrom.timezone} ({formatPlaceWithZone(placeFrom)}):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {placeFrom.otherZones.map((zone) => {
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

      {(placeTo.otherZones && placeTo.otherZones.length > 0) && (
        <section className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#222222] dark:text-white mb-2">
            Other time zones in {placeTo.name}
          </h2>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] mb-4">
            {placeTo.name} covers multiple standard time zones. The primary calculation above references {placeTo.timezone} ({formatPlaceWithZone(placeTo)}):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {placeTo.otherZones.map((zone) => {
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

      {/* 3. FAQ */}
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
                href={`/best-time-to-call/${rel.to.slug}-from-${rel.from.slug}`}
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
    </div>
  );
}
