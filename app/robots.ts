import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getActiveWave } from "@/app/sitemap";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.siteUrl;
  const wave = getActiveWave();

  const sitemaps = [
    `${baseUrl}/sitemap/core.xml`,
    `${baseUrl}/sitemap/corridors.xml`,
    `${baseUrl}/sitemap/converters.xml`,
    `${baseUrl}/sitemap/shifts.xml`,
    `${baseUrl}/sitemap/sports.xml`,
  ];

  if (wave >= 2) {
    sitemaps.push(`${baseUrl}/sitemap/cities.xml`);
  }
  if (wave >= 3) {
    sitemaps.push(`${baseUrl}/sitemap/countries.xml`);
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: sitemaps,
  };
}
