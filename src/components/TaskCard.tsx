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
  done: 'Done',
};

const STATUS_STYLES: Record<string, string> = {
  todo: 'bg-slate-500/20 text-slate-400',
  in_progress: 'bg-amber-500/20 text-amber-400',
  done: 'bg-emerald-500/20 text-emerald-400',
};

export const TaskCard = memo(function TaskCard({ taskId }: TaskCardProps) {
  const task = useOrbitStore((s) => s.tasks[taskId]);
  const cycleTaskStatus = useOrbitStore((s) => s.cycleTaskStatus);
  const deleteTask = useOrbitStore((s) => s.deleteTask);
  const [expanded, setExpanded] = useState(false);

  if (!task) return null;

  const priorityColor = PRIORITY_COLORS[task.priority];
  const dueStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const isOverdue = task.dueDate !== null && task.dueDate < Date.now() && task.status !== 'done';

  return (
    <div className="bg-elevated rounded-lg border border-border hover:border-accent-violet/30 transition-colors">
      <div className="p-3 flex items-start gap-3">
        {/* Priority indicator */}
        <div
          className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
          style={{ backgroundColor: priorityColor }}
          title={`Priority: ${task.priority}`}
        />
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={() => cycleTaskStatus(taskId)}
              className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${STATUS_STYLES[task.status]}`}
              aria-label={`Status: ${STATUS_LABELS[task.status]}. Click to change.`}
            >
              {STATUS_LABELS[task.status]}
            </button>
            {dueStr && (
              <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-text-muted'}`}>
                {isOverdue ? '⚠ ' : ''}{dueStr}
              </span>
            )}
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors text-xs"
            aria-label={expanded ? 'Collapse task' : 'Expand task'}
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button
            onClick={() => deleteTask(taskId)}
            className="w-7 h-7 flex items-center justify-center rounded text-text-muted hover:text-red-400 hover:bg-surface transition-colors text-xs"
            aria-label="Delete task"
          >
            ✕
          </button>
        </div>
      </div>
      {expanded && <TaskDetail taskId={taskId} />}
    </div>
  );
});
