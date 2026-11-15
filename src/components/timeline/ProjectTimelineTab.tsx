import { memo, useMemo, useState } from 'react';
import { useOrbitStore } from '../../store/useOrbitStore';
import { EmptyState } from '../common/EmptyState';
import { PRIORITY_COLORS } from '../../types';

interface ProjectTimelineTabProps {
  projectId: string;
}

export const ProjectTimelineTab = memo(function ProjectTimelineTab({ projectId }: ProjectTimelineTabProps) {
  const allTasks = useOrbitStore((s) => s.tasks);
  const allMilestones = useOrbitStore((s) => s.milestones);
  const toggleTaskComplete = useOrbitStore((s) => s.toggleTaskComplete);
  const toggleMilestone = useOrbitStore((s) => s.toggleMilestone);
  const openPanel = useOrbitStore((s) => s.openPanel);

  const [filter, setFilter] = useState<'all' | 'milestones_only' | 'pending'>('all');

  const tasks = useMemo(
    () => Object.values(allTasks).filter((t) => t.projectId === projectId),
    [allTasks, projectId]
  );

  const milestones = useMemo(
    () => Object.values(allMilestones).filter((m) => m.projectId === projectId),
    [allMilestones, projectId]
  );

  // Group events chronologically
  const timelineEvents = useMemo(() => {
    type TimelineItem =
      | { type: 'milestone'; id: string; title: string; date: number | null; completed: boolean }
      | {
          type: 'task';
          id: string;
          title: string;
          date: number | null;
          completed: boolean;
          priority: string;
          status: string;
        };

    const items: TimelineItem[] = [];

    milestones.forEach((m) => {
      items.push({
        type: 'milestone',
        id: m.id,
        title: m.title,
        date: m.dueDate,
        completed: m.completed,
      });
    });

    tasks.forEach((t) => {
      items.push({
        type: 'task',
        id: t.id,
        title: t.title,
        date: t.dueDate,
        completed: t.status === 'done',
        priority: t.priority,
        status: t.status,
      });
    });

    // Filter
    let filtered = items;
    if (filter === 'milestones_only') {
      filtered = items.filter((i) => i.type === 'milestone');
    } else if (filter === 'pending') {
      filtered = items.filter((i) => !i.completed);
    }

    // Sort: dated items by timestamp, then undated items at end
    return filtered.sort((a, b) => {
      if (a.date && b.date) return a.date - b.date;
      if (a.date && !b.date) return -1;
      if (!a.date && b.date) return 1;
      return 0;
    });
  }, [tasks, milestones, filter]);

  const now = Date.now();

  if (tasks.length === 0 && milestones.length === 0) {
    return (
      <EmptyState
        title="Orbital Chronology Empty"
        description="No milestones or task horizons have been scheduled for this celestial world."
        actionLabel="Deploy Tasks & Horizons"
        onAction={() => openPanel('tasks')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Chips */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl bg-black/40 p-1 border border-white/[0.06] text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Events ({tasks.length + milestones.length})
          </button>
          <button
            onClick={() => setFilter('milestones_only')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'milestones_only' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Milestones ({milestones.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'pending' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Chronological Vector
        </span>
      </div>

      {/* Chronological Event Spine */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/[0.08]">
        {timelineEvents.map((item) => {
          const isOverdue = item.date && item.date < now && !item.completed;
          const isMilestone = item.type === 'milestone';

          return (
            <div key={item.id} className="relative group">
              {/* Spine Node Point */}
              <div
                className={`absolute -left-6 sm:-left-8 top-3.5 w-3 h-3 rounded-full border-2 transition-transform group-hover:scale-125 ${
                  item.completed
                    ? 'bg-emerald-400 border-[#030308]'
                    : isOverdue
                    ? 'bg-red-400 border-[#030308] shadow-[0_0_8px_#f87171]'
                    : isMilestone
                    ? 'bg-violet-400 border-[#030308]'
                    : 'bg-slate-500 border-[#030308]'
                }`}
              />

              {/* Event Card */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.completed
                    ? 'bg-white/[0.01] border-white/[0.04] opacity-60'
                    : isOverdue
                    ? 'bg-red-950/15 border-red-500/25'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={() =>
                        isMilestone ? toggleMilestone(item.id) : toggleTaskComplete(item.id)
                      }
                      className="mt-0.5 w-4 h-4 rounded border border-white/20 flex items-center justify-center text-[11px] text-emerald-400 hover:border-emerald-400 transition-colors shrink-0 cursor-pointer"
                      aria-label="Toggle completion"
                    >
                      {item.completed && '✓'}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[11px] px-1.5 py-0.2 rounded-full  ${
                            isMilestone
                              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                              : 'bg-white/[0.04] text-slate-400'
                          }`}
                        >
                          {isMilestone ? 'Milestone' : 'Task'}
                        </span>
                        {!isMilestone && (
                          <span
                            className="text-[11px] font-bold"
                            style={{ color: PRIORITY_COLORS[(item as any).priority as keyof typeof PRIORITY_COLORS] }}
                          >
                            {(item as any).priority}
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-xs font-medium text-white truncate max-w-[280px] sm:max-w-md ${
                          item.completed ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  {/* Date & Alert */}
                  <div className="text-right shrink-0">
                    {item.date ? (
                      <span
                        className={`text-[11px] block ${
                          isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-600 block">
                        Undated Orbit
                      </span>
                    )}

                    {isOverdue && (
                      <span className="text-[11px] text-red-400 block">
                        OVERDUE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
