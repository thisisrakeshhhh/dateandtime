"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Place } from "@/lib/places";
import { computeSolarTerminator } from "@/lib/solar";
import { isCoordinateDaytime, getPlaceTimeInfo } from "@/lib/time";
import { calculateDistance } from "@/lib/distance";
import citiesData from "@/data/cities.json";

interface WorldMapProps {
  placeA: Place | null;
  placeB: Place | null;
  onSelectPlace?: (place: Place, target: "A" | "B") => void;
  className?: string;
}

// Generate intermediate points along great-circle arc for smooth curved flight path
function getGreatCircleArc(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  pointsCount = 60
): [number, number][] {
  const d2r = Math.PI / 180;
  const r2d = 180 / Math.PI;

  const φ1 = lat1 * d2r;
  const λ1 = lon1 * d2r;
  const φ2 = lat2 * d2r;
  const λ2 = lon2 * d2r;

  // Angular distance in radians
  const dλ = λ2 - λ1;
  const cosσ =
    Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(dλ);
  const σ = Math.acos(Math.max(-1, Math.min(1, cosσ)));

  if (σ < 0.001) {
    return [[lat1, lon1], [lat2, lon2]];
  }

  const arcPoints: [number, number][] = [];
  const sinσ = Math.sin(σ);

  for (let i = 0; i <= pointsCount; i++) {
    const f = i / pointsCount;
    const A = Math.sin((1 - f) * σ) / sinσ;
    const B = Math.sin(f * σ) / sinσ;

    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);

    arcPoints.push([φ * r2d, λ * r2d]);
  }

  return arcPoints;
}

