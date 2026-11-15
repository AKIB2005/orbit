import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../../store/useOrbitStore';

export const ToastContainer = memo(function ToastContainer() {
  const toasts = useOrbitStore((s) => s.toasts);
  const removeToast = useOrbitStore((s) => s.removeToast);

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const borderColor =
            toast.type === 'success'
              ? 'border-emerald-500/40 text-emerald-300'
              : toast.type === 'error'
              ? 'border-red-500/40 text-red-300'
              : toast.type === 'warning'
              ? 'border-amber-500/40 text-amber-300'
              : 'border-cyan-500/40 text-cyan-300';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto p-3.5 rounded-xl bg-[#090916]/95 border ${borderColor} shadow-2xl backdrop-blur-2xl flex items-start gap-3`}
              role="alert"
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <span className="text-emerald-400">✓</span>}
                {toast.type === 'error' && <span className="text-red-400">✕</span>}
                {toast.type === 'warning' && <span className="text-amber-400">⚠</span>}
                {toast.type === 'info' && <span className="text-cyan-400">✦</span>}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-mono font-medium text-white tracking-wide">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans font-normal">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white text-xs px-1"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});
