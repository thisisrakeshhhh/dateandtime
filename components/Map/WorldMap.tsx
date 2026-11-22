"use client";

import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Place } from "@/lib/places";
import { computeSolarTerminator } from "@/lib/solar";
import { isCoordinateDaytime, getPlaceTimeInfo } from "@/lib/time";
import { getVisibleMapPlaces, MapLabelItem } from "@/lib/mapLabels";
import citiesData from "@/data/cities.json";

interface WorldMapProps {
  placeA: Place | null;
  placeB: Place | null;
  userTimezone: string;
  userPlace?: Place | null;
  onSelectPlace?: (place: Place) => void;
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
  userTimezone,
  userPlace,
  onSelectPlace,
  className = "h-full w-full",
}: WorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState<L.Map | null>(null);

  // Layer groups
  const terminatorLayerRef = useRef<L.Polygon | null>(null);
  const nightLightsGroupRef = useRef<L.LayerGroup | null>(null);
  const labelsGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const flightPathLayerRef = useRef<L.Polyline | null>(null);

  // Top populated cities for night light visualization
  const prominentCities = useMemo(() => {
    return citiesData
      .filter((c) => c.population && c.population > 600000)
      .slice(0, 160);
  }, []);

  // Update visible label pills with Screen-Space Bounding Box Collision Prevention
  const updateLabels = useCallback(() => {
    const map = mapInstanceRef.current;
    const group = labelsGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const b = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };

    const userCoords = userPlace ? { lat: userPlace.lat, lng: userPlace.lng } : undefined;
    const labelItems: MapLabelItem[] = getVisibleMapPlaces(zoom, userTimezone || "UTC", b, userCoords);

    // Screen-space bounding boxes to prevent ANY label overlap
    const occupiedBoxes: Array<{
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    }> = [];

    const mapSize = map.getSize();

    // Check if placeA or placeB are on screen and reserve their bounding boxes
    if (placeA) {
      const ptA = map.latLngToContainerPoint([placeA.lat, placeA.lng]);
      occupiedBoxes.push({
        minX: ptA.x - 80,
        maxX: ptA.x + 80,
        minY: ptA.y - 25,
        maxY: ptA.y + 25,
      });
    }

    if (placeB) {
      const ptB = map.latLngToContainerPoint([placeB.lat, placeB.lng]);
      occupiedBoxes.push({
        minX: ptB.x - 80,
        maxX: ptB.x + 80,
        minY: ptB.y - 25,
        maxY: ptB.y + 25,
      });
    }

    for (const item of labelItems) {
      // Don't show generic label if place is already selected as A or B
      const isSelected =
        (placeA && placeA.slug === item.place.slug) ||
        (placeB && placeB.slug === item.place.slug);

      if (isSelected) continue;

      // Project geo coordinates to screen container pixels
      const pt = map.latLngToContainerPoint([item.place.lat, item.place.lng]);

      // Filter out points outside visible viewport bounds with safe padding
      if (pt.x < 40 || pt.x > mapSize.x - 40 || pt.y < 35 || pt.y > mapSize.y - 35) {
        continue;
      }

      // Calculate label box dimensions with generous calm spacing
      const pillHalfWidth = Math.max(50, item.place.name.length * 4.2 + (item.distanceStr ? 60 : 35));
      const pillHalfHeight = 16;
      const marginX = zoom <= 3 ? 24 : 14; // Greater breathing room at world scale
      const marginY = zoom <= 3 ? 18 : 10;

      const box = {
        minX: pt.x - pillHalfWidth - marginX,
        maxX: pt.x + pillHalfWidth + marginX,
        minY: pt.y - pillHalfHeight - marginY,
        maxY: pt.y + pillHalfHeight + marginY,
      };

      // Check collision against all placed bounding boxes
      const collides = occupiedBoxes.some(
        (b) =>
          box.minX < b.maxX &&
          box.maxX > b.minX &&
          box.minY < b.maxY &&
          box.maxY > b.minY
      );

      if (collides) {
        continue; // Collision detected -> skip cleanly
      }

      occupiedBoxes.push(box);

      const pillHtml = `
        <div class="map-label-pill">
          <span>${item.place.name}</span>
          <span class="pill-time">${item.timeStr}</span>
          <span class="pill-diff">${item.diffStr}</span>
          ${item.distanceStr ? `<span class="pill-dist">${item.distanceStr}</span>` : ""}
          ${item.isDiffDay ? `<span class="pill-day">${item.dayStr}</span>` : ""}
        </div>
      `;

      const labelIcon = L.divIcon({
        className: "custom-label-icon",
        html: pillHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([item.place.lat, item.place.lng], {
        icon: labelIcon,
        zIndexOffset: 100,
      });

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectPlace) {
          onSelectPlace(item.place);
        }
      });

      group.addLayer(marker);
    }
  }, [userTimezone, userPlace, placeA, placeB, onSelectPlace]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: [22, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: false,
      worldCopyJump: true,
      attributionControl: true,
    });

    // Standard OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Dynamic layer groups
    const nightGroup = L.layerGroup().addTo(map);
    const labelsGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    nightLightsGroupRef.current = nightGroup;
    labelsGroupRef.current = labelsGroup;
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Listen to zoom and move events for label updates
    map.on("zoomend moveend", () => {
      updateLabels();
    });

    // Initial label load
    updateLabels();

    setMapReady(map);

    return () => {
      setMapReady(null);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [updateLabels]);

  // 2. Terminator & Night Lights updates every minute
  useEffect(() => {
    const map = mapReady;
    if (!map) return;

    function updateDayNight() {
      if (!map) return;
      const termData = computeSolarTerminator(new Date());

      // Seamless Multi-Polygon covering standard world and wrapped horizontally adjacent copies [-540, 540]
      const base = termData.nightPolygonLatLngs;
      const copyMinus1: [number, number][] = base.map(([lat, lng]) => [lat, lng - 360]);
      const copy0: [number, number][] = base;
      const copyPlus1: [number, number][] = base.map(([lat, lng]) => [lat, lng + 360]);
      const multiRings = [copy0, copyMinus1, copyPlus1];

      if (terminatorLayerRef.current) {
        terminatorLayerRef.current.setLatLngs(multiRings);
      } else {
        const nightPolygon = L.polygon(multiRings, {
          fill: true,
          fillColor: "#0f172a",
          fillOpacity: 0.38,
          stroke: false,
          weight: 0,
          interactive: false,
          className: "leaflet-terminator-shadow pointer-events-none",
        }).addTo(map);
        terminatorLayerRef.current = nightPolygon;
      }

      if (nightLightsGroupRef.current) {
        nightLightsGroupRef.current.clearLayers();

        prominentCities.forEach((city) => {
          const isDay = isCoordinateDaytime(city.lat, city.lng);
          if (!isDay) {
            [-360, 0, 360].forEach((offset) => {
              const lightMarker = L.circleMarker([city.lat, city.lng + offset], {
                radius: city.population > 3000000 ? 3 : 2,
                fillColor: "#fde047",
                fillOpacity: 0.85,
                color: "#fbbf24",
                weight: 1,
                opacity: 0.6,
                className: "night-city-dot cursor-pointer",
              });

              lightMarker.on("click", (e) => {
                L.DomEvent.stopPropagation(e);
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
                  onSelectPlace(placeObj);
                }
              });

              nightLightsGroupRef.current?.addLayer(lightMarker);
            });
          }
        });
      }
    }

    updateDayNight();
    const interval = setInterval(() => {
      updateDayNight();
      updateLabels();
    }, 60000);

    return () => clearInterval(interval);
  }, [mapReady, prominentCities, onSelectPlace, updateLabels]);

  // 3. Render Markers for Place A & Place B, curved Great-Circle line, and fly-to
  useEffect(() => {
    const map = mapReady;
    if (!map || !markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;

    markersGroup.clearLayers();

    if (flightPathLayerRef.current) {
      map.removeLayer(flightPathLayerRef.current);
      flightPathLayerRef.current = null;
    }

    // Update labels whenever placeA or placeB changes
    updateLabels();

    const boundsLatLngs: L.LatLngExpression[] = [];

    // Place A Marker
    if (placeA) {
      const timeInfoA = getPlaceTimeInfo(placeA.timezone, placeA.lat, placeA.lng);
      const iconA = L.divIcon({
        className: "custom-selected-marker",
        html: `
          <div class="relative flex flex-col items-center cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-semibold shadow-md whitespace-nowrap mb-1">
              ${placeA.name} · ${timeInfoA.formattedTime}
            </div>
            <div class="w-7 h-7 rounded-full bg-[#E85D4E] text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
              A
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const markerA = L.marker([placeA.lat, placeA.lng], { icon: iconA, zIndexOffset: 1000 });
      markersGroup.addLayer(markerA);
      boundsLatLngs.push([placeA.lat, placeA.lng]);
    }

    // Place B Marker
    if (placeB) {
      const timeInfoB = getPlaceTimeInfo(placeB.timezone, placeB.lat, placeB.lng);
      const iconB = L.divIcon({
        className: "custom-selected-marker",
        html: `
          <div class="relative flex flex-col items-center cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-semibold shadow-md whitespace-nowrap mb-1">
              ${placeB.name} · ${timeInfoB.formattedTime}
            </div>
            <div class="w-7 h-7 rounded-full bg-[#E85D4E] text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
              B
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const markerB = L.marker([placeB.lat, placeB.lng], { icon: iconB, zIndexOffset: 1000 });
      markersGroup.addLayer(markerB);
      boundsLatLngs.push([placeB.lat, placeB.lng]);
    }

    // Great-Circle Curved Route Line if both places exist
    if (placeA && placeB) {
      const arcPoints = getGreatCircleArc(
        placeA.lat,
        placeA.lng,
        placeB.lat,
        placeB.lng,
        80
      );

      const path = L.polyline(arcPoints, {
        color: "#E85D4E",
        weight: 3,
        opacity: 0.9,
        lineCap: "round",
      }).addTo(map);

      flightPathLayerRef.current = path;

      try {
        map.fitBounds(L.latLngBounds(boundsLatLngs), {
          padding: [60, 60],
          maxZoom: 6,
          animate: true,
        });
      } catch {
        try {
          map.setView([placeA.lat, placeA.lng], 4);
        } catch {
          // Ignore if map pane position not ready
        }
      }
    } else if (placeA && !placeB) {
      // Single place: fly to it smoothly with safety check
      try {
        if (typeof map.flyTo === "function") {
          map.flyTo([placeA.lat, placeA.lng], 4, { animate: true, duration: 1.2 });
        } else {
          map.setView([placeA.lat, placeA.lng], 4);
        }
      } catch {
        try {
          map.setView([placeA.lat, placeA.lng], 4);
        } catch {
          // Ignore if map pane position not ready
        }
      }
    }
  }, [mapReady, placeA, placeB, updateLabels]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />
    </div>
  );
}
