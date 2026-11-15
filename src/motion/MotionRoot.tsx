import { useEffect, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { useReducedMotionPreference } from './useMotionPreference';

/** Applies the motion preference to framer-motion and to CSS (html.reduce-motion). */
export function MotionRoot({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionPreference();

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced);
  }, [reduced]);

  return <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>{children}</MotionConfig>;
}
