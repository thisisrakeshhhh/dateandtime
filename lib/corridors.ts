import popularPairsData from '@/data/popular-pairs.json';
import { getPlaceBySlug, Place, formatPlaceWithZone } from '@/lib/places';

export interface RegionalCorridorGroup {
  regionName: string;
  description: string;
  pairs: Array<{
    fromSlug: string;
    toSlug: string;
    fromPlace: Place;
    toPlace: Place;
    fromLabel: string;
    toLabel: string;
    timeDiffUrl: string;
    callPlannerUrl: string;
  }>;
}

export function getCorridorPairsGrouped(): RegionalCorridorGroup[] {
  const groups: Record<string, RegionalCorridorGroup> = {
    transatlantic: {
      regionName: 'Transatlantic Corridors (North America ↔ Europe)',
      description: 'The highest volume business and finance time routes connecting New York, London, Toronto, Paris and Frankfurt.',
      pairs: [],
    },
    transpacific: {
      regionName: 'Transpacific Corridors (North America ↔ Asia & Oceania)',
      description: 'Crucial technology and supply-chain corridors spanning San Francisco, Tokyo, Sydney, Singapore and Seoul.',
      pairs: [],
    },
    eurasia: {
      regionName: 'Eurasia & Middle East Corridors (Europe ↔ Asia)',
      description: 'Strategic trade and aviation routes linking London, Berlin, Dubai, Tokyo, Hong Kong and Singapore.',
      pairs: [],
    },
    southAsiaGulf: {
      regionName: 'India, South Asia & Gulf Corridors (IST & GST)',
      description: 'Global IT service corridors, software engineering teams, and GCC collaboration corridors connecting India, UAE and the world.',
      pairs: [],
    },
    northAmerica: {
      regionName: 'North American Regional Corridors',
      description: 'Cross-zone time differences between Eastern, Central, Mountain and Pacific hubs in the United States and Canada.',
      pairs: [],
    },
    europeRegional: {
      regionName: 'Europe & UK Regional Corridors',
      description: 'Intercity and international routes across GMT, CET and EET time zones.',
      pairs: [],
    },
    latinAmericaAfrica: {
      regionName: 'Latin America, Africa & Global South Corridors',
      description: 'Time synchronization across São Paulo, Mexico City, Johannesburg, Lagos, Cairo and Buenos Aires.',
      pairs: [],
    },
    globalOther: {
      regionName: 'Global International Corridors',
      description: 'Worldwide flight and communication links across diverse time zones.',
      pairs: [],
    },
  };

  for (const item of popularPairsData) {
    const fromPlace = getPlaceBySlug(item.from);
    const toPlace = getPlaceBySlug(item.to);
    if (!fromPlace || !toPlace) continue;

    const fromLabel = formatPlaceWithZone(fromPlace);
    const toLabel = formatPlaceWithZone(toPlace);
    const timeDiffUrl = `/time-difference/${item.from}-to-${item.to}`;
    const callPlannerUrl = `/best-time-to-call/${item.to}-from-${item.from}`;

    const c1 = fromPlace.continent || '';
    const c2 = toPlace.continent || '';
    const isIndiaOrGulf =
      fromPlace.countrySlug === 'india' ||
      toPlace.countrySlug === 'india' ||
      fromPlace.countrySlug === 'united-arab-emirates' ||
      toPlace.countrySlug === 'united-arab-emirates';

    const pairEntry = {
      fromSlug: item.from,
      toSlug: item.to,
      fromPlace,
      toPlace,
      fromLabel,
      toLabel,
      timeDiffUrl,
      callPlannerUrl,
    };

    if (isIndiaOrGulf) {
      groups.southAsiaGulf.pairs.push(pairEntry);
    } else if (
      (c1 === 'North America' && c2 === 'Europe') ||
      (c1 === 'Europe' && c2 === 'North America')
    ) {
      groups.transatlantic.pairs.push(pairEntry);
    } else if (
      (c1 === 'North America' && (c2 === 'Asia' || c2 === 'Oceania')) ||
      ((c1 === 'Asia' || c1 === 'Oceania') && c2 === 'North America')
    ) {
      groups.transpacific.pairs.push(pairEntry);
    } else if (
      (c1 === 'Europe' && (c2 === 'Asia' || c2 === 'Oceania')) ||
      ((c1 === 'Asia' || c1 === 'Oceania') && c2 === 'Europe')
    ) {
      groups.eurasia.pairs.push(pairEntry);
    } else if (c1 === 'North America' && c2 === 'North America') {
      groups.northAmerica.pairs.push(pairEntry);
    } else if (c1 === 'Europe' && c2 === 'Europe') {
      groups.europeRegional.pairs.push(pairEntry);
    } else if (
      c1 === 'South America' ||
      c2 === 'South America' ||
      c1 === 'Africa' ||
      c2 === 'Africa'
    ) {
      groups.latinAmericaAfrica.pairs.push(pairEntry);
    } else {
      groups.globalOther.pairs.push(pairEntry);
    }
  }

  // Filter out any empty group
  return Object.values(groups).filter((g) => g.pairs.length > 0);
}
