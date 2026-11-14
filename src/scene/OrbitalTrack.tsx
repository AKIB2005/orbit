import { memo, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitalParameters } from '../utils/orbitalKinematics';
import { generateEllipsePoints } from '../utils/orbitalKinematics';

interface OrbitalTrackProps {
  orbit: OrbitalParameters;
  color: string;
  isHighlighted?: boolean;
}

export const OrbitalTrack = memo(function OrbitalTrack({
  orbit,
  color,
  isHighlighted = false,
}: OrbitalTrackProps) {
  const points = useMemo(() => generateEllipsePoints(orbit, 128), [orbit]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: isHighlighted ? 0.45 : 0.15,
        blending: THREE.AdditiveBlending,
      }),
    [color, isHighlighted]
  );

  const lineObject = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  return <primitive object={lineObject} />;
});
