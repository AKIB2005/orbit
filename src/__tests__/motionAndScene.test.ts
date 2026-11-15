import { describe, it, expect } from 'vitest';
import { dur, ease, modal, popover, toast, listRow, collapse } from '../motion/tokens';
import { getPlanetRadius, PLANET_SIZES } from '../utils/orbitalKinematics';

type Timed = { transition?: { duration?: number } };
const d = (v: unknown) => (v as Timed).transition?.duration;

describe('motion tokens', () => {
  it('uses a single decelerating curve and a symmetric curve', () => {
    expect(ease.out).toHaveLength(4);
    expect(ease.inOut).toHaveLength(4);
  });
  it('exits are faster than entrances (UI never feels like it is waiting)', () => {
    for (const v of [popover, listRow, collapse]) {
      expect(d(v.exit)!).toBeLessThan(d(v.visible)!);
    }
    expect(d(modal.exit)!).toBeLessThanOrEqual(dur.fast);
    expect(d(toast.exit)!).toBeLessThanOrEqual(dur.fast);
  });
  it('durations are ordered', () => {
    expect(dur.fast).toBeLessThan(dur.base);
    expect(dur.base).toBeLessThan(dur.slow);
    expect(dur.slow).toBeLessThan(dur.scene);
  });
});

describe('getPlanetRadius', () => {
  it('maps every slot to a known size and wraps past the table', () => {
    expect(getPlanetRadius(0)).toBe(PLANET_SIZES[0]);
    expect(getPlanetRadius(PLANET_SIZES.length)).toBe(PLANET_SIZES[0]);
    expect(getPlanetRadius(7)).toBe(PLANET_SIZES[7 % PLANET_SIZES.length]);
  });
  it('is safe for negative indices (camera uses -1 for "none")', () => {
    expect(PLANET_SIZES).toContain(getPlanetRadius(-1));
  });
});
