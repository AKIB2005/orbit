import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../../store/useOrbitStore';
import { Icon, type IconName } from '../ui/Icon';
import { toast as toastVariants } from '../../motion/tokens';

const TONE: Record<string, { icon: IconName; accent: string; text: string }> = {
  success: { icon: 'check', accent: 'bg-emerald-400', text: 'text-emerald-300' },
  error: { icon: 'alert', accent: 'bg-rose-400', text: 'text-rose-300' },
  warning: { icon: 'alert', accent: 'bg-amber-400', text: 'text-amber-300' },
  info: { icon: 'info', accent: 'bg-sky-300', text: 'text-sky-300' },
};

export const ToastContainer = memo(function ToastContainer() {
  const toasts = useOrbitStore((s) => s.toasts);
  const removeToast = useOrbitStore((s) => s.removeToast);

  return (
    // Sits below the top bar so it never covers its controls
    <div
      className="fixed z-[70] top-[calc(max(0.75rem,env(safe-area-inset-top))+3.5rem)] right-3 sm:right-5 left-3 sm:left-auto sm:w-[22rem] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tone = TONE[t.type] ?? TONE.info;
          return (
            <motion.div
              key={t.id}
              layout
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role={t.type === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto relative overflow-hidden flex items-start gap-3 py-3 pl-4 pr-2 rounded-xl sheet-surface"
            >
              <span className={`absolute left-0 inset-y-0 w-[3px] ${tone.accent}`} aria-hidden />
              <Icon name={tone.icon} className={`mt-0.5 shrink-0 ${tone.text}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white leading-snug">{t.title}</p>
                {t.message && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t.message}</p>}
              </div>
              <button className="btn-icon !w-7 !h-7" onClick={() => removeToast(t.id)} aria-label="Dismiss notification">
                <Icon name="close" size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});
