import { memo, useMemo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../types';
import { Icon } from './ui/Icon';

interface PanelHeaderProps {
  projectId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

export const PanelHeader = memo(function PanelHeader({ projectId, isExpanded, onToggleExpand }: PanelHeaderProps) {
  const project = useOrbitStore((s) => s.projects[projectId]);
  const allProjects = useOrbitStore((s) => s.projects);
  const selectProject = useOrbitStore((s) => s.selectProject);
  const closePanel = useOrbitStore((s) => s.closePanel);
  const tasks = useOrbitStore((s) => s.tasks);

  const projectList = useMemo(() => Object.values(allProjects), [allProjects]);
  const currentIndex = projectList.findIndex((p) => p.id === projectId);

  const step = (dir: 1 | -1) => {
    if (projectList.length <= 1) return;
    selectProject(projectList[(currentIndex + dir + projectList.length) % projectList.length].id);
  };

  const { total, percent } = useMemo(() => {
    const mine = Object.values(tasks).filter((t) => t.projectId === projectId);
    const done = mine.filter((t) => t.status === 'done').length;
    return { total: mine.length, percent: mine.length ? Math.round((done / mine.length) * 100) : 0 };
  }, [tasks, projectId]);

  if (!project) return null;
  const color = COLOR_THEME_MAP[project.colorTheme].primary;

  return (
    <div className="px-4 pt-3 pb-3.5 sm:pt-4 border-b border-white/[0.07]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0 transition-colors duration-500"
            style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}66` }}
            aria-hidden
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-medium text-white truncate">{project.name}</h2>
              <span className="chip shrink-0">{STATUS_LABEL[project.status] ?? project.status}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
              {total} {total === 1 ? 'task' : 'tasks'} · {percent}% complete
            </p>
          </div>
        </div>

        <div className="flex items-center shrink-0 -mr-1">
          <button className="btn-icon" onClick={() => step(-1)} aria-label="Previous planet" title="Previous planet ([)">
            <Icon name="chevronLeft" />
          </button>
          <button className="btn-icon" onClick={() => step(1)} aria-label="Next planet" title="Next planet (])">
            <Icon name="chevronRight" />
          </button>
          <button
            className="btn-icon hidden sm:inline-flex"
            onClick={onToggleExpand}
            aria-label={isExpanded ? 'Narrow panel' : 'Widen panel'}
            aria-pressed={isExpanded}
            title={isExpanded ? 'Narrow panel' : 'Widen panel'}
          >
            <Icon name={isExpanded ? 'collapse' : 'expand'} />
          </button>
          <button className="btn-icon" onClick={closePanel} aria-label="Close workspace" title="Close (Esc)">
            <Icon name="close" />
          </button>
        </div>
      </div>

      {/* Progress uses the planet's own colour so the panel and the 3D body read as one object */}
      <div
        className="h-[3px] rounded-full bg-white/[0.07] overflow-hidden mt-3.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Project completion"
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out)]"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
});
