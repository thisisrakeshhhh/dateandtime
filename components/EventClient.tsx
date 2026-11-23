'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import {
  decodeEventFromParams,
  encodeEventToParams,
  generateGoogleCalendarUrl,
  generateIcsContent,
  calculateCountdown,
  EventData,
  getEventUtcRange,
} from '@/lib/events';
import { Calendar, Clock, Globe, Copy, Check, ExternalLink, Download, Share2, Code } from 'lucide-react';

const COMMON_ZONES = [
  { label: 'India Standard Time (IST)', zone: 'Asia/Kolkata' },
  { label: 'US Eastern Time (ET)', zone: 'America/New_York' },
  { label: 'US Central Time (CT)', zone: 'America/Chicago' },
  { label: 'US Mountain Time (MT)', zone: 'America/Denver' },
  { label: 'US Pacific Time (PT)', zone: 'America/Los_Angeles' },
  { label: 'United Kingdom (London)', zone: 'Europe/London' },
  { label: 'Central European Time (Berlin/Paris)', zone: 'Europe/Paris' },
  { label: 'Australia Eastern (Sydney)', zone: 'Australia/Sydney' },
  { label: 'Gulf Standard Time (Dubai)', zone: 'Asia/Dubai' },
  { label: 'Singapore Standard Time (SGT)', zone: 'Asia/Singapore' },
  { label: 'Japan Standard Time (Tokyo)', zone: 'Asia/Tokyo' },
  { label: 'UTC / Universal Time', zone: 'UTC' },
];

