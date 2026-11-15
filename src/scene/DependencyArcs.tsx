import { memo, useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOrbitStore } from '../store/useOrbitStore';
import { activePlanetPositions } from '../utils/orbitalKinematics';

const SEGMENTS = 49; // 50 points
const LIFT = 3.0;

export const DependencyArcs = memo(function DependencyArcs() {
  const links = useOrbitStore((s) => s.links);
  const showLines = useOrbitStore((s) => s.settings.showDependencyLines);

  if (!showLines) return null;

  return (
    <group>
      {Object.values(links).map((link) => (
        <DynamicDependencyArc key={link.id} sourceId={link.sourceProjectId} targetId={link.targetProjectId} />
      ))}
    </group>
  );
});

interface DynamicDependencyArcProps {
  sourceId: string;
  targetId: string;
}

const DynamicDependencyArc = memo(function DynamicDependencyArc({ sourceId, targetId }: DynamicDependencyArcProps) {
  const dashOffset = useRef(0);
  const emphasis = useRef(0);
  const reducedMotion = useOrbitStore((s) => s.settings.reducedMotion);
  // Arcs touching the selected planet brighten; the rest recede so relationships read at a glance.
  const related = useOrbitStore((s) => s.ui.selectedProjectId === sourceId || s.ui.selectedProjectId === targetId);
  const anySelected = useOrbitStore((s) => s.ui.selectedProjectId !== null);

  const { geometry, material, line } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((SEGMENTS + 1) * 3), 3));
    const m = new THREE.LineDashedMaterial({
      color: '#a78bfa',
      transparent: true,
      opacity: 0.4,
      dashSize: 0.4,
      gapSize: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const l = new THREE.Line(g, m);
    l.frustumCulled = false;
    return { geometry: g, material: m, line: l };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((_, delta) => {
    const a = activePlanetPositions.get(sourceId);
    const b = activePlanetPositions.get(targetId);
    if (!a || !b) return;

    // Quadratic Bézier evaluated in place — no curve/vector allocation per frame.
    const mx = (a.x + b.x) / 2;
    const my = Math.max(a.y, b.y) + LIFT;
    const mz = (a.z + b.z) / 2;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const u = 1 - t;
      const w0 = u * u;
      const w1 = 2 * u * t;
      const w2 = t * t;
      pos.setXYZ(i, w0 * a.x + w1 * mx + w2 * b.x, w0 * a.y + w1 * my + w2 * b.y, w0 * a.z + w1 * mz + w2 * b.z);
    }
    pos.needsUpdate = true;
    line.computeLineDistances();

    const target = anySelected ? (related ? 1 : -1) : 0;
    emphasis.current = THREE.MathUtils.damp(emphasis.current, target, 6, Math.min(delta, 0.05));
    if (!reducedMotion) dashOffset.current -= delta * 1.6;
    // three's typings omit dashOffset on LineDashedMaterial, though the shader reads it
    (material as unknown as { dashOffset: number }).dashOffset = dashOffset.current;
    material.opacity = 0.38 + emphasis.current * 0.3;
  });

  return <primitive object={line} />;
});
