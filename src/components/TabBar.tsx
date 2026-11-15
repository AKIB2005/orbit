import { memo, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOrbitStore } from '../store/useOrbitStore';
import type { UIState } from '../types';

type TabKey = UIState['panelView'];

export const TabBar = memo(function TabBar() {
  const panelView = useOrbitStore((s) => s.ui.panelView);
  const openPanel = useOrbitStore((s) => s.openPanel);
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const allTasks = useOrbitStore((s) => s.tasks);
  const allMilestones = useOrbitStore((s) => s.milestones);
  const refs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});

  const taskCount = useMemo(
    () => (selectedProjectId ? Object.values(allTasks).filter((t) => t.projectId === selectedProjectId).length : 0),
    [allTasks, selectedProjectId]
  );
  const milestoneCount = useMemo(
    () => (selectedProjectId ? Object.values(allMilestones).filter((m) => m.projectId === selectedProjectId).length : 0),
    [allMilestones, selectedProjectId]
  );

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'tasks', label: 'Tasks', count: taskCount },
    { key: 'insights', label: 'Insights' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'milestones', label: 'Milestones', count: milestoneCount },
    { key: 'notes', label: 'Notes' },
    { key: 'dependencies', label: 'Links' },
    { key: 'settings', label: 'Settings' },
  ];

  // Keep the active tab visible when the strip scrolls horizontally
  useEffect(() => {
    refs.current[panelView]?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  }, [panelView]);

  const move = (to: number) => {
    const next = tabs[(to + tabs.length) % tabs.length].key;
    openPanel(next);
    // Roving focus: move DOM focus with the selection so repeated arrow presses keep travelling
    requestAnimationFrame(() => refs.current[next]?.focus());
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); move(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); move(0); }
    else if (e.key === 'End') { e.preventDefault(); move(tabs.length - 1); }
  };

  return (
    <div
      className="flex border-b border-white/[0.07] overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Workspace sections"
    >
      {tabs.map((tab, idx) => {
        const selected = panelView === tab.key;
        return (
          <button
            key={tab.key}
            ref={(el) => {
              refs.current[tab.key] = el;
            }}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={selected}
            aria-controls="workspace-tabpanel"
            tabIndex={selected ? 0 : -1}
            onClick={() => openPanel(tab.key)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            className={`relative px-3 py-3 text-[13px] flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors duration-150 ${
              selected ? 'text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-[11px] tabular-nums text-slate-500">{tab.count}</span>
            )}
            {selected && (
              <motion.span
                layoutId="panel-tab-underline"
                className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-starlight"
                transition={{ type: 'spring', damping: 30, stiffness: 420 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
});
