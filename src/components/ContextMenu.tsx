import { memo, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../store/useOrbitStore';
import { popover } from '../motion/tokens';

export const ContextMenu = memo(function ContextMenu() {
  const contextMenu = useOrbitStore((s) => s.ui.contextMenu);
  const setContextMenu = useOrbitStore((s) => s.setContextMenu);
  const selectProject = useOrbitStore((s) => s.selectProject);
  const deleteProject = useOrbitStore((s) => s.deleteProject);
  const openPanel = useOrbitStore((s) => s.openPanel);
  const addToast = useOrbitStore((s) => s.addToast);
  const targetName = useOrbitStore((s) => (s.ui.contextMenu?.targetId ? s.projects[s.ui.contextMenu.targetId]?.name : undefined));
  const menuRef = useRef<HTMLDivElement>(null);
  const [armedFor, setArmedFor] = useState<object | null>(null);
  // Armed only for the menu instance it was armed on, so reopening always starts disarmed
  const confirmDelete = !!contextMenu && armedFor === contextMenu;

  const open = !!contextMenu;

  useEffect(() => {
    if (!open) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
      if (!items.length) return;
      const i = items.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      else if (e.key === 'Tab') close();
    };
    window.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
    window.addEventListener('blur', close);
    window.addEventListener('resize', close);
    const raf = requestAnimationFrame(() => menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus());
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('blur', close);
      window.removeEventListener('resize', close);
    };
  }, [open, setContextMenu]);

  const w = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const h = typeof window !== 'undefined' ? window.innerHeight : 800;
  const x = contextMenu ? Math.max(12, Math.min(contextMenu.x, w - 196)) : 0;
  const y = contextMenu ? Math.max(12, Math.min(contextMenu.y, h - 220)) : 0;
  const id = contextMenu?.targetId;

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={menuRef}
          variants={popover}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed z-[65] sheet-surface rounded-xl p-1 min-w-[11.5rem] pointer-events-auto origin-top-left"
          style={{ left: x, top: y }}
          role="menu"
          aria-label={targetName ? `${targetName} actions` : 'Workspace actions'}
        >
          {id ? (
            <>
              <Item label="Open" onClick={() => (selectProject(id), setContextMenu(null))} />
              <Item label="Add task" onClick={() => (selectProject(id), openPanel('tasks'), setContextMenu(null))} />
              <Item label="Settings" onClick={() => (selectProject(id), openPanel('settings'), setContextMenu(null))} />
              <div className="my-1 h-px bg-white/[0.08]" role="separator" />
              {/* Two-step delete: the first click arms it, the second confirms. Menu stays open in between. */}
              <Item
                danger
                armed={confirmDelete}
                label={confirmDelete ? 'Click again to delete' : 'Delete planet'}
                keepOpen={!confirmDelete}
                onClick={() => {
                  if (!confirmDelete) {
                    setArmedFor(contextMenu);
                    return;
                  }
                  deleteProject(id);
                  addToast({ type: 'success', title: 'Planet deleted', message: targetName ? `${targetName} and its tasks were removed.` : undefined });
                  setContextMenu(null);
                }}
              />
            </>
          ) : (
            <Item label="New planet" onClick={() => (document.dispatchEvent(new CustomEvent('orbit:create-project')), setContextMenu(null))} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

function Item({
  label,
  onClick,
  danger = false,
  armed = false,
  keepOpen = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  armed?: boolean;
  keepOpen?: boolean;
}) {
  return (
    <button
      role="menuitem"
      tabIndex={-1}
      onClick={(e) => {
        // The window click-listener closes the menu; swallow it when we need the menu to stay open
        if (keepOpen) e.nativeEvent.stopImmediatePropagation();
        onClick();
      }}
      className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors duration-100 ${
        armed
          ? 'bg-rose-500/20 text-rose-200'
          : danger
            ? 'text-rose-300 hover:bg-rose-500/10 focus:bg-rose-500/10'
            : 'text-slate-200 hover:bg-white/[0.08] focus:bg-white/[0.08]'
      }`}
    >
      {label}
    </button>
  );
}
