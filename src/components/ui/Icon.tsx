import { memo } from 'react';

const PATHS = {
  close: 'M6 6l12 12M18 6L6 18',
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronRight: 'M9 5l7 7-7 7',
  chevronDown: 'M5 9l7 7 7-7',
  arrowRight: 'M5 12h14m-6-6l6 6-6 6',
  arrowLeft: 'M19 12H5m6-6l-6 6 6 6',
  expand: 'M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6',
  collapse: 'M10 4v6H4M14 20v-6h6M10 10L4 4M14 14l6 6',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 8v5m0 3.5v.01M10.3 3.9L2.6 17.5A2 2 0 004.3 20.5h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  info: 'M12 11v5m0-8.5v.01M12 21a9 9 0 100-18 9 9 0 000 18z',
  search: 'M21 21l-4.5-4.5M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  help: 'M9.5 9.2a2.6 2.6 0 115 .9c0 1.7-2.5 2-2.5 3.6M12 17v.01M12 21a9 9 0 100-18 9 9 0 000 18z',
  cloud: 'M7 18a4 4 0 01-.6-7.95A5.5 5.5 0 0117 8.5a4.75 4.75 0 01.5 9.5H7z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z',
  trash: 'M5 7h14M10 11v6m4-6v6M6 7l1 12a1 1 0 001 1h8a1 1 0 001-1l1-12M9 7V4h6v3',
  radar: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-5a4 4 0 100-8 4 4 0 000 8zm0-4l5-5',
  planet: 'M12 17a5 5 0 100-10 5 5 0 000 10zM3.5 15.5c-1.2-1.7 2.8-5.4 8.5-6.5 5.7-1.1 9.7.3 8.5 2.5',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/** Tiny stroke icon set — decorative by default (aria-hidden); label the parent button. */
export const Icon = memo(function Icon({ name, size = 16, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
});
