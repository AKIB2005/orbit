import { useRef, useMemo, memo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { getGlowTexture } from '../../scene/glowTexture';
import { useReducedMotionPreference } from '../../motion/useMotionPreference';

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Module-level flag read inside frame loops without re-rendering the scene graph
const motionState = { reduced: false };

interface SatelliteData {
  radiusX: number;
  radiusZ: number;
  speed: number;
  size: number;
  color: string;
  initialAngle: number;
  tilt: number;
}

const SATELLITES: SatelliteData[] = [
  { radiusX: 3.8, radiusZ: 3.2, speed: 0.45, size: 0.07, color: '#38bdf8', initialAngle: 0.4, tilt: 0.18 },
  { radiusX: 4.9, radiusZ: 4.3, speed: 0.35, size: 0.08, color: '#818cf8', initialAngle: 2.1, tilt: -0.22 },
  { radiusX: 6.0, radiusZ: 5.4, speed: 0.25, size: 0.07, color: '#22d3ee', initialAngle: 3.8, tilt: 0.28 },
  { radiusX: 7.2, radiusZ: 6.5, speed: 0.18, size: 0.09, color: '#a78bfa', initialAngle: 5.2, tilt: -0.12 },
];

// Cinematic Deep Celestial Body
const HeroCorePlanet = memo(function HeroCorePlanet() {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringGroupRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (motionState.reduced) return;
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.08;
    }
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.z += delta * 0.04;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.03;
    }
  });

  return (
    <group position={[0, -2.4, -0.6]}>
      {/* Central Planet Sphere */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial
          color="#0b0e1a"
          emissive="#1e1b4b"
          emissiveIntensity={0.15}
          roughness={0.65}
          metalness={0.3}
        />
      </mesh>

      {/* Atmospheric Rim Halo */}
      <mesh ref={atmosphereRef} scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[2.5, 48, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.13}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Multi-Filament Ring System */}
      <group ref={ringGroupRef} rotation={[Math.PI / 3.3, 0.22, -0.08]}>
        {/* Inner Ring */}
        <mesh>
          <ringGeometry args={[3.2, 3.8, 96]} />
          <meshStandardMaterial
            color="#475569"
            emissive="#1e293b"
            emissiveIntensity={0.2}
            side={THREE.DoubleSide}
            transparent
            opacity={0.14}
            roughness={0.4}
          />
        </mesh>

        {/* Outer Ring */}
        <mesh>
          <ringGeometry args={[3.95, 4.75, 96]} />
          <meshStandardMaterial
            color="#334155"
            emissive="#0f172a"
            emissiveIntensity={0.15}
            side={THREE.DoubleSide}
            transparent
            opacity={0.09}
            roughness={0.5}
          />
        </mesh>

        {/* Hairline Outer Filament */}
        <mesh>
          <ringGeometry args={[4.85, 4.88, 96]} />
          <meshBasicMaterial
            color="#38bdf8"
            side={THREE.DoubleSide}
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
    </group>
  );
});

// Single Orbit Path & Satellite Beacon
const SatelliteOrbit = memo(function SatelliteOrbit({ sat }: { sat: SatelliteData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(sat.initialAngle);

  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * sat.radiusX;
      const z = Math.sin(theta) * sat.radiusZ;
      const y = Math.sin(theta) * sat.tilt * 2 - 2.4;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [sat]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color: '#64748b', transparent: true, opacity: 0.12 }),
    []
  );
  const lineObject = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((_, delta) => {
    if (motionState.reduced) return;
    angleRef.current += delta * sat.speed;
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(angleRef.current) * sat.radiusX;
      meshRef.current.position.z = Math.sin(angleRef.current) * sat.radiusZ;
      meshRef.current.position.y = Math.sin(angleRef.current) * sat.tilt * 2 - 2.4;
    }
  });

  return (
    <group>
      <primitive object={lineObject} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[sat.size, 16, 16]} />
        <meshStandardMaterial
          color={sat.color}
          emissive={sat.color}
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
});

// Subtle Multi-Depth Cosmic Stardust
const HeroStarDust = memo(function HeroStarDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const rand = mulberry32(0x5eed);
    const count = 900;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#94a3b8'),
      new THREE.Color('#cbd5e1'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < count; i++) {
      const r = 5 + rand() * 22;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(rand() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(rand() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (motionState.reduced) return;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        map={getGlowTexture()}
        alphaTest={0.02}
        depthWrite={false}
        vertexColors
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

// Soft Mouse Parallax Rig
function SceneRig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (motionState.reduced) return;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.12, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.08, 0.04);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

export function Hero3DCanvas() {
  const reduced = useReducedMotionPreference();
  useEffect(() => {
    motionState.reduced = reduced;
  }, [reduced]);
  const isLowPower = typeof navigator !== 'undefined' && Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  return (
    <div className="w-full h-full relative pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0.6, 9.2], fov: 42, near: 0.1, far: 100 }}
        dpr={isLowPower ? [1, 1.2] : [1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.25} color="#050510" />
        <directionalLight position={[12, 10, 8]} intensity={2.2} color="#f8fafc" />
        <directionalLight position={[-8, -5, -4]} intensity={0.5} color="#475569" />

        <SceneRig>
          <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
            <HeroCorePlanet />
            {SATELLITES.map((sat, idx) => (
              <SatelliteOrbit key={idx} sat={sat} />
            ))}
          </Float>
          <HeroStarDust />
        </SceneRig>
      </Canvas>
    </div>
  );
}
