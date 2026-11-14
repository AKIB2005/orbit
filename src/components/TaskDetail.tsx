import { memo, useState } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import type { TaskPriority } from '../types';

interface TaskDetailProps {
  taskId: string;
}

export const TaskDetail = memo(function TaskDetail({ taskId }: TaskDetailProps) {
  const task = useOrbitStore((s) => s.tasks[taskId]);
  const updateTask = useOrbitStore((s) => s.updateTask);

  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );

  if (!task) return null;

  const handleSave = () => {
    updateTask(taskId, {
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).getTime() : null,
    });
  };

  return (
    <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
      <div>
        <label className="text-xs text-text-muted block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSave}
          rows={3}
          maxLength={2000}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-violet/50 resize-none"
          placeholder="Add a description..."
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-text-muted block mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => {
              const newPriority = e.target.value as TaskPriority;
              setPriority(newPriority);
              updateTask(taskId, { priority: newPriority });
            }}
            className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet/50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-muted block mb-1">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => {
              const newDate = e.target.value;
              setDueDate(newDate);
              updateTask(taskId, { dueDate: newDate ? new Date(newDate).getTime() : null });
            }}
            className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet/50"
          />
        </div>
      </div>
    </div>
  );
});
