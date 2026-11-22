import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { siteConfig } from "@/lib/config";
import CookieConsent from "@/components/CookieConsent";
import HeaderLocationButton from "@/components/HeaderLocationButton";

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
      <body className="min-h-screen flex flex-col bg-white dark:bg-[#141414] text-[#222222] dark:text-[#f5f5f5] antialiased selection:bg-[#E85D4E] selection:text-white">
        {/* Slim Top Bar */}
        <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#141414]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#262626]">
          <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo Text Left */}
            <Link
              href="/"
              className="flex items-center gap-2 group focus:outline-none"
            >
              <span className="w-3 h-3 rounded-full bg-[#E85D4E] shrink-0" />
              <span className="font-semibold text-base sm:text-lg tracking-tight text-[#222222] dark:text-white">
                {siteConfig.name}
              </span>
            </Link>

            {/* 3 Links + Location Button */}
            <nav className="flex items-center gap-1 sm:gap-4 text-xs sm:text-sm font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">
              <HeaderLocationButton />
              <Link
                href="/time-difference/new-york-to-london"
                className="px-2.5 py-1.5 rounded-lg hover:text-[#222222] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Time difference
              </Link>
              <Link
                href="/best-time-to-call/london-from-new-york"
                className="hidden sm:inline-block px-2.5 py-1.5 rounded-lg hover:text-[#222222] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Best time to call
              </Link>
              <Link
                href="/about"
                className="px-2.5 py-1.5 rounded-lg hover:text-[#222222] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                About
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>

        {/* Short Footer (3 columns, small grey text) */}
        <footer className="w-full border-t border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#141414] py-8 text-xs text-[#6B6B6B] dark:text-[#888888]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="font-semibold text-[#222222] dark:text-white mb-2">
                  {siteConfig.name}
                </p>
                <p className="leading-relaxed text-[11px] max-w-xs">
                  World time difference tool with interactive solar terminator map,
                  live weather and minute-accurate calling hours.
                </p>
              </div>

              <div>
                <p className="font-semibold text-[#222222] dark:text-white mb-2">
                  Popular corridors
                </p>
                <ul className="space-y-1 text-[11px]">
                  <li>
                    <Link href="/time-difference/new-york-to-london" className="hover:text-[#222] dark:hover:text-white hover:underline">
                      New York to London time
                    </Link>
                  </li>
                  <li>
                    <Link href="/time-difference/london-to-tokyo" className="hover:text-[#222] dark:hover:text-white hover:underline">
                      London to Tokyo time
                    </Link>
                  </li>
                  <li>
                    <Link href="/time-difference/united-states-to-united-kingdom" className="hover:text-[#222] dark:hover:text-white hover:underline">
                      USA to UK time
                    </Link>
                  </li>
                  <li>
                    <Link href="/time-difference/sydney-to-los-angeles" className="hover:text-[#222] dark:hover:text-white hover:underline">
                      Sydney to Los Angeles time
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-[#222222] dark:text-white mb-2">
                  Information
                </p>
                <ul className="space-y-1 text-[11px]">
                  <li>
                    <Link href="/about" className="hover:text-[#222] dark:hover:text-white hover:underline">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-[#222] dark:hover:text-white hover:underline">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="hover:text-[#222] dark:hover:text-white hover:underline">
                      Privacy policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-[#222] dark:hover:text-white hover:underline">
                      Terms of service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
              <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
              <p>
                Suggest a missing city or feedback:{" "}
                <a
                  href="mailto:mickeygorveth@gmail.com?subject=Add%20City%20Suggestion%20or%20Feedback"
                  className="text-[#E85D4E] hover:underline font-semibold"
                >
                  mickeygorveth@gmail.com
                </a>
              </p>
              <p>Data: IANA · Open-Meteo · Nager.Date · OpenStreetMap</p>
            </div>
          </div>
        </footer>

        <CookieConsent />
      </body>
    </html>
  );
}
