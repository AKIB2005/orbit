import { describe, it, expect } from 'vitest';
import { getOrbitalParameters, calculateOrbitalPosition } from '../utils/orbitalKinematics';

describe('orbitalKinematics', () => {
  it('generates consistent orbital parameters for indexes 0 through 11', () => {
    for (let i = 0; i < 12; i++) {
      const params = getOrbitalParameters(i);
      expect(params.semiMajor).toBeGreaterThan(0);
      expect(params.semiMinor).toBeGreaterThan(0);
      expect(params.semiMajor).toBeGreaterThanOrEqual(params.semiMinor);
      expect(params.speed).toBeGreaterThan(0);
      expect(typeof params.initialAngle).toBe('number');
    }
  });

  it('calculates valid finite 3D coordinates along elliptical path', () => {
    const params = getOrbitalParameters(0);
    const [x, y, z] = calculateOrbitalPosition(params, Math.PI / 4);

    expect(Number.isFinite(x)).toBe(true);
    expect(Number.isFinite(y)).toBe(true);
    expect(Number.isFinite(z)).toBe(true);
  });
});
