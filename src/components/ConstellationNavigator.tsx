import { memo, useRef, useEffect, useMemo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../types';

export const ConstellationNavigator = memo(function ConstellationNavigator() {
  const projects = useOrbitStore((s) => s.projects);
  const tasks = useOrbitStore((s) => s.tasks);
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const selectProject = useOrbitStore((s) => s.selectProject);
  const navRef = useRef<HTMLDivElement>(null);

  const projectList = useMemo(() => Object.values(projects), [projects]);

  // Keyboard arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (index + 1) % projectList.length;
      const nextId = projectList[nextIdx]?.id;
      if (nextId) selectProject(nextId);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (index - 1 + projectList.length) % projectList.length;
      const prevId = projectList[prevIdx]?.id;
      if (prevId) selectProject(prevId);
    }
  };

  // Global Tab key to cycle constellation
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      if (projectList.length === 0) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        const currIdx = projectList.findIndex((p) => p.id === selectedProjectId);
        const nextIdx = e.shiftKey
          ? (currIdx - 1 + projectList.length) % projectList.length
          : (currIdx + 1) % projectList.length;
        selectProject(projectList[nextIdx].id);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [projectList, selectedProjectId, selectProject]);

  // Scroll active item into view
  useEffect(() => {
    if (!selectedProjectId || !navRef.current) return;
    const activeBtn = navRef.current.querySelector<HTMLButtonElement>(`[data-id="${selectedProjectId}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedProjectId]);

  if (projectList.length === 0) return null;

  return (
    <nav
      ref={navRef}
      className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[92vw] overflow-x-auto py-1.5 sm:py-2 px-2.5 sm:px-3 glass-panel rounded-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      role="tablist"
      aria-label="Celestial Planetary Navigator"
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 pl-1 pr-2 border-r border-white/10 hidden md:inline-block">
          WORLDS:
        </span>

        {projectList.map((project, idx) => {
          const isSelected = selectedProjectId === project.id;
          const theme = COLOR_THEME_MAP[project.colorTheme];
          const projectTasks = Object.values(tasks).filter((t) => t.projectId === project.id);

          return (
            <button
              key={project.id}
              data-id={project.id}
              role="tab"
              aria-selected={isSelected}
              aria-label={`Select ${project.name}, Status ${project.status}, ${projectTasks.length} tasks`}
              onClick={() => selectProject(isSelected ? null : project.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.1] border-white/25 text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] scale-[1.02]'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.07]'
              } border`}
            >
              {/* Pulsing color beacon */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: isSelected ? `0 0 10px ${theme.primary}` : 'none',
                }}
              />

              <div className="flex flex-col text-left">
                <span className="font-display font-medium text-white truncate max-w-[130px] sm:max-w-[170px]">
                  {project.name}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {project.status} • {projectTasks.length} tasks
                </span>
              </div>

              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});
