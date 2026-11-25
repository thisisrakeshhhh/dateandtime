#!/usr/bin/env node

/**
 * TimeBridge Production Smoke Test Suite
 * Usage: node scripts/smoke-test.mjs [baseUrl]
 * Example: node scripts/smoke-test.mjs https://dateandtime-sable.vercel.app
 */

const rawArg = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || 'https://dateandtime-sable.vercel.app';
const baseUrl = rawArg.replace(/\/+$/, '');
const baseHost = new URL(baseUrl).host;

console.log('========================================================================');
console.log('                 TIMEBRIDGE PRODUCTION SMOKE TEST                       ');
console.log(` Target Host : ${baseHost}`);
console.log(` Base URL    : ${baseUrl}`);
console.log('========================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function report(name, passed, detail = '') {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`[PASS] ${name}${detail ? ` (${detail})` : ''}`);
  } else {
    failedChecks++;
    console.error(`[FAIL] ${name}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function fetchSafe(url, options = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'TimeBridge-SmokeTest/1.0',
          ...(options.headers || {}),
        },
      });
      return res;
    } catch (err) {
      if (attempt === retries) return null;
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  return null;
}

function extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match ? match[1] : null;
}

function extractOgUrl(html) {
  const match = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i) ||
                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i);
  return match ? match[1] : null;
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractRobots(html) {
  const match = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i) ||
                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
  return match ? match[1].toLowerCase() : '';
}

async function runSmokeTests() {
  // ---------------------------------------------------------------------------
  // Check 1: 200 OK on Essential Routes
  // ---------------------------------------------------------------------------
  console.log('--- 1. Testing Core Route HTTP Status Codes ---');
  const routesToTest = [
    '/',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/converter',
    '/converter/est-to-ist',
    '/shift-converter',
    '/event',
    '/jet-lag-calculator',
    '/all-corridors',
    '/cities',
    '/countries',
    '/sports',
    '/time-difference/new-york-to-london',
    '/what-time-is-it-in/london',
    '/daylight-saving-time/united-states',
    '/robots.txt',
    '/sitemap/core.xml',
  ];

  for (const path of routesToTest) {
    const res = await fetchSafe(`${baseUrl}${path}`);
    const ok = res && res.status === 200;
    report(`HTTP 200 for ${path}`, ok, res ? `status ${res.status}` : 'network error');
  }

  // ---------------------------------------------------------------------------
  // Check 2: 404 for Random Non-Existent Route
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Testing 404 Error Handling ---');
  const nonExistentPath = `/non-existent-page-${Date.now()}`;
  const res404 = await fetchSafe(`${baseUrl}${nonExistentPath}`);
  report(
    'Random non-existent page returns HTTP 404',
    res404 && res404.status === 404,
    res404 ? `status ${res404.status}` : 'network error'
  );

  // ---------------------------------------------------------------------------
  // Check 3: Canonical URLs on Homepage and 5 Sample Pages
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Testing Self-Referencing Canonical Tags ---');
  const canonicalCheckPages = [
    '/',
    '/about',
    '/converter/est-to-ist',
    '/time-difference/new-york-to-london',
    '/what-time-is-it-in/london',
    '/all-corridors',
  ];

  const foreignHosts = ['vercel.app', 'timebridge.app'].filter((h) => !baseHost.includes(h));

  for (const path of canonicalCheckPages) {
    const res = await fetchSafe(`${baseUrl}${path}`);
    if (!res || res.status !== 200) {
      report(`Canonical on ${path}`, false, 'Page did not return 200');
      continue;
    }
    const html = await res.text();
    const canonical = extractCanonical(html);
    const startsWithBase = canonical && (canonical.startsWith(baseUrl) || canonical.replace(/^https?:\/\//, '').startsWith(baseHost));
    const hasForeign = foreignHosts.some((fh) => canonical && canonical.includes(fh));
    const valid = startsWithBase && !hasForeign;
    report(`Canonical on ${path}`, valid, canonical || 'none');
  }

  // ---------------------------------------------------------------------------
  // Check 3b: Social Tags (og:url === canonical) and No Duplicated Brand in Titles
  // ---------------------------------------------------------------------------
  console.log('\n--- 3b. Testing Social Tags (og:url === canonical) and Non-Duplicated Brand in Titles ---');
  const socialCheckPages = [
    '/',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/converter',
    '/converter/est-to-ist',
    '/time-difference/new-york-to-london',
    '/what-time-is-it-in/london',
    '/all-corridors',
  ];

  for (const path of socialCheckPages) {
    const res = await fetchSafe(`${baseUrl}${path}`);
    if (!res || res.status !== 200) {
      report(`Social tags & Title on ${path}`, false, 'Page did not return 200');
      continue;
    }
    const html = await res.text();
    const canonical = extractCanonical(html);
    const ogUrl = extractOgUrl(html);
    const title = extractTitle(html);

    // 1. og:url must match canonical
    const ogUrlMatches = Boolean(
      canonical && ogUrl &&
      (ogUrl === canonical || ogUrl.replace(/^https?:\/\//, '') === canonical.replace(/^https?:\/\//, ''))
    );
    report(`og:url matches canonical on ${path}`, ogUrlMatches, `og:url: ${ogUrl || 'none'} | canonical: ${canonical || 'none'}`);

    // 2. Title must not duplicate brand (e.g. "TimeBridge | TimeBridge" or "| TimeBridge | TimeBridge")
    const brandOccurrences = (title.match(/TimeBridge/gi) || []).length;
    const hasDuplicatedBrand = brandOccurrences > 1 || /\|\s*TimeBridge\s*\|\s*TimeBridge/i.test(title);
    report(`No duplicated brand in title on ${path}`, !hasDuplicatedBrand, `title: "${title}"`);
  }

  // ---------------------------------------------------------------------------
  // Check 4: robots.txt and Sitemap Validation
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Testing robots.txt and Sitemaps ---');
  const robotsRes = await fetchSafe(`${baseUrl}/robots.txt`);
  const sitemaps = [];

  if (robotsRes && robotsRes.status === 200) {
    const robotsText = await robotsRes.text();
    const sitemapMatches = robotsText.matchAll(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
    for (const m of sitemapMatches) {
      sitemaps.push(m[1].trim());
    }
  }

  report(
    'robots.txt lists sitemap URLs on base host',
    sitemaps.length > 0 && sitemaps.every((sm) => sm.includes(baseHost)),
    `${sitemaps.length} sitemaps found`
  );

  const allSitemapUrls = new Set();

  for (const sitemapUrl of sitemaps) {
    const fetchUrl = sitemapUrl.startsWith('https://localhost') && baseUrl.startsWith('http://localhost')
      ? sitemapUrl.replace('https://localhost', 'http://localhost')
      : sitemapUrl;
    const smRes = await fetchSafe(fetchUrl);
    if (!smRes || smRes.status !== 200) {
      report(`Sitemap ${sitemapUrl} returns 200`, false, smRes ? `status ${smRes.status}` : 'error');
      continue;
    }
    const xml = await smRes.text();
    const locMatches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
    locMatches.forEach((u) => allSitemapUrls.add(u));

    const hasBaseLoc = locMatches.length > 0 && locMatches.some((u) => u.includes(baseHost));
    report(`Sitemap ${sitemapUrl.replace(baseUrl, '')} has <loc> on base host`, hasBaseLoc, `${locMatches.length} URLs`);

    // Sample up to 5 URLs from each sitemap
    const sampleUrls = locMatches.slice(0, 5);
    for (const sampleUrl of sampleUrls) {
      const sampleFetchUrl = sampleUrl.startsWith('https://localhost') && baseUrl.startsWith('http://localhost')
        ? sampleUrl.replace('https://localhost', 'http://localhost')
        : sampleUrl;
      const sampleRes = await fetchSafe(sampleFetchUrl);
      const isOk = sampleRes && sampleRes.status === 200;
      report(`  Sample URL in sitemap returns 200: ${sampleUrl.replace(baseUrl, '')}`, isOk);
    }
  }

  // ---------------------------------------------------------------------------
  // Check 5: Reverse Pair & Best Time to Call Canonical and Sitemap Exclusion
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Testing Reverse Pairs and Best-Time-To-Call Canonical Rules ---');
  const targetPath = '/time-difference/new-york-to-london';

  // Reverse pair: london-to-new-york points canonical to new-york-to-london
  const revPairUrl = `${baseUrl}/time-difference/london-to-new-york`;
  const revRes = await fetchSafe(revPairUrl);
  if (revRes && revRes.status === 200) {
    const revHtml = await revRes.text();
    const revCanonical = extractCanonical(revHtml);
    const pointsToPrimary = revCanonical && (revCanonical === `${baseUrl}${targetPath}` || revCanonical.replace(/^https?:\/\/[^/]+/, '') === targetPath);
    report('Reverse pair points canonical to Tier-1 primary', pointsToPrimary, revCanonical || 'none');
  } else {
    report('Reverse pair points canonical to Tier-1 primary', false, 'Could not fetch');
  }

  const isRevInSitemap = [...allSitemapUrls].some(u => u.includes('/time-difference/london-to-new-york'));
  report('Reverse pair is NOT in any sitemap', !isRevInSitemap);

  // Best time to call: london-from-new-york points to time-difference/new-york-to-london
  const bttcUrl = `${baseUrl}/best-time-to-call/london-from-new-york`;
  const bttcRes = await fetchSafe(bttcUrl);
  if (bttcRes && bttcRes.status === 200) {
    const bttcHtml = await bttcRes.text();
    const bttcCanonical = extractCanonical(bttcHtml);
    const bttcValid = bttcCanonical && (bttcCanonical === `${baseUrl}${targetPath}` || bttcCanonical.replace(/^https?:\/\/[^/]+/, '') === targetPath);
    report('Best time to call points canonical to primary time-difference page', bttcValid, bttcCanonical || 'none');
  } else {
    report('Best time to call points canonical to primary time-difference page', false, 'Could not fetch');
  }

  const isBttcInSitemap = [...allSitemapUrls].some(u => u.includes('/best-time-to-call/london-from-new-york'));
  report('Best time to call is NOT in any sitemap', !isBttcInSitemap);

  // ---------------------------------------------------------------------------
  // Check 6: TBC Sports Event is Noindex and Excluded from Sitemap
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Testing Sports TBC Event Noindex & Sitemap Exclusion ---');
  const tbcSportsPath = '/sports/super-bowl-time-in-united-states';
  const tbcSportsUrl = `${baseUrl}${tbcSportsPath}`;
  const tbcRes = await fetchSafe(tbcSportsUrl);
  if (tbcRes && tbcRes.status === 200) {
    const tbcHtml = await tbcRes.text();
    const tbcRobots = extractRobots(tbcHtml);
    const isNoindex = tbcRobots.includes('noindex');
    report('TBC sports event has noindex robots meta', isNoindex, tbcRobots || 'no robots tag');
  } else {
    report('TBC sports event has noindex robots meta', false, 'Could not fetch');
  }

  const isTbcInSitemap = allSitemapUrls.has(tbcSportsUrl);
  report('TBC sports event is NOT in sports sitemap', !isTbcInSitemap);

  // ---------------------------------------------------------------------------
  // Check 7: Shared Event Links with Parameters are Noindex
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. Testing Shared Event Links Query Parameters Noindex ---');
  const sharedEventPath = '/event?title=Global+Sync&start=2026-12-01T15:00:00Z';
  const sharedEventRes = await fetchSafe(`${baseUrl}${sharedEventPath}`);
  if (sharedEventRes && sharedEventRes.status === 200) {
    const sharedHtml = await sharedEventRes.text();
    const sharedRobots = extractRobots(sharedHtml);
    report('/event?... query link has noindex meta', sharedRobots.includes('noindex'), sharedRobots || 'none');
  } else {
    report('/event?... query link has noindex meta', false, 'Could not fetch');
  }

  // ---------------------------------------------------------------------------
  // Check 8: No Placeholder or Leaked Strings in Page Bodies
  // ---------------------------------------------------------------------------
  console.log('\n--- 8. Testing for Leaked Placeholder Strings & Content Cleanliness (20 Pages) ---');
  const forbiddenStrings = [
    '{{',
    '}}',
    'TODO',
    'TBD',
    'lorem',
    'TimeBridgeintegrates',
    'Place A',
    'Place B',
    'undefined',
    'NaN',
    '[object Object]',
  ];
  const twentySamplePaths = [
    '/',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/converter',
    '/converter/est-to-ist',
    '/time-difference/new-york-to-london',
    '/what-time-is-it-in/london',
    '/shift-converter',
    '/all-corridors',
    '/cities',
    '/countries',
    '/sports',
    '/sports/wimbledon-mens-final-time-in-united-states',
    '/daylight-saving-time/united-states',
    '/jet-lag-calculator',
    '/event',
    '/us-shift-timings-in-ist',
    '/uk-shift-timings-in-ist',
  ];

  let anyForbiddenFound = false;

  for (const path of twentySamplePaths) {
    const res = await fetchSafe(`${baseUrl}${path}`);
    if (!res || res.status !== 200) {
      report(`Clean body on ${path}`, false, 'Page did not return 200');
      anyForbiddenFound = true;
      continue;
    }
    const html = await res.text();
    // Exclude next script JSON bundles or inline script code, check visible text
    const bodyContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    const foundBad = [];
    for (const bad of forbiddenStrings) {
      if (bodyContent.includes(bad)) {
        foundBad.push(bad);
      }
    }
    const isClean = foundBad.length === 0;
    if (!isClean) anyForbiddenFound = true;
    report(`Clean body on ${path}`, isClean, isClean ? 'clean' : `found: ${foundBad.join(', ')}`);
  }

  // ---------------------------------------------------------------------------
  // Check 9: Exactly One <h1> on Homepage and Pair Page
  // ---------------------------------------------------------------------------
  console.log('\n--- 9. Testing <h1> Tag Count ---');
  const h1Pages = ['/', '/time-difference/new-york-to-london'];
  for (const path of h1Pages) {
    const res = await fetchSafe(`${baseUrl}${path}`);
    if (res && res.status === 200) {
      const html = await res.text();
      const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
      report(`Page ${path} has exactly one <h1>`, h1Count === 1, `found ${h1Count}`);
    } else {
      report(`Page ${path} has exactly one <h1>`, false, 'Could not fetch');
    }
  }

  // ---------------------------------------------------------------------------
  // Check 10: /api/contact Empty Body Validation
  // ---------------------------------------------------------------------------
  console.log('\n--- 10. Testing Contact API Validation ---');
  const contactRes = await fetchSafe(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const isContactExpected = contactRes && (contactRes.status === 400 || contactRes.status === 503);
  report(
    '/api/contact with empty body returns 400 or 503 (not 200 or 500)',
    isContactExpected,
    contactRes ? `status ${contactRes.status}` : 'network error'
  );

  // ---------------------------------------------------------------------------
  // Check 11: Security Headers on Homepage
  // ---------------------------------------------------------------------------
  console.log('\n--- 11. Testing Production Security Headers on Homepage ---');
  const homeRes = await fetchSafe(`${baseUrl}/`);
  if (homeRes) {
    const h = homeRes.headers;
    report('X-Content-Type-Options: nosniff', h.get('x-content-type-options') === 'nosniff');
    report('Referrer-Policy: strict-origin-when-cross-origin', h.get('referrer-policy') === 'strict-origin-when-cross-origin');
    report('X-Frame-Options: SAMEORIGIN', h.get('x-frame-options') === 'SAMEORIGIN');
    report('Strict-Transport-Security present', Boolean(h.get('strict-transport-security')));
    const perm = h.get('permissions-policy') || '';
    report('Permissions-Policy disables camera, microphone and payment', perm.includes('camera=()') && perm.includes('microphone=()') && perm.includes('payment=()'));
  } else {
    report('Homepage headers accessible', false, 'Could not fetch homepage');
  }

  // ---------------------------------------------------------------------------
  // Final Summary
  // ---------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`TOTAL CHECKS  : ${totalChecks}`);
  console.log(`PASSED CHECKS : ${passedChecks}`);
  console.log(`FAILED CHECKS : ${failedChecks}`);
  console.log('========================================================================\n');

  if (failedChecks > 0) {
    console.error(`SMOKE TEST FAILED with ${failedChecks} issue(s).`);
    process.exit(1);
  } else {
    console.log('ALL SMOKE TEST CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runSmokeTests();
