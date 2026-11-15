import { memo, useState } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import type { TaskPriority } from '../types';

interface CreateTaskFormProps {
  projectId: string;
}

export const CreateTaskForm = memo(function CreateTaskForm({ projectId }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [showOptions, setShowOptions] = useState(false);
  const [dueDate, setDueDate] = useState('');

  const createTask = useOrbitStore((s) => s.createTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || trimmed.length > 120) return;

    createTask({
      projectId,
      title: trimmed,
      description: '',
      status: 'todo',
      priority,
      dueDate: dueDate ? new Date(dueDate).getTime() : null,
    });

    setTitle('');
    setShowOptions(false);
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-3.5 rounded-xl border border-white/[0.08] space-y-2.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task title"
          maxLength={120}
          className="field flex-1"
        />
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className={`btn ${showOptions ? 'btn-glass !text-white' : 'btn-ghost'}`}
          aria-expanded={showOptions}
          title="Toggle priority & due date"
        >
          Options
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="btn btn-primary"
        >
          Add task
        </button>
      </div>

      {showOptions && (
        <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="ct-priority" className="text-xs text-slate-400">Priority</label>
            <select
              id="ct-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="field !w-auto !min-h-9"
            >
              <option value="low" className="bg-[#0a0a18]">Low</option>
              <option value="medium" className="bg-[#0a0a18]">Medium</option>
              <option value="high" className="bg-[#0a0a18]">High</option>
              <option value="critical" className="bg-[#0a0a18]">Critical</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="ct-due" className="text-xs text-slate-400">Due date</label>
            <input
              id="ct-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="field !w-auto !min-h-9"
            />
          </div>
        </div>
      )}
    </form>
  );
});
