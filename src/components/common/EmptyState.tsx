import { memo, type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Compact variant for use inside panels. */
  compact?: boolean;
}

/** A tiny planet-and-satellite mark: the default "nothing here yet" illustration. */
function OrbitMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <ellipse cx="28" cy="28" rx="25" ry="10" transform="rotate(-24 28 28)" stroke="rgba(255,255,255,0.14)" strokeDasharray="2 4" />
      <circle cx="28" cy="28" r="8" fill="rgba(243,238,226,0.9)" />
      <circle cx="47.5" cy="17.5" r="2.5" fill="#7dd3fc" />
    </svg>
  );
}

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] ${
        compact ? 'p-6' : 'p-8 sm:p-12'
      }`}
    >
      <div className="mb-4 text-slate-400">{icon ?? <OrbitMark />}</div>
      <h3 className="font-display font-medium text-base text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
});
