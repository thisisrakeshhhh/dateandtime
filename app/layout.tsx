import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { siteConfig } from "@/lib/config";
import { Clock } from "lucide-react";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "time difference calculator",
    "world clock map",
    "best time to call",
    "time zone converter",
    "day and night world map",
    "solar terminator live",
    "flight distance calculator",
    "daylight saving time tracker",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.siteUrl }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.siteUrl,
    title: `${siteConfig.name} - World Time Difference & Interactive Map`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white leading-none">
                  {siteConfig.name}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                  World Time & Day/Night Map
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-4 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                World Map
              </Link>
              <Link
                href="/time-difference/india-to-united-kingdom"
                className="hidden sm:inline-block px-3 py-1.5 rounded-lg hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Time Difference
              </Link>
              <Link
                href="/best-time-to-call/united-kingdom-from-india"
                className="hidden md:inline-block px-3 py-1.5 rounded-lg hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Best Time to Call
              </Link>
              <Link
                href="/about"
                className="px-3 py-1.5 rounded-lg hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                About
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>

        {/* Global Footer (AdSense Compliant with real links) */}
        <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-10 mt-16 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">
                    {siteConfig.name}
                  </span>
                </div>
                <p className="max-w-md text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                  {siteConfig.description} Powered by IANA time zone database,
                  astronomical solar calculations, and OpenStreetMap data.
                </p>
              </div>

              <div>
                <p className="font-semibold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                  Quick Corridors
                </p>
                <ul className="space-y-1.5">
                  <li>
                    <Link
                      href="/time-difference/india-to-united-kingdom"
                      className="hover:underline hover:text-emerald-500"
                    >
                      India to UK Time Difference
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/time-difference/india-to-united-states"
                      className="hover:underline hover:text-emerald-500"
                    >
                      India to USA Time Difference
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/time-difference/united-states-to-united-kingdom"
                      className="hover:underline hover:text-emerald-500"
                    >
                      USA to UK Time Difference
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/time-difference/australia-to-india"
                      className="hover:underline hover:text-emerald-500"
                    >
                      Australia to India Time
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                  Legal & Support
                </p>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/about" className="hover:underline hover:text-emerald-500">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:underline hover:text-emerald-500">
                      Contact Support
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="hover:underline hover:text-emerald-500"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:underline hover:text-emerald-500">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
              <p>
                &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
                reserved.
              </p>
              <p className="text-neutral-400">
                Data sources: IANA Time Zone Database · OpenStreetMap · NOAA Solar Position.
              </p>
            </div>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
