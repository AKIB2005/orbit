import { memo, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../store/useOrbitStore';
import { TaskCard } from './TaskCard';
import { CreateTaskForm } from './CreateTaskForm';

interface TaskListProps {
  projectId: string;
}

export const TaskList = memo(function TaskList({ projectId }: TaskListProps) {
  const tasks = useOrbitStore((s) =>
    Object.values(s.tasks).filter((t) => t.projectId === projectId)
  );

  const sortedTasks = useMemo(() => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { in_progress: 0, todo: 1, done: 2 };
    return [...tasks].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  return (
    <div className="space-y-3">
      <CreateTaskForm projectId={projectId} />
      {sortedTasks.length === 0 ? (
        <div className="text-center py-8 text-text-muted text-sm">
          <p>No tasks yet</p>
          <p className="text-xs mt-1">Create your first task above</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2 }}
            >
              <TaskCard taskId={task.id} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
});
