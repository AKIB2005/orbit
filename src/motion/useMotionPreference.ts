import { useSyncExternalStore } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
const getSnapshot = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(QUERY).matches;

/**
 * True when motion should be minimised. The OS preference is read live (the persisted
 * in-app flag was captured once on first visit and could go stale), and either source wins.
 */
export function useReducedMotionPreference(): boolean {
  const os = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const app = useOrbitStore((s) => s.settings.reducedMotion);
  return os || app;
}
