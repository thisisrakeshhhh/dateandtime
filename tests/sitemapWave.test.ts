import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateSitemaps, getActiveWave } from '../app/sitemap';

describe('Sitemap Wave Deployment (INDEX_WAVE)', () => {
  const originalWave = process.env.INDEX_WAVE;

  afterEach(() => {
    process.env.INDEX_WAVE = originalWave;
  });

  it('defaults to Wave 1 when INDEX_WAVE is unset or 1', async () => {
    delete process.env.INDEX_WAVE;
    expect(getActiveWave()).toBe(1);
    const sitemaps = await generateSitemaps();
    const ids = sitemaps.map((s) => s.id);
    expect(ids).toContain('core');
    expect(ids).toContain('corridors');
    expect(ids).toContain('converters');
    expect(ids).toContain('shifts');
    expect(ids).toContain('sports');
    expect(ids).not.toContain('cities');
    expect(ids).not.toContain('countries');
  });

  it('includes cities when INDEX_WAVE=2', async () => {
    process.env.INDEX_WAVE = '2';
    expect(getActiveWave()).toBe(2);
    const sitemaps = await generateSitemaps();
    const ids = sitemaps.map((s) => s.id);
    expect(ids).toContain('cities');
    expect(ids).not.toContain('countries');
  });

  it('includes countries and DST when INDEX_WAVE=3', async () => {
    process.env.INDEX_WAVE = '3';
    expect(getActiveWave()).toBe(3);
    const sitemaps = await generateSitemaps();
    const ids = sitemaps.map((s) => s.id);
    expect(ids).toContain('cities');
    expect(ids).toContain('countries');
  });
});
