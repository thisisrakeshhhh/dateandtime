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
import FlagIcon from "@/components/FlagIcon";
import { ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const cities = getCities().slice(0, 150);
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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
        <Link href="/" className="hover:text-[#222222] dark:hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/country/${city.countrySlug}`}
          className="hover:text-[#222222] dark:hover:text-white transition-colors"
        >
          {city.countryName}
        </Link>
        <span>/</span>
        <span className="text-[#222222] dark:text-white font-medium">
          {city.name}
        </span>
      </nav>

      {/* Hero Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <FlagIcon countryCode={city.countryIso} size="md" />
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#222222] dark:text-white">
            Current local time in {city.name}, {city.countryName}
          </h1>
        </div>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] max-w-3xl leading-relaxed">
          {city.name} observes the{" "}
          <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">{city.timezone}</span> time zone (
          {timeInfo.utcOffsetString}).
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

        {/* City Stats Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between text-xs space-y-3">
          <h2 className="font-semibold text-xs text-[#222222] dark:text-white uppercase tracking-wider">
            City facts
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Country</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {city.countryName}
              </span>
            </div>
            {city.population && (
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Population</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {city.population.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Coordinates</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-300">
                {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
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

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        <WorldMapContainer
          placeA={city}
          placeB={null}
          userTimezone={city.timezone}
          className="h-[460px] w-full"
        />
      </div>

      <AdSlot slotId="city-bottom" format="horizontal" />

      {/* Popular pairs */}
      <section>
        <h2 className="text-base font-semibold text-[#222222] dark:text-white mb-3">
          Popular comparisons for {city.name}
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
              Check out all comparisons on the{" "}
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
