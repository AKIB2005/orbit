import { useRef, memo } from 'react';
import { useQuality } from './quality';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOrbitStore } from '../store/useOrbitStore';

export const CosmicCore = memo(function CosmicCore() {
  const q = useQuality();
  const coreRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const outerHaloRef = useRef<THREE.Mesh>(null);
  const flareRingRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const reducedMotion = useOrbitStore((s) => s.settings.reducedMotion);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const time = state.clock.elapsedTime;

    // Slow organic rotation of the core
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.3;
      coreRef.current.rotation.z += delta * 0.08;
    }

    // Atmospheric coronal breathing
    if (coronaRef.current) {
      coronaRef.current.rotation.y -= delta * 0.2;
      const pulse = 1.0 + Math.sin(time * 2.2) * 0.05;
      coronaRef.current.scale.set(pulse, pulse, pulse);
    }

    // Outer faint halo pulse
    if (outerHaloRef.current) {
      outerHaloRef.current.rotation.z += delta * 0.1;
      const haloPulse = 1.0 + Math.cos(time * 1.5) * 0.08;
      outerHaloRef.current.scale.set(haloPulse, haloPulse, haloPulse);
    }

    // Tilting flare ring
    if (flareRingRef.current) {
      flareRingRef.current.rotation.z -= delta * 0.15;
    }

    // Subtle light breathing
    if (lightRef.current) {
      lightRef.current.intensity = 2.8 + Math.sin(time * 3) * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Singularity Sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.35, q.coreSegments, q.coreSegments]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#818cf8"
          emissiveIntensity={1.0}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Inner Coronal Atmosphere Shell */}
      <mesh ref={coronaRef} scale={[1.48, 1.48, 1.48]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer Ethereal Halo */}
      <mesh ref={outerHaloRef} scale={[1.9, 1.9, 1.9]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Equatorial Flare Energy Ring */}
      <mesh ref={flareRingRef} rotation={[Math.PI / 2.3, 0.2, 0]}>
        <ringGeometry args={[1.5, 2.3, 64]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Primary Cosmic Radiant Light Source */}
      <pointLight
        ref={lightRef}
        color="#a78bfa"
        intensity={3.0}
        distance={45}
        decay={1.2}
      />
      {q.fullLighting && (
        <pointLight
          color="#38bdf8"
          intensity={2.0}
          distance={25}
          decay={1.5}
          position={[0, 0.5, 0]}
        />
      )}
    </group>
  );
});
