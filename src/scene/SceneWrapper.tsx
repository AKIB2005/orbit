import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Suspense, memo, useRef, useState, useCallback, useEffect } from 'react';
import { Starfield } from './Starfield';
import { CosmicLighting } from './CosmicLighting';
import { CosmicCore } from './CosmicCore';
import { CameraController } from './CameraController';
import { PlanetGroup } from './PlanetGroup';
import { DependencyArcs } from './DependencyArcs';
import { useOrbitStore } from '../store/useOrbitStore';
import { useReducedMotionPreference } from '../motion/useMotionPreference';
import { QUALITY, QualityContext, detectQualityTier, readDeviceHints, type QualityTier } from './quality';
import { FrameDemand } from './FrameDemand';
import { DebugStats } from './DebugStats';

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export const SceneWrapper = memo(function SceneWrapper() {
  const selectProject = useOrbitStore((s) => s.selectProject);
  const setContextMenu = useOrbitStore((s) => s.setContextMenu);
  const setViewMode = useOrbitStore((s) => s.setViewMode);
  const reduced = useReducedMotionPreference();
  const pointerDownPos = useRef({ x: 0, y: 0 });

  const [supported] = useState(hasWebGL);
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  // Quality: start from device hints, demote at runtime if frames drop, never exceed the starting ceiling.
  const [ceiling] = useState<QualityTier>(() =>
    detectQualityTier(readDeviceHints(), new URLSearchParams(window.location.search).get('quality'))
  );
  // An explicit ?quality=… is a deliberate choice, so it also disables runtime demotion
  const [locked] = useState(() => ['low', 'high'].includes(new URLSearchParams(window.location.search).get('quality') ?? ''));
  const [tier, setTier] = useState<QualityTier>(ceiling);
  const cfg = QUALITY[tier];

  // Pause rendering entirely while the tab is hidden; resume without a time jump (frame deltas are clamped).
  const [hidden, setHidden] = useState(() => document.visibilityState === 'hidden');
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Reduced motion means nothing moves on its own, so render on demand instead of 60 times a second.
  const frameloop = hidden ? 'never' : reduced ? 'demand' : 'always';

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerMissed = (e: MouseEvent) => {
    // Only treat as a deselect if the pointer barely moved (a drag is a camera rotation)
    const dist = Math.hypot(e.clientX - pointerDownPos.current.x, e.clientY - pointerDownPos.current.y);
    if (dist < 6) selectProject(null);
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const onCreated = useCallback(({ gl }: { gl: { domElement: HTMLCanvasElement } }) => {
    const el = gl.domElement;
    el.addEventListener('webglcontextlost', (ev) => {
      ev.preventDefault();
      setContextLost(true);
    });
    // Lights up after the first frame is composed, avoiding a flash of unlit geometry.
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  }, []);

  useEffect(() => () => void (document.body.style.cursor = ''), []);

  if (!supported || contextLost) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#030308]">
        <div className="max-w-sm text-center" role="alert">
          <h2 className="font-display text-lg text-white mb-2">
            {supported ? '3D view paused' : '3D isn’t available here'}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            {supported
              ? 'The graphics context was interrupted, usually by another tab or a driver reset. Your projects are safe.'
              : 'This browser or device can’t start WebGL. The 2D radar shows the same projects and works everywhere.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {supported && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setContextLost(false);
                  setReady(false);
                  setCanvasKey((k) => k + 1);
                }}
              >
                Restore 3D
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => setViewMode('2d')}>
              Open 2D radar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label="Interactive 3D map of your projects. Planets are projects and the small satellites are tasks. Use the planet list at the bottom of the screen, or the bracket keys, to move between planets."
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 w-full h-full select-none transition-opacity ease-[var(--ease-out)]"
      style={{ opacity: ready ? 1 : 0, transitionDuration: 'var(--dur-scene)' }}
    >
      <Canvas
        key={canvasKey}
        // Start pulled back; CameraController dollies in once on first load.
        camera={{ position: [0, 22, 42], fov: 48, near: 0.1, far: 160 }}
        dpr={cfg.dpr}
        frameloop={frameloop}
        gl={{ antialias: QUALITY[ceiling].antialias, powerPreference: ceiling === 'high' ? 'high-performance' : 'default' }}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={handlePointerMissed}
        onCreated={onCreated}
      >
        {!locked && (
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setTier('low')}
          onIncline={() => setTier(ceiling)}
          onFallback={() => setTier('low')}
        />
        )}
        <color attach="background" args={['#030308']} />
        <fog attach="fog" args={['#030308', 38, 85]} />

        <QualityContext.Provider value={tier}>
        <FrameDemand />
        <DebugStats />
        <Suspense fallback={null}>
          <CosmicLighting />
          <CosmicCore />
          <Starfield />
          <PlanetGroup />
          <DependencyArcs />
          <CameraController />
        </Suspense>
        </QualityContext.Provider>
      </Canvas>
      <div className="scene-vignette" />
    </div>
  );
});
