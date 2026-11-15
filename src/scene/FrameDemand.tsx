import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useOrbitStore } from '../store/useOrbitStore';

/**
 * With frameloop="demand" nothing renders unless asked. Any store change (selection, hover, tasks,
 * settings) may alter the scene, so request a frame. Camera moves and resizes already invalidate.
 */
export function FrameDemand() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    return useOrbitStore.subscribe(() => invalidate());
  }, [invalidate]);
  return null;
}
