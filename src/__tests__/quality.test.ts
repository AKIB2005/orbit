import { describe, it, expect } from 'vitest';
import { detectQualityTier, QUALITY } from '../scene/quality';

describe('detectQualityTier', () => {
  it('defaults to high when nothing is known', () => {
    expect(detectQualityTier({})).toBe('high');
  });
  it('treats a capable desktop as high', () => {
    expect(detectQualityTier({ cores: 12, memory: 16, coarsePointer: false, width: 1920 })).toBe('high');
  });
  it('drops to low on few cores, low memory or data-saver', () => {
    expect(detectQualityTier({ cores: 4 })).toBe('low');
    expect(detectQualityTier({ memory: 2 })).toBe('low');
    expect(detectQualityTier({ saveData: true })).toBe('low');
  });
  it('drops to low on small touch screens but not on large ones', () => {
    expect(detectQualityTier({ coarsePointer: true, width: 390 })).toBe('low');
    expect(detectQualityTier({ coarsePointer: true, width: 1024, cores: 8 })).toBe('high');
  });
  it('lets an explicit override win, and ignores junk overrides', () => {
    expect(detectQualityTier({ cores: 2 }, 'high')).toBe('high');
    expect(detectQualityTier({ cores: 16 }, 'low')).toBe('low');
    expect(detectQualityTier({ cores: 2 }, 'ultra')).toBe('low');
  });
  it('low tier is strictly cheaper than high on every scaled dimension', () => {
    expect(QUALITY.low.starDensity).toBeLessThan(QUALITY.high.starDensity);
    expect(QUALITY.low.planetSegments).toBeLessThan(QUALITY.high.planetSegments);
    expect(QUALITY.low.coreSegments).toBeLessThan(QUALITY.high.coreSegments);
    expect(QUALITY.low.dpr[1]).toBeLessThanOrEqual(QUALITY.high.dpr[1]);
    expect(QUALITY.low.fullLighting).toBe(false);
  });
});
