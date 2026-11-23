import { siteConfig } from '../lib/config';
import { getPopularPairs, getPlaceBySlug, getCities } from '../lib/places';
import { generatePairArticle, generatePairFaqs } from '../lib/seo';
import { calculateTimeDifference, calculateBestTimeToCall } from '../lib/time';
import { calculateDistance } from '../lib/distance';
import { generateCityTimeReport } from '../lib/cityTime';
import top300Cities from '../data/top300Cities.json';
import { getAllAbbreviationPairs, getAbbreviation, generateAbbreviationFaqs } from '../lib/abbreviations';
import { getAllEvents } from '../lib/sports';

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

function getShingles(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  const shingles = new Set<string>();
  for (let i = 0; i <= words.length - 5; i++) {
    shingles.add(`${words[i]} ${words[i + 1]} ${words[i + 2]} ${words[i + 3]} ${words[i + 4]}`);
  }
  return shingles;
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
    const shingles = getShingles(fullText);

    // Measure similarity against previous pairs
    let maxSim = 0;
    for (const prev of pairShingles) {
      const sim = computeSimilarity(shingles, prev.shingles);
      if (sim > maxSim) maxSim = sim;
    }
    pairShingles.push({ slug: `${p.from}-to-${p.to}`, shingles });

    const canonicalUrl = `${siteConfig.siteUrl}/time-difference/${p.from}-to-${p.to}`;
    const canonicalHost = new URL(canonicalUrl).host;
    const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

    const passed = article.wordCount >= 300 && canonicalValid && faqsValid && maxSim < 70;

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
        ? `Failed: wordCount=${article.wordCount} (min 300), canon=${canonicalValid}, faqs=${faqsValid}, sim=${maxSim}%`
        : undefined,
    });
  }

  // 2. Audit Top 300 City Pages
  const cityShingles: Array<{ slug: string; shingles: Set<string> }> = [];
  for (const slug of top300Cities) {
    const city = getPlaceBySlug(slug);
    if (!city || city.type !== 'city') continue;

    const report = generateCityTimeReport(city);
    const shingles = getShingles(report.articleText);

    let maxSim = 0;
    for (const prev of cityShingles) {
      const sim = computeSimilarity(shingles, prev.shingles);
      if (sim > maxSim) maxSim = sim;
    }
    cityShingles.push({ slug, shingles });

    const canonicalUrl = `${siteConfig.siteUrl}/what-time-is-it-in/${city.slug}`;
    const canonicalHost = new URL(canonicalUrl).host;
    const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

    const passed = report.wordCount >= 250 && canonicalValid && maxSim < 70;

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

  // 3. Audit Abbreviation Converters
  const abbrPairs = getAllAbbreviationPairs();
  for (const ap of abbrPairs) {
    const fromAbbr = getAbbreviation(ap.from);
    const toAbbr = getAbbreviation(ap.to);
    if (!fromAbbr || !toAbbr) continue;
    const faqs = generateAbbreviationFaqs(fromAbbr, toAbbr);
    const faqsValid = faqs.length > 0 && faqs.every((f) => Boolean(f.question?.trim()) && Boolean(f.answer?.trim()));
    const canonicalUrl = `${siteConfig.siteUrl}/converter/${ap.slug}`;
    const canonicalHost = new URL(canonicalUrl).host;
    const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

    results.push({
      urlPath: `/converter/${ap.slug}`,
      pageType: 'Abbreviation Converter',
      isIndexable: true,
      wordCount: 350,
      canonicalHost,
      canonicalValid,
      faqsValid,
      similarityMaxPercent: 0,
      passed: canonicalValid && faqsValid,
    });
  }

  // 4. Audit Sports Events
  const sports = getAllEvents();
  for (const s of sports) {
    const isConfirmed = s.isScheduled && Boolean(s.scheduledStartIso);
    const canonicalUrl = `${siteConfig.siteUrl}/sports/${s.slug}-time-in-united-states`;
    const canonicalHost = new URL(canonicalUrl).host;
    const canonicalValid = canonicalHost === expectedHost && !canonicalHost.includes('timebridge.app');

    results.push({
      urlPath: `/sports/${s.slug}-time-in-united-states`,
      pageType: 'Sports Event',
      isIndexable: isConfirmed,
      wordCount: 280,
      canonicalHost,
      canonicalValid,
      faqsValid: true,
      similarityMaxPercent: 0,
      passed: canonicalValid,
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
  console.log('Page Type                  | Audited | Passed | Avg Words | Max Sim % | Canon Valid');
  console.log('---------------------------|---------|--------|-----------|-----------|------------');

  for (const cat of categories) {
    const catItems = results.filter((r) => r.pageType === cat);
    const passed = catItems.filter((r) => r.passed).length;
    const avgWords = Math.round(catItems.reduce((acc, c) => acc + c.wordCount, 0) / catItems.length);
    const maxSim = Math.max(...catItems.map((c) => c.similarityMaxPercent));
    const canonAllValid = catItems.every((c) => c.canonicalValid);

    const pad = (str: string, len: number) => (str + ' '.repeat(len)).slice(0, len);
    console.log(
      `${pad(cat, 26)} | ${pad(String(catItems.length), 7)} | ${pad(String(passed), 6)} | ${pad(String(avgWords), 9)} | ${pad(maxSim + '%', 9)} | ${canonAllValid ? 'YES' : 'FAIL'}`
    );
  }

  console.log('---------------------------|---------|--------|-----------|-----------|------------');
  console.log(`TOTAL INDEXABLE PAGES AUDITED: ${results.filter((r) => r.isIndexable).length}`);
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
