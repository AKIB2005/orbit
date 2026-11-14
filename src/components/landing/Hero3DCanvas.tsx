import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Orbiting satellite data
interface SatelliteData {
  radiusX: number;
  radiusZ: number;
  speed: number;
  size: number;
  color: string;
  initialAngle: number;
  tilt: number;
  label: string;
}

const SATELLITES: SatelliteData[] = [
  { radiusX: 3.2, radiusZ: 2.8, speed: 0.6, size: 0.12, color: '#22d3ee', initialAngle: 0, tilt: 0.2, label: 'Task: Neural Nav' },
  { radiusX: 4.4, radiusZ: 3.9, speed: 0.45, size: 0.15, color: '#a78bfa', initialAngle: 1.8, tilt: -0.35, label: 'Task: WebGL Shaders' },
  { radiusX: 5.6, radiusZ: 5.1, speed: 0.3, size: 0.14, color: '#f43f5e', initialAngle: 3.5, tilt: 0.5, label: 'Task: Spatial Persistence' },
  { radiusX: 6.8, radiusZ: 6.2, speed: 0.22, size: 0.18, color: '#38bdf8', initialAngle: 5.0, tilt: -0.15, label: 'Task: Gemini Agent' },
];

// Inner Planet Mesh with atmosphere & pulsing glow
const HeroCorePlanet = memo(function HeroCorePlanet() {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.25;
      planetRef.current.rotation.x += delta * 0.05;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.15;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.1;
    }
  });

  return (
    <group>
      {/* Central Core Planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#4c1d95"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          roughness={0.4}
          metalness={0.7}
          wireframe={false}
        />
      </mesh>

      {/* Atmospheric Halo */}
      <mesh ref={atmosphereRef} scale={[1.65, 1.65, 1.65]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Planetary Outer Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0.2, 0]}>
        <ringGeometry args={[2.0, 2.5, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#06b6d4"
          emissiveIntensity={0.6}
          side={THREE.DoubleSide}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Core Point Light */}
      <pointLight color="#8b5cf6" intensity={2.5} distance={10} />
      <pointLight color="#06b6d4" intensity={2} distance={8} position={[1, -1, 2]} />
    </group>
  );
});

// Single Orbit Path & Satellite
const SatelliteOrbit = memo(function SatelliteOrbit({ sat }: { sat: SatelliteData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(sat.initialAngle);

  // Generate orbit ring points
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 100;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * sat.radiusX;
      const z = Math.sin(theta) * sat.radiusZ;
      const y = Math.sin(theta) * sat.tilt * 2;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [sat]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color: sat.color, transparent: true, opacity: 0.2 }),
    [sat.color]
  );
  const lineObject = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  useFrame((_, delta) => {
    angleRef.current += delta * sat.speed;
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(angleRef.current) * sat.radiusX;
      meshRef.current.position.z = Math.sin(angleRef.current) * sat.radiusZ;
      meshRef.current.position.y = Math.sin(angleRef.current) * sat.tilt * 2;
    }
  });

  return (
    <group>
      {/* Orbit Ring Line */}
      <primitive object={lineObject} />

      {/* Orbiting Satellite Body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[sat.size, 16, 16]} />
        <meshStandardMaterial
          color={sat.color}
          emissive={sat.color}
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.8}
        />
        {/* Glow halo */}
        <pointLight color={sat.color} intensity={0.6} distance={2} />
      </mesh>
    </group>
  );
});

// Ambient Cosmic Star Dust in Hero
const HeroStarDust = memo(function HeroStarDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#cbd5e1'),
    ];

    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

// Interactive Parallax Rig
function SceneRig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (groupRef.current) {
      // Subtle smooth tilt towards mouse cursor
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.35, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.25, 0.05);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

export function Hero3DCanvas() {
  return (
    <div className="w-full h-full relative pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 1.5, 9.5], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#312e81" />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -5, -5]} intensity={0.8} color="#06b6d4" />

        <SceneRig>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
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
