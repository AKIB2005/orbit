import { memo, useState } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../types';

interface DependencyManagerProps {
  projectId: string;
}

export const DependencyManager = memo(function DependencyManager({ projectId }: DependencyManagerProps) {
  const project = useOrbitStore((s) => s.projects[projectId]);
  const allProjects = useOrbitStore((s) => s.projects);
  const links = useOrbitStore((s) => s.links);
  const createLink = useOrbitStore((s) => s.createLink);
  const deleteLink = useOrbitStore((s) => s.deleteLink);
  const [selectedTarget, setSelectedTarget] = useState('');

  if (!project) return null;

  const outgoing = Object.values(links).filter((l) => l.sourceProjectId === projectId);
  const incoming = Object.values(links).filter((l) => l.targetProjectId === projectId);

  const availableTargets = Object.values(allProjects).filter(
    (p) => p.id !== projectId && !outgoing.some((l) => l.targetProjectId === p.id)
  );

  const handleAdd = () => {
    if (!selectedTarget) return;
    createLink(projectId, selectedTarget);
    setSelectedTarget('');
  };

  return (
    <div className="space-y-4">
      {/* Add dependency */}
      <div>
        <label className="text-xs text-text-muted block mb-2">Add Dependency</label>
        <div className="flex gap-2">
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="flex-1 bg-elevated border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet/50"
          >
            <option value="">Select a project...</option>
            {availableTargets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedTarget}
            className="px-3 py-1.5 bg-accent-violet text-white text-sm rounded-md hover:bg-accent-violet/80 disabled:opacity-40 transition-colors"
          >
            Link
          </button>
        </div>
      </div>

      {/* Outgoing: "depends on" */}
      <div>
        <h4 className="text-xs text-text-muted uppercase tracking-wider mb-2">Depends On</h4>
        {outgoing.length === 0 ? (
          <p className="text-sm text-text-muted/60">No dependencies</p>
        ) : (
          <div className="space-y-1.5">
            {outgoing.map((link) => {
              const target = allProjects[link.targetProjectId];
              if (!target) return null;
              const colors = COLOR_THEME_MAP[target.colorTheme];
              return (
                <div key={link.id} className="flex items-center gap-2 bg-elevated rounded-md px-3 py-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors.primary }} />
                  <span className="text-sm text-text-primary flex-1">{target.name}</span>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="text-xs text-text-muted hover:text-red-400 transition-colors"
                    aria-label={`Remove dependency on ${target.name}`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Incoming: "depended on by" */}
      <div>
        <h4 className="text-xs text-text-muted uppercase tracking-wider mb-2">Depended On By</h4>
        {incoming.length === 0 ? (
          <p className="text-sm text-text-muted/60">No dependents</p>
        ) : (
          <div className="space-y-1.5">
            {incoming.map((link) => {
              const source = allProjects[link.sourceProjectId];
              if (!source) return null;
              const colors = COLOR_THEME_MAP[source.colorTheme];
              return (
                <div key={link.id} className="flex items-center gap-2 bg-elevated rounded-md px-3 py-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors.primary }} />
                  <span className="text-sm text-text-primary flex-1">{source.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
