import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade, modal } from '../../motion/tokens';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name announced by screen readers. */
  label: string;
  children: ReactNode;
  className?: string;
  /** Tailwind max-width class, default max-w-md. */
  width?: string;
  /** Panel scrolls when taller than the viewport (default). Disable if children manage their own scrolling. */
  scroll?: boolean;
  /** Where the dialog sits: centered, or a bottom sheet on small screens. */
  placement?: 'center' | 'top';
}

/**
 * Centered dialog with scrim, focus trap, Esc-to-close and focus restoration.
 * Rendered fixed + pointer-events-auto so it works inside the pointer-events-none HUD layer.
 */
export function Modal({ open, onClose, label, children, className = '', width = 'max-w-md', scroll = true, placement = 'center' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the first autofocus/field, otherwise the first control, otherwise the panel.
    const raf = requestAnimationFrame(() => {
      const el = panelRef.current;
      if (!el || el.contains(document.activeElement)) return;
      const target = el.querySelector<HTMLElement>('[data-autofocus]') ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el;
      target.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey, true);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-[60] flex justify-center p-3 sm:p-4 pointer-events-auto ${
            placement === 'top' ? 'items-end sm:items-start sm:pt-[10vh]' : 'items-center'
          }`}>
          <motion.div
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-[#02020a]/70"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={`relative w-full ${width} max-h-[90dvh] ${scroll ? 'overflow-y-auto' : 'overflow-hidden'} rounded-[var(--radius-sheet)] sheet-surface ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
