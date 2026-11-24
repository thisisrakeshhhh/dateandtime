/**
 * TimeBridge Global Configuration
 * All site branding, SEO metadata, AdSense IDs, and default settings are centralized here.
 * Change the site name or domain in this single file.
 */

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  domain: string;
  siteUrl: string;
  contactEmail: string;
  defaultFromSlug: string;
  defaultToSlug: string;
  workHours: {
    start: number; // 9 AM
    end: number;   // 9 PM (21:00)
  };
  officeHours: {
    start: number; // 9 AM
    end: number;   // 5 PM (17:00)
  };
  ads: {
    enabled: boolean;
    client: string;
    slots: {
      headerBanner?: string;
      inContent?: string;
      sidebar?: string;
      footerBanner?: string;
    };
  };
  audienceCountries: string[];
}

export function getSiteUrl(): string {
  // 1. Explicit domain provided via environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const raw = process.env.NEXT_PUBLIC_SITE_URL.trim();
    if (raw && !raw.includes("timebridge.app")) {
      return (raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`).replace(/\/+$/, "");
    }
  }
  // 2. Vercel production project domain (set automatically by Vercel for production deployments)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`.replace(/\/+$/, "");
  }
  // 3. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.trim()}`.replace(/\/+$/, "");
  }
  // 4. Safe fallback for local development and testing
  return "https://localhost:3000";
}

export function getDomain(): string {
  try {
    return new URL(getSiteUrl()).host;
  } catch {
    return "localhost:3000";
  }
}

export const CONTACT_EMAIL = (process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();

export const siteConfig: SiteConfig = {
  name: "TimeBridge",
  shortName: "TimeBridge",
  tagline: "Live World Time Difference, Interactive Day/Night Map & Best Time to Call",
  description:
    "Accurate time difference calculator, live solar terminator world map, daylight saving tracker, distance measurement, and optimal call window finder across world cities and countries.",
  domain: getDomain(),
  siteUrl: getSiteUrl(),
  contactEmail: CONTACT_EMAIL,
  defaultFromSlug: "new-york",
  defaultToSlug: "london",
  workHours: {
    start: 9, // 9:00 AM
    end: 21,  // 9:00 PM (21:00)
  },
  officeHours: {
    start: 9, // 9:00 AM
    end: 17,  // 5:00 PM (17:00)
  },
  ads: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ADS === "true",
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-XXXXXXXXXXXXXXXX",
    slots: {
      headerBanner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER || "1234567890",
      inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT || "2345678901",
      sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || "3456789012",
      footerBanner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || "4567890123",
    },
  },
  audienceCountries: [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "India",
    "New Zealand",
  ],
};
