import { memo, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../store/useOrbitStore';
import { TaskCard } from './TaskCard';
import { CreateTaskForm } from './CreateTaskForm';
import { EmptyState } from './common/EmptyState';
import { Icon } from './ui/Icon';

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
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="field"
          />
          <Icon name="search" size={15} className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { key: 'all', label: 'All', count: counts.all },
              { key: 'in_progress', label: 'In progress', count: counts.in_progress },
              { key: 'todo', label: 'To do', count: counts.todo },
              { key: 'done', label: 'Done', count: counts.done },
              { key: 'urgent', label: 'Urgent', count: counts.urgent },
            ] as const
          ).map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-white/[0.12] text-white border-white/25 font-medium'
                    : 'text-slate-400 hover:text-white bg-white/[0.03] border-white/[0.06]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[11px] opacity-60 tabular-nums">{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        tasks.length === 0 ? (
          <EmptyState
            compact
            title="No tasks yet"
            description="Add your first task above. Each one becomes a satellite orbiting this planet."
          />
        ) : (
          <EmptyState
            compact
            title="No matching tasks"
            description={search ? `Nothing matches “${search.trim()}”.` : 'No tasks in this filter.'}
            actionLabel={search ? 'Clear search' : 'Show all tasks'}
            onAction={() => {
              setSearch('');
              setFilter('all');
            }}
          />
        )
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
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
