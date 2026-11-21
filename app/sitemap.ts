import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getCountries, getCities, getPopularPairs } from "@/lib/places";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.siteUrl;
  const now = new Date();

  // 1. Static Core Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // 2. Popular Pair Time Difference Pages
  const popularPairs = getPopularPairs();
  const timeDifferencePages: MetadataRoute.Sitemap = popularPairs.map((pair) => ({
    url: `${baseUrl}/time-difference/${pair.from}-to-${pair.to}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // 3. Best Time to Call Pages
  const bestTimeToCallPages: MetadataRoute.Sitemap = popularPairs.map((pair) => ({
    url: `${baseUrl}/best-time-to-call/${pair.to}-from-${pair.from}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // 4. Country Pages
  const countries = getCountries();
  const countryPages: MetadataRoute.Sitemap = countries.map((country) => ({
    url: `${baseUrl}/country/${country.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 5. Major City Pages (Top 100 cities)
  const cities = getCities().slice(0, 100);
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${baseUrl}/city/${city.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...timeDifferencePages,
    ...bestTimeToCallPages,
    ...countryPages,
    ...cityPages,
  ];
}
