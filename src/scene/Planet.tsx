import { useRef, useMemo, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useOrbitStore } from '../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../types';
import { SatelliteRing } from './SatelliteRing';
import { OrbitalTrack } from './OrbitalTrack';
import {
  getOrbitalParameters,
  calculateOrbitalPosition,
  activePlanetPositions,
} from '../utils/orbitalKinematics';

interface PlanetProps {
  projectId: string;
  orbitIndex: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: '● ACTIVE', color: '#34d399' },
  paused: { label: '❙❙ PAUSED', color: '#fbbf24' },
  completed: { label: '✔ DONE', color: '#22d3ee' },
  archived: { label: '■ ARCHIVED', color: '#64748b' },
};

export const Planet = memo(function Planet({ projectId, orbitIndex }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const project = useOrbitStore((s) => s.projects[projectId]);
  const isSelected = useOrbitStore((s) => s.ui.selectedProjectId === projectId);
  const isHovered = useOrbitStore((s) => s.ui.hoveredProjectId === projectId);
  const selectProject = useOrbitStore((s) => s.selectProject);
  const hoverProject = useOrbitStore((s) => s.hoverProject);
  const reducedMotion = useOrbitStore((s) => s.settings.reducedMotion);
  const tasks = useOrbitStore((s) =>
    Object.values(s.tasks).filter((t) => t.projectId === projectId)
  );

  const orbit = useMemo(() => getOrbitalParameters(orbitIndex), [orbitIndex]);
  const angleRef = useRef(orbit.initialAngle);

  // Initialize position in kinematic registry
  useEffect(() => {
    const initialPos = calculateOrbitalPosition(orbit, angleRef.current);
    const vec = new THREE.Vector3(...initialPos);
    activePlanetPositions.set(projectId, vec);
    if (groupRef.current) {
      groupRef.current.position.copy(vec);
    }
    return () => {
      activePlanetPositions.delete(projectId);
    };
  }, [projectId, orbit]);

  // Delta-time based animation
  useFrame((_, delta) => {
    if (!reducedMotion) {
      // Advance true anomaly along the orbital ellipse
      angleRef.current += delta * orbit.speed;
      const [x, y, z] = calculateOrbitalPosition(orbit, angleRef.current);

      if (groupRef.current) {
        groupRef.current.position.set(x, y, z);
        activePlanetPositions.set(projectId, groupRef.current.position);
      }
    }

    // Axial planet spin
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }

    // Planetary ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.15;
    }

    // Pulsing atmosphere glow
    if (glowRef.current) {
      const pulse = 2.4 + Math.sin(Date.now() * 0.003 + orbitIndex) * 0.2;
      glowRef.current.scale.set(pulse, pulse, 1);
    }
  });

  if (!project) return null;

  const themeColors = COLOR_THEME_MAP[project.colorTheme];
  const active = isHovered || isSelected;
  const statusInfo = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.active;

  // Distinct procedural planet sizing & features
  const planetSizes = [1.1, 0.95, 1.15, 0.85, 1.3];
  const radius = planetSizes[orbitIndex % planetSizes.length] ?? 1.0;
  const hasRings = orbitIndex % 2 === 1 || orbitIndex === 4;

  return (
    <>
      {/* 3D Elliptical Orbit Track Path (rendered from origin) */}
      <OrbitalTrack
        orbit={orbit}
        color={themeColors.primary}
        isHighlighted={active}
      />

      {/* Orbiting Planet Group */}
      <group ref={groupRef}>
        {/* Clickable Planet Sphere */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            selectProject(projectId);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            hoverProject(projectId);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            hoverProject(null);
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={themeColors.primary}
            emissive={themeColors.primary}
            emissiveIntensity={active ? 0.75 : 0.25}
            roughness={0.5}
            metalness={0.4}
          />
        </mesh>

        {/* Distinct Planetary Rings (for planets with ring systems) */}
        {hasRings && (
          <mesh ref={ringRef} rotation={[Math.PI / 2.6, 0.2, 0]}>
            <ringGeometry args={[radius * 1.4, radius * 2.0, 64]} />
            <meshStandardMaterial
              color={themeColors.satellite}
              emissive={themeColors.primary}
              emissiveIntensity={0.3}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Atmospheric Glow Sprite */}
        <sprite ref={glowRef}>
          <spriteMaterial
            color={themeColors.primary}
            transparent
            opacity={active ? 0.5 : 0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>

        {/* Dynamic Selection Indicator Ring */}
        {active && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.35, radius * 1.55, 64]} />
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={isSelected ? 0.8 : 0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Camera-Facing Billboard Labels (Project Name & Status) */}
        <Billboard
          position={[0, radius + 1.1, 0]}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          {/* Project Title */}
          <Text
            position={[0, 0.32, 0]}
            fontSize={0.38}
            color="#f8fafc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#030308"
            font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-g.woff"
          >
            {project.name}
          </Text>

          {/* Status Badge */}
          <Text
            position={[0, 0, 0]}
            fontSize={0.22}
            color={statusInfo.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#030308"
          >
            {`${statusInfo.label} • ${tasks.length} TASKS`}
          </Text>
        </Billboard>

        {/* Orbiting Task Satellites */}
        <SatelliteRing
          projectId={projectId}
          tasks={tasks}
          colorTheme={project.colorTheme}
        />
      </group>
    </>
  );
});
