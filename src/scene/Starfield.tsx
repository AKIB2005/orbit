import { useRef, useMemo, memo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useOrbitStore } from '../store/useOrbitStore';
import { useQuality } from './quality';

const STAR_COUNT = 2200;

/** Small seeded PRNG so the sky is identical on every mount (no re-rolled constellations). */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uTwinkle;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 1.0 - uTwinkle * (0.5 + 0.5 * sin(uTime * (0.6 + aPhase * 1.4) + aPhase * 40.0)) * 0.55;
    gl_PointSize = aSize * tw * uPixelRatio * (60.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vAlpha = tw;
  }
`;
const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha);
  }
`;

/**
 * Starfield as one Points draw call. Twinkle runs in the vertex shader from a time uniform,
 * so there is zero per-frame CPU work or buffer upload (previously 40 matrix writes + upload / frame).
 */
export const Starfield = memo(function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useOrbitStore((s) => s.settings.reducedMotion);
  const dpr = useThree((s) => s.viewport.dpr);
  const q = useQuality();

  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(0x0b17);
    const pos = new Float32Array(STAR_COUNT * 3);
    const size = new Float32Array(STAR_COUNT);
    const phase = new Float32Array(STAR_COUNT);
    const col = new Float32Array(STAR_COUNT * 3);
    // Cool-white dominant, with a few warm and blue stars for realism
    const palette = ['#ffffff', '#e2e8f0', '#bfdbfe', '#c4b5fd', '#fde68a'].map((c) => new THREE.Color(c));
    const weights = [0.4, 0.3, 0.15, 0.08, 0.07];

    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(rand() * 2 - 1);
      const r = 40 + rand() * 60;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      size[i] = rand() < 0.04 ? 2.4 + rand() * 1.6 : 0.8 + rand() * 1.1;
      phase[i] = rand();

      let pick = rand();
      let ci = 0;
      for (; ci < weights.length - 1; ci++) {
        if (pick < weights[ci]) break;
        pick -= weights[ci];
      }
      const c = palette[ci];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));

    const m = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uTwinkle: { value: 1 },
      },
    });
    return { geometry: g, material: m };
  }, []);

  // Adaptive density: draw fewer stars on weaker tiers without rebuilding any buffers
  useEffect(() => {
    geometry.setDrawRange(0, Math.floor(STAR_COUNT * q.starDensity));
  }, [geometry, q.starDensity]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = dpr;
    material.uniforms.uTwinkle.value = reducedMotion ? 0 : 1;
    // A barely perceptible drift gives the backdrop depth against the planets
    if (!reducedMotion && pointsRef.current) pointsRef.current.rotation.y += delta * 0.0025;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
});
