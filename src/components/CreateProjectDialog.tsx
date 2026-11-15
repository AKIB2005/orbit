import { memo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../store/useOrbitStore';
import type { ColorTheme } from '../types';
import { COLOR_THEME_MAP } from '../types';
import { getOrbitalParameters, calculateOrbitalPosition } from '../utils/orbitalKinematics';

const THEMES: ColorTheme[] = ['violet', 'cyan', 'rose', 'amber', 'emerald', 'blue', 'orange', 'teal'];

export const CreateProjectDialog = memo(function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('violet');
  const createProject = useOrbitStore((s) => s.createProject);
  const projects = useOrbitStore((s) => s.projects);
  const projectCount = Object.keys(projects).length;

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    document.addEventListener('orbit:create-project', handleOpen);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        return;
      }
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !open) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('orbit:create-project', handleOpen);
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || projectCount >= 12) return;
    const orbitParams = getOrbitalParameters(projectCount);
    const initialPos = calculateOrbitalPosition(orbitParams, orbitParams.initialAngle);
    createProject({
      name: trimmed,
      description: description.trim(),
      colorTheme,
      status: 'active',
      position: initialPos,
    });
    setName('');
    setDescription('');
    setColorTheme('violet');
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setName('');
    setDescription('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] max-w-[90vw] bg-surface border border-border rounded-xl shadow-2xl z-50 p-6"
            role="dialog"
            aria-label="Create new project"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Create Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  autoFocus
                  required
                  placeholder="Project name"
                  className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-violet/50"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="What is this project about?"
                  className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-violet/50 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-2">Color Theme</label>
                <div className="flex gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setColorTheme(theme)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        colorTheme === theme ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: COLOR_THEME_MAP[theme].primary }}
                      aria-label={`Color: ${theme}`}
                    />
                  ))}
                </div>
              </div>
              {projectCount >= 12 && (
                <p className="text-xs text-amber-400">Maximum 12 projects reached.</p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm bg-elevated text-text-muted rounded-md hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || projectCount >= 12}
                  className="flex-1 px-4 py-2 text-sm bg-white text-[#05050d] font-medium rounded-md hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
