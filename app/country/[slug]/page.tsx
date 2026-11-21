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
import { Globe, Clock, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
      title,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CountryPage({ params }: PageProps) {
  const resolved = await params;
  const country = getCountryBySlug(resolved.slug);
  if (!country) notFound();

  const timeInfo = getPlaceTimeInfo(country.timezone, country.lat, country.lng);
  const allPopular = getPopularPairs();
  const countryPairs = allPopular.filter(
    (p) => p.from === country.slug || p.to === country.slug
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-400">Country</span>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
          {country.name}
        </span>
      </nav>

      {/* Hero Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>Country Time Zone Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Current Local Time in {country.name}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          {country.name} is situated in {country.continent || "the world"}, with its capital
          at {country.capital || country.name}. The primary IANA standard time zone is{" "}
          <span className="font-mono font-semibold">{country.timezone}</span> (
          {timeInfo.utcOffsetString}).
        </p>
      </div>

      {/* Live Clock Card for Country */}
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

        {/* Country Quick Info Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between text-xs space-y-3">
          <h2 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
            Country Details
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">ISO Code:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {country.countryIso}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Continent:</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {country.continent || "Global"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Capital:</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {country.capital || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Coordinates:</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-300">
                {country.lat.toFixed(2)}°, {country.lng.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Daylight Saving:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {timeInfo.isDST ? "Active (Summer Time)" : "Not Active (Standard Time)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Sub-Zones (if country spans multiple zones like US, Australia, Canada) */}
      {country.otherZones && country.otherZones.length > 0 && (
        <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            Other Time Zones in {country.name}
          </h2>
          <p className="text-xs text-neutral-500 mb-4">
            Because {country.name} covers vast geographic territory, different states and
            territories observe distinct standard offsets:
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
                    <p className="font-mono text-xs font-semibold text-neutral-900 dark:text-white">
                      {zone.split("/").pop()?.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {zoneTime.timeZoneAbbr} ({zoneTime.utcOffsetString})
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {zoneTime.formattedTime}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Interactive Map Centered on Country */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
          {country.name} on Live World Map
        </h2>
        <WorldMapContainer placeA={country} placeB={null} className="h-[460px] w-full" />
      </div>

      <AdSlot type="in-content" />

      {/* Popular Time Differences for this Country */}
      <section>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Popular Time Difference Comparisons for {country.name}
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
                  className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/50 hover:shadow-xs transition-all group flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {pFrom.name} to {pTo.name}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Live difference & overlap table
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })
          ) : (
            <p className="text-xs text-neutral-500 col-span-3">
              Check out all global corridors on the{" "}
              <Link href="/" className="text-emerald-600 underline">
                homepage interactive tool
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
