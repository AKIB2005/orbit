import { memo, useState } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import type { ColorTheme, ProjectStatus } from '../types';
import { COLOR_THEME_MAP } from '../types';
import { Icon } from './ui/Icon';

interface ProjectSettingsProps {
  projectId: string;
}

const THEMES: ColorTheme[] = ['violet', 'cyan', 'rose', 'amber', 'emerald', 'blue', 'orange', 'teal'];
const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export const ProjectSettings = memo(function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const project = useOrbitStore((s) => s.projects[projectId]);
  const updateProject = useOrbitStore((s) => s.updateProject);
  const deleteProject = useOrbitStore((s) => s.deleteProject);
  const closePanel = useOrbitStore((s) => s.closePanel);
  const addToast = useOrbitStore((s) => s.addToast);
  const [confirming, setConfirming] = useState(false);

  if (!project) return null;

  const handleDelete = () => {
    const name = project.name;
    deleteProject(projectId);
    closePanel();
    addToast({ type: 'success', title: 'Planet deleted', message: `${name} and its tasks were removed.` });
  };

  const openGitHub = () => useOrbitStore.getState().setGitHubModalOpen(true);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="ps-name" className="field-label">Name</label>
        <input
          id="ps-name"
          type="text"
          value={project.name}
          onChange={(e) => updateProject(projectId, { name: e.target.value })}
          maxLength={60}
          className="field"
        />
      </div>

      <div>
        <label htmlFor="ps-desc" className="field-label">Description</label>
        <textarea
          id="ps-desc"
          value={project.description}
          onChange={(e) => updateProject(projectId, { description: e.target.value })}
          maxLength={500}
          rows={3}
          className="field resize-none"
        />
      </div>

      <div>
        <label htmlFor="ps-status" className="field-label">Status</label>
        <select
          id="ps-status"
          value={project.status}
          onChange={(e) => updateProject(projectId, { status: e.target.value as ProjectStatus })}
          className="field"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div role="radiogroup" aria-label="Planet color">
        <span className="field-label">Color</span>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((theme) => {
            const on = project.colorTheme === theme;
            const c = COLOR_THEME_MAP[theme].primary;
            return (
              <button
                key={theme}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={theme}
                onClick={() => updateProject(projectId, { colorTheme: theme })}
                className="w-8 h-8 rounded-full transition-[transform,box-shadow] duration-200 hover:scale-110 active:scale-95"
                style={{ backgroundColor: c, boxShadow: on ? `0 0 0 2px #07070f, 0 0 0 4px ${c}` : 'none' }}
              />
            );
          })}
        </div>
      </div>

      <section aria-labelledby="ps-gh" className="pt-5 border-t border-white/[0.07]">
        <h3 id="ps-gh" className="field-label">GitHub repository</h3>
        {project.github ? (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-white font-medium truncate">
                {project.github.owner}/{project.github.repo}
              </span>
              <span className="chip !text-emerald-300 shrink-0">Connected</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={openGitHub} className="btn btn-ghost flex-1">View details</button>
              <button
                type="button"
                onClick={() => useOrbitStore.getState().disconnectProjectGitHub(projectId)}
                className="btn btn-ghost hover:!text-rose-300"
              >
                Unlink
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={openGitHub} className="btn btn-ghost w-full">
            <Icon name="plus" size={15} /> Attach a repository
          </button>
        )}
      </section>

      <section aria-labelledby="ps-danger" className="pt-5 border-t border-white/[0.07]">
        <h3 id="ps-danger" className="field-label">Delete planet</h3>
        {!confirming ? (
          <button type="button" onClick={() => setConfirming(true)} className="btn btn-danger w-full">
            <Icon name="trash" size={15} /> Delete planet…
          </button>
        ) : (
          <div className="space-y-3 p-3.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20" role="alert">
            <p className="text-sm text-rose-200">This permanently deletes {project.name} and all of its tasks and milestones.</p>
            <div className="flex gap-2">
              <button type="button" onClick={handleDelete} className="btn flex-1 !bg-rose-500 !text-white hover:!bg-rose-400" data-autofocus>
                Delete permanently
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="btn btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
});
