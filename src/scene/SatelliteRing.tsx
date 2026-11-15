import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Task, ColorTheme } from '../types';
import { COLOR_THEME_MAP } from '../types';
import { useOrbitStore } from '../store/useOrbitStore';

interface SatelliteRingProps {
  projectId: string;
  tasks: Task[];
  colorTheme: ColorTheme;
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#475569',
  in_progress: '__theme__',
  done: '#10b981',
};

const PRIORITY_SPEED: Record<string, number> = {
  critical: 1.2,
  high: 0.9,
  medium: 0.6,
  low: 0.4,
};

const ORBIT_RADIUS = 2.0;
const MAX_SATELLITES = 10;

export const SatelliteRing = memo(function SatelliteRing({
  projectId: _projectId,
  tasks,
  colorTheme,
}: SatelliteRingProps) {
  void _projectId;
  const anglesRef = useRef<number[]>([]);
  const themeColors = COLOR_THEME_MAP[colorTheme];
  const reducedMotion = useOrbitStore((s) => s.settings.reducedMotion);
  const visibleTasks = tasks.slice(0, MAX_SATELLITES);

  if (anglesRef.current.length !== visibleTasks.length) {
    anglesRef.current = visibleTasks.map(
      (_, i) => (i / Math.max(visibleTasks.length, 1)) * Math.PI * 2
    );
  }

  const satelliteRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    visibleTasks.forEach((task, i) => {
      const speed = PRIORITY_SPEED[task.priority] ?? 0.5;
      if (!reducedMotion) {
        anglesRef.current[i] += delta * speed;
      }
      const mesh = satelliteRefs.current[i];
      if (mesh) {
        mesh.position.x = Math.cos(anglesRef.current[i]) * ORBIT_RADIUS;
        mesh.position.z = Math.sin(anglesRef.current[i]) * ORBIT_RADIUS;
        mesh.position.y = Math.sin(anglesRef.current[i] * 0.5) * 0.3;
      }
    });
  });

  const getColor = (task: Task) => {
    if (task.status === 'in_progress') return themeColors.satellite;
    return STATUS_COLORS[task.status] ?? '#475569';
  };

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ORBIT_RADIUS - 0.01, ORBIT_RADIUS + 0.01, 64]} />
        <meshBasicMaterial
          color={themeColors.primary}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {visibleTasks.map((task, i) => (
        <mesh
          key={task.id}
          ref={(el) => { satelliteRefs.current[i] = el; }}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color={getColor(task)}
            emissive={getColor(task)}
            emissiveIntensity={task.status === 'in_progress' ? 0.8 : 0.3}
          />
        </mesh>
      ))}
    </group>
  );
});
