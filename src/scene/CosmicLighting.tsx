import { memo } from 'react';

export const CosmicLighting = memo(function CosmicLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#4338ca" />
      <pointLight position={[10, 15, 10]} intensity={0.8} color="#e2e8f0" />
      <pointLight position={[-8, -5, -10]} intensity={0.3} color="#06b6d4" />
    </>
  );
});
