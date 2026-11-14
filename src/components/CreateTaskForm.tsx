import { memo, useState, type FormEvent } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';

interface CreateTaskFormProps {
  projectId: string;
}

export const CreateTaskForm = memo(function CreateTaskForm({ projectId }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const createTask = useOrbitStore((s) => s.createTask);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || trimmed.length > 120) return;
    createTask({
      projectId,
      title: trimmed,
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
    });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        maxLength={120}
        className="flex-1 bg-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-violet/50"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="px-4 py-2 bg-accent-violet text-white text-sm font-medium rounded-md hover:bg-accent-violet/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Add
      </button>
    </form>
  );
});
