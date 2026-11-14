import { memo } from 'react';

export const CosmicLighting = memo(function CosmicLighting() {
  return (
    <>
      {/* Deep Space Ambient Light (cool indigo base) */}
      <ambientLight intensity={0.25} color="#312e81" />

      {/* Distant Star Key Light */}
      <directionalLight
        position={[25, 20, 15]}
        intensity={1.2}
        color="#f8fafc"
      />

      {/* Backlight Rim Lighting (Cosmic Cyan & Violet) */}
      <directionalLight
        position={[-20, -10, -25]}
        intensity={0.65}
        color="#06b6d4"
      />
      <directionalLight
        position={[-15, 15, -15]}
        intensity={0.45}
        color="#8b5cf6"
      />
    </>
  );
});
