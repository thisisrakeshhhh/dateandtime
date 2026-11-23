const fs = require('fs');
const pairs = require('../data/popular-pairs.json');

const seenUndirected = new Map();
let tier1Count = 0;
let tier2Count = 0;

// High priority search origins
const priorityOrigins = ['united-states', 'new-york', 'united-kingdom', 'london', 'india', 'delhi', 'mumbai', 'california', 'los-angeles', 'sydney', 'australia', 'toronto', 'canada'];

// First pass: identify Tier 1 pairs (up to 120 unique undirected pairs, preferring primary search direction)
const tier1Pairs = new Set();

for (const p of pairs) {
  const key = [p.from, p.to].sort().join(':::');
  if (!seenUndirected.has(key) && tier1Count < 120) {
    seenUndirected.set(key, `${p.from}-to-${p.to}`);
    tier1Pairs.add(`${p.from}-to-${p.to}`);
    tier1Count++;
  }
}

const updated = pairs.map((p) => {
  const pairSlug = `${p.from}-to-${p.to}`;
  const reversePairSlug = `${p.to}-to-${p.from}`;
  const key = [p.from, p.to].sort().join(':::');
  const canonicalTier1 = seenUndirected.get(key);

  if (tier1Pairs.has(pairSlug)) {
    return {
      from: p.from,
      to: p.to,
      category: p.category,
      tier: 1,
    };
  } else {
    tier2Count++;
    return {
      from: p.from,
      to: p.to,
      category: p.category,
      tier: 2,
      canonicalPair: canonicalTier1 || pairSlug,
    };
  }
});

console.log('Tier 1 pairs:', tier1Count);
console.log('Tier 2 pairs:', tier2Count);
console.log('Total pairs:', updated.length);

fs.writeFileSync('./data/popular-pairs.json', JSON.stringify(updated, null, 2));
console.log('Successfully updated data/popular-pairs.json');
