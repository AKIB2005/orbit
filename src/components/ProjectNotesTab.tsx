import { memo, useState, useEffect } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';

interface ProjectNotesTabProps {
  projectId: string;
}

export const ProjectNotesTab = memo(function ProjectNotesTab({ projectId }: ProjectNotesTabProps) {
  const project = useOrbitStore((s) => s.projects[projectId]);
  const updateProject = useOrbitStore((s) => s.updateProject);

  const [notes, setNotes] = useState(project?.notes ?? '');
  const [savedBadge, setSavedBadge] = useState(false);

  useEffect(() => {
    setNotes(project?.notes ?? '');
  }, [project?.notes]);

  const handleChange = (val: string) => {
    setNotes(val);
    updateProject(projectId, { notes: val });
    setSavedBadge(true);
    const timer = setTimeout(() => setSavedBadge(false), 2000);
    return () => clearTimeout(timer);
  };

  if (!project) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-base text-white">
            Planetary Logbook & Architecture Notes
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Free-form notes for this project. Saved as you type.
          </p>
        </div>

        {savedBadge && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Saved
          </span>
        )}
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] relative">
        <textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`# ${project.name} Architectural Notes\n\n- Key system constraints...\n- Technical dependencies...\n- Launch checklist...`}
          rows={14}
          className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
        />

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <span>{notes.length} characters</span>
          <span>IndexedDB Encrypted Offline Storage</span>
        </div>
      </div>
    </div>
  );
});
