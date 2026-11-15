import type { Transition, Variants } from 'framer-motion';

/**
 * ORBIT motion language
 * - One decelerating curve (easeOut) for things that arrive.
 * - One symmetric curve (easeInOut) for things that travel.
 * - Springs only for surfaces the user physically "throws" (panels, sheets).
 * - Exits are ~40% faster than entrances so the UI never feels like it is waiting.
 */
export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

export const dur = { fast: 0.14, base: 0.24, slow: 0.48, scene: 0.9 };

export const spring = {
  sheet: { type: 'spring', damping: 32, stiffness: 340, mass: 0.9 } as Transition,
  pop: { type: 'spring', damping: 26, stiffness: 380 } as Transition,
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: dur.base, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: dur.fast, ease: ease.inOut } },
};

export const popover: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: dur.fast, ease: ease.inOut } },
};

export const modal: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 14 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.pop },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: dur.fast, ease: ease.inOut } },
};

/** Content swap inside a panel: short, no travel distance to read. */
export const tabSwap: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: 0.08 } },
};

export const toast: Variants = {
  hidden: { opacity: 0, x: 24, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1, transition: spring.pop },
  exit: { opacity: 0, x: 16, transition: { duration: dur.fast, ease: ease.inOut } },
};

/** Staggered list entrance: use once per list mount, not on every re-render. */
export const listParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};
export const listItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
};
