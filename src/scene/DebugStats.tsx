import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useQualityTier } from './quality';

/**
 * Opt-in diagnostics: open the app with `?debug` and read `window.__orbitStats()` in the console.
 * Renders nothing and is inert otherwise. Used to measure GPU resource counts and frames drawn.
 */
export function DebugStats() {
  const gl = useThree((s) => s.gl);
  const tier = useQualityTier();
  useEffect(() => {
    if (typeof window === 'undefined' || !new URLSearchParams(window.location.search).has('debug')) return;
    const w = window as unknown as { __orbitStats?: () => unknown };
    w.__orbitStats = () => ({
      tier,
      frames: gl.info.render.frame,
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      programs: gl.info.programs?.length ?? 0,
      pixelRatio: gl.getPixelRatio(),
    });
    return () => {
      delete w.__orbitStats;
    };
  }, [gl, tier]);
  return null;
}
