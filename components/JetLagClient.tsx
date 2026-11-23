'use client';

import React, { useState, useMemo } from 'react';
import { DateTime } from 'luxon';
import { getAllPlaces } from '@/lib/places';
import { calculateJetLagPlan, JetLagPlan } from '@/lib/jetlag';
import { Plane, Clock, Calendar, Compass, Sun, ShieldCheck, ArrowRight } from 'lucide-react';

export default function JetLagClient() {
  const allPlaces = useMemo(() => getAllPlaces(), []);

  const [originSlug, setOriginSlug] = useState('new-york');
  const [destSlug, setDestSlug] = useState('london');
  const [departureDate, setDepartureDate] = useState(() => {
    return DateTime.now().plus({ days: 3 }).set({ hour: 18, minute: 0 }).toFormat("yyyy-MM-dd'T'HH:mm");
  });
  const [customFlightHours, setCustomFlightHours] = useState<number | undefined>(undefined);

  const originPlace = useMemo(() => allPlaces.find((p) => p.slug === originSlug) || allPlaces[0], [allPlaces, originSlug]);
  const destPlace = useMemo(() => allPlaces.find((p) => p.slug === destSlug) || allPlaces[1], [allPlaces, destSlug]);

  const plan = useMemo<JetLagPlan | null>(() => {
    if (!originPlace || !destPlace) return null;
    return calculateJetLagPlan(originPlace, destPlace, departureDate, customFlightHours);
  }, [originPlace, destPlace, departureDate, customFlightHours]);

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-theme">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            <Plane className="w-3.5 h-3.5" />
            Aviation Circadian Optimizer
          </span>
          <span className="text-xs text-muted">Scientific Light & Sleep Shift Protocol</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="originSelect" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Departure City / Country
            </label>
            <select
              id="originSelect"
              value={originSlug}
              onChange={(e) => setOriginSlug(e.target.value)}
              className="w-full bg-card border border-theme rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-accent outline-none"
            >
              {allPlaces.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} {p.type === 'city' ? `(${p.countryName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="destSelect" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Arrival City / Country
            </label>
            <select
              id="destSelect"
              value={destSlug}
              onChange={(e) => setDestSlug(e.target.value)}
              className="w-full bg-card border border-theme rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-accent outline-none"
            >
              {allPlaces.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} {p.type === 'city' ? `(${p.countryName})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="depTimeInput" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Departure Date & Local Time
            </label>
            <input
              id="depTimeInput"
              type="datetime-local"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-card border border-theme rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-accent outline-none"
            />
          </div>

          <div>
            <label htmlFor="flightDurationInput" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Flight Duration (Hours - Optional)
            </label>
            <input
              id="flightDurationInput"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              placeholder={plan ? `${plan.flightDurationHours} hrs (estimated)` : 'Estimated by distance'}
              value={customFlightHours || ''}
              onChange={(e) => setCustomFlightHours(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full bg-card border border-theme rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-accent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Output Results */}
      {plan && (
        <div className="space-y-6">
          {/* Key Facts Summary */}
          <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-theme">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-lg">
                  {plan.origin.name}
                </span>
                <ArrowRight className="w-4 h-4 text-accent" />
                <span className="font-bold text-foreground text-lg">
                  {plan.destination.name}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                Recovery window: ~{plan.adaptationDays} {plan.adaptationDays === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-card border border-theme">
                <div className="text-xs text-muted font-medium mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  Time Difference
                </div>
                <div className="text-base font-bold text-foreground">
                  {plan.timeDiffFormatted}
                </div>
                <div className="text-xs text-muted mt-1">
                  {Math.abs(plan.timeDiffMinutes) / 60} hours shift
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-theme">
                <div className="text-xs text-muted font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  Local Arrival Time
                </div>
                <div className="text-base font-bold text-foreground font-mono">
                  {plan.arrivalLocal.toFormat('hh:mm a')}
                </div>
                <div className="text-xs text-muted mt-1">
                  {plan.arrivalLocal.toFormat('ccc, LLL d')}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-theme">
                <div className="text-xs text-muted font-medium mb-1 flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5 text-accent" />
                  Flight Duration
                </div>
                <div className="text-base font-bold text-foreground font-mono">
                  {plan.flightDurationHours} hours
                </div>
                <div className="text-xs text-muted mt-1">
                  Air distance: {plan.distanceKm.toLocaleString()} km
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-theme">
                <div className="text-xs text-muted font-medium mb-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-accent" />
                  Shift Direction
                </div>
                <div className="text-base font-bold text-foreground">
                  {plan.isEastward ? 'Eastward (Advance)' : 'Westward (Delay)'}
                </div>
                <div className="text-xs text-muted mt-1">
                  {plan.isEastward ? 'Phase advance requires bright morning light' : 'Phase delay requires late afternoon light'}
                </div>
              </div>
            </div>
          </div>

          {/* Adaptation Protocol Timeline */}
          <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-theme pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent" />
                Evidence-Based Circadian Adaptation Schedule
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Follow this timeline to align your biological clock with your destination in {plan.destination.name}.
              </p>
            </div>

            <div className="space-y-4">
              {/* Pre-Flight */}
              <div className="p-4 rounded-xl bg-card border border-theme">
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  1. Pre-Flight Preparation (2–3 Days Before Departure)
                </div>
                <ul className="space-y-1.5 text-xs text-foreground/90 list-disc list-inside">
                  {plan.tips.preFlight.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>

              {/* In-Flight */}
              <div className="p-4 rounded-xl bg-card border border-theme">
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  2. In-Flight Protocol (During Transit)
                </div>
                <ul className="space-y-1.5 text-xs text-foreground/90 list-disc list-inside">
                  {plan.tips.inFlight.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Day 1 At Destination */}
              <div className="p-4 rounded-xl bg-card border border-theme">
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  3. Day 1 at Destination ({plan.destination.name})
                </div>
                <ul className="space-y-1.5 text-xs text-foreground/90 list-disc list-inside">
                  {plan.tips.postFlightDay1.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Day 2 Onward */}
              <div className="p-4 rounded-xl bg-card border border-theme">
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  4. Consolidation (Days 2 to {plan.adaptationDays})
                </div>
                <ul className="space-y-1.5 text-xs text-foreground/90 list-disc list-inside">
                  {plan.tips.postFlightDay2Onward.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
