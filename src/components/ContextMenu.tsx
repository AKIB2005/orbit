import { memo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../store/useOrbitStore';

export const ContextMenu = memo(function ContextMenu() {
  const contextMenu = useOrbitStore((s) => s.ui.contextMenu);
  const setContextMenu = useOrbitStore((s) => s.setContextMenu);
  const selectProject = useOrbitStore((s) => s.selectProject);
  const deleteProject = useOrbitStore((s) => s.deleteProject);
  const openPanel = useOrbitStore((s) => s.openPanel);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [setContextMenu]);

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="absolute z-50 bg-elevated border border-border rounded-lg shadow-xl py-1 min-w-[160px] pointer-events-auto"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
        >
          {contextMenu.targetId ? (
            <>
              <MenuItem label="Open" onClick={() => { selectProject(contextMenu.targetId!); setContextMenu(null); }} />
              <MenuItem label="Edit Settings" onClick={() => { selectProject(contextMenu.targetId!); openPanel('settings'); setContextMenu(null); }} />
              <MenuItem label="Add Task" onClick={() => { selectProject(contextMenu.targetId!); openPanel('tasks'); setContextMenu(null); }} />
              <div className="border-t border-border my-1" />
              <MenuItem label="Delete" onClick={() => { deleteProject(contextMenu.targetId!); setContextMenu(null); }} danger />
            </>
          ) : (
            <MenuItem label="Create Project" onClick={() => {
              document.dispatchEvent(new CustomEvent('orbit:create-project'));
              setContextMenu(null);
            }} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

function MenuItem({ label, onClick, danger = false }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
        danger ? 'text-red-400 hover:bg-red-400/10' : 'text-text-primary hover:bg-surface'
      }`}
    >
      {label}
    </button>
  );
}
