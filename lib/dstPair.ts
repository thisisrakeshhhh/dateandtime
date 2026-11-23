import { DateTime } from 'luxon';
import { Place } from '@/lib/places';
import { getNextClockChange } from '@/lib/dst';

export interface PairSeasonalAnalysis {
  minDiffMinutes: number;
  maxDiffMinutes: number;
  minDiffFormatted: string;
  maxDiffFormatted: string;
  isConstantYearRound: boolean;
  summaryText: string;
  transitionsThisYear: Array<{
    date: string;
    placeName: string;
    description: string;
  }>;
  whichChangesFirst?: string;
}

/**
 * Analyzes the year-round daylight saving interaction between two places using IANA data
 */
export function analyzePairSeasonalDst(placeA: Place, placeB: Place, year: number = 2026): PairSeasonalAnalysis {
  const shortA = placeA.name;
  const shortB = placeB.name;

  // Sample across 52 weeks of the year at Sunday noon UTC
  const diffs: number[] = [];
  const startOfYear = DateTime.fromObject({ year, month: 1, day: 4, hour: 12, minute: 0 }, { zone: 'utc' });

  for (let week = 0; week < 52; week++) {
    const ref = startOfYear.plus({ weeks: week });
    const offsetA = ref.setZone(placeA.timezone).offset;
    const offsetB = ref.setZone(placeB.timezone).offset;
    diffs.push(offsetB - offsetA);
  }

  const minDiff = Math.min(...diffs);
  const maxDiff = Math.max(...diffs);

  const formatDiff = (mins: number) => {
    const abs = Math.abs(mins);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    const dur = `${h}h${m > 0 ? ` ${m}m` : ''}`;
    if (mins === 0) return '0 hours (same time)';
    return mins > 0 ? `${dur} ahead` : `${dur} behind`;
  };

  const isConstantYearRound = minDiff === maxDiff;
  const minDiffFormatted = formatDiff(minDiff);
  const maxDiffFormatted = formatDiff(maxDiff);

  // Transitions for both places in reference year
  const jan1 = DateTime.fromObject({ year, month: 1, day: 1 }, { zone: 'utc' });
  const nextA = getNextClockChange(placeA.timezone, jan1);
  const nextB = getNextClockChange(placeB.timezone, jan1);

  let whichChangesFirst: string | undefined = undefined;
  if (nextA && nextB) {
    if (nextA.date < nextB.date) {
      whichChangesFirst = shortA;
    } else if (nextB.date < nextA.date) {
      whichChangesFirst = shortB;
    } else {
      whichChangesFirst = 'Both places on the same day';
    }
  } else if (nextA) {
    whichChangesFirst = shortA;
  } else if (nextB) {
    whichChangesFirst = shortB;
  }

  let summaryText = '';
  const v = Math.abs(shortA.length * 31 + shortB.length * 17 + (minDiff % 13));

  if (isConstantYearRound) {
    if (v % 3 === 0) {
      summaryText = `Both ${shortA} and ${shortB} maintain a steady ${formatDiff(minDiff)} difference every single day of the year. Neither location experiences seasonal clock adjustments, so meeting schedules remain permanent across all seasons.`;
    } else if (v % 3 === 1) {
      summaryText = `The time delta between ${shortA} and ${shortB} never varies, remaining fixed at ${formatDiff(minDiff)} throughout winter, spring, summer, and autumn. Because neither territory observes daylight saving shifts, calendar appointments stay constant indefinitely.`;
    } else {
      summaryText = `There are no seasonal clock adjustments between ${shortA} and ${shortB}, keeping the time offset stable at ${formatDiff(minDiff)} year-round. Distributed teams and travelers can rely on consistent daily schedules without semi-annual clock confusion.`;
    }
  } else {
    if (nextA && nextB) {
      if (v % 3 === 0) {
        summaryText = `Over the course of the year, the time gap between ${shortA} and ${shortB} fluctuates between ${minDiffFormatted} and ${maxDiffFormatted}. Because ${shortA} and ${shortB} transition into and out of Daylight Saving Time on different weekends (with ${whichChangesFirst} changing clocks first), there are brief transitional periods in March and October/November where the customary gap narrows or widens by one hour.`;
      } else if (v % 3 === 1) {
        summaryText = `Throughout the calendar year, the offset between ${shortA} and ${shortB} shifts between ${minDiffFormatted} and ${maxDiffFormatted}. This variation occurs because daylight saving calendars are not synchronized internationally: ${whichChangesFirst} adjusts its clocks on an earlier weekend, creating an interim span during the spring and autumn transitions where the standard offset moves by 60 minutes.`;
      } else {
        summaryText = `Due to unsynchronized Daylight Saving Time changeovers, the time difference between ${shortA} and ${shortB} toggles between ${minDiffFormatted} and ${maxDiffFormatted}. With ${whichChangesFirst} switching clocks first, cross-border meeting organizers should anticipate a temporary one-hour adjustment during seasonal transition weeks.`;
      }
    } else if (nextA) {
      const vMod = v % 4;
      if (vMod === 0) {
        summaryText = `The time difference varies throughout the year because ${shortA} observes Daylight Saving Time while ${shortB} remains on standard time year-round. Clocks in ${shortA} adjust by 1 hour, altering the time gap between ${minDiffFormatted} and ${maxDiffFormatted}.`;
      } else if (vMod === 1) {
        summaryText = `Because ${shortA} shifts its clocks for Daylight Saving Time while ${shortB} adheres to fixed standard time all year, the bilateral gap alternates between ${minDiffFormatted} and ${maxDiffFormatted}. Remote teams coordinating between these two regions should note that the hour difference shifts according to ${shortA}'s seasonal clock calendar.`;
      } else if (vMod === 2) {
        summaryText = `Civil time in ${shortA} moves forward and backward each year under daylight saving rules, whereas ${shortB} never adjusts its clocks. As a consequence, their mutual time difference expands or contracts between ${minDiffFormatted} and ${maxDiffFormatted} based entirely on ${shortA}'s seasonal schedule.`;
      } else {
        summaryText = `Across all four seasons, the gap between ${shortA} and ${shortB} transitions between ${minDiffFormatted} and ${maxDiffFormatted}. This change is driven exclusively by ${shortA}'s statutory daylight adjustments, while counterparts in ${shortB} operate on a permanent, unwavering UTC offset.`;
      }
    } else {
      const vMod = v % 4;
      if (vMod === 0) {
        summaryText = `The time difference shifts seasonally because ${shortB} observes Daylight Saving Time while ${shortA} operates on static standard time year-round. When ${shortB} adjusts its clocks, the offset alternates between ${minDiffFormatted} and ${maxDiffFormatted}.`;
      } else if (vMod === 1) {
        summaryText = `Seasonal clock changes in ${shortB} cause the operational time difference to swing between ${minDiffFormatted} and ${maxDiffFormatted}, while ${shortA} remains on uninterrupted standard time. Global calendars should account for ${shortB}'s spring and autumn transitions.`;
      } else if (vMod === 2) {
        summaryText = `While ${shortA} maintains an unvarying standard time throughout the year, ${shortB} shifts its clocks bi-annually for Daylight Saving Time. This creates a seasonal offset that moves between ${minDiffFormatted} and ${maxDiffFormatted}.`;
      } else {
        summaryText = `Operating between a permanent-time region like ${shortA} and a daylight-shifting jurisdiction like ${shortB} causes their mutual time difference to toggle between ${minDiffFormatted} and ${maxDiffFormatted} twice every year.`;
      }
    }
  }

  return {
    minDiffMinutes: minDiff,
    maxDiffMinutes: maxDiff,
    minDiffFormatted,
    maxDiffFormatted,
    isConstantYearRound,
    summaryText,
    transitionsThisYear: [],
    whichChangesFirst,
  };
}
