import { createContext, useContext } from 'react';

export type QualityTier = 'high' | 'low';

export interface DeviceHints {
  cores?: number;
  memory?: number; // GB, navigator.deviceMemory (Chromium only)
  coarsePointer?: boolean;
  width?: number;
  saveData?: boolean;
}

/** What each tier costs. Everything the scene scales lives here so it can be tuned in one place. */
export const QUALITY = {
  high: { dpr: [1, 1.75] as [number, number], starDensity: 1, planetSegments: 48, coreSegments: 64, fullLighting: true, antialias: true },
  low: { dpr: [1, 1] as [number, number], starDensity: 0.35, planetSegments: 24, coreSegments: 32, fullLighting: false, antialias: false },
} as const;

/**
 * Starting tier from coarse device signals. This is a heuristic, not a benchmark: the runtime
 * PerformanceMonitor can still demote a "high" device, and `?quality=low|high` overrides it.
 */
export function detectQualityTier(h: DeviceHints, override?: string | null): QualityTier {
  if (override === 'low' || override === 'high') return override;
  if (h.saveData) return 'low';
  if (h.cores !== undefined && h.cores <= 4) return 'low';
  if (h.memory !== undefined && h.memory <= 4) return 'low';
  if (h.coarsePointer && (h.width ?? 1024) < 768) return 'low';
  return 'high';
}

export function readDeviceHints(): DeviceHints {
  if (typeof navigator === 'undefined') return {};
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return {
    cores: nav.hardwareConcurrency,
    memory: nav.deviceMemory,
    coarsePointer: typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches,
    width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    saveData: nav.connection?.saveData,
  };
}

export const QualityContext = createContext<QualityTier>('high');
export const useQuality = () => QUALITY[useContext(QualityContext)];
export const useQualityTier = () => useContext(QualityContext);
