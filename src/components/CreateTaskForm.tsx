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
          placeholder="Deploy new satellite task..."
          maxLength={120}
          className="flex-1 bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60"
        />
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
            showOptions
              ? 'bg-white/10 border-white/20 text-white'
              : 'border-white/[0.08] text-slate-400 hover:text-white bg-black/30'
          }`}
          title="Toggle priority & due date"
        >
          ⚙ Options
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[#05050d] text-xs font-display font-medium tracking-wider uppercase rounded-xl transition-all shadow-[0_1px_2px_rgba(0,0,0,0.4)] active:scale-95 cursor-pointer"
        >
          Add Task
        </button>
      </div>

      {showOptions && (
        <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500/60"
            >
              <option value="low" className="bg-[#0a0a18]">Low</option>
              <option value="medium" className="bg-[#0a0a18]">Medium</option>
              <option value="high" className="bg-[#0a0a18]">High</option>
              <option value="critical" className="bg-[#0a0a18]">Critical</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase">Due Date:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500/60"
            />
          </div>
        </div>
      )}
    </form>
  );
});
