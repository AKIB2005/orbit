import { memo, type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white/[0.01] border border-white/[0.04]">
      {icon ? (
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-400 mb-4">
          {icon}
        </div>
      ) : (
        <div className="relative w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
          <div className="w-2 h-2 rounded-full bg-slate-500" />
        </div>
      )}

      <h3 className="font-display font-medium text-sm text-slate-200 mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6 font-normal">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl text-xs font-display font-medium tracking-wider uppercase bg-white text-[#05050d] hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
});
