import { Canvas } from '@react-three/fiber';
import { Suspense, memo } from 'react';
import { Starfield } from './Starfield';
import { CosmicLighting } from './CosmicLighting';
import { CosmicCore } from './CosmicCore';
import { CameraController } from './CameraController';
import { PlanetGroup } from './PlanetGroup';
import { DependencyArcs } from './DependencyArcs';
import { useOrbitStore } from '../store/useOrbitStore';

export const SceneWrapper = memo(function SceneWrapper() {
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
    <div onContextMenu={handleContextMenu} className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 14, 25], fov: 48, near: 0.1, far: 150 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={handlePointerMissed}
      >
        <color attach="background" args={['#030308']} />
        <fog attach="fog" args={['#030308', 35, 75]} />

        <Suspense fallback={null}>
          <CosmicLighting />
          <CosmicCore />
          <Starfield />
          <PlanetGroup />
          <DependencyArcs />
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
});
