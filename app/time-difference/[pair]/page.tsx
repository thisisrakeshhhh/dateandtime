import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getPlaceBySlug,
  getPopularPairs,
  getRelatedPairs,
} from "@/lib/places";
import { calculateTimeDifference, calculateBestTimeToCall } from "@/lib/time";
import { calculateDistance } from "@/lib/distance";
import {
  generatePairArticle,
  generatePairFaqs,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/config";
import ResultCard from "@/components/ResultCard";
import BestTimeToCallBox from "@/components/BestTimeToCallBox";
import MeetingTable from "@/components/MeetingTable";
import FaqBlock from "@/components/FaqBlock";
import WorldMapContainer from "@/components/Map";
import AdSlot from "@/components/AdSlot";
import {
  ArrowLeftRight,
  PhoneCall,
  Globe,
  Clock,
  Compass,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  params: Promise<{ pair: string }>;
}

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
    placeB.lng
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
  const pageUrl = `${siteConfig.siteUrl}/time-difference/${placeA.slug}-to-${placeB.slug}`;

  return {
    title: article.metaTitle,
    description: article.metaDescription,
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
    placeB.lng
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

  // Breadcrumbs
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Time Difference", url: "/time-difference/india-to-united-kingdom" },
    { name: `${placeA.name} to ${placeB.name}`, url: `/time-difference/${placeA.slug}-to-${placeB.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="space-y-8">
      {/* Breadcrumb JSON-LD & Breadcrumbs UI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-400">Time Difference</span>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
          {placeA.name} to {placeB.name}
        </span>
      </nav>

      {/* Header H1 and Subtitle */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Live Daylight Saving & Time Offset Calculation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          {article.h1}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          {diff.verbalSummary} Compare live local clocks, observe current day and night
          regions on the world map, check distance, and plan the ideal overlap window.
        </p>
      </div>

      {/* Fast Action Quick Links */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href={`/time-difference/${placeB.slug}-to-${placeA.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors shadow-xs"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-500" />
          <span>Reverse: {placeB.name} to {placeA.name}</span>
        </Link>
        <Link
          href={`/best-time-to-call/${placeB.slug}-from-${placeA.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5 text-indigo-500" />
          <span>Best Time to Call Guide</span>
        </Link>
        {placeA.countrySlug && (
          <Link
            href={`/country/${placeA.countrySlug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <span>{placeA.countryName} Time & Zones</span>
          </Link>
        )}
        {placeB.countrySlug && placeB.countrySlug !== placeA.countrySlug && (
          <Link
            href={`/country/${placeB.countrySlug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <span>{placeB.countryName} Time & Zones</span>
          </Link>
        )}
      </div>

      {/* Main Result Card */}
      <ResultCard placeA={placeA} placeB={placeB} />

      {/* Interactive World Map showing live terminator & geodesic path */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-500" />
            Day / Night World Map & Flight Path
          </h2>
          <span className="text-xs text-neutral-400">
            {dist.formattedKm} apart
          </span>
        </div>
        <WorldMapContainer
          placeA={placeA}
          placeB={placeB}
          className="h-[460px] w-full"
        />
      </div>

      {/* Optional AdSlot (In-Content) */}
      <AdSlot type="in-content" />

      {/* Best Time to Call Box */}
      <BestTimeToCallBox fromPlace={placeA} toPlace={placeB} />

      {/* 24-Hour Comparison Table */}
      <MeetingTable placeA={placeA} placeB={placeB} />

      {/* Editorial Content Section (250-400 words written from real data) */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-3">
            Understanding the Time Difference: {placeA.name} to {placeB.name}
          </h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-4">
            {article.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>

        {/* Server-Rendered Plain HTML Key Facts Table for SEO / No-JS crawlers */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Quick Reference Facts
          </h3>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <dt className="text-neutral-500 text-[11px]">Time Difference</dt>
              <dd className="font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {diff.relationTextShort}
              </dd>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <dt className="text-neutral-500 text-[11px]">{placeA.name} Zone</dt>
              <dd className="font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {diff.fromTime.timeZoneAbbr} ({diff.fromTime.utcOffsetString})
              </dd>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <dt className="text-neutral-500 text-[11px]">{placeB.name} Zone</dt>
              <dd className="font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {diff.toTime.timeZoneAbbr} ({diff.toTime.utcOffsetString})
              </dd>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <dt className="text-neutral-500 text-[11px]">Direct Distance</dt>
              <dd className="font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {dist.formattedKm}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* FAQ Section with FAQPage JSON-LD Schema */}
      <FaqBlock
        faqs={faqs}
        title={`Frequently Asked Questions: ${placeA.name} to ${placeB.name}`}
      />

      {/* Related Pairs Internal Links (SEO Silo Architecture) */}
      <section className="pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-500" />
          Related Time Differences & Corridors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {relatedPairs.map((r) => (
            <Link
              key={r.url}
              href={r.url}
              className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/50 hover:shadow-xs transition-all group flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {r.from.name} to {r.to.name}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {r.from.countryName} → {r.to.countryName}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