export default function EventClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Visitor's local timezone
  const [visitorZone, setVisitorZone] = useState<string>('UTC');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now().toUTC());

  // Form state for creating a new event
  const [title, setTitle] = useState('');
  const [isoDate, setIsoDate] = useState('');
  const [sourceZone, setSourceZone] = useState('America/New_York');
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  // Detect visitor timezone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setVisitorZone(detected);
        if (!sourceZone) {
          setSourceZone(detected);
        }
      }
    } catch {
      // Fallback to UTC
    }

    // Set default datetime to tomorrow at 15:00
    const tomorrow = DateTime.now().plus({ days: 1 }).set({ hour: 15, minute: 0, second: 0 });
    setIsoDate(tomorrow.toFormat("yyyy-MM-dd'T'HH:mm"));

    const interval = setInterval(() => {
      setCurrentTime(DateTime.now().toUTC());
    }, 1000);

    return () => clearInterval(interval);
  }, [sourceZone]);

  // Decode event from URL if present
  const eventData = useMemo<EventData | null>(() => {
    return decodeEventFromParams(searchParams);
  }, [searchParams]);

  // If viewing an event, parse its start & visitor local time
  const eventDetails = useMemo(() => {
    if (!eventData) return null;

    const range = getEventUtcRange(eventData);
    if (!range) return null;

    const originLocal = DateTime.fromISO(eventData.iso, { zone: eventData.zone });
    const visitorLocal = range.startUtc.setZone(visitorZone);
    const visitorEndLocal = range.endUtc.setZone(visitorZone);

    const countdown = calculateCountdown(range.startUtc, currentTime);

    return {
      range,
      originLocal,
      visitorLocal,
      visitorEndLocal,
      countdown,
    };
  }, [eventData, visitorZone, currentTime]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !isoDate) return;

    const newEvent: EventData = {
      title,
      iso: isoDate,
      zone: sourceZone,
      durationMinutes: duration,
      description: description.trim() || undefined,
    };

    const qs = encodeEventToParams(newEvent);
    startTransition(() => {
      router.push(`/event?${qs}`);
    });
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadIcs = () => {
    if (!eventData) return;
    const icsContent = generateIcsContent(eventData);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${eventData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const embedCode = useMemo(() => {
    if (!eventData || !currentUrl) return '';
    return `<iframe src="${currentUrl.replace('/event?', '/event/embed?')}" width="100%" height="320" style="border:1px solid #e2e8f0;border-radius:12px;max-width:540px;" title="${eventData.title}"></iframe><div style="font-size:12px;margin-top:4px;color:#64748b;"><a href="${currentUrl}" target="_blank" rel="noopener noreferrer" style="color:#E85D4E;text-decoration:none;">View on TimeBridge</a></div>`;
  }, [eventData, currentUrl]);

  const handleCopyEmbed = () => {
    if (!embedCode) return;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* If viewing a shared event */}
      {eventData && eventDetails ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-theme">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                <Globe className="w-3.5 h-3.5" />
                Live Event Time
              </span>
              <button
                onClick={() => {
                  setTitle(eventData.title);
                  setIsoDate(eventData.iso);
                  setSourceZone(eventData.zone);
                  setDescription(eventData.description || '');
                  startTransition(() => {
                    router.push('/event');
                  });
                }}
                className="text-xs text-muted hover:text-foreground font-medium underline underline-offset-4"
              >
                Create a new event link
              </button>
            </div>

            <div className="mt-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {eventData.title}
              </h1>
              {eventData.description && (
                <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl whitespace-pre-wrap">
                  {eventData.description}
                </p>
              )}
            </div>

            {/* Countdown Banner */}
            <div className="mt-6 p-4 rounded-xl bg-card border border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted">
                <Clock className="w-4 h-4 text-accent" />
                <span>Countdown:</span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-foreground">
                {eventDetails.countdown.isPast ? (
                  <span className="text-accent font-sans text-base">This event has already started or concluded.</span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    {eventDetails.countdown.days > 0 && (
                      <span>
                        {eventDetails.countdown.days} <span className="text-xs text-muted font-sans font-normal">days</span>
                      </span>
                    )}
                    <span>
                      {String(eventDetails.countdown.hours).padStart(2, '0')} <span className="text-xs text-muted font-sans font-normal">hrs</span>
                    </span>
                    <span>
                      {String(eventDetails.countdown.minutes).padStart(2, '0')} <span className="text-xs text-muted font-sans font-normal">min</span>
                    </span>
                    <span className="text-accent">
                      {String(eventDetails.countdown.seconds).padStart(2, '0')} <span className="text-xs text-muted font-sans font-normal">sec</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Converted Time Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Recipient Local Time */}
              <div className="p-5 rounded-xl bg-accent/5 border border-accent/20">
                <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
                  In Your Local Timezone
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
                  {eventDetails.visitorLocal.toFormat('hh:mm a')}
                </div>
                <div className="text-sm font-medium text-foreground/80 mt-1">
                  {eventDetails.visitorLocal.toFormat('cccc, LLLL d, yyyy')}
                </div>
                <div className="text-xs text-muted mt-2 flex items-center justify-between">
                  <span>Zone: {visitorZone}</span>
                  <span>Ends: {eventDetails.visitorEndLocal.toFormat('hh:mm a')}</span>
                </div>
              </div>

              {/* Host/Organizer Time */}
              <div className="p-5 rounded-xl bg-card border border-theme">
                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Host Timezone
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
                  {eventDetails.originLocal.toFormat('hh:mm a')}
                </div>
                <div className="text-sm font-medium text-muted mt-1">
                  {eventDetails.originLocal.toFormat('cccc, LLLL d, yyyy')}
                </div>
                <div className="text-xs text-muted mt-2 flex items-center justify-between">
                  <span>Zone: {eventData.zone}</span>
                  <span>Duration: {eventData.durationMinutes || 60}m</span>
                </div>
              </div>
            </div>

            {/* Interactive Timezone Switcher */}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted">
              <label htmlFor="visitorZoneSelect" className="shrink-0 font-medium">Viewing as:</label>
              <select
                id="visitorZoneSelect"
                value={visitorZone}
                onChange={(e) => setVisitorZone(e.target.value)}
                className="bg-card border border-theme text-foreground rounded-lg px-2.5 py-1 text-xs outline-none focus:border-accent"
              >
                {COMMON_ZONES.map((z) => (
                  <option key={z.zone} value={z.zone}>{z.label}</option>
                ))}
                {!COMMON_ZONES.some((z) => z.zone === visitorZone) && (
                  <option value={visitorZone}>{visitorZone} (Detected)</option>
                )}
              </select>
            </div>

            {/* Actions: Add to Calendar, Download .ics, Share */}
            <div className="mt-8 pt-6 border-t border-theme flex flex-wrap items-center gap-3">
              <a
                href={generateGoogleCalendarUrl(eventData)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-sm shadow-sm hover:opacity-95 transition-all"
              >
                <Calendar className="w-4 h-4" />
                Add to Google Calendar
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                onClick={handleDownloadIcs}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-theme text-foreground font-medium text-sm hover:bg-surface transition-all"
              >
                <Download className="w-4 h-4" />
                Download .ics file
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-theme text-foreground font-medium text-sm hover:bg-surface transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Link Copied!' : 'Copy Share Link'}
              </button>

              <button
                onClick={() => setShowEmbedCode(!showEmbedCode)}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-muted text-xs hover:text-foreground font-medium ml-auto"
              >
                <Code className="w-3.5 h-3.5" />
                {showEmbedCode ? 'Hide embed code' : 'Embed widget'}
              </button>
            </div>

            {/* Embed snippet view */}
            {showEmbedCode && (
              <div className="mt-4 p-4 rounded-xl bg-card border border-theme">
                <div className="flex items-center justify-between text-xs font-medium text-muted mb-2">
                  <span>HTML Embed Snippet (Responsive iframe)</span>
                  <button
                    onClick={handleCopyEmbed}
                    className="text-accent hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedEmbed ? 'Copied' : 'Copy code'}
                  </button>
                </div>
                <pre className="text-xs bg-surface border border-theme p-3 rounded-lg overflow-x-auto text-foreground font-mono">
                  {embedCode}
                </pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Event Creation Form */
        <div className="bg-surface border border-theme rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <Share2 className="w-3.5 h-3.5" />
              Event Time Links
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-3">
              Share an event time in everyone’s local timezone
            </h1>
            <p className="mt-2 text-sm text-muted">
              Pick your date, time and timezone. Anyone opening the link sees the exact time in their own city with a live countdown and one-click calendar sync.
            </p>
          </div>

          <form onSubmit={handleCreate} className="mt-8 space-y-5 max-w-2xl">
            <div>
              <label htmlFor="eventTitle" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                Event Title *
              </label>
              <input
                id="eventTitle"
                type="text"
                required
                placeholder="e.g. Q4 Town Hall / Design Review / Webinar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-card border border-theme rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-accent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventDateTime" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Date & Start Time *
                </label>
                <input
                  id="eventDateTime"
                  type="datetime-local"
                  required
                  value={isoDate}
                  onChange={(e) => setIsoDate(e.target.value)}
                  className="w-full bg-card border border-theme rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                />
              </div>

              <div>
                <label htmlFor="eventTimezone" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Event Timezone *
                </label>
                <select
                  id="eventTimezone"
                  value={sourceZone}
                  onChange={(e) => setSourceZone(e.target.value)}
                  className="w-full bg-card border border-theme rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                >
                  {COMMON_ZONES.map((z) => (
                    <option key={z.zone} value={z.zone}>{z.label}</option>
                  ))}
                  {!COMMON_ZONES.some((z) => z.zone === sourceZone) && (
                    <option value={sourceZone}>{sourceZone}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventDuration" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Duration
                </label>
                <select
                  id="eventDuration"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  className="w-full bg-card border border-theme rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>

              <div>
                <label htmlFor="eventDescription" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Notes / Agenda (Optional)
                </label>
                <input
                  id="eventDescription"
                  type="text"
                  placeholder="e.g. Zoom link or meeting agenda"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-card border border-theme rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-accent outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm shadow-sm hover:opacity-95 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Generate Shareable Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
