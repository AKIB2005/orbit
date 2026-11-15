import { memo, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitalParameters } from '../utils/orbitalKinematics';
import { generateEllipsePoints } from '../utils/orbitalKinematics';

interface OrbitalTrackProps {
  orbit: OrbitalParameters;
  color: string;
  isHighlighted?: boolean;
}

export const OrbitalTrack = memo(function OrbitalTrack({ orbit, color, isHighlighted = false }: OrbitalTrackProps) {
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(generateEllipsePoints(orbit, 128)), [orbit]);

  // One material for the lifetime of the track. (Previously a new material was built — and never
  // disposed — every time hover state or colour changed.)
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending }),
    []
  );
  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  useEffect(() => {
    material.color.set(color);
  }, [material, color]);

  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry]
  );
  useEffect(
    () => () => {
      material.dispose();
    },
    [material]
  );

  // Ease the highlight instead of snapping; ask for another frame only while it is still moving.
  useFrame((state, delta) => {
    const target = isHighlighted ? 0.45 : 0.15;
    if (Math.abs(material.opacity - target) < 0.002) {
      material.opacity = target;
      return;
    }
    material.opacity = THREE.MathUtils.damp(material.opacity, target, 9, Math.min(delta, 0.05));
    state.invalidate();
  });

  return <primitive object={line} />;
});
