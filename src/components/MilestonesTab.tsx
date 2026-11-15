import { useState, memo, useMemo } from 'react';
import { Icon } from './ui/Icon';
import { useOrbitStore } from '../store/useOrbitStore';

interface MilestonesTabProps {
  projectId: string;
}

export const MilestonesTab = memo(function MilestonesTab({ projectId }: MilestonesTabProps) {
  const allMilestones = useOrbitStore((s) => s.milestones);
  const allTasks = useOrbitStore((s) => s.tasks);
  const createMilestone = useOrbitStore((s) => s.createMilestone);
  const toggleMilestone = useOrbitStore((s) => s.toggleMilestone);
  const deleteMilestone = useOrbitStore((s) => s.deleteMilestone);

  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const projectMilestones = useMemo(
    () => Object.values(allMilestones).filter((m) => m.projectId === projectId),
    [allMilestones, projectId]
  );

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    createMilestone({
      projectId,
      title: trimmed,
      dueDate: newDueDate ? new Date(newDueDate).getTime() : null,
      completed: false,
    });

    setNewTitle('');
    setNewDueDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div>
        <h3 className="font-display font-semibold text-base text-white">
          Orbital Milestones & Stages
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Key delivery goals for this project. Link tasks to a milestone to track progress toward it.
        </p>
      </div>

      {/* Create Milestone Form */}
      <form onSubmit={handleAddMilestone} className="glass-panel p-4 rounded-xl border border-white/[0.08] space-y-3">
        <span className="text-[11px] text-slate-400 block">
          NEW STRATEGIC MILESTONE
        </span>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Core Security Audit Complete"
            maxLength={100}
            className="field flex-1"
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="field"
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 text-[#05050d] rounded-lg text-xs font-medium transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            Add Stage
          </button>
        </div>
      </form>

      {/* Milestones List */}
      <div className="space-y-3">
        {projectMilestones.length === 0 ? (
          <div className="text-center py-10 glass-panel rounded-2xl border border-white/[0.06] text-slate-400">
            <p className="text-xs">No milestones yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">Add a key date or delivery goal above.</p>
          </div>
        ) : (
          projectMilestones.map((milestone) => {
            const linkedTasks = Object.values(allTasks).filter(
              (t) => t.projectId === projectId && t.milestoneId === milestone.id
            );
            const completedLinked = linkedTasks.filter((t) => t.status === 'done').length;

            const isOverdue =
              milestone.dueDate &&
              milestone.dueDate < Date.now() &&
              !milestone.completed;

            const dateStr = milestone.dueDate
              ? new Date(milestone.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null;

            return (
              <div
                key={milestone.id}
                className={`p-4 rounded-xl border transition-all ${
                  milestone.completed
                    ? 'bg-emerald-950/20 border-emerald-800/30'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Completion Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleMilestone(milestone.id)}
                    className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition-all ${
                      milestone.completed
                        ? 'bg-emerald-500 border-emerald-400 text-black font-bold'
                        : 'border-white/20 hover:border-cyan-400 bg-black/40'
                    }`}
                    aria-label={`Mark milestone ${milestone.title} as ${milestone.completed ? 'incomplete' : 'complete'}`}
                  >
                    {milestone.completed && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          milestone.completed
                            ? 'line-through text-slate-400'
                            : 'text-white'
                        }`}
                      >
                        {milestone.title}
                      </span>
                      {milestone.completed && (
                        <span className="text-[11px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          COMPLETED
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                      {dateStr && (
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-400 font-semibold' : ''}`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{isOverdue ? 'Overdue: ' : 'Target: '}{dateStr}</span>
                        </span>
                      )}

                      {linkedTasks.length > 0 && (
                        <span className="text-cyan-300">
                          {completedLinked}/{linkedTasks.length} linked tasks
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="text-slate-500 hover:text-rose-400 text-xs p-1"
                    title="Delete milestone"
                    aria-label="Delete milestone"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
