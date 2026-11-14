import { memo, useMemo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../types';

interface PanelHeaderProps {
  projectId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const PanelHeader = memo(function PanelHeader({
  projectId,
  isExpanded,
  onToggleExpand,
}: PanelHeaderProps) {
  const project = useOrbitStore((s) => s.projects[projectId]);
  const allProjects = useOrbitStore((s) => s.projects);
  const selectProject = useOrbitStore((s) => s.selectProject);
  const closePanel = useOrbitStore((s) => s.closePanel);
  const tasks = useOrbitStore((s) => s.tasks);

  const projectList = useMemo(() => Object.values(allProjects), [allProjects]);
  const currentIndex = projectList.findIndex((p) => p.id === projectId);

  const handlePrev = () => {
    if (projectList.length <= 1) return;
    const prevIdx = (currentIndex - 1 + projectList.length) % projectList.length;
    selectProject(projectList[prevIdx].id);
  };

  const handleNext = () => {
    if (projectList.length <= 1) return;
    const nextIdx = (currentIndex + 1) % projectList.length;
    selectProject(projectList[nextIdx].id);
  };

  const projectTasks = useMemo(
    () => Object.values(tasks).filter((t) => t.projectId === projectId),
    [tasks, projectId]
  );
  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
  const progressPercent = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

  if (!project) return null;

  const themeColors = COLOR_THEME_MAP[project.colorTheme];

  return (
    <div className="p-4 border-b border-white/[0.08] bg-black/40">
      <div className="flex items-center justify-between gap-3">
        {/* Planet Identity */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-[0_0_10px_currentColor] transition-colors"
            style={{ backgroundColor: themeColors.primary, color: themeColors.primary }}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-white truncate">
                {project.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-white/[0.06] text-slate-300 uppercase shrink-0">
                {project.status}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
              {projectTasks.length} task satellites • {progressPercent}% orbit complete
            </p>
          </div>
        </div>

        {/* Planet Traversal & Window Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Previous Planet */}
          <button
            onClick={handlePrev}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors text-xs font-mono"
            title="Cycle to previous planet"
            aria-label="Previous Planet"
          >
            ◀
          </button>

          {/* Next Planet */}
          <button
            onClick={handleNext}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors text-xs font-mono"
            title="Cycle to next planet"
            aria-label="Next Planet"
          >
            ▶
          </button>

          {/* Expand/Collapse Width */}
          <button
            onClick={onToggleExpand}
            className="w-7 h-7 hidden sm:flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors text-xs font-mono ml-1"
            title={isExpanded ? 'Collapse panel width' : 'Expand panel width'}
            aria-label="Toggle Panel Width"
          >
            {isExpanded ? '⇲' : '⇱'}
          </button>

          {/* Close Panel */}
          <button
            onClick={closePanel}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors text-xs font-mono"
            aria-label="Close Project Workspace"
            title="Close workspace (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden mt-3">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
});
