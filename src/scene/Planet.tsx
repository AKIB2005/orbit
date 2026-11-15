import { useRef, useMemo, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useShallow } from 'zustand/react/shallow';
import { useOrbitStore } from '../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../types';
import { SatelliteRing } from './SatelliteRing';
import { OrbitalTrack } from './OrbitalTrack';
import { getGlowTexture } from './glowTexture';
import { LabelBoundary } from './LabelBoundary';
import { useQuality } from './quality';
import {
  getOrbitalParameters,
  calculateOrbitalPosition,
  activePlanetPositions,
  getPlanetRadius,
} from '../utils/orbitalKinematics';

interface PlanetProps {
  projectId: string;
  orbitIndex: number;
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};
const STATUS_COLOR: Record<string, string> = {
  active: '#34d399',
  paused: '#fbbf24',
  completed: '#7dd3fc',
  archived: '#94a3b8',
};

const damp = THREE.MathUtils.damp;

export const Planet = memo(function Planet({ projectId, orbitIndex }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const glowMatRef = useRef<THREE.SpriteMaterial>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const selectRingRef = useRef<THREE.Mesh>(null);
  const selectMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const nameRef = useRef<{ fillOpacity: number } | null>(null);
  const statusRef = useRef<{ fillOpacity: number } | null>(null);
  const angleRef = useRef(0);
  // Eased 0..1 values so hover/selection never pop.
  const hoverT = useRef(0);
  const selectT = useRef(0);

  const project = useOrbitStore((s) => s.projects[projectId]);
  const isSelected = useOrbitStore((s) => s.ui.selectedProjectId === projectId);
  const isHovered = useOrbitStore((s) => s.ui.hoveredProjectId === projectId);
  const selectProject = useOrbitStore((s) => s.selectProject);
  const hoverProject = useOrbitStore((s) => s.hoverProject);
  const setContextMenu = useOrbitStore((s) => s.setContextMenu);
  const reducedMotion = useOrbitStore((s) => s.settings.reducedMotion);
  // Focus effect: when another planet is selected, this one recedes slightly
  const dimmed = useOrbitStore((s) => s.ui.selectedProjectId !== null && s.ui.selectedProjectId !== projectId);
  const q = useQuality();
  // Shallow-compared: only re-render when *this* project's tasks change, not any task in the workspace.
  const tasks = useOrbitStore(
    useShallow((s) => Object.values(s.tasks).filter((t) => t.projectId === projectId))
  );

  const orbit = useMemo(() => getOrbitalParameters(orbitIndex), [orbitIndex]);
  const glowMap = useMemo(() => getGlowTexture(), []);

  useEffect(() => {
    angleRef.current = orbit.initialAngle;
    const vec = new THREE.Vector3(...calculateOrbitalPosition(orbit, orbit.initialAngle));
    activePlanetPositions.set(projectId, vec);
    if (groupRef.current) groupRef.current.position.copy(vec);
    return () => {
      activePlanetPositions.delete(projectId);
    };
  }, [projectId, orbit]);

  // Never leave a pointer cursor behind if the planet unmounts while hovered.
  useEffect(() => () => void (document.body.style.cursor = ''), []);

  const radius = getPlanetRadius(orbitIndex);
  const hasRings = orbitIndex % 2 === 1 || orbitIndex === 4;
  const theme = project ? COLOR_THEME_MAP[project.colorTheme] : COLOR_THEME_MAP.violet;
  const active = isHovered || isSelected;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.elapsedTime;

    if (!reducedMotion) {
      angleRef.current += dt * orbit.speed;
      const [x, y, z] = calculateOrbitalPosition(orbit, angleRef.current);
      if (groupRef.current) {
        groupRef.current.position.set(x, y, z);
        activePlanetPositions.set(projectId, groupRef.current.position);
      }
      if (meshRef.current) meshRef.current.rotation.y += dt * 0.3;
      if (ringRef.current) ringRef.current.rotation.z += dt * 0.15;
    }

    // Ease hover / selection state (≈180ms to settle)
    hoverT.current = damp(hoverT.current, isHovered || isSelected ? 1 : 0, 9, dt);
    selectT.current = damp(selectT.current, isSelected ? 1 : 0, 7, dt);
    const h = hoverT.current;
    const sel = selectT.current;
    const recede = dimmed ? 0.55 : 1;

    if (bodyRef.current) bodyRef.current.scale.setScalar(1 + h * 0.06);
    if (matRef.current) matRef.current.emissiveIntensity = (0.22 + h * 0.5) * recede;

    if (glowRef.current && glowMatRef.current) {
      const breathe = reducedMotion ? 0 : Math.sin(elapsed * 1.6 + orbitIndex) * 0.08;
      const s = radius * (3.0 + h * 0.5 + breathe);
      glowRef.current.scale.set(s, s, 1);
      glowMatRef.current.opacity = (0.16 + h * 0.2) * recede;
    }

    if (selectRingRef.current && selectMatRef.current) {
      selectRingRef.current.visible = sel > 0.01;
      selectMatRef.current.opacity = sel * 0.7;
      selectRingRef.current.scale.setScalar(1.25 - sel * 0.25);
      if (!reducedMotion) selectRingRef.current.rotation.z += dt * 0.35;
    }

    // Labels: name always readable, details only when the planet is in focus.
    if (nameRef.current) nameRef.current.fillOpacity = damp(nameRef.current.fillOpacity, (0.55 + h * 0.45) * (dimmed ? 0.5 : 1), 9, dt);
    if (statusRef.current) statusRef.current.fillOpacity = damp(statusRef.current.fillOpacity, h, 9, dt);

    const settling = Math.abs(hoverT.current - (active ? 1 : 0)) > 0.004 || Math.abs(selectT.current - (isSelected ? 1 : 0)) > 0.004;
    if (settling || (dimmed && matRef.current && matRef.current.emissiveIntensity > 0.13)) state.invalidate();
  });

  if (!project) return null;

  const statusColor = STATUS_COLOR[project.status] ?? STATUS_COLOR.active;
  const taskWord = tasks.length === 1 ? 'task' : 'tasks';

  return (
    <>
      <OrbitalTrack orbit={orbit} color={theme.primary} isHighlighted={active} />

      <group ref={groupRef}>
        <group ref={bodyRef}>
          <mesh
            ref={meshRef}
            onClick={(e) => {
              e.stopPropagation();
              selectProject(projectId);
            }}
            onContextMenu={(e) => {
              e.stopPropagation();
              const native = (e as unknown as { nativeEvent: MouseEvent }).nativeEvent;
              if (native) setContextMenu({ x: native.clientX, y: native.clientY, targetId: projectId });
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              hoverProject(projectId);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              hoverProject(null);
              document.body.style.cursor = '';
            }}
          >
            <sphereGeometry args={[radius, q.planetSegments, q.planetSegments]} />
            <meshStandardMaterial
              ref={matRef}
              color={theme.primary}
              emissive={theme.primary}
              emissiveIntensity={0.22}
              roughness={0.55}
              metalness={0.35}
            />
          </mesh>

          {hasRings && (
            <mesh ref={ringRef} rotation={[Math.PI / 2.6, 0.2, 0]}>
              <ringGeometry args={[radius * 1.4, radius * 2.0, 64]} />
              <meshStandardMaterial
                color={theme.satellite}
                emissive={theme.primary}
                emissiveIntensity={0.25}
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>

        {/* Atmosphere: textured sprite (radial falloff), not a flat quad */}
        <sprite ref={glowRef} raycast={() => null}>
          <spriteMaterial
            ref={glowMatRef}
            map={glowMap}
            color={theme.primary}
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </sprite>

        {/* Selection reticle — always mounted, faded by selection progress */}
        <mesh ref={selectRingRef} rotation={[Math.PI / 2.2, 0, 0]} visible={false} raycast={() => null}>
          <ringGeometry args={[radius * 1.55, radius * 1.6, 96]} />
          <meshBasicMaterial
            ref={selectMatRef}
            color={theme.satellite}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        <LabelBoundary>
        <Billboard position={[0, radius + 1.15, 0]}>
          <Text
            ref={nameRef as never}
            position={[0, 0.3, 0]}
            fontSize={0.36}
            color="#f8fafc"
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.55}
            outlineWidth={0.025}
            outlineColor="#030308"
          >
            {project.name}
          </Text>
          <Text
            ref={statusRef as never}
            position={[0, -0.05, 0]}
            fontSize={0.2}
            color={statusColor}
            anchorX="center"
            anchorY="middle"
            fillOpacity={0}
            outlineWidth={0.015}
            outlineColor="#030308"
          >
            {`${STATUS_LABEL[project.status] ?? 'Active'} · ${tasks.length} ${taskWord}`}
          </Text>
        </Billboard>
        </LabelBoundary>

        <SatelliteRing projectId={projectId} tasks={tasks} colorTheme={project.colorTheme} />
      </group>
    </>
  );
});
