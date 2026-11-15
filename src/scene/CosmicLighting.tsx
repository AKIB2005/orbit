import { memo } from 'react';
import { useQuality } from './quality';

/** Lights are per-fragment cost on every planet: the low tier keeps ambient + the key light only. */
export const CosmicLighting = memo(function CosmicLighting() {
  const q = useQuality();
  return (
    <>
      {/* Deep space ambient (cool indigo base) */}
      <ambientLight intensity={q.fullLighting ? 0.25 : 0.38} color="#312e81" />

      {/* Distant star key light */}
      <directionalLight position={[25, 20, 15]} intensity={1.2} color="#f8fafc" />

      {q.fullLighting && (
        <>
          {/* Rim lights (cyan & violet) */}
          <directionalLight position={[-20, -10, -25]} intensity={0.65} color="#06b6d4" />
          <directionalLight position={[-15, 15, -15]} intensity={0.45} color="#8b5cf6" />
        </>
      )}
    </>
  );
});
