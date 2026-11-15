import { memo } from 'react';
import type { AIAction } from '../../ai/actionSchemas';
import { useOrbitStore } from '../../store/useOrbitStore';
import { PRIORITY_COLORS } from '../../types';

interface AIActionCardProps {
  action: AIAction;
  onConfirm: (actionId: string) => void;
  onDismiss: (actionId: string) => void;
}

export const AIActionCard = memo(function AIActionCard({
  action,
  onConfirm,
  onDismiss,
}: AIActionCardProps) {
  const projects = useOrbitStore((s) => s.projects);
  const tasks = useOrbitStore((s) => s.tasks);

  const getActionBadge = () => {
    switch (action.type) {
      case 'create_task':
        return { label: '✦ DEPLOY TASK', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'update_task_priority':
        return { label: '▲ ELEVATE PRIORITY', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' };
      case 'schedule_task':
        return { label: '📅 SCHEDULE HORIZON', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'create_project':
        return { label: '🪐 SPAWN PLANET', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' };
    }
  };

  const badge = getActionBadge();

  // Render specific preview details
  const renderDetails = () => {
    if (action.type === 'create_task') {
      const proj = projects[action.payload.projectId];
      const prioColor = PRIORITY_COLORS[action.payload.priority];
      return (
        <div className="text-xs font-mono space-y-1 text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/[0.04] mt-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Destination Planet:</span>
            <span className="text-white font-medium">{proj?.name || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Orbital Velocity:</span>
            <span className="font-semibold uppercase" style={{ color: prioColor }}>
              {action.payload.priority}
            </span>
          </div>
          {action.payload.dueDate && (
            <div className="flex justify-between">
              <span className="text-slate-500">Horizon:</span>
              <span>{new Date(action.payload.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      );
    }

    if (action.type === 'update_task_priority') {
      const task = tasks[action.payload.taskId];
      const newColor = PRIORITY_COLORS[action.payload.newPriority];
      return (
        <div className="text-xs font-mono space-y-1 text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/[0.04] mt-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Satellite:</span>
            <span className="text-white font-medium truncate max-w-[200px]">{task?.title || 'Unknown'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Velocity Shift:</span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400 capitalize">{task?.priority || 'low'}</span>
              <span>→</span>
              <span className="font-bold uppercase" style={{ color: newColor }}>
                {action.payload.newPriority}
              </span>
            </span>
          </div>
          {action.payload.reason && (
            <div className="text-[11px] text-amber-300/80 pt-1">
              ⚡ {action.payload.reason}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all my-2 ${
        action.status === 'executed'
          ? 'bg-emerald-950/20 border-emerald-800/30'
          : action.status === 'dismissed'
          ? 'bg-white/[0.01] border-white/[0.04] opacity-50'
          : 'bg-white/[0.04] border-white/[0.1] shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badge.color}`}>
          {badge.label}
        </span>

        {action.status === 'executed' && (
          <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
            ✓ EXECUTED
          </span>
        )}
        {action.status === 'dismissed' && (
          <span className="text-[10px] font-mono text-slate-500">
            DISMISSED
          </span>
        )}
      </div>

      <p className="text-xs font-medium text-white leading-relaxed">
        {action.description}
      </p>

      {renderDetails()}

      {/* Confirmation Actions */}
      {action.status === 'pending' && (
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.06]">
          <button
            onClick={() => onConfirm(action.id)}
            className="flex-1 py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-lg text-xs font-mono font-semibold tracking-wider transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center justify-center gap-1.5"
          >
            <span>Confirm & Execute</span>
            <span>✓</span>
          </button>
          <button
            onClick={() => onDismiss(action.id)}
            className="py-1.5 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white rounded-lg text-xs font-mono transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
});
