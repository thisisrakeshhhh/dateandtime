import { siteConfig } from '../lib/config';
import { getPopularPairs, getPlaceBySlug, getCountries } from '../lib/places';
import { generatePairArticle, generatePairFaqs } from '../lib/seo';
import { calculateTimeDifference, calculateBestTimeToCall } from '../lib/time';
import { calculateDistance } from '../lib/distance';
import { generateCityTimeReport } from '../lib/cityTime';
import top300Cities from '../data/top300Cities.json';
import {
  getAllAbbreviationPairs,
  getAbbreviation,
  calculateAbbreviationConversion,
  generateAbbreviationFaqs,
} from '../lib/abbreviations';
import { getAllEvents, generateSportsEventReport, TARGET_VIEWER_COUNTRIES } from '../lib/sports';
import { generateCountryArticle } from '../lib/countryContent';
import { generateDSTReport } from '../lib/dstReport';

interface AuditResult {
  urlPath: string;
  pageType: string;
  isIndexable: boolean;
  wordCount: number;
  canonicalHost: string;
  canonicalValid: boolean;
  faqsValid: boolean;
  similarityMaxPercent: number;
  passed: boolean;
  failureReason?: string;
}

// Function to compute Jaccard similarity of 5-grams of content words (excluding common stop words)
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for', 'with', 'from', 'by', 'this', 'that', 'it', 'be', 'are', 'as', 'will', 'has', 'have', 'there'
]);

function getShingles(text: string): { shingles: Set<string>; wordCount: number } {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  const shingles = new Set<string>();
  for (let i = 0; i <= words.length - 5; i++) {
    shingles.add(`${words[i]} ${words[i + 1]} ${words[i + 2]} ${words[i + 3]} ${words[i + 4]}`);
  }
  return { shingles, wordCount: words.length };
}

function computeSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const s of setA) {
    if (setB.has(s)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

export function runContentAudit(): { results: AuditResult[]; allPassed: boolean } {
  const results: AuditResult[] = [];
  const expectedHost = new URL(siteConfig.siteUrl).host;

  console.log(`Starting Content Quality Audit against canonical host: ${expectedHost}`);

  // 1. Audit Tier 1 Pairs
  const allPairs = getPopularPairs();
  const tier1Pairs = allPairs.filter((p) => p.tier === 1);
  const pairShingles: Array<{ slug: string; shingles: Set<string> }> = [];

  for (const p of tier1Pairs) {
    const placeA = getPlaceBySlug(p.from);
    const placeB = getPlaceBySlug(p.to);
    if (!placeA || !placeB) continue;

    const diff = calculateTimeDifference(
      placeA.timezone,
      placeB.timezone,
      placeA.lat,
      placeA.lng,
      placeB.lat,
      placeB.lng,
      undefined,
      placeA.name,
      placeB.name
    );
    const bestTime = calculateBestTimeToCall(
      placeA.timezone,
      placeB.timezone,
      placeA.name,
      placeB.name,
      placeA.lat,
      placeA.lng,
      placeB.lat,
      placeB.lng
    );
    const dist = calculateDistance(placeA.lat, placeA.lng, placeB.lat, placeB.lng);

    const article = generatePairArticle(placeA, placeB, diff, bestTime, dist);
    const faqs = generatePairFaqs(placeA, placeB, diff, bestTime, dist);

    const faqsValid = faqs.length > 0 && faqs.every((f) => Boolean(f.question?.trim()) && Boolean(f.answer?.trim()));
    const fullText = `${article.h1} ${diff.verbalSummary} ${article.paragraphs.join(' ')}`;
    const { shingles } = getShingles(fullText);

    let maxSim = 0;
    for (const prev of pairShingles) {
      const sim = computeSimilarity(shingles, prev.shingles);
      if (sim > maxSim) maxSim = sim;
    }
    pairShingles.push({ slug: `${p.from}-to-${p.to}`, shingles });

    const canonicalUrl = `${siteConfig.siteUrl}/time-difference/${p.from}-to-${p.to}`;
    const canonicalHost = new URL(canonicalUrl).host;
    const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

    const passed = article.wordCount >= 250 && canonicalValid && faqsValid && maxSim <= 60;

    results.push({
      urlPath: `/time-difference/${p.from}-to-${p.to}`,
      pageType: 'Pair (Tier 1)',
      isIndexable: true,
      wordCount: article.wordCount,
      canonicalHost,
      canonicalValid,
      faqsValid,
      similarityMaxPercent: maxSim,
      passed,
      failureReason: !passed
        ? `Failed: wordCount=${article.wordCount} (min 250), canon=${canonicalValid}, faqs=${faqsValid}, sim=${maxSim}%`
        : undefined,
    });
  }

  // 2. Audit Top 300 City Pages
  const cityShingles: Array<{ slug: string; shingles: Set<string> }> = [];
  for (const slug of top300Cities) {
    const city = getPlaceBySlug(slug);
    if (!city || city.type !== 'city') continue;

    const report = generateCityTimeReport(city);
    const { shingles } = getShingles(report.articleText);

    let maxSim = 0;
    for (const prev of cityShingles) {
      const sim = computeSimilarity(shingles, prev.shingles);
      if (sim > maxSim) maxSim = sim;
    }
    cityShingles.push({ slug, shingles });

    const canonicalUrl = `${siteConfig.siteUrl}/what-time-is-it-in/${city.slug}`;
    const canonicalHost = new URL(canonicalUrl).host;
    const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

    const passed = report.wordCount >= 250 && canonicalValid && maxSim <= 60;

    results.push({
      urlPath: `/what-time-is-it-in/${city.slug}`,
      pageType: 'City Clock',
      isIndexable: true,
      wordCount: report.wordCount,
      canonicalHost,
      canonicalValid,
      faqsValid: true,
      similarityMaxPercent: maxSim,
      passed,
      failureReason: !passed ? `Failed: wordCount=${report.wordCount}, sim=${maxSim}%` : undefined,
    });
  }

  // 3. Audit Abbreviation Converters (computed against all other converter pages)
  const abbrPairs = getAllAbbreviationPairs();
  const converterItems: Array<{
    pairSlug: string;
    fromCode: string;
    toCode: string;
    text: string;
    faqsValid: boolean;
    canonicalHost: string;
    canonicalValid: boolean;
    shingles: Set<string>;
    wordCount: number;
  }> = [];

  for (const ap of abbrPairs) {
    const fromAbbr = getAbbreviation(ap.from);
    const toAbbr = getAbbreviation(ap.to);
    if (!fromAbbr || !toAbbr) continue;

    const conv = calculateAbbreviationConversion(fromAbbr.code, toAbbr.code, '2026-11-23', '12:00');
    const faqs = generateAbbreviationFaqs(fromAbbr, toAbbr, '2026-11-23');
    const faqsValid = faqs.length > 0 && faqs.every((f) => Boolean(f.question?.trim()) && Boolean(f.answer?.trim()));

    const text = [
      `${fromAbbr.code} to ${toAbbr.code} Time Zone Converter`,
      `${fromAbbr.name} (${fromAbbr.standardOffset}) to ${toAbbr.name} (${toAbbr.standardOffset})`,
      conv?.oneLineAnswer || '',
      `Offset difference: ${conv?.diffFormatted || ''}. Calculated using official IANA database: ${fromAbbr.defaultIana} to ${toAbbr.defaultIana}`,
      `Seasonal notice for ${fromAbbr.code} (${fromAbbr.name}): ${fromAbbr.seasonalWarning} Ambiguity: ${fromAbbr.ambiguityWarning}`,
      `Seasonal notice for ${toAbbr.code} (${toAbbr.name}): ${toAbbr.seasonalWarning} Ambiguity: ${toAbbr.ambiguityWarning}`,
      `Cities observing ${fromAbbr.code}: When observed: ${fromAbbr.whenObserved}. Major metropolitan areas: ${fromAbbr.majorCities.map((c) => `${c.name} ${c.country}`).join(', ')}`,
      `Cities observing ${toAbbr.code}: When observed: ${toAbbr.whenObserved}. Major metropolitan areas: ${toAbbr.majorCities.map((c) => `${c.name} ${c.country}`).join(', ')}`,
      faqs.map((f) => `${f.question} ${f.answer}`).join(' '),
    ].join(' ');

    const { shingles, wordCount } = getShingles(text);
    const canonicalUrl = `${siteConfig.siteUrl}/converter/${ap.slug}`;
    const canonicalHost = new URL(canonicalUrl).host;
    const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

    converterItems.push({
      pairSlug: ap.slug,
      fromCode: fromAbbr.code,
      toCode: toAbbr.code,
      text,
      faqsValid,
      canonicalHost,
      canonicalValid,
      shingles,
      wordCount,
    });
  }

  // Cross-compare every converter page against all other converter pages
  for (let i = 0; i < converterItems.length; i++) {
    let maxSim = 0;
    for (let j = 0; j < converterItems.length; j++) {
      if (i === j) continue;
      const sim = computeSimilarity(converterItems[i].shingles, converterItems[j].shingles);
      if (sim > maxSim) maxSim = sim;
    }

    const item = converterItems[i];
    const passed = item.wordCount >= 250 && item.canonicalValid && item.faqsValid && maxSim <= 60;

    results.push({
      urlPath: `/converter/${item.pairSlug}`,
      pageType: 'Abbreviation Converter',
      isIndexable: true,
      wordCount: item.wordCount,
      canonicalHost: item.canonicalHost,
      canonicalValid: item.canonicalValid,
      faqsValid: item.faqsValid,
      similarityMaxPercent: maxSim,
      passed,
      failureReason: !passed
        ? `Failed: wordCount=${item.wordCount} (min 250), canon=${item.canonicalValid}, faqs=${item.faqsValid}, sim=${maxSim}%`
        : undefined,
    });
  }

  // 4. Audit Sports Events (Confirmed events in US, UK, India, Australia + TBC pages)
  const sports = getAllEvents();
  const sportsItems: Array<{
    urlPath: string;
    slug: string;
    countrySlug: string;
    isIndexable: boolean;
    wordCount: number;
    shingles: Set<string>;
    canonicalHost: string;
    canonicalValid: boolean;
    faqsValid: boolean;
  }> = [];

  for (const s of sports) {
    const isConfirmed =
      s.status === 'confirmed' &&
      Boolean(s.isScheduled) &&
      Boolean(s.scheduledStartIso) &&
      Boolean(s.sourceUrl) &&
      new Date(s.scheduledStartIso).getTime() > Date.now();

    if (isConfirmed) {
      for (const countrySlug of TARGET_VIEWER_COUNTRIES) {
        const report = generateSportsEventReport(s, countrySlug);
        if (!report) continue;

        const { shingles, wordCount } = getShingles(report.fullText);
        const canonicalUrl = `${siteConfig.siteUrl}/sports/${s.slug}-time-in-${countrySlug}`;
        const canonicalHost = new URL(canonicalUrl).host;
        const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');
        const faqsValid =
          report.faqs.length > 0 && report.faqs.every((f) => Boolean(f.question?.trim()) && Boolean(f.answer?.trim()));

        sportsItems.push({
          urlPath: `/sports/${s.slug}-time-in-${countrySlug}`,
          slug: s.slug,
          countrySlug,
          isIndexable: true,
          wordCount,
          shingles,
          canonicalHost,
          canonicalValid,
          faqsValid,
        });
      }
    } else {
      // TBC events: not indexable
      const report = generateSportsEventReport(s, 'united-states');
      if (!report) continue;
      const { shingles, wordCount } = getShingles(report.fullText);
      const canonicalUrl = `${siteConfig.siteUrl}/sports/${s.slug}-time-in-united-states`;
      const canonicalHost = new URL(canonicalUrl).host;
      const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

      sportsItems.push({
        urlPath: `/sports/${s.slug}-time-in-united-states`,
        slug: s.slug,
        countrySlug: 'united-states',
        isIndexable: false,
        wordCount,
        shingles,
        canonicalHost,
        canonicalValid,
        faqsValid: true,
      });
    }
  }

  // Cross-compare every indexable sports variant against all other indexable sports pages
  for (let i = 0; i < sportsItems.length; i++) {
    const item = sportsItems[i];
    let maxSim = 0;

    if (item.isIndexable) {
      for (let j = 0; j < sportsItems.length; j++) {
        if (i === j || !sportsItems[j].isIndexable) continue;
        const sim = computeSimilarity(item.shingles, sportsItems[j].shingles);
        if (sim > maxSim) maxSim = sim;
      }
    }

    const passed =
      !item.isIndexable || (item.wordCount >= 250 && item.canonicalValid && item.faqsValid && maxSim <= 60);

    results.push({
      urlPath: item.urlPath,
      pageType: 'Sports Event',
      isIndexable: item.isIndexable,
      wordCount: item.wordCount,
      canonicalHost: item.canonicalHost,
      canonicalValid: item.canonicalValid,
      faqsValid: item.faqsValid,
      similarityMaxPercent: maxSim,
      passed,
      failureReason: !passed
        ? `Failed: wordCount=${item.wordCount} (min 250), canon=${item.canonicalValid}, faqs=${item.faqsValid}, sim=${maxSim}%`
        : undefined,
    });
  }

  // 5. Audit Daylight Saving Time Pages
  const allCountries = getCountries();
  const dstShingles: Array<{ slug: string; shingles: Set<string> }> = [];
  for (const c of allCountries) {
    const report = generateDSTReport(c);
    const text = report.sections.map((s) => `${s.title} ${s.body}`).join(' ');
    const { shingles } = getShingles(text);

    let maxSim = 0;
    for (const prev of dstShingles) {
      const sim = computeSimilarity(shingles, prev.shingles);
      if (sim > maxSim) maxSim = sim;
    }
    dstShingles.push({ slug: c.slug, shingles });

    const canonicalUrl = `${siteConfig.siteUrl}/daylight-saving-time/${c.slug}`;
    const canonicalHost = new URL(canonicalUrl).host;
    const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

    const passed = report.wordCount >= 250 && canonicalValid && maxSim <= 60;

    results.push({
      urlPath: `/daylight-saving-time/${c.slug}`,
      pageType: 'Daylight Saving Time',
      isIndexable: true,
      wordCount: report.wordCount,
      canonicalHost,
      canonicalValid,
      faqsValid: true,
      similarityMaxPercent: maxSim,
      passed,
      failureReason: !passed ? `Failed: wordCount=${report.wordCount}, sim=${maxSim}%` : undefined,
    });
  }

  // 6. Audit Country Directory Pages
  const countryShingles: Array<{ slug: string; shingles: Set<string> }> = [];
  for (const c of allCountries) {
    const article = generateCountryArticle(c);
    const { shingles } = getShingles(article.fullText);

    let maxSim = 0;
    for (const prev of countryShingles) {
      const sim = computeSimilarity(shingles, prev.shingles);
      if (sim > maxSim) maxSim = sim;
    }
    countryShingles.push({ slug: c.slug, shingles });

    const canonicalUrl = `${siteConfig.siteUrl}/country/${c.slug}`;
    const canonicalHost = new URL(canonicalUrl).host;
    const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

    const passed = article.wordCount >= 250 && canonicalValid && maxSim <= 60;

    results.push({
      urlPath: `/country/${c.slug}`,
      pageType: 'Country Directory',
      isIndexable: true,
      wordCount: article.wordCount,
      canonicalHost,
      canonicalValid,
      faqsValid: true,
      similarityMaxPercent: maxSim,
      passed,
      failureReason: !passed ? `Failed: wordCount=${article.wordCount}, sim=${maxSim}%` : undefined,
    });
  }

  const failedCount = results.filter((r) => r.isIndexable && !r.passed).length;
  const allPassed = failedCount === 0;

  return { results, allPassed };
}

// CLI execution
if (require.main === module) {
  const { results, allPassed } = runContentAudit();

  console.log('\n========================================================================');
  console.log('                   TIMEBRIDGE CONTENT QUALITY AUDIT                      ');
  console.log('========================================================================');

  // Summary by category
  const categories = Array.from(new Set(results.map((r) => r.pageType)));
  console.log('Page Type                  | Indexable | Noindex | Passed | Avg Words | Max Sim % | Status');
  console.log('---------------------------|-----------|---------|--------|-----------|-----------|-------');

  for (const cat of categories) {
    const catItems = results.filter((r) => r.pageType === cat);
    const indexableCount = catItems.filter((r) => r.isIndexable).length;
    const noindexCount = catItems.filter((r) => !r.isIndexable).length;
    const passed = catItems.filter((r) => r.passed).length;
    const avgWords = Math.round(catItems.reduce((acc, c) => acc + c.wordCount, 0) / catItems.length);
    const maxSim = Math.max(...catItems.map((c) => c.similarityMaxPercent));
    const canonAllValid = catItems.every((c) => c.canonicalValid);

    const pad = (str: string, len: number) => (str + ' '.repeat(len)).slice(0, len);
    console.log(
      `${pad(cat, 26)} | ${pad(String(indexableCount), 9)} | ${pad(String(noindexCount), 7)} | ${pad(String(passed), 6)} | ${pad(String(avgWords), 9)} | ${pad(maxSim + '%', 9)} | ${passed === catItems.length && canonAllValid ? 'PASSED' : 'FAILED'}`
    );
  }

  // Calculate global totals including Tier 2 pairs and best-time-to-call
  const allPopularPairs = getPopularPairs();
  const tier2PairsCount = allPopularPairs.filter((p) => p.tier !== 1).length;
  const bestTimeToCallCount = allPopularPairs.length; // canonical duplicates
  const totalAudited = results.length;
  const totalIndexable = results.filter((r) => r.isIndexable).length;
  const totalNoindex = results.filter((r) => !r.isIndexable).length + tier2PairsCount + bestTimeToCallCount;

  console.log('---------------------------|-----------|---------|--------|-----------|-----------|-------');
  console.log(`Audited Routes:            | ${totalIndexable}       | ${results.filter((r) => !r.isIndexable).length}       | ${results.filter((r) => r.passed).length}    |           |           |`);
  console.log(`Global System Total:       | Indexable: ${totalIndexable} | Noindex: ${totalNoindex} (incl. ${tier2PairsCount} Tier-2 & ${bestTimeToCallCount} canonical duplicates)`);
  console.log(`OVERALL AUDIT STATUS: ${allPassed ? 'ALL PASSED (100%)' : 'FAILURES DETECTED'}`);
  console.log('========================================================================\n');

  if (!allPassed) {
    const failedItems = results.filter((r) => r.isIndexable && !r.passed);
    console.error(`ERROR: ${failedItems.length} pages failed content quality audit!`);
    failedItems.slice(0, 10).forEach((f) => console.error(`  - ${f.urlPath}: ${f.failureReason}`));
    process.exit(1);
  } else {
    console.log('Audit passed successfully! All indexable pages meet word count, canonical, FAQ, and similarity thresholds.');
    process.exit(0);
  }
}
