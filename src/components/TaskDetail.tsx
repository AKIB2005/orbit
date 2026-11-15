import { memo, useState, useMemo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import type { TaskPriority } from '../types';

interface TaskDetailProps {
  taskId: string;
}

export const TaskDetail = memo(function TaskDetail({ taskId }: TaskDetailProps) {
  const task = useOrbitStore((s) => s.tasks[taskId]);
  const allTasks = useOrbitStore((s) => s.tasks);
  const allMilestones = useOrbitStore((s) => s.milestones);
  const updateTask = useOrbitStore((s) => s.updateTask);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [milestoneId, setMilestoneId] = useState(task?.milestoneId ?? '');
  const [dependsOnTaskId, setDependsOnTaskId] = useState(task?.dependsOnTaskId ?? '');

  const projectTasks = useMemo(() => {
    if (!task) return [];
    return Object.values(allTasks).filter(
      (t) => t.projectId === task.projectId && t.id !== taskId
    );
  }, [allTasks, task, taskId]);

  const projectMilestones = useMemo(() => {
    if (!task) return [];
    return Object.values(allMilestones).filter((m) => m.projectId === task.projectId);
  }, [allMilestones, task]);

  if (!task) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(taskId, { title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      updateTask(taskId, { description });
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] bg-black/30 space-y-3.5">
      {/* Title Edit */}
      <div>
        <label className="text-[11px] text-slate-400 block mb-1">
          Task Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          maxLength={120}
          className="field"
        />
      </div>

      {/* Description Edit */}
      <div>
        <label className="text-[11px] text-slate-400 block mb-1">
          Payload Specification & Notes
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          rows={3}
          maxLength={2000}
          placeholder="Add execution details, technical requirements, acceptance criteria..."
          className="field resize-none"
        />
      </div>

      {/* 2-column Grid: Priority & Due Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">
            Priority Kinematics
          </label>
          <select
            value={priority}
            onChange={(e) => {
              const newP = e.target.value as TaskPriority;
              setPriority(newP);
              updateTask(taskId, { priority: newP });
            }}
            className="field"
          >
            <option value="low" className="bg-[#0a0a18]">Low Velocity</option>
            <option value="medium" className="bg-[#0a0a18]">Medium Velocity</option>
            <option value="high" className="bg-[#0a0a18]">High Velocity</option>
            <option value="critical" className="bg-[#0a0a18]">Critical / Immediate</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">
            Due Horizon
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => {
              const val = e.target.value;
              setDueDate(val);
              updateTask(taskId, { dueDate: val ? new Date(val).getTime() : null });
            }}
            className="field"
          />
        </div>
      </div>

      {/* 2-column Grid: Milestone & Task Dependency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/[0.04]">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">
            Assigned Milestone
          </label>
          <select
            value={milestoneId}
            onChange={(e) => {
              const val = e.target.value || null;
              setMilestoneId(val || '');
              updateTask(taskId, { milestoneId: val });
            }}
            className="field"
          >
            <option value="" className="bg-[#0a0a18]">No Milestone Assigned</option>
            {projectMilestones.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0a0a18]">
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">
            Prerequisite Dependency
          </label>
          <select
            value={dependsOnTaskId}
            onChange={(e) => {
              const val = e.target.value || null;
              setDependsOnTaskId(val || '');
              updateTask(taskId, { dependsOnTaskId: val });
            }}
            className="field"
          >
            <option value="" className="bg-[#0a0a18]">None (Independent Orbit)</option>
            {projectTasks.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#0a0a18]">
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
});
