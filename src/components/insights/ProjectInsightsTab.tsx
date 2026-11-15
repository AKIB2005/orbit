import { memo, useMemo } from 'react';
import { useOrbitStore } from '../../store/useOrbitStore';
import { EmptyState } from '../common/EmptyState';

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
      bottlenecks.push(`${overdueCount} task satellite${overdueCount > 1 ? 's have' : ' has'} drifted past their scheduled horizon.`);
    }
    const criticalPending = tasks.filter((t) => t.priority === 'critical' && t.status === 'todo').length;
    if (criticalPending > 0) {
      bottlenecks.push(`${criticalPending} critical priority satellite${criticalPending > 1 ? 's are' : ' is'} pending launch.`);
    }

    // Inter-project link dependencies check
    const incomingLinks = Object.values(links).filter((l) => l.targetProjectId === projectId);
    if (incomingLinks.length > 0 && completionRatio < 50) {
      bottlenecks.push(`This planet holds upstream dependencies for other celestial worlds.`);
    }

    // Velocity estimation: assuming average 1.5 tasks completed per week
    const remainingTasks = todoCount + inProgressCount;
    const estimatedDaysRemaining = Math.max(1, Math.round(remainingTasks * 2.5));

    return {
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
        title="No Telemetry Data Available"
        description="Deploy satellite tasks to this world to generate orbital velocity diagnostics, health indicators, and bottleneck analytics."
        actionLabel="Deploy First Task"
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
            Orbital Health Index
          </span>
          <div className="flex items-baseline gap-2 mt-2">
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
              {metrics.healthScore > 80 ? 'STABLE ORBIT' : metrics.healthScore > 50 ? 'PERTURBED' : 'CRITICAL'}
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
            Satellites In Target Orbit
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl font-medium text-white">
              {metrics.completionRatio}%
            </span>
            <span className="text-xs text-slate-400">
              {metrics.doneCount}/{tasks.length} Done
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
            Estimated Orbit Completion
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl font-medium text-slate-200">
              ~{metrics.estimatedDaysRemaining}d
            </span>
            <span className="text-xs text-slate-400">at current burn</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-3">
            {metrics.todoCount + metrics.inProgressCount} payloads pending
          </span>
        </div>
      </div>

      {/* Trajectory Burn-Up Sparkline Visualization */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 ">
            Trajectory Burn-Up Vector
          </span>
          <span className="text-xs text-cyan-400">60 FPS Kinematics</span>
        </div>

        {/* SVG Sparkline Curve */}
        <div className="h-28 w-full relative flex items-end">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
            <defs>
              <linearGradient id="orbitBurnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={`M 0 40 L 0 35 Q 25 30, 50 ${Math.max(10, 38 - metrics.completionRatio * 0.28)} T 100 ${Math.max(
                4,
                38 - metrics.completionRatio * 0.35
              )} L 100 40 Z`}
              fill="url(#orbitBurnGrad)"
            />
            {/* Line trace */}
            <path
              d={`M 0 35 Q 25 30, 50 ${Math.max(10, 38 - metrics.completionRatio * 0.28)} T 100 ${Math.max(
                4,
                38 - metrics.completionRatio * 0.35
              )}`}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
            />
            {/* End point beacon */}
            <circle
              cx="100"
              cy={Math.max(4, 38 - metrics.completionRatio * 0.35)}
              r="2.5"
              fill="#ffffff"
            />
          </svg>
        </div>

        <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-white/[0.04]">
          <span>Launch Inception</span>
          <span>Mid-Orbit Velocity</span>
          <span>Target Equilibrium</span>
        </div>
      </div>

      {/* Task Status & Priority Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <span className="text-[11px] text-slate-400 block">
            Status Breakdown
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
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> To Do
              </span>
              <span className="text-white">{metrics.todoCount}</span>
            </div>
          </div>
        </div>

        {/* Priority Matrix */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <span className="text-[11px] text-slate-400 block">
            Velocity Priority Mix
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
            Gravitational Perturbations & Risks
          </span>
          <span className="text-[11px] text-slate-500">Autonomous Diagnostics</span>
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
                <span>⚠</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});
