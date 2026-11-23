'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DateTime } from 'luxon';
import { SportsEventReport } from '@/lib/sports';
import { Calendar, Clock, Globe, AlertCircle, CalendarPlus, ExternalLink, Tv, Info, HelpCircle } from 'lucide-react';
import { generateGoogleCalendarUrl, EventData } from '@/lib/events';

export default function SportsEventClient({ report }: { report: SportsEventReport }) {
  const {
    event,
    targetCountry,
    isConfirmed,
    isScheduled,
    tentativeMessage,
    targetCountryTimeFormatted,
    targetCountryDateFormatted,
    dayDifference,
    calendarShiftText,
    localBroadcasters,
    localViewingAdvice,
    majorAudiences,
    lastUpdated,
    source,
    sourceUrl,
    faqs,
  } = report;

  // Auto-detected visitor timezone
  const [visitorZone, setVisitorZone] = useState<string>('UTC');
  const [countdownStr, setCountdownStr] = useState<string>('');

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setVisitorZone(detected);
    } catch {
      // Fallback UTC
    }

    if (isScheduled && event.scheduledStartIso) {
      const startLocal = DateTime.fromISO(event.scheduledStartIso, { zone: event.hostTimezone });
      const updateTimer = () => {
        const now = DateTime.now().toUTC();
        const startUtc = startLocal.toUTC();
        const diff = startUtc.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();
        if (startUtc.toMillis() <= now.toMillis()) {
          setCountdownStr('Event has concluded');
        } else {
          const d = Math.floor(diff.days || 0);
          const h = Math.floor(diff.hours || 0);
          const m = Math.floor(diff.minutes || 0);
          const s = Math.floor(diff.seconds || 0);
          setCountdownStr(`${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [isScheduled, event.scheduledStartIso, event.hostTimezone]);

  const visitorLocalTime = useMemo(() => {
    if (!isScheduled || !event.scheduledStartIso) return null;
    const startUtc = DateTime.fromISO(event.scheduledStartIso, { zone: event.hostTimezone }).toUTC();
    return startUtc.setZone(visitorZone);
  }, [isScheduled, event.scheduledStartIso, event.hostTimezone, visitorZone]);

  const calendarEventData: EventData | null = useMemo(() => {
    if (!isScheduled || !event.scheduledStartIso) return null;
    return {
      title: event.name,
      iso: event.scheduledStartIso,
      zone: event.hostTimezone,
      description: `${event.description} Hosted in ${event.venueCity}, ${event.venueCountry}.`,
      durationMinutes: 180,
    };
  }, [isScheduled, event]);

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-theme">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <Calendar className="w-3.5 h-3.5" />
              {event.sport} Global Broadcast
            </span>
            <span className="text-xs text-muted">
              Venue: {event.venueCity}, {event.venueCountry}
            </span>
          </div>
          <div className="text-xs text-muted flex items-center gap-2 sm:gap-3 flex-wrap">
            {source && (
              <span>
                Official Source:{' '}
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-foreground hover:text-accent font-medium inline-flex items-center gap-0.5"
                  >
                    {source}
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                ) : (
                  source
                )}
              </span>
            )}
            <span>•</span>
            <span>Verified: {report.lastChecked || lastUpdated}</span>
          </div>
        </div>

        <div className="mt-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            What time is {event.name} in {targetCountry.name}?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Tentative Schedule Warning Block */}
        {!isConfirmed ? (
          <div className="mt-6 p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-foreground flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                Official Broadcast Schedule Pending Confirmation (TBC)
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {tentativeMessage}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* Primary Target Country Box */}
            <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
                Official Start Time in {targetCountry.name}
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-foreground">
                {targetCountryTimeFormatted}
              </div>
              <div className="text-sm font-medium text-foreground/80 mt-1">
                {targetCountryDateFormatted}
              </div>
              <div className="text-xs text-muted mt-2">
                Time Zone: {targetCountry.timezone}
              </div>

              {/* Calendar Day Difference Notice */}
              {dayDifference !== 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{calendarShiftText}</span>
                </div>
              )}
            </div>

            {/* Auto-detected Visitor Time Block */}
            {visitorLocalTime && (
              <div className="p-5 rounded-xl bg-card border border-theme flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-1">
                    <Globe className="w-3.5 h-3.5 text-accent" />
                    Auto-Detected In Your Time Zone ({visitorZone})
                  </div>
                  <div className="text-2xl font-mono font-bold text-foreground">
                    {visitorLocalTime.toFormat('h:mm a')}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {visitorLocalTime.toFormat('cccc, LLLL d, yyyy')}
                  </div>
                </div>

                {countdownStr && (
                  <div className="text-right sm:text-right w-full sm:w-auto">
                    <div className="text-xs text-muted font-medium mb-1 flex items-center sm:justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      Live Countdown
                    </div>
                    <div className="text-lg font-mono font-bold text-foreground">
                      {countdownStr}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add to Calendar Button */}
            {calendarEventData && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={generateGoogleCalendarUrl(calendarEventData)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-xs shadow-sm hover:opacity-95 transition-all"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Add to Google Calendar
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Broadcast & Television Schedule for Target Country */}
      <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Tv className="w-4 h-4 text-accent" />
          <h2 className="text-lg sm:text-xl font-bold">Broadcasting in {targetCountry.name}</h2>
        </div>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          {localBroadcasters}
        </p>
        <div className="p-4 rounded-xl bg-card border border-theme text-xs space-y-2">
          <div className="font-semibold text-foreground">Viewing Guide for {targetCountry.name}:</div>
          <div className="text-muted leading-relaxed">
            {localViewingAdvice}
          </div>
        </div>
      </div>

      {/* Event Overview & Background */}
      <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Info className="w-4 h-4 text-accent" />
          <h2 className="text-lg sm:text-xl font-bold">Event Overview & Competition History</h2>
        </div>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          {event.overview || event.description}
        </p>
        <div className="p-4 rounded-xl bg-card border border-theme text-xs space-y-2">
          <div className="font-semibold text-foreground">Host Venue Information:</div>
          <div className="text-muted leading-relaxed">
            Staged in {event.venueCity}, {event.venueCountry} within the {event.hostTimezone} time zone.
          </div>
        </div>
      </div>

      {/* Major Global Audiences Table */}
      {isConfirmed && majorAudiences.length > 0 && (
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Broadcast Start Times for Major Global Audiences
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Kickoff / opening converted across international viewership markets.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-theme text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="py-3 px-4">Market / Audience</th>
                  <th className="py-3 px-4">Local Time</th>
                  <th className="py-3 px-4">Calendar Date</th>
                  <th className="py-3 px-4">Time Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {majorAudiences.map((aud) => (
                  <tr key={aud.timezone} className="hover:bg-card/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {aud.regionLabel}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {aud.timeFormatted}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-foreground/80">
                      {aud.dateFormatted}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-muted">
                      {aud.timezone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Frequently Asked Questions */}
      {faqs && faqs.length > 0 && (
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <HelpCircle className="w-4 h-4 text-accent" />
            <h2 className="text-lg sm:text-xl font-bold">Frequently Asked Questions ({targetCountry.name})</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group p-4 rounded-xl bg-card border border-theme transition-all"
              >
                <summary className="font-semibold text-xs sm:text-sm text-foreground cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
