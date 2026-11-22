"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import HeaderLocationButton from "@/components/HeaderLocationButton";
import { Menu, X, Clock, PhoneCall, Info, Mail, Briefcase } from "lucide-react";

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
    <header ref={navRef} className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors">
      <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#E85D4E] shadow-[0_0_10px_rgba(232,93,78,0.7)] group-hover:scale-125 transition-transform duration-300 shrink-0" />
          <span className="font-semibold text-base sm:text-lg tracking-tight text-[#1c1c1c] dark:text-white group-hover:text-[#E85D4E] transition-colors">
            {siteConfig.name}
          </span>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Location Button (Always visible on mobile & desktop) */}
          <HeaderLocationButton />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300">
            <Link
              href="/converter"
              className="px-3 py-1.5 rounded-full hover:text-[#1c1c1c] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all"
            >
              Converter
            </Link>
            <Link
              href="/shift-converter"
              className="px-3 py-1.5 rounded-full hover:text-[#1c1c1c] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all"
            >
              Shift converter
            </Link>
            <Link
              href="/time-difference/new-york-to-london"
              className="px-3 py-1.5 rounded-full hover:text-[#1c1c1c] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all"
            >
              Time difference
            </Link>
            <Link
              href="/best-time-to-call/london-from-new-york"
              className="px-3 py-1.5 rounded-full hover:text-[#1c1c1c] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all"
            >
              Best time to call
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-full hover:text-[#1c1c1c] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all"
            >
              About
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:scale-95 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-[#141414]/95 backdrop-blur-2xl px-4 py-3.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/converter"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Clock className="w-4 h-4 text-[#E85D4E]" />
              <span>Converter</span>
            </Link>
            <Link
              href="/shift-converter"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-[#E85D4E]" />
              <span>Shift converter</span>
            </Link>
            <Link
              href="/time-difference/new-york-to-london"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Clock className="w-4 h-4 text-[#E85D4E]" />
              <span>Time difference calculator</span>
            </Link>
            <Link
              href="/best-time-to-call/london-from-new-york"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-[#E85D4E]" />
              <span>Best time to call planner</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Info className="w-4 h-4 text-[#E85D4E]" />
              <span>About TimeBridge</span>
            </Link>
            <a
              href="mailto:mickeygorveth@gmail.com?subject=Add%20City%20or%20Feedback"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 transition-colors"
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
