import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Starfield } from './Starfield';
import { CosmicLighting } from './CosmicLighting';
import { CameraController } from './CameraController';
import { PlanetGroup } from './PlanetGroup';
import { DependencyArcs } from './DependencyArcs';
import { useOrbitStore } from '../store/useOrbitStore';

export function SceneWrapper() {
  const selectProject = useOrbitStore((s) => s.selectProject);
  const setContextMenu = useOrbitStore((s) => s.setContextMenu);

  const handlePointerMissed = (e: MouseEvent) => {
    void e;
    selectProject(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onContextMenu={handleContextMenu} className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 8, 20], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={handlePointerMissed}
      >
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 25, 50]} />
        <Suspense fallback={null}>
          <CosmicLighting />
          <Starfield />
          <PlanetGroup />
          <DependencyArcs />
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
}
