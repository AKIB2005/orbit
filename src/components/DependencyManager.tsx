import { memo, useState, useMemo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../types';

interface DependencyManagerProps {
  projectId: string;
}

export const DependencyManager = memo(function DependencyManager({
  projectId,
}: DependencyManagerProps) {
  const project = useOrbitStore((s) => s.projects[projectId]);
  const allProjects = useOrbitStore((s) => s.projects);
  const links = useOrbitStore((s) => s.links);
  const allTasks = useOrbitStore((s) => s.tasks);
  const createLink = useOrbitStore((s) => s.createLink);
  const deleteLink = useOrbitStore((s) => s.deleteLink);

  const [selectedTarget, setSelectedTarget] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const outgoing = Object.values(links).filter((l) => l.sourceProjectId === projectId);
  const incoming = Object.values(links).filter((l) => l.targetProjectId === projectId);

  const availableTargets = Object.values(allProjects).filter(
    (p) => p.id !== projectId && !outgoing.some((l) => l.targetProjectId === p.id)
  );

  // Intra-project task dependencies
  const projectTasks = useMemo(
    () => Object.values(allTasks).filter((t) => t.projectId === projectId),
    [allTasks, projectId]
  );

  const taskDependencies = useMemo(() => {
    return projectTasks
      .filter((t) => t.dependsOnTaskId)
      .map((t) => ({
        task: t,
        prerequisite: allTasks[t.dependsOnTaskId!],
      }))
      .filter((pair) => pair.prerequisite !== undefined);
  }, [projectTasks, allTasks]);

  if (!project) return null;

  const handleAdd = () => {
    setErrorMsg('');
    if (!selectedTarget) return;
    const res = createLink(projectId, selectedTarget);
    if (!res) {
      setErrorMsg('Can’t add this link: it would create a loop, or it already exists.');
    } else {
      setSelectedTarget('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-base text-white">
          Dependencies
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Show which planets and tasks must finish before others can start.
        </p>
      </div>

      {/* Add Dependency Box */}
      <div className="glass-panel p-4 rounded-xl border border-white/[0.08] space-y-3">
        <label className="text-xs text-slate-400 block">
          Add a dependency
        </label>
        <p className="text-xs text-slate-400 leading-relaxed">
          Specify that <span className="text-white font-medium">{project.name}</span> depends on another planet:
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedTarget}
            onChange={(e) => {
              setSelectedTarget(e.target.value);
              setErrorMsg('');
            }}
            className="field flex-1"
          >
            <option value="">Select target project...</option>
            {availableTargets.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0a0a18]">
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedTarget}
            className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-[#05050d] rounded-xl text-xs font-display font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Add link
          </button>
        </div>
        {errorMsg && (
          <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>
        )}
      </div>

      {/* Outgoing: "Depends On" */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs text-slate-400 ">
            This planet depends on
          </h4>
          <span className="text-[11px] text-slate-500">
            {outgoing.length} links
          </span>
        </div>

        {outgoing.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 glass-panel rounded-xl">
            This project has no upstream dependencies. Autonomous execution.
          </p>
        ) : (
          <div className="space-y-2">
            {outgoing.map((link) => {
              const target = allProjects[link.targetProjectId];
              if (!target) return null;
              const colors = COLOR_THEME_MAP[target.colorTheme];
              return (
                <div
                  key={link.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-violet-500/30 transition-all"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: colors.primary, color: colors.primary }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-white block truncate">
                      {target.name}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {target.status}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                    aria-label={`Remove link to ${target.name}`}
                  >
                    Remove link
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Incoming: "Depended On By" */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs text-slate-400 ">
            Planets that depend on this one
          </h4>
          <span className="text-[11px] text-slate-500">
            {incoming.length} dependents
          </span>
        </div>

        {incoming.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 glass-panel rounded-xl">
            No other planet depends on this one.
          </p>
        ) : (
          <div className="space-y-2">
            {incoming.map((link) => {
              const source = allProjects[link.sourceProjectId];
              if (!source) return null;
              const colors = COLOR_THEME_MAP[source.colorTheme];
              return (
                <div
                  key={link.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-white block truncate">
                      {source.name}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {source.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Intra-project Task Dependencies */}
      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h4 className="text-xs text-slate-400 ">
            Task dependencies
          </h4>
          <span className="text-[11px] text-slate-500">
            {taskDependencies.length} blocking
          </span>
        </div>

        {taskDependencies.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 glass-panel rounded-xl">
            No task depends on another yet. Set a prerequisite from a task’s details.
          </p>
        ) : (
          <div className="space-y-2">
            {taskDependencies.map((dep, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`w-2 h-2 rounded-full ${dep.task.status === 'done' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span className="text-white font-medium truncate">{dep.task.title}</span>
                </div>

                <span className="text-[11px] text-slate-500">requires</span>

                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                  <span className="text-cyan-300 font-medium truncate">{dep.prerequisite.title}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded ${
                      dep.prerequisite.status === 'done' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {dep.prerequisite.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
