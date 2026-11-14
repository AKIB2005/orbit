import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOrbitStore } from '../store/useOrbitStore';

export const DependencyArcs = memo(function DependencyArcs() {
  const links = useOrbitStore((s) => s.links);
  const projects = useOrbitStore((s) => s.projects);
  const showLines = useOrbitStore((s) => s.settings.showDependencyLines);

  if (!showLines) return null;

  return (
    <group>
      {Object.values(links).map((link) => {
        const source = projects[link.sourceProjectId];
        const target = projects[link.targetProjectId];
        if (!source || !target) return null;
        return (
          <DependencyArc
            key={link.id}
            start={source.position}
            end={target.position}
          />
        );
      })}
    </group>
  );
});

interface DependencyArcProps {
  start: [number, number, number];
  end: [number, number, number];
}

const DependencyArc = memo(function DependencyArc({ start, end }: DependencyArcProps) {
  const lineRef = useRef<THREE.Line>(null);
  const dashOffsetRef = useRef(0);

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start),
    new THREE.Vector3(
      (start[0] + end[0]) / 2,
      Math.max(start[1], end[1]) + 3,
      (start[2] + end[2]) / 2
    ),
    new THREE.Vector3(...end)
  );

  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  useFrame((_, delta) => {
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineDashedMaterial & { dashOffset: number };
      dashOffsetRef.current -= delta * 2;
      mat.dashOffset = dashOffsetRef.current;
    }
  });

  return (
    // @ts-expect-error - In React 19 JSX, <line> resolves to SVGLineElement instead of Three.Line
    <line ref={lineRef} geometry={geometry} computeLineDistances>
      <lineDashedMaterial
        color="#8b5cf6"
        transparent
        opacity={0.4}
        dashSize={0.3}
        gapSize={0.2}
      />
    </line>
  );
});
