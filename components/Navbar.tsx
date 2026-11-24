"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { Place, searchPlaces, getPlaceByTimezone, getAllPlaces } from "@/lib/places";
import { calculateDistance } from "@/lib/distance";
import FlagIcon from "@/components/FlagIcon";
import {
  Search,
  X,
  MapPin,
  Navigation,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  Clock,
  Briefcase,
  Calendar,
  Compass,
  Globe,
  Info,
  PhoneCall,
} from "lucide-react";

function getPlaceTime(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: tz,
    }).format(new Date());
  } catch {
    return "";
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Scroll state for soft shadow
  const [isScrolled, setIsScrolled] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Location Chip state
  const [mounted, setMounted] = useState(false);
  const [userPlace, setUserPlace] = useState<Place | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>("UTC");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Tools dropdown & mobile sheet state
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Track scroll for soft shadow
  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Theme initialization and toggle
  useEffect(() => {
    const savedTheme = localStorage.getItem("timebridge-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("timebridge-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("timebridge-theme", "light");
    }
  }

  // Location initialization & ticker
  useEffect(() => {
    setMounted(true);

    function updateTime(tz: string) {
      try {
        const formatted = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZoneName: "short",
          timeZone: tz,
        }).format(new Date());
        setCurrentTimeStr(formatted);
      } catch {
        setCurrentTimeStr("");
      }
    }

    function initLocation() {
      try {
        const saved = localStorage.getItem("timebridge_user_place");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name) {
            setUserPlace(parsed);
            setUserTimezone(parsed.timezone || "UTC");
            updateTime(parsed.timezone || "UTC");
            return;
          }
        }
      } catch {}

      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detected) {
          setUserTimezone(detected);
          const matched = getPlaceByTimezone(detected);
          if (matched) {
            setUserPlace(matched);
          }
          updateTime(detected);
        }
      } catch {
        setUserTimezone("UTC");
        updateTime("UTC");
      }
    }

    initLocation();
    window.addEventListener("timebridge-location-updated", initLocation);

    const timer = setInterval(() => {
      const tz = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      updateTime(tz);
    }, 15000);

    return () => {
      window.removeEventListener("timebridge-location-updated", initLocation);
      clearInterval(timer);
    };
  }, [userTimezone]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (locationMenuRef.current && !locationMenuRef.current.contains(target)) {
        setLocationMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(target)) {
        setToolsMenuOpen(false);
      }
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(target)
      ) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile sheet on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsMenuOpen(false);
    setLocationMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Autocomplete search execution
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const matches = searchPlaces(searchQuery, 8);
      setSearchResults(matches);
      setHighlightIndex(0);
      setSearchOpen(true);
    } else {
      setSearchResults([]);
      setSearchOpen(false);
    }
  }, [searchQuery]);

  function handleSelectResult(place: Place) {
    setSearchQuery("");
    setSearchOpen(false);
    if (pathname === "/") {
      window.dispatchEvent(new CustomEvent("timebridge-select-place", { detail: place }));
    } else {
      router.push(`/?select=${place.slug}`);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (!searchOpen || searchResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[highlightIndex]) {
        handleSelectResult(searchResults[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  }

  function handleUseDeviceLocation() {
    setLocationMenuOpen(false);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const all = getAllPlaces();
          let closest: Place | null = null;
          let minKm = Infinity;

          for (const p of all) {
            const d = calculateDistance(latitude, longitude, p.lat, p.lng);
            if (d.km < minKm) {
              minKm = d.km;
              closest = p;
            }
          }

          if (closest) {
            setUserPlace(closest);
            setUserTimezone(closest.timezone);
            try {
              localStorage.setItem("timebridge_user_place", JSON.stringify(closest));
              window.dispatchEvent(new CustomEvent("timebridge-location-updated"));
              if (pathname === "/") {
                window.dispatchEvent(new CustomEvent("timebridge-select-place", { detail: closest }));
              }
            } catch {}
          }
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }

  function handleChangeLocation() {
    setLocationMenuOpen(false);
    window.dispatchEvent(new CustomEvent("open-location-modal"));
  }

  return (
    <>
      {/* Sticky Header with dynamic soft shadow on scroll */}
      <header
        className={`sticky top-0 z-40 w-full bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] transition-shadow duration-200 ${
          isScrolled
            ? "shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)]"
            : "shadow-none"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6">
          {/* Main Bar: Desktop 1-row, Mobile Row 1 */}
          <div className="h-14 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand Logo + Location Chip */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Brand Logo with small red dot */}
              <Link
                href="/"
                className="flex items-center gap-2.5 min-h-[44px] py-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4E] rounded-lg shrink-0"
                aria-label="TimeBridge homepage"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#E85D4E] shadow-[0_0_8px_rgba(232,93,78,0.7)] group-hover:scale-125 transition-transform duration-300 shrink-0" />
                <span className="font-semibold text-base sm:text-lg tracking-tight text-[#1c1c1c] dark:text-white group-hover:text-[#E85D4E] transition-colors">
                  {siteConfig.name}
                </span>
              </Link>

              {/* Location Chip */}
              <div className="relative" ref={locationMenuRef}>
                <button
                  type="button"
                  onClick={() => setLocationMenuOpen((v) => !v)}
                  aria-expanded={locationMenuOpen}
                  aria-haspopup="true"
                  className="group flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-full text-xs sm:text-sm font-medium bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200/90 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:border-[#E85D4E]/40 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-all cursor-pointer shrink-0 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4E]"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#E85D4E] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate max-w-[125px] sm:max-w-[200px]">
                    {userPlace
                      ? `${userPlace.name} - ${currentTimeStr}`
                      : mounted && currentTimeStr
                      ? `Your location - ${currentTimeStr}`
                      : "Add location"}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-transform duration-200 ${
                      locationMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Location Dropdown Menu */}
                {locationMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Location options"
                    className="absolute left-0 mt-2 w-56 rounded-2xl bg-white/98 dark:bg-[#1a1a1a]/98 backdrop-blur-xl border border-neutral-200 dark:border-white/10 p-1.5 shadow-2xl z-[1060] animate-in fade-in-50 zoom-in-95 duration-150"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleChangeLocation}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors cursor-pointer text-left"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#E85D4E] shrink-0" />
                      <span>Change location</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleUseDeviceLocation}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors cursor-pointer text-left"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#E85D4E] shrink-0" />
                      <span>Use my device location</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Center: Rounded Search Bar (Takes available space in the same row) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-4 relative" ref={desktopSearchRef}>
              <div className="relative w-full">
                <label htmlFor="desktop-nav-search" className="sr-only">
                  Search a city or country
                </label>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="desktop-nav-search"
                    type="text"
                    role="combobox"
                    aria-label="Search a city or country"
                    aria-autocomplete="list"
                    aria-expanded={searchOpen && searchResults.length > 0}
                    aria-controls="desktop-search-results"
                    aria-activedescendant={
                      searchResults[highlightIndex]
                        ? `desktop-opt-${searchResults[highlightIndex].slug}`
                        : undefined
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim().length > 0) setSearchOpen(true);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search a city or country"
                    className="w-full pl-10 pr-9 py-2 rounded-full bg-neutral-100/90 dark:bg-[#1e1e1e]/90 border border-neutral-200/90 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4E]/30 focus:border-[#E85D4E] transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                      aria-label="Clear search input"
                      className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Results Dropdown */}
                {searchOpen && searchResults.length > 0 && (
                  <div
                    id="desktop-search-results"
                    role="listbox"
                    aria-label="Search suggestions"
                    className="absolute left-0 right-0 top-full mt-2 z-[1050] max-h-80 overflow-y-auto rounded-2xl bg-white/98 dark:bg-[#1a1a1a]/98 backdrop-blur-xl border border-neutral-200 dark:border-white/10 p-1.5 shadow-2xl"
                  >
                    {searchResults.map((place, index) => {
                      const timeStr = getPlaceTime(place.timezone);
                      const isHighlighted = index === highlightIndex;
                      return (
                        <div
                          key={place.slug}
                          id={`desktop-opt-${place.slug}`}
                          role="option"
                          aria-selected={isHighlighted}
                          onClick={() => handleSelectResult(place)}
                          onMouseEnter={() => setHighlightIndex(index)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs sm:text-sm transition-colors ${
                            isHighlighted
                              ? "bg-[#E85D4E]/10 text-neutral-900 dark:text-white font-medium"
                              : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FlagIcon countryCode={place.countryIso} size="sm" />
                            <div className="truncate">
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                {place.name}
                              </span>
                              <span className="text-neutral-400 text-xs ml-1.5">
                                {place.countryName}
                              </span>
                            </div>
                          </div>
                          {timeStr && (
                            <span className="ml-3 font-mono font-semibold text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                              {timeStr}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Tools dropdown, Theme switch & Mobile menu button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Desktop Tools Dropdown */}
              <div className="relative hidden md:block" ref={toolsMenuRef}>
                <button
                  type="button"
                  onClick={() => setToolsMenuOpen((v) => !v)}
                  aria-expanded={toolsMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4E]"
                >
                  <span>Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                      toolsMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Tools Dropdown Menu */}
                {toolsMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Tools menu"
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/98 dark:bg-[#1a1a1a]/98 backdrop-blur-xl border border-neutral-200 dark:border-white/10 p-2 shadow-2xl z-[1060] animate-in fade-in-50 zoom-in-95 duration-150"
                  >
                    <nav className="flex flex-col gap-1 text-xs sm:text-sm">
                      <Link
                        href="/converter"
                        role="menuitem"
                        onClick={() => setToolsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors"
                      >
                        <Clock className="w-4 h-4 text-[#E85D4E] shrink-0" />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">Converter</div>
                          <div className="text-[11px] text-neutral-400">Time zone conversions</div>
                        </div>
                      </Link>
                      <Link
                        href="/shift-converter"
                        role="menuitem"
                        onClick={() => setToolsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-[#E85D4E] shrink-0" />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">
                            Shift converter
                          </div>
                          <div className="text-[11px] text-neutral-400">Work & shift handovers</div>
                        </div>
                      </Link>
                      <Link
                        href="/event"
                        role="menuitem"
                        onClick={() => setToolsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-[#E85D4E] shrink-0" />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">Share event</div>
                          <div className="text-[11px] text-neutral-400">Multi-timezone event links</div>
                        </div>
                      </Link>
                      <Link
                        href="/jet-lag-calculator"
                        role="menuitem"
                        onClick={() => setToolsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors"
                      >
                        <Compass className="w-4 h-4 text-[#E85D4E] shrink-0" />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">Jet lag</div>
                          <div className="text-[11px] text-neutral-400">Recovery & sleep schedule</div>
                        </div>
                      </Link>
                      <Link
                        href="/all-corridors"
                        role="menuitem"
                        onClick={() => setToolsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors"
                      >
                        <Globe className="w-4 h-4 text-[#E85D4E] shrink-0" />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">All corridors</div>
                          <div className="text-[11px] text-neutral-400">Global route directories</div>
                        </div>
                      </Link>
                      <Link
                        href="/all-corridors"
                        role="menuitem"
                        onClick={() => setToolsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors"
                      >
                        <Clock className="w-4 h-4 text-[#E85D4E] shrink-0" />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">Time difference</div>
                          <div className="text-[11px] text-neutral-400">Time offsets & corridors</div>
                        </div>
                      </Link>
                      <Link
                        href="/all-corridors"
                        role="menuitem"
                        onClick={() => setToolsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors"
                      >
                        <PhoneCall className="w-4 h-4 text-[#E85D4E] shrink-0" />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">Best time to call</div>
                          <div className="text-[11px] text-neutral-400">Mutual awake & calling windows</div>
                        </div>
                      </Link>
                      <Link
                        href="/about"
                        role="menuitem"
                        onClick={() => setToolsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#E85D4E] transition-colors"
                      >
                        <Info className="w-4 h-4 text-[#E85D4E] shrink-0" />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">About</div>
                          <div className="text-[11px] text-neutral-400">Data sources & mission</div>
                        </div>
                      </Link>
                    </nav>
                  </div>
                )}
              </div>

              {/* Theme Switch Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4E]"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-neutral-700" />
                )}
              </button>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation tools menu"
                className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Row 2: Search Bar under row 1, full width, 44px touch height */}
          <div className="md:hidden pb-3 pt-0.5 relative" ref={mobileSearchRef}>
            <label htmlFor="mobile-nav-search" className="sr-only">
              Search a city or country
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                id="mobile-nav-search"
                type="text"
                role="combobox"
                aria-label="Search a city or country"
                aria-autocomplete="list"
                aria-expanded={searchOpen && searchResults.length > 0}
                aria-controls="mobile-search-results"
                aria-activedescendant={
                  searchResults[highlightIndex]
                    ? `mobile-opt-${searchResults[highlightIndex].slug}`
                    : undefined
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setSearchOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search a city or country"
                className="w-full h-11 pl-10 pr-9 rounded-full bg-neutral-100/90 dark:bg-[#1e1e1e]/90 border border-neutral-200/90 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4E]/30 focus:border-[#E85D4E] transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  aria-label="Clear search input"
                  className="absolute right-3 p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Autocomplete Results Dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div
                id="mobile-search-results"
                role="listbox"
                aria-label="Search suggestions"
                className="absolute left-0 right-0 top-full mt-1.5 z-[1050] max-h-72 overflow-y-auto rounded-2xl bg-white/98 dark:bg-[#1a1a1a]/98 backdrop-blur-xl border border-neutral-200 dark:border-white/10 p-1.5 shadow-2xl"
              >
                {searchResults.map((place, index) => {
                  const timeStr = getPlaceTime(place.timezone);
                  const isHighlighted = index === highlightIndex;
                  return (
                    <div
                      key={place.slug}
                      id={`mobile-opt-${place.slug}`}
                      role="option"
                      aria-selected={isHighlighted}
                      onClick={() => handleSelectResult(place)}
                      onMouseEnter={() => setHighlightIndex(index)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                        isHighlighted
                          ? "bg-[#E85D4E]/10 text-neutral-900 dark:text-white font-medium"
                          : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FlagIcon countryCode={place.countryIso} size="sm" />
                        <div className="truncate">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {place.name}
                          </span>
                          <span className="text-neutral-400 text-xs ml-1.5">{place.countryName}</span>
                        </div>
                      </div>
                      {timeStr && (
                        <span className="ml-3 font-mono font-semibold text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                          {timeStr}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Tools Menu as a Bottom Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[1050] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Card */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation tools menu"
            className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-[#161616] border-t border-neutral-200 dark:border-white/10 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 text-neutral-800 dark:text-neutral-100"
          >
            {/* Grab handle */}
            <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/10 mb-2">
              <span className="font-bold text-base text-neutral-900 dark:text-white">
                Tools &amp; Navigation
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close tools menu"
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 text-sm font-medium pt-1">
              <Link
                href="/converter"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                <Clock className="w-5 h-5 text-[#E85D4E] shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Converter</div>
                  <div className="text-xs text-neutral-400">Interactive time zone converter</div>
                </div>
              </Link>

              <Link
                href="/shift-converter"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                <Briefcase className="w-5 h-5 text-[#E85D4E] shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    Shift converter
                  </div>
                  <div className="text-xs text-neutral-400">Work shifts &amp; handover planner</div>
                </div>
              </Link>

              <Link
                href="/event"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                <Calendar className="w-5 h-5 text-[#E85D4E] shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Share event</div>
                  <div className="text-xs text-neutral-400">Multi-timezone event share page</div>
                </div>
              </Link>

              <Link
                href="/jet-lag-calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                <Compass className="w-5 h-5 text-[#E85D4E] shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Jet lag</div>
                  <div className="text-xs text-neutral-400">Flight sleep &amp; circadian schedule</div>
                </div>
              </Link>

              <Link
                href="/all-corridors"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                <Globe className="w-5 h-5 text-[#E85D4E] shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    All corridors
                  </div>
                  <div className="text-xs text-neutral-400">298 global route directories</div>
                </div>
              </Link>

              <Link
                href="/all-corridors"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                <Clock className="w-5 h-5 text-[#E85D4E] shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    Time difference
                  </div>
                  <div className="text-xs text-neutral-400">Compare time difference across cities</div>
                </div>
              </Link>

              <Link
                href="/all-corridors"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                <PhoneCall className="w-5 h-5 text-[#E85D4E] shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    Best time to call
                  </div>
                  <div className="text-xs text-neutral-400">Mutual awake &amp; calling windows</div>
                </div>
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                <Info className="w-5 h-5 text-[#E85D4E] shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    About TimeBridge
                  </div>
                  <div className="text-xs text-neutral-400">Mission, data sources, and precision</div>
                </div>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
