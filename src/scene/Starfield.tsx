import { useRef, useMemo, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOrbitStore } from '../store/useOrbitStore';

const STAR_COUNT = 2400;

export const Starfield = memo(function Starfield() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const reducedMotion = useOrbitStore((s) => s.settings.reducedMotion);

  // Generate star positions, sizes, and colors
  const [positions, scales] = useMemo(() => {
    const pos: [number, number, number][] = [];
    const sca: number[] = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      // Sphere between radius 30 and 70
      const r = 28 + Math.random() * 45;

      pos.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]);

      // Mostly tiny stars, with a few brighter distant beacons
      const isBeacon = Math.random() < 0.05;
      sca.push(isBeacon ? 1.5 + Math.random() * 1.0 : 0.4 + Math.random() * 0.8);
    }
    return [pos, sca];
  }, []);

  // Initialize instance matrices once
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;

    const colors = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#cbd5e1'),
      new THREE.Color('#93c5fd'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#67e8f9'),
    ];

    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const color = colors[Math.floor(Math.random() * colors.length)];
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [positions, scales, dummy]);

  // Subtle twinkling on a small subset of stars per frame
  useFrame(() => {
    if (reducedMotion || !meshRef.current) return;

    for (let i = 0; i < 40; i++) {
      const idx = Math.floor(Math.random() * STAR_COUNT);
      dummy.position.set(...positions[idx]);
      const twinkle = scales[idx] * (0.6 + Math.random() * 0.8);
      dummy.scale.setScalar(twinkle);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(idx, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, STAR_COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
});
