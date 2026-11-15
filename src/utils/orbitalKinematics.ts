import * as THREE from 'three';

export interface OrbitalParameters {
  semiMajor: number;     // a
  semiMinor: number;     // b
  inclination: number;   // tilt angle in radians
  speed: number;         // angular speed in rad/s
  initialAngle: number;  // starting phase in radians
  tiltAxis: [number, number, number];
}

// 60 FPS zero-overhead registry of live 3D planetary positions
export const activePlanetPositions = new Map<string, THREE.Vector3>();

/**
 * Deterministically generates smooth, harmonious elliptical orbital parameters
 * for up to 12 planetary bodies centered around the core.
 */
export function getOrbitalParameters(index: number): OrbitalParameters {
  const baseRadius = 5.8;
  const radiusStep = 3.4;
  const a = baseRadius + index * radiusStep;

  // Subtle natural eccentricity (b slightly less than a for realistic ellipse)
  const eccentricities = [0.88, 0.92, 0.85, 0.90, 0.87, 0.91];
  const b = a * (eccentricities[index % eccentricities.length] ?? 0.88);

  // Gentle realistic orbital inclinations (up to ~10 degrees)
  const inclinations = [0.08, -0.11, 0.13, -0.06, 0.12, -0.09];
  const inclination = inclinations[index % inclinations.length] ?? 0.08;

  // Keplerian-inspired speed: inner planets orbit faster than outer planets
  const keplerSpeed = 0.18 / Math.sqrt(a / baseRadius);
  const speed = keplerSpeed;

  // Golden ratio phase offset for aesthetic initial dispersion
  const initialAngle = ((index * 2.39996) + 0.5) % (Math.PI * 2);

  return {
    semiMajor: a,
    semiMinor: b,
    inclination,
    speed,
    initialAngle,
    tiltAxis: [1, 0, index % 2 === 0 ? 0.3 : -0.3],
  };
}

/**
 * Calculates current 3D position [x, y, z] along the elliptical trajectory
 */
export function calculateOrbitalPosition(
  orbit: OrbitalParameters,
  angle: number
): [number, number, number] {
  const x = Math.cos(angle) * orbit.semiMajor;
  const z = Math.sin(angle) * orbit.semiMinor;
  // Apply inclination along the Y axis
  const y = Math.sin(angle) * (orbit.semiMajor * orbit.inclination * 0.4);

  return [x, y, z];
}

/**
 * Generates point array for rendering the elliptical orbit path line
 */
export function generateEllipsePoints(
  orbit: OrbitalParameters,
  segments: number = 128
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const [x, y, z] = calculateOrbitalPosition(orbit, angle);
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

/** Visual radius per orbit slot. Shared by the planet mesh and the camera framing logic. */
export const PLANET_SIZES = [1.1, 0.95, 1.15, 0.85, 1.3];
export function getPlanetRadius(orbitIndex: number): number {
  return PLANET_SIZES[((orbitIndex % PLANET_SIZES.length) + PLANET_SIZES.length) % PLANET_SIZES.length] ?? 1;
}