export default function WorldMap({
  placeA,
  placeB,
  onSelectPlace,
  className = "h-[480px] w-full",
}: WorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const terminatorLayerRef = useRef<L.Polygon | null>(null);
  const nightLightsGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const flightPathLayerRef = useRef<L.Polyline | null>(null);
  const distanceBadgeRef = useRef<L.Marker | null>(null);

  // Active target place to replace on map click: "A" | "B"
  const [clickTarget, setClickTarget] = useState<"A" | "B">("B");

  // Filter top prominent cities for night light visualization (top populated)
  const prominentCities = useMemo(() => {
    return citiesData
      .filter((c) => c.population && c.population > 500000)
      .slice(0, 180);
  }, []);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix default marker icon assets for Leaflet
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: false,
      worldCopyJump: true,
      attributionControl: true,
    });

    // Pure OpenStreetMap standard tiles (100% free, no API key required)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls in top right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Layer groups for dynamic elements
    const nightGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    nightLightsGroupRef.current = nightGroup;
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render and Update Day/Night Terminator + Night City Lights (every 60 seconds)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    function updateDayNight() {
      if (!map) return;
      const termData = computeSolarTerminator(new Date());

      // Update or create Terminator polygon (deep indigo night shadow)
      if (terminatorLayerRef.current) {
        terminatorLayerRef.current.setLatLngs(termData.nightPolygonLatLngs);
      } else {
        const nightPolygon = L.polygon(termData.nightPolygonLatLngs, {
          color: "#0f172a",
          fillColor: "#020617",
          fillOpacity: 0.52,
          weight: 1,
          stroke: true,
          dashArray: "4, 6",
          className: "leaflet-terminator-shadow pointer-events-none",
        }).addTo(map);
        terminatorLayerRef.current = nightPolygon;
      }

      // Update night city glowing lights inside the night shadow
      if (nightLightsGroupRef.current) {
        nightLightsGroupRef.current.clearLayers();

        prominentCities.forEach((city) => {
          const isDay = isCoordinateDaytime(city.lat, city.lng);
          if (!isDay) {
            // City is at night: render warm glowing light
            const lightMarker = L.circleMarker([city.lat, city.lng], {
              radius: city.population > 3000000 ? 3.5 : 2.5,
              fillColor: "#fde047", // Warm golden city light
              fillOpacity: 0.85,
              color: "#fbbf24",
              weight: 1,
              opacity: 0.6,
              className: "night-city-dot cursor-pointer",
            });

            lightMarker.bindTooltip(
              `<div class="text-xs font-sans">
                <strong>${city.name}</strong> (${city.country})<br/>
                <span class="text-amber-500 font-medium">🌙 Night</span>
              </div>`,
              { direction: "top", offset: [0, -3] }
            );

            lightMarker.on("click", () => {
              if (onSelectPlace) {
                const placeObj: Place = {
                  id: `city-${city.slug}`,
                  name: city.name,
                  slug: city.slug,
                  type: "city",
                  countryName: city.country,
                  countrySlug: city.countrySlug,
                  countryIso: city.countryIso,
                  lat: city.lat,
                  lng: city.lng,
                  timezone: city.timezone,
                  population: city.population,
                };
                onSelectPlace(placeObj, clickTarget);
                // Toggle target for next click
                setClickTarget((t) => (t === "A" ? "B" : "A"));
              }
            });

            nightLightsGroupRef.current?.addLayer(lightMarker);
          }
        });
      }
    }

    updateDayNight();
    const interval = setInterval(updateDayNight, 60000); // Live update every minute

    return () => clearInterval(interval);
  }, [prominentCities, onSelectPlace, clickTarget]);

  // 3. Render Place A, Place B Markers, Geodesic Line and Auto-fit Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (flightPathLayerRef.current) {
      map.removeLayer(flightPathLayerRef.current);
      flightPathLayerRef.current = null;
    }
    if (distanceBadgeRef.current) {
      map.removeLayer(distanceBadgeRef.current);
      distanceBadgeRef.current = null;
    }

    const boundsLatLngs: L.LatLngExpression[] = [];

    // Custom pulsing pin for Place A (Emerald/Green)
    if (placeA) {
      const timeInfoA = getPlaceTimeInfo(placeA.timezone, placeA.lat, placeA.lng);
      const iconA = L.divIcon({
        className: "custom-map-marker marker-place-a",
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></span>
            <span class="absolute w-6 h-6 rounded-full bg-emerald-500/40"></span>
            <div class="relative w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white dark:border-neutral-900">
              A
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const markerA = L.marker([placeA.lat, placeA.lng], { icon: iconA });
      markerA.bindPopup(`
        <div class="p-1 text-neutral-900 dark:text-neutral-100 font-sans">
          <div class="flex items-center gap-1.5 font-bold text-sm">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Place A: ${placeA.name}
          </div>
          <div class="text-xs text-neutral-500 mt-0.5">${placeA.countryName}</div>
          <div class="mt-2 text-xs font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded">
            🕒 ${timeInfoA.formattedTime} · ${timeInfoA.timeZoneAbbr}
          </div>
        </div>
      `);
      markersGroup.addLayer(markerA);
      boundsLatLngs.push([placeA.lat, placeA.lng]);
    }

    // Custom pulsing pin for Place B (Indigo/Blue)
    if (placeB) {
      const timeInfoB = getPlaceTimeInfo(placeB.timezone, placeB.lat, placeB.lng);
      const iconB = L.divIcon({
        className: "custom-map-marker marker-place-b",
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-indigo-500/30 animate-ping"></span>
            <span class="absolute w-6 h-6 rounded-full bg-indigo-500/40"></span>
            <div class="relative w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white dark:border-neutral-900">
              B
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const markerB = L.marker([placeB.lat, placeB.lng], { icon: iconB });
      markerB.bindPopup(`
        <div class="p-1 text-neutral-900 dark:text-neutral-100 font-sans">
          <div class="flex items-center gap-1.5 font-bold text-sm">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Place B: ${placeB.name}
          </div>
          <div class="text-xs text-neutral-500 mt-0.5">${placeB.countryName}</div>
          <div class="mt-2 text-xs font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded">
            🕒 ${timeInfoB.formattedTime} · ${timeInfoB.timeZoneAbbr}
          </div>
        </div>
      `);
      markersGroup.addLayer(markerB);
      boundsLatLngs.push([placeB.lat, placeB.lng]);
    }

    // Connect Place A and Place B with Geodesic Flight Line
    if (placeA && placeB) {
      const arcPoints = getGreatCircleArc(
        placeA.lat,
        placeA.lng,
        placeB.lat,
        placeB.lng,
        50
      );

      const flightPath = L.polyline(arcPoints, {
        color: "#6366f1", // Indigo curve
        weight: 3,
        opacity: 0.85,
        dashArray: "6, 8",
        lineCap: "round",
      }).addTo(map);

      flightPathLayerRef.current = flightPath;

      // Distance Badge in center of arc
      const distInfo = calculateDistance(
        placeA.lat,
        placeA.lng,
        placeB.lat,
        placeB.lng
      );
      const midPoint = arcPoints[Math.floor(arcPoints.length / 2)];

      const badgeIcon = L.divIcon({
        className: "distance-map-badge",
        html: `
          <div class="bg-neutral-900/90 text-white backdrop-blur-sm text-[11px] font-mono px-2 py-0.5 rounded-full shadow-md border border-neutral-700 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2">
            ✈️ ${distInfo.formattedKm} (${distInfo.formattedMiles})
          </div>
        `,
        iconSize: [0, 0],
      });

      const badgeMarker = L.marker(midPoint, {
        icon: badgeIcon,
        interactive: false,
      }).addTo(map);
      distanceBadgeRef.current = badgeMarker;
    }

    // Auto-fit map viewport to encompass both points smoothly
    if (boundsLatLngs.length > 1) {
      const bounds = L.latLngBounds(boundsLatLngs);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 5,
        animate: true,
      });
    } else if (boundsLatLngs.length === 1) {
      map.setView(boundsLatLngs[0], 4, { animate: true });
    }
  }, [placeA, placeB]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-lg bg-neutral-950">
      {/* Map Header Status Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Day & Night Terminator
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="flex items-center gap-1 text-[11px] text-amber-500">
            ✨ Glowing Night Lights
          </span>
        </div>

        {/* Quick Click-to-Select Target Selector */}
        {onSelectPlace && (
          <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center gap-1 text-[11px]">
            <span className="text-neutral-400">Clicking map selects:</span>
            <button
              type="button"
              onClick={() => setClickTarget("A")}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                clickTarget === "A"
                  ? "bg-emerald-600 text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Place A
            </button>
            <button
              type="button"
              onClick={() => setClickTarget("B")}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                clickTarget === "B"
                  ? "bg-indigo-600 text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Place B
            </button>
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className={`${className} z-0 min-h-[360px]`} />
    </div>
  );
}
