import { memo, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../store/useOrbitStore';
import { TaskCard } from './TaskCard';
import { CreateTaskForm } from './CreateTaskForm';

interface TaskListProps {
  projectId: string;
}

type FilterTab = 'all' | 'todo' | 'in_progress' | 'done' | 'urgent';

export const TaskList = memo(function TaskList({ projectId }: TaskListProps) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const allTasks = useOrbitStore((s) => s.tasks);
  const tasks = useMemo(
    () => Object.values(allTasks).filter((t) => t.projectId === projectId),
    [allTasks, projectId]
  );

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filter === 'todo') list = list.filter((t) => t.status === 'todo');
    else if (filter === 'in_progress') list = list.filter((t) => t.status === 'in_progress');
    else if (filter === 'done') list = list.filter((t) => t.status === 'done');
    else if (filter === 'urgent') list = list.filter((t) => t.priority === 'critical' || t.priority === 'high');

    // Sort order: in_progress -> todo -> done, then priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { in_progress: 0, todo: 1, done: 2 };

    return list.sort((a, b) => {
      const sDiff = statusOrder[a.status] - statusOrder[b.status];
      if (sDiff !== 0) return sDiff;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, filter, search]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      urgent: tasks.filter((t) => t.priority === 'critical' || t.priority === 'high').length,
    }),
    [tasks]
  );

  return (
    <div className="space-y-4">
      {/* Quick Task Creator */}
      <CreateTaskForm projectId={projectId} />

      {/* Filter and Search Bar */}
      <div className="space-y-2 pt-1">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payload title or specification..."
            className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60"
          />
          <svg
            className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { key: 'all', label: 'All', count: counts.all },
              { key: 'in_progress', label: 'In Flight', count: counts.in_progress },
              { key: 'todo', label: 'To Do', count: counts.todo },
              { key: 'done', label: 'Done', count: counts.done },
              { key: 'urgent', label: 'Urgent', count: counts.urgent },
            ] as const
          ).map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-violet-600/30 text-violet-200 border border-violet-500/40 font-medium'
                    : 'text-slate-400 hover:text-white bg-white/[0.02] border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70">({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-white/[0.06] text-slate-400">
          <span className="text-2xl block mb-2">🛰️</span>
          <p className="text-xs font-mono">No matching task satellites found.</p>
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-cyan-400 hover:underline mt-1 font-mono"
            >
              Clear search filter
            </button>
          ) : (
            <p className="text-[11px] text-slate-500 mt-1">
              Deploy your first task payload above to initialize orbital trajectory.
            </p>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
              >
                <TaskCard taskId={task.id} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
});
