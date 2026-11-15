import { memo, useMemo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import type { UIState } from '../types';

export const TabBar = memo(function TabBar() {
  const panelView = useOrbitStore((s) => s.ui.panelView);
  const openPanel = useOrbitStore((s) => s.openPanel);
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const allTasks = useOrbitStore((s) => s.tasks);
  const allMilestones = useOrbitStore((s) => s.milestones);

  const taskCount = useMemo(() => {
    if (!selectedProjectId) return 0;
    return Object.values(allTasks).filter((t) => t.projectId === selectedProjectId).length;
  }, [allTasks, selectedProjectId]);

  const milestoneCount = useMemo(() => {
    if (!selectedProjectId) return 0;
    return Object.values(allMilestones).filter((m) => m.projectId === selectedProjectId).length;
  }, [allMilestones, selectedProjectId]);

  const tabs: { key: UIState['panelView']; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'tasks', label: 'Tasks', count: taskCount },
    { key: 'insights', label: 'Insights' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'milestones', label: 'Milestones', count: milestoneCount },
    { key: 'notes', label: 'Notes' },
    { key: 'dependencies', label: 'Links' },
    { key: 'settings', label: 'Settings' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (index + 1) % tabs.length;
      openPanel(tabs[nextIdx].key);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (index - 1 + tabs.length) % tabs.length;
      openPanel(tabs[prevIdx].key);
    }
  };

  return (
    <div
      className="flex border-b border-white/[0.08] bg-black/20 overflow-x-auto px-2"
      role="tablist"
      aria-label="Workspace Sections"
    >
      {tabs.map((tab, idx) => {
        const isSelected = panelView === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isSelected}
            onClick={() => openPanel(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`px-3 py-2.5 text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border-b-2 ${isSelected
                ? 'text-cyan-300 border-cyan-400 font-semibold bg-white/[0.03]'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-white/[0.01]'
              }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/[0.06] text-slate-400'
                  }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
