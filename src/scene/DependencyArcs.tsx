import { memo, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOrbitStore } from '../store/useOrbitStore';
import { activePlanetPositions } from '../utils/orbitalKinematics';

export const DependencyArcs = memo(function DependencyArcs() {
  const links = useOrbitStore((s) => s.links);
  const showLines = useOrbitStore((s) => s.settings.showDependencyLines);

  if (!showLines) return null;

  return (
    <group>
      {Object.values(links).map((link) => (
        <DynamicDependencyArc
          key={link.id}
          sourceId={link.sourceProjectId}
          targetId={link.targetProjectId}
        />
      ))}
    </group>
  );
});

interface DynamicDependencyArcProps {
  sourceId: string;
  targetId: string;
}

const DynamicDependencyArc = memo(function DynamicDependencyArc({
  sourceId,
  targetId,
}: DynamicDependencyArcProps) {
  const lineRef = useRef<THREE.Line>(null);
  const dashOffsetRef = useRef(0);
  const pointsRef = useRef<THREE.Vector3[]>([]);

  // Create reusable geometry & dashed material
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(50 * 3);
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  const material = useMemo(
    () =>
      new THREE.LineDashedMaterial({
        color: '#8b5cf6',
        transparent: true,
        opacity: 0.5,
        dashSize: 0.4,
        gapSize: 0.25,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const lineObject = useMemo(() => {
    const l = new THREE.Line(geometry, material);
    return l;
  }, [geometry, material]);

  useFrame((_, delta) => {
    const sourcePos = activePlanetPositions.get(sourceId);
    const targetPos = activePlanetPositions.get(targetId);

    if (!sourcePos || !targetPos || !lineRef.current) return;

    // Calculate elevated midpoint for cosmic curvature
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = Math.max(sourcePos.y, targetPos.y) + 3.0;
    const midZ = (sourcePos.z + targetPos.z) / 2;

    const curve = new THREE.QuadraticBezierCurve3(
      sourcePos,
      new THREE.Vector3(midX, midY, midZ),
      targetPos
    );

    pointsRef.current = curve.getPoints(49);
    const posAttr = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pointsRef.current.length; i++) {
      const pt = pointsRef.current[i];
      posAttr.setXYZ(i, pt.x, pt.y, pt.z);
    }
    posAttr.needsUpdate = true;
    lineRef.current.computeLineDistances();

    // Pulse moving energy pulses along the dependency stream
    dashOffsetRef.current -= delta * 2.2;
    (material as unknown as { dashOffset: number }).dashOffset = dashOffsetRef.current;
    material.opacity = 0.4 + Math.sin(dashOffsetRef.current * 3) * 0.2;
  });

  return <primitive ref={lineRef} object={lineObject} />;
});
