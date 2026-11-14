import { memo, useState } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import type { ColorTheme, ProjectStatus } from '../types';
import { COLOR_THEME_MAP } from '../types';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!project) return null;

  const handleDelete = () => {
    deleteProject(projectId);
    closePanel();
  };

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="text-xs text-text-muted block mb-1">Project Name</label>
        <input
          type="text"
          value={project.name}
          onChange={(e) => updateProject(projectId, { name: e.target.value })}
          maxLength={60}
          className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-violet/50"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-text-muted block mb-1">Description</label>
        <textarea
          value={project.description}
          onChange={(e) => updateProject(projectId, { description: e.target.value })}
          maxLength={500}
          rows={3}
          className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-violet/50 resize-none"
        />
      </div>

      {/* Status */}
      <div>
        <label className="text-xs text-text-muted block mb-1">Status</label>
        <select
          value={project.status}
          onChange={(e) => updateProject(projectId, { status: e.target.value as ProjectStatus })}
          className="w-full bg-elevated border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet/50"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Color Theme */}
      <div>
        <label className="text-xs text-text-muted block mb-2">Color Theme</label>
        <div className="flex gap-2 flex-wrap">
          {THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => updateProject(projectId, { colorTheme: theme })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                project.colorTheme === theme ? 'border-white scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: COLOR_THEME_MAP[theme].primary }}
              aria-label={`Color theme: ${theme}`}
              aria-pressed={project.colorTheme === theme}
            />
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-4 border-t border-border">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-4 py-2 text-sm text-red-400 border border-red-400/30 rounded-md hover:bg-red-400/10 transition-colors"
          >
            Delete Project
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-400">Delete this project and all its tasks?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm bg-elevated text-text-muted rounded-md hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
