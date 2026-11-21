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
import BestTimeToCallBox from "@/components/BestTimeToCallBox";
import MeetingTable from "@/components/MeetingTable";
import ResultCard from "@/components/ResultCard";
import FaqBlock from "@/components/FaqBlock";
import WorldMapContainer from "@/components/Map";
import AdSlot from "@/components/AdSlot";
import {
  PhoneCall,
  Clock,
  ArrowLeftRight,
  Compass,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  params: Promise<{ pair: string }>;
}

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
  const description = `Find the best time to call ${placeTo.name} from ${placeFrom.name}: optimal 9 AM - 9 PM awake overlap (${bestTime.overlapHoursCount}h), office hours overlap, and full 24h table.`;
  const pageUrl = `${siteConfig.siteUrl}/best-time-to-call/${placeTo.slug}-from-${placeFrom.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
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

  // Breadcrumbs
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Best Time to Call", url: "/best-time-to-call/united-kingdom-from-india" },
    { name: `${placeTo.name} from ${placeFrom.name}`, url: `/best-time-to-call/${placeTo.slug}-from-${placeFrom.slug}` },
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
        <span className="text-neutral-400">Best Time to Call</span>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
          {placeTo.name} from {placeFrom.name}
        </span>
      </nav>

      {/* Header H1 */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Cross-Timezone Call Planning Window</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Best Time to Call {placeTo.name} from {placeFrom.name}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          {bestTime.description}
        </p>
      </div>

      {/* Fast Action Quick Links */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href={`/time-difference/${placeFrom.slug}-to-${placeTo.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors shadow-xs"
        >
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Live Time Difference Page</span>
        </Link>
        <Link
          href={`/best-time-to-call/${placeFrom.slug}-from-${placeTo.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors shadow-xs"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
          <span>Reverse: Call {placeFrom.name} from {placeTo.name}</span>
        </Link>
      </div>

      {/* Best Time to Call Box (Top Priority on this route) */}
      <BestTimeToCallBox fromPlace={placeFrom} toPlace={placeTo} />

      {/* 24-Hour Comparison Table */}
      <MeetingTable placeA={placeFrom} placeB={placeTo} />

      {/* Result Card: Clocks & Distance */}
      <ResultCard placeA={placeFrom} placeB={placeTo} />

      {/* Interactive Map */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-500" />
            Live Day/Night Globe
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {dist.formattedKm} apart
          </span>
        </div>
        <WorldMapContainer
          placeA={placeFrom}
          placeB={placeTo}
          className="h-[460px] w-full"
        />
      </div>

      {/* Optional AdSlot (In-Content) */}
      <AdSlot type="in-content" />

      {/* Editorial Content */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
          How to Schedule Calls Between {placeFrom.name} and {placeTo.name}
        </h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-4">
          {article.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </section>

      {/* FAQ Section with FAQPage JSON-LD Schema */}
      <FaqBlock
        faqs={faqs}
        title={`Calling Questions: ${placeTo.name} & ${placeFrom.name}`}
      />

      {/* Related Pairs Internal Links */}
      <section className="pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-500" />
          Other Popular Calling Windows
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {relatedPairs.map((r) => (
            <Link
              key={r.url}
              href={`/best-time-to-call/${r.to.slug}-from-${r.from.slug}`}
              className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/50 hover:shadow-xs transition-all group flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Call {r.to.name} from {r.from.name}
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
