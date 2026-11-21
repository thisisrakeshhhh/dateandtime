import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCities, getCityBySlug, getPopularPairs, getPlaceBySlug } from "@/lib/places";
import { getPlaceTimeInfo } from "@/lib/time";
import { siteConfig } from "@/lib/config";
import LiveClock from "@/components/LiveClock";
import WorldMapContainer from "@/components/Map";
import AdSlot from "@/components/AdSlot";
import { MapPin, Clock, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const cities = getCities().slice(0, 150); // Pre-generate top 150 cities statically, remainder on-demand
  return cities.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const city = getCityBySlug(resolved.slug);
  if (!city) return {};

  const timeInfo = getPlaceTimeInfo(city.timezone, city.lat, city.lng);
  const title = `Current Local Time in ${city.name}, ${city.countryName} | Time Zone & Clock`;
  const description = `Live time in ${city.name} (${timeInfo.formattedTime}, ${timeInfo.timeZoneAbbr}): daylight saving info, UTC offset ${timeInfo.utcOffsetString}, coordinates, and time difference calculator.`;
  const pageUrl = `${siteConfig.siteUrl}/city/${city.slug}`;

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

export default async function CityPage({ params }: PageProps) {
  const resolved = await params;
  const city = getCityBySlug(resolved.slug);
  if (!city) notFound();

  const timeInfo = getPlaceTimeInfo(city.timezone, city.lat, city.lng);
  const allPopular = getPopularPairs();
  const cityPairs = allPopular.filter(
    (p) => p.from === city.slug || p.to === city.slug
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/country/${city.countrySlug}`}
          className="hover:text-emerald-600 transition-colors"
        >
          {city.countryName}
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
          {city.name}
        </span>
      </nav>

      {/* Hero Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>City Local Clock & Time Zone</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Current Local Time in {city.name}, {city.countryName}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          {city.name} observes the{" "}
          <span className="font-mono font-semibold">{city.timezone}</span> time zone (
          {timeInfo.utcOffsetString}). Track real-time digital clocks, current day/night
          illumination, and calculate exact time differences with other global hubs.
        </p>
      </div>

      {/* Live Clock Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <LiveClock
            placeName={city.name}
            countryName={city.countryName}
            timezone={city.timezone}
            lat={city.lat}
            lng={city.lng}
            badgeColor="indigo"
          />
        </div>

        {/* City Quick Info Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between text-xs space-y-3">
          <h2 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
            City Details
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Country:</span>
              <Link
                href={`/country/${city.countrySlug}`}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {city.countryName} ({city.countryIso})
              </Link>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Time Zone:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white truncate max-w-[140px]">
                {city.timezone}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Coordinates:</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-300">
                {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
              </span>
            </div>
            {city.population && (
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Population:</span>
                <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                  ~{city.population.toLocaleString("en-US")}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Daylight Saving:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {timeInfo.isDST ? "Active (Summer Time)" : "Standard Time"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Centered on City */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
          {city.name} on Live World Map
        </h2>
        <WorldMapContainer placeA={city} placeB={null} className="h-[460px] w-full" />
      </div>

      <AdSlot type="in-content" />

      {/* Popular Time Differences for this City */}
      <section>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Popular Corridors for {city.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {cityPairs.length > 0 ? (
            cityPairs.map((p) => {
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
              Compare {city.name} with any world destination using the{" "}
              <Link href="/" className="text-emerald-600 underline">
                homepage world time calculator
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
