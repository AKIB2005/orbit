import { memo, useState } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { PRIORITY_COLORS } from '../types';
import { TaskDetail } from './TaskDetail';

interface TaskCardProps {
  taskId: string;
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Completed',
};

const STATUS_STYLES: Record<string, string> = {
  todo: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  in_progress: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  done: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

export const TaskCard = memo(function TaskCard({ taskId }: TaskCardProps) {
  const task = useOrbitStore((s) => s.tasks[taskId]);
  const milestones = useOrbitStore((s) => s.milestones);
  const allTasks = useOrbitStore((s) => s.tasks);
  const toggleTaskComplete = useOrbitStore((s) => s.toggleTaskComplete);
  const cycleTaskStatus = useOrbitStore((s) => s.cycleTaskStatus);
  const deleteTask = useOrbitStore((s) => s.deleteTask);
  const [expanded, setExpanded] = useState(false);

  if (!task) return null;

  const priorityColor = PRIORITY_COLORS[task.priority];
  const dueStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const isOverdue = task.dueDate !== null && task.dueDate < Date.now() && task.status !== 'done';

  const milestone = task.milestoneId ? milestones[task.milestoneId] : null;
  const prerequisiteTask = task.dependsOnTaskId ? allTasks[task.dependsOnTaskId] : null;
  const isPrereqBlocked = prerequisiteTask && prerequisiteTask.status !== 'done';

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${task.status === 'done'
          ? 'bg-emerald-950/10 border-emerald-800/20 opacity-80'
          : 'bg-white/[0.03] border-white/[0.08] hover:border-violet-500/40 hover:bg-white/[0.05]'
        }`}
    >
      <div className="p-3.5 flex items-start gap-3">
        {/* Quick Completion Checkbox */}
        <button
          type="button"
          onClick={() => toggleTaskComplete(taskId)}
          className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition-all ${task.status === 'done'
              ? 'bg-emerald-500 border-emerald-400 text-black font-bold shadow-[0_0_8px_#34d399]'
              : 'border-white/20 hover:border-cyan-400 bg-black/40'
            }`}
          aria-label={task.status === 'done' ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          {task.status === 'done' && (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-white'
                }`}
            >
              {task.title}
            </p>
          </div>

          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Status Cycle Button */}
            <button
              onClick={() => cycleTaskStatus(taskId)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium border transition-colors ${STATUS_STYLES[task.status]}`}
              title="Click to cycle status"
            >
              {STATUS_LABELS[task.status]}
            </button>

            {/* Priority Beacon */}
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 uppercase flex items-center gap-1.5"
              style={{ color: priorityColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColor }} />
              {task.priority}
            </span>

            {/* Due Date */}
            {dueStr && (
              <span
                className={`text-[10px] font-mono flex items-center gap-1 ${isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
                  }`}
              >
                <span>{isOverdue ? '⚠ Due ' : 'Due '}{dueStr}</span>
              </span>
            )}

            {/* Milestone Tag */}
            {milestone && (
              <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.2 rounded">
                <span>🏁</span>
                <span className="truncate max-w-[120px]">{milestone.title}</span>
              </span>
            )}

            {/* Prerequisite Blocker Indicator */}
            {isPrereqBlocked && (
              <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.2 rounded">
                <span>⚡ Blocked by:</span>
                <span className="truncate max-w-[110px]">{prerequisiteTask.title}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors text-xs"
            aria-label={expanded ? 'Collapse task details' : 'Edit task details'}
            title="Edit task details"
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button
            onClick={() => deleteTask(taskId)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs"
            aria-label="Delete task"
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded Inline Detail Editor */}
      {expanded && <TaskDetail taskId={taskId} />}
    </div>
  );
});
