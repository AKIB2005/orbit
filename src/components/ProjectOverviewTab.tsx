import { memo, useMemo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import type { ProjectStatus, ColorTheme } from '../types';
import { COLOR_THEME_MAP } from '../types';

interface ProjectOverviewTabProps {
  projectId: string;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-emerald-500' },
  { value: 'paused', label: 'Paused', color: 'bg-amber-500' },
  { value: 'completed', label: 'Completed', color: 'bg-cyan-500' },
  { value: 'archived', label: 'Archived', color: 'bg-slate-500' },
];

const THEMES: ColorTheme[] = ['violet', 'cyan', 'rose', 'amber', 'emerald', 'blue', 'orange', 'teal'];

export const ProjectOverviewTab = memo(function ProjectOverviewTab({
  projectId,
}: ProjectOverviewTabProps) {
  const project = useOrbitStore((s) => s.projects[projectId]);
  const updateProject = useOrbitStore((s) => s.updateProject);
  const openPanel = useOrbitStore((s) => s.openPanel);
  const allTasks = useOrbitStore((s) => s.tasks);
  const allMilestones = useOrbitStore((s) => s.milestones);
  const allLinks = useOrbitStore((s) => s.links);

  const tasks = useMemo(
    () => Object.values(allTasks).filter((t) => t.projectId === projectId),
    [allTasks, projectId]
  );

  const milestones = useMemo(
    () => Object.values(allMilestones).filter((m) => m.projectId === projectId),
    [allMilestones, projectId]
  );

  const dependenciesCount = useMemo(
    () => Object.values(allLinks).filter((l) => l.sourceProjectId === projectId || l.targetProjectId === projectId).length,
    [allLinks, projectId]
  );

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const criticalTasks = tasks.filter((t) => (t.priority === 'critical' || t.priority === 'high') && t.status !== 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const completedMilestones = milestones.filter((m) => m.completed).length;

  if (!project) return null;

  const theme = COLOR_THEME_MAP[project.colorTheme];

  return (
    <div className="space-y-6">
      {/* Progress & Health Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] text-slate-400">
              Progress
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-display text-3xl font-bold text-white">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-400">
                ({completedTasks} of {totalTasks} tasks complete)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400">
              Health
            </span>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  criticalTasks > 1 ? 'bg-amber-400 ' : 'bg-emerald-400 '
                }`}
              />
              <span className="text-xs font-medium text-slate-200">
                {criticalTasks > 1 ? 'Needs attention' : 'On track'}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden flex border border-white/[0.04]">
          <div
            className="h-full bg-emerald-400  transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="h-full bg-amber-400  transition-all duration-500"
            style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Done ({completedTasks})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> In progress ({inProgressTasks})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" /> To do ({totalTasks - completedTasks - inProgressTasks})
            </span>
          </div>
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => openPanel('tasks')}
          className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all text-left group"
        >
          <div className="text-[11px] text-slate-400 ">
            Tasks
          </div>
          <div className="text-xl font-display font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5">
            {totalTasks}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">In this project</div>
        </button>

        <button
          onClick={() => openPanel('milestones')}
          className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all text-left group"
        >
          <div className="text-[11px] text-slate-400 ">
            Milestones
          </div>
          <div className="text-xl font-display font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5">
            {completedMilestones}/{milestones.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Completed</div>
        </button>

        <button
          onClick={() => openPanel('dependencies')}
          className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all text-left group"
        >
          <div className="text-[11px] text-slate-400 ">
            Links
          </div>
          <div className="text-xl font-display font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5">
            {dependenciesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">To other planets</div>
        </button>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] text-slate-400 ">
            Urgent
          </div>
          <div className={`text-xl font-display font-bold mt-0.5 ${criticalTasks > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {criticalTasks}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Critical or high</div>
        </div>
      </div>

      {/* Editable Project Details Form */}
      <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="font-display font-semibold text-sm text-white">
            Details
          </h3>
          <span className="text-[11px] text-slate-400 ">
            Saved automatically
          </span>
        </div>

        {/* Project Name */}
        <div>
          <label className="field-label">
            Project Name
          </label>
          <input
            type="text"
            value={project.name}
            onChange={(e) => updateProject(projectId, { name: e.target.value })}
            maxLength={60}
            className="field"
          />
        </div>

        {/* Description */}
        <div>
          <label className="field-label">
            Description
          </label>
          <textarea
            value={project.description}
            onChange={(e) => updateProject(projectId, { description: e.target.value })}
            maxLength={500}
            rows={3}
            placeholder="What is this project about?"
            className="field resize-none"
          />
        </div>

        {/* Status & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="field-label">
              Status
            </label>
            <select
              value={project.status}
              onChange={(e) => updateProject(projectId, { status: e.target.value as ProjectStatus })}
              className="field"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a0a18] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">
              Target date
            </label>
            <input
              type="date"
              value={project.targetDate ? new Date(project.targetDate).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                updateProject(projectId, {
                  targetDate: e.target.value ? new Date(e.target.value).getTime() : null,
                })
              }
              className="field"
            />
          </div>
        </div>

        {/* Color Spectrum */}
        <div>
          <label className="field-label">
            Color
          </label>
          <div className="flex flex-wrap gap-2.5">
            {THEMES.map((t) => {
              const isSelected = project.colorTheme === t;
              const pColor = COLOR_THEME_MAP[t].primary;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateProject(projectId, { colorTheme: t })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    isSelected ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: pColor }}
                  title={`Color: ${t}`}
                  aria-label={`Color ${t}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
