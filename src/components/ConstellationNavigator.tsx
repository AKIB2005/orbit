import { memo, useRef, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useOrbitStore } from '../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../types';
import { useMediaQuery } from '../motion/useMediaQuery';
import { SIDE_PANEL_QUERY, SIDE_PANEL_WIDTH } from './ui/layout';

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
};

export const ConstellationNavigator = memo(function ConstellationNavigator() {
  const projects = useOrbitStore((s) => s.projects);
  // Per-project task counts only; re-renders when a count changes, not on every task edit.
  const counts = useOrbitStore(
    useShallow((s) => {
      const c: Record<string, number> = {};
      for (const t of Object.values(s.tasks)) c[t.projectId] = (c[t.projectId] ?? 0) + 1;
      return c;
    })
  );
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const panelOpen = useOrbitStore((s) => s.ui.panelOpen);
  const selectProject = useOrbitStore((s) => s.selectProject);
  const navRef = useRef<HTMLElement>(null);
  const isDesktop = useMediaQuery(SIDE_PANEL_QUERY);

  const projectList = useMemo(() => Object.values(projects), [projects]);

  const step = (dir: 1 | -1) => {
    if (projectList.length === 0) return;
    const cur = projectList.findIndex((p) => p.id === selectedProjectId);
    const next = cur === -1 ? (dir === 1 ? 0 : projectList.length - 1) : (cur + dir + projectList.length) % projectList.length;
    selectProject(projectList[next].id);
  };

  const onItemKey = (e: React.KeyboardEvent, index: number) => {
    const go = (i: number) => {
      const id = projectList[(i + projectList.length) % projectList.length]?.id;
      if (!id) return;
      selectProject(id);
      requestAnimationFrame(() => navRef.current?.querySelector<HTMLButtonElement>(`[data-id="${id}"]`)?.focus());
    };
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(index + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(index - 1); }
  };

  // Global planet cycling.
  //  • "]" / "[" always work (never conflict with normal focus movement).
  //  • Tab / Shift+Tab cycle planets only while nothing is focused and no workspace is open, so
  //    Tab keeps its normal job of moving through controls the rest of the time.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey || projectList.length === 0) return;
      if (e.key === ']') { e.preventDefault(); step(1); }
      else if (e.key === '[') { e.preventDefault(); step(-1); }
      else if (e.key === 'Tab' && document.activeElement === document.body && !panelOpen) {
        e.preventDefault();
        step(e.shiftKey ? -1 : 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectList, selectedProjectId, panelOpen]);

  useEffect(() => {
    if (!selectedProjectId || !navRef.current) return;
    navRef.current
      .querySelector<HTMLButtonElement>(`[data-id="${selectedProjectId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedProjectId]);

  if (projectList.length === 0) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Planets"
      // Re-centres in the space left of the open panel so it never slides underneath it
      style={{ left: isDesktop && panelOpen ? `calc((100% - ${SIDE_PANEL_WIDTH}px) / 2)` : '50%', transition: 'left 700ms var(--ease-out), max-width 700ms var(--ease-out)' }}
      className="absolute -translate-x-1/2 bottom-safe z-20 pointer-events-auto max-w-[94vw] sm:max-w-[min(56rem,calc(100%-2rem))] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-1.5 glass-panel rounded-2xl"
    >
      <ul className="flex items-center gap-1" role="list">
        {projectList.map((project, idx) => {
          const isSelected = selectedProjectId === project.id;
          const theme = COLOR_THEME_MAP[project.colorTheme];
          const n = counts[project.id] ?? 0;
          return (
            <li key={project.id} className="shrink-0">
              <button
                data-id={project.id}
                aria-pressed={isSelected}
                aria-label={`${project.name}, ${project.status}, ${n} ${n === 1 ? 'task' : 'tasks'}`}
                onClick={() => selectProject(isSelected ? null : project.id)}
                onKeyDown={(e) => onItemKey(e, idx)}
                className={`group relative flex items-center gap-2.5 pl-3 pr-3.5 py-2 rounded-xl text-left transition-colors duration-200 cursor-pointer ${
                  isSelected ? 'bg-white/[0.1]' : 'hover:bg-white/[0.06]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-[transform,box-shadow] duration-300 group-hover:scale-125"
                  style={{ backgroundColor: theme.primary, boxShadow: isSelected ? `0 0 0 3px ${theme.primary}33, 0 0 12px ${theme.primary}88` : 'none' }}
                  aria-hidden
                />
                <span className="flex flex-col leading-tight">
                  <span className={`text-[13px] font-medium truncate max-w-[9rem] sm:max-w-[11rem] ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {project.name}
                  </span>
                  <span className="text-[11px] text-slate-500 capitalize tabular-nums">
                    {project.status} · {n}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
