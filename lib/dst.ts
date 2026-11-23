import { DateTime } from 'luxon';

export interface ClockChange {
  date: string; // ISO date e.g. "2026-11-01"
  formattedDate: string; // "Sunday, November 1, 2026"
  formattedTime: string; // "2:00 AM"
  type: 'forward' | 'backward';
  shiftMinutes: number; // e.g. +60 or -60
  description: string;
}

export interface DstSummary {
  observesDst: boolean;
  currentStatus: 'Standard Time' | 'Daylight Saving Time';
  currentOffsetStr: string;
  nextChange: ClockChange | null;
  lastChange: ClockChange | null;
  popularPairEffects: Array<{
    pairLabel: string;
    routeUrl: string;
    standardDifference: string;
    dstDifference: string;
    explanation: string;
  }>;
}

/**
 * Finds the exact DST transition point between two epoch millis in a timezone
 */
function findTransitionPoint(zone: string, startMs: number, endMs: number): number | null {
  const startOffset = DateTime.fromMillis(startMs, { zone }).offset;
  const endOffset = DateTime.fromMillis(endMs, { zone }).offset;
  if (startOffset === endOffset) return null;

  let low = startMs;
  let high = endMs;

  // Binary search down to minute precision
  while (high - low > 60000) {
    const mid = Math.floor((low + high) / 2);
    const midOffset = DateTime.fromMillis(mid, { zone }).offset;
    if (midOffset === startOffset) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

/**
 * Scans for next clock transition in timezone within the next 365 days
 */
export function getNextClockChange(ianaZone: string, referenceDate: DateTime = DateTime.now()): ClockChange | null {
  const startMs = referenceDate.toMillis();
  const stepMs = 7 * 24 * 60 * 60 * 1000; // 7-day intervals
  const maxScanMs = startMs + 370 * 24 * 60 * 60 * 1000;

  let currentMs = startMs;
  let transitionMs: number | null = null;

  while (currentMs < maxScanMs) {
    const nextMs = currentMs + stepMs;
    const pt = findTransitionPoint(ianaZone, currentMs, nextMs);
    if (pt !== null) {
      transitionMs = pt;
      break;
    }
    currentMs = nextMs;
  }

  if (!transitionMs) return null;

  const dtBefore = DateTime.fromMillis(transitionMs - 60000, { zone: ianaZone });
  const dtAfter = DateTime.fromMillis(transitionMs + 60000, { zone: ianaZone });
  const diffMinutes = dtAfter.offset - dtBefore.offset;

  const transitionDt = DateTime.fromMillis(transitionMs, { zone: ianaZone });
  const isForward = diffMinutes > 0;

  return {
    date: transitionDt.toISODate() || '',
    formattedDate: transitionDt.toFormat('cccc, MMMM d, yyyy'),
    formattedTime: transitionDt.toFormat('h:mm a'),
    type: isForward ? 'forward' : 'backward',
    shiftMinutes: diffMinutes,
    description: isForward
      ? `Clocks spring forward 1 hour at ${transitionDt.toFormat('h:mm a')} (${transitionDt.toFormat('MMMM d')}).`
      : `Clocks fall back 1 hour at ${transitionDt.toFormat('h:mm a')} (${transitionDt.toFormat('MMMM d')}).`,
  };
}

/**
 * Scans for last clock transition in timezone within the previous 365 days
 */
export function getLastClockChange(ianaZone: string, referenceDate: DateTime = DateTime.now()): ClockChange | null {
  const endMs = referenceDate.toMillis();
  const stepMs = 7 * 24 * 60 * 60 * 1000;
  const minScanMs = endMs - 370 * 24 * 60 * 60 * 1000;

  let currentMs = endMs;
  let transitionMs: number | null = null;

  while (currentMs > minScanMs) {
    const prevMs = currentMs - stepMs;
    const pt = findTransitionPoint(ianaZone, prevMs, currentMs);
    if (pt !== null) {
      transitionMs = pt;
      break;
    }
    currentMs = prevMs;
  }

  if (!transitionMs) return null;

  const dtBefore = DateTime.fromMillis(transitionMs - 60000, { zone: ianaZone });
  const dtAfter = DateTime.fromMillis(transitionMs + 60000, { zone: ianaZone });
  const diffMinutes = dtAfter.offset - dtBefore.offset;

  const transitionDt = DateTime.fromMillis(transitionMs, { zone: ianaZone });
  const isForward = diffMinutes > 0;

  return {
    date: transitionDt.toISODate() || '',
    formattedDate: transitionDt.toFormat('cccc, MMMM d, yyyy'),
    formattedTime: transitionDt.toFormat('h:mm a'),
    type: isForward ? 'forward' : 'backward',
    shiftMinutes: diffMinutes,
    description: isForward
      ? `Clocks jumped forward 1 hour on ${transitionDt.toFormat('MMMM d, yyyy')}.`
      : `Clocks fell back 1 hour on ${transitionDt.toFormat('MMMM d, yyyy')}.`,
  };
}

/**
 * Generates full DST report for country or zone
 */
export function getDstSummaryForCountry(ianaZone: string, countryName: string, referenceDate: DateTime = DateTime.now()): DstSummary {
  const local = referenceDate.setZone(ianaZone);
  const nextChange = getNextClockChange(ianaZone, referenceDate);
  const lastChange = getLastClockChange(ianaZone, referenceDate);
  const observesDst = nextChange !== null || lastChange !== null;

  const offsetMinutes = local.offset;
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const h = Math.floor(Math.abs(offsetMinutes) / 60);
  const m = Math.abs(offsetMinutes) % 60;
  const currentOffsetStr = `UTC${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  const currentStatus = local.isInDST ? 'Daylight Saving Time' : 'Standard Time';

  // 3 Popular pair effects
  const popularPairEffects: DstSummary['popularPairEffects'] = [];

  if (countryName.toLowerCase().includes('united states') || ianaZone.includes('New_York')) {
    popularPairEffects.push(
      {
        pairLabel: 'United States (New York) vs United Kingdom (London)',
        routeUrl: '/time-difference/united-states-to-united-kingdom',
        standardDifference: '5 hours difference (winter and summer)',
        dstDifference: '4 or 6 hours difference during the 2–3 week spring/autumn divergence',
        explanation: 'The US and UK change clocks on different weekends in March and late October/November. During these gap weeks, the transatlantic time difference shifts by one hour.',
      },
      {
        pairLabel: 'United States (New York) vs India (IST)',
        routeUrl: '/time-difference/united-states-to-india',
        standardDifference: '10 hours 30 minutes in winter (EST)',
        dstDifference: '9 hours 30 minutes in summer (EDT)',
        explanation: 'India does not observe DST. Consequently, when US clocks spring forward into EDT, the gap to India shrinks from 10h 30m down to 9h 30m.',
      },
      {
        pairLabel: 'United States (New York) vs Australia (Sydney)',
        routeUrl: '/time-difference/united-states-to-australia',
        standardDifference: '16 hours difference (US winter / AU summer)',
        dstDifference: '14 hours difference (US summer / AU winter)',
        explanation: 'Because the Northern and Southern Hemispheres have opposite seasons, daylight saving moves in opposite directions, creating a 2-hour swing between July and December.',
      }
    );
  } else if (countryName.toLowerCase().includes('united kingdom') || ianaZone.includes('London')) {
    popularPairEffects.push(
      {
        pairLabel: 'United Kingdom (London) vs United States (New York)',
        routeUrl: '/time-difference/united-kingdom-to-united-states',
        standardDifference: '5 hours difference',
        dstDifference: '4 or 6 hours during transition gap weeks',
        explanation: 'US and UK DST switches do not align on the calendar, creating brief 4-hour or 6-hour windows in March and October.',
      },
      {
        pairLabel: 'United Kingdom (London) vs India (IST)',
        routeUrl: '/time-difference/united-kingdom-to-india',
        standardDifference: '5 hours 30 minutes in winter (GMT)',
        dstDifference: '4 hours 30 minutes in summer (BST)',
        explanation: 'In winter GMT, India is 5h 30m ahead. When Britain enters British Summer Time (BST, UTC+1), the difference narrows to 4h 30m.',
      },
      {
        pairLabel: 'United Kingdom (London) vs Australia (Sydney)',
        routeUrl: '/time-difference/united-kingdom-to-australia',
        standardDifference: '11 hours in UK winter (GMT to AEDT)',
        dstDifference: '9 hours in UK summer (BST to AEST)',
        explanation: 'Opposite hemisphere DST schedules produce an 11-hour difference in December/January and a 9-hour difference in June/July.',
      }
    );
  } else {
    popularPairEffects.push(
      {
        pairLabel: `${countryName} vs United Kingdom (London)`,
        routeUrl: '/time-difference',
        standardDifference: 'Varies with British Summer Time (BST)',
        dstDifference: '1 hour seasonal shift',
        explanation: 'London switches between GMT (UTC+0) in winter and BST (UTC+1) in summer, causing a 1-hour shift for regions with no DST.',
      },
      {
        pairLabel: `${countryName} vs United States (New York)`,
        routeUrl: '/time-difference',
        standardDifference: 'Varies with Eastern Daylight Time (EDT)',
        dstDifference: '1 hour seasonal shift',
        explanation: 'New York shifts from UTC-5 (EST) to UTC-4 (EDT) each March, shifting call schedules by 60 minutes.',
      },
      {
        pairLabel: `${countryName} vs India (IST)`,
        routeUrl: '/time-difference',
        standardDifference: 'Fixed against UTC+05:30',
        dstDifference: 'Static Indian Standard Time year-round',
        explanation: 'India maintains a constant UTC+05:30 offset throughout all seasons without daylight saving alterations.',
      }
    );
  }

  return {
    observesDst,
    currentStatus,
    currentOffsetStr,
    nextChange,
    lastChange,
    popularPairEffects,
  };
}
