import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCountries, getCountryBySlug, getPopularPairs, getPlaceBySlug } from "@/lib/places";
import { getPlaceTimeInfo } from "@/lib/time";
import { siteConfig } from "@/lib/config";
import LiveClock from "@/components/LiveClock";
import WorldMapContainer from "@/components/Map";
import AdSlot from "@/components/AdSlot";
import FlagIcon from "@/components/FlagIcon";
import { ArrowRight } from "lucide-react";
import { generateCountryArticle } from "@/lib/countryContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const countries = getCountries();
  return countries.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const country = getCountryBySlug(resolved.slug);
  if (!country) return {};

  const timeInfo = getPlaceTimeInfo(country.timezone, country.lat, country.lng);
  const title = `Current Local Time in ${country.name} | Time Zones & DST Info`;
  const description = `Live local time in ${country.name} (${timeInfo.utcOffsetString}, ${timeInfo.timeZoneAbbr}). Current daylight saving status, time zones, capital ${country.capital}, and popular time differences.`;
  const pageUrl = `${siteConfig.siteUrl}/country/${country.slug}`;

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
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}

export default async function CountryPage({ params }: PageProps) {
  const resolved = await params;
  const country = getCountryBySlug(resolved.slug);
  if (!country) notFound();

  const timeInfo = getPlaceTimeInfo(country.timezone, country.lat, country.lng);
  const article = generateCountryArticle(country);
  const allPopular = getPopularPairs();
  const countryPairs = allPopular.filter(
    (p) => p.from === country.slug || p.to === country.slug
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
        <Link href="/" className="hover:text-[#222222] dark:hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-400">Country</span>
        <span>/</span>
        <span className="text-[#222222] dark:text-white font-medium">
          {country.name}
        </span>
      </nav>

      {/* Hero Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <FlagIcon countryCode={country.countryIso} size="md" />
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#222222] dark:text-white">
            Current local time in {country.name}
          </h1>
        </div>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] max-w-3xl leading-relaxed">
          {country.name} is situated in {country.continent || "the world"}, with its capital
          at {country.capital || country.name}. Standard IANA time zone:{" "}
          <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">{country.timezone}</span> (
          {timeInfo.utcOffsetString}).
        </p>
      </div>

      {/* Live Clock Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <LiveClock
            placeName={country.name}
            countryName={country.capital ? `Capital: ${country.capital}` : country.name}
            timezone={country.timezone}
            lat={country.lat}
            lng={country.lng}
            badgeColor="emerald"
          />
        </div>

        {/* Details Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between text-xs space-y-3">
          <h2 className="font-semibold text-xs text-[#222222] dark:text-white uppercase tracking-wider">
            Quick facts
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">ISO code</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {country.countryIso}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Continent</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {country.continent || "Global"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Capital</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {country.capital || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Coordinates</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-300">
                {country.lat.toFixed(2)}°, {country.lng.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Daylight saving</span>
              <span className="font-medium text-[#E85D4E]">
                {timeInfo.isDST ? "Active" : "Standard time"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Other zones */}
      {country.otherZones && country.otherZones.length > 0 && (
        <section className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#222222] dark:text-white mb-2">
            Other time zones in {country.name}
          </h2>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] mb-4">
            Due to geographic breadth, different territories in {country.name} observe distinct standard offsets:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {country.otherZones.map((zone) => {
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

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        <WorldMapContainer
          placeA={country}
          placeB={null}
          userTimezone={country.timezone}
          className="h-[460px] w-full"
        />
      </div>

      {/* Comprehensive Country Guide Article */}
      <section className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-[#222222] dark:text-white">
          Timekeeping, Solar Daylight &amp; Business Operating Hours in {country.name}
        </h2>
        <div className="space-y-3.5 text-sm leading-relaxed text-[#555555] dark:text-[#CCCCCC]">
          {article.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </section>

      <AdSlot slotId="country-bottom" format="horizontal" />

      {/* Popular pairs */}
      <section>
        <h2 className="text-base font-semibold text-[#222222] dark:text-white mb-3">
          Popular comparisons for {country.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {countryPairs.length > 0 ? (
            countryPairs.map((p) => {
              const pFrom = getPlaceBySlug(p.from);
              const pTo = getPlaceBySlug(p.to);
              if (!pFrom || !pTo) return null;

              return (
                <Link
                  key={`${p.from}-${p.to}`}
                  href={`/time-difference/${p.from}-to-${p.to}`}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 hover:border-[#E85D4E]/60 hover:shadow-sm transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-[#222222] dark:text-white truncate">
                    <FlagIcon countryCode={pFrom.countryIso} size="sm" />
                    <span className="truncate">{pFrom.name}</span>
                    <span className="text-neutral-400">→</span>
                    <FlagIcon countryCode={pTo.countryIso} size="sm" />
                    <span className="truncate">{pTo.name}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E85D4E] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              );
            })
          ) : (
            <p className="text-xs text-neutral-500 col-span-3">
              Explore comparisons on the{" "}
              <Link href="/" className="text-[#E85D4E] underline">
                interactive map
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
