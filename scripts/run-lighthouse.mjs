import { execSync } from 'child_process';
import fs from 'fs';

const baseUrl = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const pages = [
  { name: 'Homepage', url: `${baseUrl}/` },
  { name: 'Pair (NY to London)', url: `${baseUrl}/time-difference/new-york-to-london` },
  { name: 'City (London)', url: `${baseUrl}/what-time-is-it-in/london` },
  { name: 'Converter (EST to IST)', url: `${baseUrl}/converter/est-to-ist` },
];

console.log('Running mobile Lighthouse audits...\n');

const results = [];

for (const p of pages) {
  console.log(`Auditing ${p.name}: ${p.url}`);
  const tmpFile = `lh-${Date.now()}.json`;
  try {
    execSync(
      `npx lighthouse ${p.url} --output=json --output-path=${tmpFile} --quiet --chrome-flags="--headless" --form-factor=mobile --screenEmulation.mobile=true --only-categories=performance,accessibility,seo`,
      { stdio: 'ignore', timeout: 90000 }
    );
    const data = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
    fs.unlinkSync(tmpFile);

    const perf = Math.round((data.categories.performance?.score || 0) * 100);
    const a11y = Math.round((data.categories.accessibility?.score || 0) * 100);
    const seo = Math.round((data.categories.seo?.score || 0) * 100);

    results.push({ name: p.name, url: p.url, perf, a11y, seo });
    console.log(`  -> Performance: ${perf}, Accessibility: ${a11y}, SEO: ${seo}\n`);
  } catch (err) {
    console.error(`  -> Failed to audit ${p.name}:`, err.message);
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

console.log('\n=============================================================');
console.log('               LIGHTHOUSE MOBILE AUDIT RESULTS               ');
console.log('=============================================================');
console.log('Page Route                     | Performance | Accessibility | SEO');
console.log('-------------------------------|-------------|---------------|----');
for (const r of results) {
  const pad = (s, l) => (s + ' '.repeat(l)).slice(0, l);
  console.log(`${pad(r.name, 30)} | ${pad(String(r.perf), 11)} | ${pad(String(r.a11y), 13)} | ${r.seo}`);
}
console.log('=============================================================\n');
