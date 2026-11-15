import { memo, useState, useEffect } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import type { ColorTheme } from '../types';
import { COLOR_THEME_MAP } from '../types';
import { getOrbitalParameters, calculateOrbitalPosition } from '../utils/orbitalKinematics';
import { Modal } from './ui/Modal';
import { Icon } from './ui/Icon';

const THEMES: ColorTheme[] = ['violet', 'cyan', 'rose', 'amber', 'emerald', 'blue', 'orange', 'teal'];
const MAX_PROJECTS = 12;

export const CreateProjectDialog = memo(function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('violet');
  const createProject = useOrbitStore((s) => s.createProject);
  const addToast = useOrbitStore((s) => s.addToast);
  const projectCount = useOrbitStore((s) => Object.keys(s.projects).length);
  const full = projectCount >= MAX_PROJECTS;

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    document.addEventListener('orbit:create-project', handleOpen);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'n' || e.ctrlKey || e.metaKey || e.altKey || open) return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('orbit:create-project', handleOpen);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const reset = () => {
    setName('');
    setDescription('');
    setColorTheme('violet');
  };
  const close = () => {
    setOpen(false);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || full) return;
    const orbit = getOrbitalParameters(projectCount);
    createProject({
      name: trimmed,
      description: description.trim(),
      colorTheme,
      status: 'active',
      position: calculateOrbitalPosition(orbit, orbit.initialAngle),
    });
    addToast({ type: 'success', title: 'Planet created', message: `${trimmed} is now in orbit.` });
    close();
  };

  const color = COLOR_THEME_MAP[colorTheme].primary;

  return (
    <Modal open={open} onClose={close} label="Create a new planet" width="max-w-[27.5rem]">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            {/* Live preview of the planet being created */}
            <span
              className="w-9 h-9 rounded-full shrink-0 transition-[background-color,box-shadow] duration-300"
              style={{ backgroundColor: color, boxShadow: `0 0 0 5px ${color}22, 0 0 24px ${color}55` }}
              aria-hidden
            />
            <div>
              <h2 className="font-display text-lg font-medium text-white leading-tight">New planet</h2>
              <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                {full ? 'Your system is full' : `${projectCount} of ${MAX_PROJECTS} in orbit`}
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon -mr-2 -mt-1" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="cp-name" className="field-label">Name</label>
            <input
              id="cp-name"
              data-autofocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
              placeholder="e.g. Website relaunch"
              className="field"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="cp-desc" className="field-label">
              Description <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="cp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="What is this project about?"
              className="field resize-none"
            />
          </div>
          <div role="radiogroup" aria-label="Planet colour">
            <span className="field-label">Colour</span>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((theme) => {
                const on = colorTheme === theme;
                const c = COLOR_THEME_MAP[theme].primary;
                return (
                  <button
                    key={theme}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={theme}
                    onClick={() => setColorTheme(theme)}
                    className="w-8 h-8 rounded-full transition-[transform,box-shadow] duration-200 hover:scale-110 active:scale-95"
                    style={{ backgroundColor: c, boxShadow: on ? `0 0 0 2px #07070f, 0 0 0 4px ${c}` : 'none' }}
                  />
                );
              })}
            </div>
          </div>

          {full && (
            <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2" role="status">
              ORBIT holds up to {MAX_PROJECTS} planets. Archive or delete one to make room.
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button type="button" onClick={close} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" disabled={!name.trim() || full} className="btn btn-primary flex-1">
            Create planet
          </button>
        </div>
      </form>
    </Modal>
  );
});
