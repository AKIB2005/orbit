import { memo, useMemo } from 'react';
import { useOrbitStore } from '../../store/useOrbitStore';
import { EmptyState } from '../common/EmptyState';
import { Icon } from '../ui/Icon';

interface ProjectInsightsTabProps {
  projectId: string;
}

export const ProjectInsightsTab = memo(function ProjectInsightsTab({ projectId }: ProjectInsightsTabProps) {
  const project = useOrbitStore((s) => s.projects[projectId]);
  const allTasks = useOrbitStore((s) => s.tasks);
  const allMilestones = useOrbitStore((s) => s.milestones);
  const links = useOrbitStore((s) => s.links);
  const openPanel = useOrbitStore((s) => s.openPanel);

  const tasks = useMemo(
    () => Object.values(allTasks).filter((t) => t.projectId === projectId),
    [allTasks, projectId]
  );

  const milestones = useMemo(
    () => Object.values(allMilestones).filter((m) => m.projectId === projectId),
    [allMilestones, projectId]
  );

  // Compute Core Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    if (total === 0) {
      return {
        completionRatio: 0,
        healthScore: 100,
        todoCount: 0,
        inProgressCount: 0,
        doneCount: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        overdueCount: 0,
        bottlenecks: [],
        estimatedDaysRemaining: 0,
        due: { overdue: 0, week: 0, nextWeek: 0, later: 0, none: 0 },
      };
    }

    const todoCount = tasks.filter((t) => t.status === 'todo').length;
    const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
    const doneCount = tasks.filter((t) => t.status === 'done').length;

    const criticalCount = tasks.filter((t) => t.priority === 'critical').length;
    const highCount = tasks.filter((t) => t.priority === 'high').length;
    const mediumCount = tasks.filter((t) => t.priority === 'medium').length;
    const lowCount = tasks.filter((t) => t.priority === 'low').length;

    const now = Date.now();
    const overdueCount = tasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== 'done').length;

    const completionRatio = Math.round((doneCount / total) * 100);

    // Dynamic health score: base 100 - deductions for overdue, critical unassigned, or stalled tasks
    let health = 100;
    health -= overdueCount * 12;
    health -= tasks.filter((t) => t.priority === 'critical' && t.status === 'todo').length * 8;
    if (milestones.length === 0 && total > 4) health -= 10;
    const healthScore = Math.max(10, Math.min(100, health));

    // Bottlenecks detection
    const bottlenecks: string[] = [];
    if (overdueCount > 0) {
      bottlenecks.push(`${overdueCount} ${overdueCount > 1 ? 'tasks are' : 'task is'} past due.`);
    }
    const criticalPending = tasks.filter((t) => t.priority === 'critical' && t.status === 'todo').length;
    if (criticalPending > 0) {
      bottlenecks.push(`${criticalPending} critical ${criticalPending > 1 ? 'tasks haven’t' : 'task hasn’t'} been started.`);
    }

    // Inter-project link dependencies check
    const incomingLinks = Object.values(links).filter((l) => l.targetProjectId === projectId);
    if (incomingLinks.length > 0 && completionRatio < 50) {
      bottlenecks.push(`Other planets depend on this one, and it’s less than half done.`);
    }

    // Rough estimate only: assumes 2.5 working days per remaining task (not derived from history)
    const remainingTasks = todoCount + inProgressCount;
    const estimatedDaysRemaining = Math.max(1, Math.round(remainingTasks * 2.5));

    // Open tasks grouped by when they are due (real data from each task's due date)
    const DAY = 86_400_000;
    const due = { overdue: 0, week: 0, nextWeek: 0, later: 0, none: 0 };
    for (const t of tasks) {
      if (t.status === 'done') continue;
      if (!t.dueDate) due.none++;
      else if (t.dueDate < now) due.overdue++;
      else if (t.dueDate < now + 7 * DAY) due.week++;
      else if (t.dueDate < now + 14 * DAY) due.nextWeek++;
      else due.later++;
    }

    return {
      due,
      completionRatio,
      healthScore,
      todoCount,
      inProgressCount,
      doneCount,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      overdueCount,
      bottlenecks,
      estimatedDaysRemaining,
    };
  }, [tasks, milestones, links, projectId]);

  if (!project) return null;

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No insights yet"
        description="Add a few tasks and this tab will show progress, due dates and anything that needs attention."
        actionLabel="Add a task"
        onAction={() => openPanel('tasks')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Health & Velocity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Health Score Gauge */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 ">
            Health
          </span>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-2">
            <span
              className={`font-display text-3xl font-medium ${
                metrics.healthScore > 80
                  ? 'text-emerald-400'
                  : metrics.healthScore > 50
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {metrics.healthScore}%
            </span>
            <span className="text-xs text-slate-400">
              {metrics.healthScore > 80 ? 'On track' : metrics.healthScore > 50 ? 'Needs attention' : 'At risk'}
            </span>
          </div>
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                metrics.healthScore > 80
                  ? 'bg-emerald-400'
                  : metrics.healthScore > 50
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}
              style={{ width: `${metrics.healthScore}%` }}
            />
          </div>
        </div>

        {/* Completion Velocity */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 ">
            Tasks done
          </span>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-2">
            <span className="font-display text-3xl font-medium text-white">
              {metrics.completionRatio}%
            </span>
            <span className="text-xs text-slate-400">
              {metrics.doneCount} of {tasks.length}
            </span>
          </div>
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-700"
              style={{ width: `${metrics.completionRatio}%` }}
            />
          </div>
        </div>

        {/* Projected Horizon */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 ">
            Rough estimate
          </span>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-2">
            <span className="font-display text-3xl font-medium text-slate-200">
              ~{metrics.estimatedDaysRemaining}d
            </span>
            <span className="text-xs text-slate-400">to finish (est.)</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-3">
            Assumes ~2.5 days per open task. Not based on your history.
          </span>
        </div>
      </div>

      {/* Open tasks by due date (real data) */}
      <section aria-labelledby="ins-due" className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <h3 id="ins-due" className="text-sm font-medium text-white mb-4">Open tasks by due date</h3>
        {(() => {
          const rows: { label: string; value: number; tone: string }[] = [
            { label: 'Overdue', value: metrics.due.overdue, tone: 'bg-rose-400' },
            { label: 'This week', value: metrics.due.week, tone: 'bg-amber-400' },
            { label: 'Next week', value: metrics.due.nextWeek, tone: 'bg-sky-300' },
            { label: 'Later', value: metrics.due.later, tone: 'bg-slate-400' },
            { label: 'No date', value: metrics.due.none, tone: 'bg-slate-600' },
          ];
          const max = Math.max(1, ...rows.map((r) => r.value));
          return (
            <ul className="space-y-2.5">
              {rows.map((r) => (
                <li key={r.label} className="grid grid-cols-[5.5rem_1fr_1.5rem] items-center gap-3 text-xs">
                  <span className="text-slate-400">{r.label}</span>
                  <span className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden" aria-hidden>
                    <span
                      className={`block h-full rounded-full ${r.tone} transition-[width] duration-700 ease-[var(--ease-out)]`}
                      style={{ width: `${(r.value / max) * 100}%` }}
                    />
                  </span>
                  <span className="text-white tabular-nums text-right">{r.value}</span>
                </li>
              ))}
            </ul>
          );
        })()}
      </section>

      {/* Task Status & Priority Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <span className="text-[11px] text-slate-400 block">
            By status
          </span>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Done
              </span>
              <span className="text-white">{metrics.doneCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> In Progress
              </span>
              <span className="text-white">{metrics.inProgressCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> To do
              </span>
              <span className="text-white">{metrics.todoCount}</span>
            </div>
          </div>
        </div>

        {/* Priority Matrix */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <span className="text-[11px] text-slate-400 block">
            By priority
          </span>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-400">Critical</span>
              <span className="text-white">{metrics.criticalCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-400">High</span>
              <span className="text-white">{metrics.highCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400">Medium</span>
              <span className="text-white">{metrics.mediumCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Low</span>
              <span className="text-white">{metrics.lowCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottlenecks and Anomaly Detection */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 ">
            Needs attention
          </span>
          <span className="text-[11px] text-slate-500">Checked automatically</span>
        </div>

        {metrics.bottlenecks.length === 0 ? (
          <p className="text-xs text-emerald-400/90 pt-1">
            No problems found. Everything in this project is on track.
          </p>
        ) : (
          <ul className="space-y-2 pt-1">
            {metrics.bottlenecks.map((b, idx) => (
              <li
                key={idx}
                className="text-xs text-amber-300/90 flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/15"
              >
                <Icon name="alert" size={14} className="mt-px shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});
