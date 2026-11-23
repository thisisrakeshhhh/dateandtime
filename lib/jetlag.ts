import { DateTime } from 'luxon';
import { Place } from '@/lib/places';
import { calculateDistance } from '@/lib/distance';

export interface JetLagPlan {
  origin: Place;
  destination: Place;
  departureLocal: DateTime;
  arrivalLocal: DateTime;
  flightDurationHours: number;
  timeDiffMinutes: number;
  timeDiffFormatted: string;
  isEastward: boolean;
  distanceKm: number;
  adaptationDays: number;
  tips: {
    preFlight: string[];
    inFlight: string[];
    postFlightDay1: string[];
    postFlightDay2Onward: string[];
  };
}

export function calculateJetLagPlan(
  origin: Place,
  destination: Place,
  departureIso: string, // YYYY-MM-DDTHH:mm
  customFlightDurationHours?: number
): JetLagPlan {
  const dist = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  const distanceKm = Math.round(dist.km);

  // If no flight duration supplied, compute based on average 850 km/h jetliner + 45m taxi/approach
  const flightDurationHours =
    customFlightDurationHours && customFlightDurationHours > 0
      ? customFlightDurationHours
      : Math.round(((dist.km / 850) + 0.75) * 10) / 10;

  const departureLocal = DateTime.fromISO(departureIso, { zone: origin.timezone });
  const departureUtc = departureLocal.toUTC();
  const arrivalUtc = departureUtc.plus({ hours: flightDurationHours });
  const arrivalLocal = arrivalUtc.setZone(destination.timezone);

  const timeDiffMinutes = arrivalLocal.offset - departureLocal.offset;
  const absDiff = Math.abs(timeDiffMinutes);
  const diffHours = Math.floor(absDiff / 60);
  const diffMins = absDiff % 60;
  const isEastward = timeDiffMinutes > 0;

  const timeDiffFormatted =
    timeDiffMinutes === 0
      ? 'Same time zone'
      : isEastward
      ? `+${diffHours}h ${diffMins > 0 ? `${diffMins}m ` : ''}ahead (Eastward)`
      : `-${diffHours}h ${diffMins > 0 ? `${diffMins}m ` : ''}behind (Westward)`;

  // Eastward travel requires circadian phase advance, which is physiologically slower than delay
  const zonesCrossed = Math.round(absDiff / 60);
  const adaptationDays = Math.max(1, Math.round(isEastward ? zonesCrossed * 1.0 : zonesCrossed * 0.7));

  // Adaptation protocol
  const tips = {
    preFlight: [
      isEastward
        ? 'Begin moving your bedtime 30–60 minutes earlier for 2–3 nights before departure.'
        : 'Begin shifting bedtime 30–60 minutes later for 2–3 nights prior to travel.',
      'Hydrate thoroughly; reduce alcohol and heavy sodium intake 24 hours prior to travel.',
    ],
    inFlight: [
      'Change your watch and digital clock to destination time immediately upon boarding.',
      isEastward
        ? 'Sleep as early as possible during the flight to align with your destination night.'
        : 'Stay awake during the first leg of the flight if landing in afternoon or evening.',
      'Drink 250ml of water every hour; avoid caffeine within 6 hours of destination bedtime.',
    ],
    postFlightDay1: [
      isEastward
        ? 'Seek bright natural sunlight in the morning (8:00 AM – 11:00 AM) to advance your circadian clock.'
        : 'Seek natural sunlight during the late afternoon (3:00 PM – 6:00 PM) to delay your internal clock.',
      'Resist taking daytime naps longer than 20–30 minutes to safeguard nighttime sleep pressure.',
      'Eat meals strictly according to local destination dining hours.',
    ],
    postFlightDay2Onward: [
      'Engage in light aerobic exercise (such as a brisk walk) during local morning hours.',
      'Maintain bedtime consistency within 30 minutes for the first 3 days after arrival.',
    ],
  };

  return {
    origin,
    destination,
    departureLocal,
    arrivalLocal,
    flightDurationHours,
    timeDiffMinutes,
    timeDiffFormatted,
    isEastward,
    distanceKm,
    adaptationDays,
    tips,
  };
}
