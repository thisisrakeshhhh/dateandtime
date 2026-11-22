"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import HeaderLocationButton from "@/components/HeaderLocationButton";
import { Menu, X, Clock, PhoneCall, Info, Mail } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#141414]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#262626]">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group focus:outline-none shrink-0"
        >
          <span className="w-3 h-3 rounded-full bg-[#E85D4E] shrink-0" />
          <span className="font-semibold text-base sm:text-lg tracking-tight text-[#222222] dark:text-white">
            {siteConfig.name}
          </span>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Location Button (Always visible on mobile & desktop) */}
          <HeaderLocationButton />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3 text-xs sm:text-sm font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">
            <Link
              href="/time-difference/new-york-to-london"
              className="px-2.5 py-1.5 rounded-lg hover:text-[#222222] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Time difference
            </Link>
            <Link
              href="/best-time-to-call/london-from-new-york"
              className="px-2.5 py-1.5 rounded-lg hover:text-[#222222] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#141414] px-4 py-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/time-difference/new-york-to-london"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              <Clock className="w-4 h-4 text-[#E85D4E]" />
              <span>Time difference calculator</span>
            </Link>
            <Link
              href="/best-time-to-call/london-from-new-york"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              <PhoneCall className="w-4 h-4 text-[#E85D4E]" />
              <span>Best time to call planner</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              <Info className="w-4 h-4 text-[#E85D4E]" />
              <span>About TimeBridge</span>
            </Link>
            <a
              href="mailto:mickeygorveth@gmail.com?subject=Add%20City%20or%20Feedback"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              <Mail className="w-4 h-4 text-[#E85D4E]" />
              <span>Suggest city / Feedback</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
