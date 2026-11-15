import { Modal } from './ui/Modal';
import { Icon } from './ui/Icon';
import { useOrbitStore } from '../store/useOrbitStore';
import { useReducedMotionPreference } from '../motion/useMotionPreference';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: { action: string; keys: string[] }[] = [
  { action: 'Rotate the view', keys: ['Drag'] },
  { action: 'Zoom', keys: ['Scroll'] },
  { action: 'Open a planet', keys: ['Click'] },
  { action: 'Back to overview', keys: ['Click empty space'] },
  { action: 'Next / previous planet', keys: [']', '['] },
  { action: 'New planet', keys: ['N'] },
  { action: 'Ask AI', keys: ['⌘ K', 'Ctrl K'] },
  { action: 'Close panel or dialog', keys: ['Esc'] },
  { action: 'Show this list', keys: ['?'] },
];

export function HelpModal({ open, onClose }: HelpModalProps) {
  const updateSettings = useOrbitStore((s) => s.updateSettings);
  const appReduced = useOrbitStore((s) => s.settings.reducedMotion);
  const effective = useReducedMotionPreference();
  const osForced = effective && !appReduced;
  return (
    <Modal open={open} onClose={onClose} label="Keyboard shortcuts and navigation" width="max-w-md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-medium text-white">Navigating ORBIT</h2>
          <button className="btn-icon -mr-2" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <dl className="divide-y divide-white/[0.06]">
          {SHORTCUTS.map((row) => (
            <div key={row.action} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-slate-300">{row.action}</dt>
              <dd className="flex items-center gap-1.5 shrink-0">
                {row.keys.map((k, i) => (
                  <span key={k} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-[11px] text-slate-600">or</span>}
                    <kbd className="kbd px-1.5">{k}</kbd>
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 pt-4 border-t border-white/[0.07] flex items-center justify-between gap-4">
          <div>
            <p id="rm-label" className="text-sm text-slate-200">Reduce motion</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {osForced ? 'Your system is already set to reduce motion.' : 'Stops orbiting, twinkling and camera flights.'}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={effective}
            aria-labelledby="rm-label"
            disabled={osForced}
            onClick={() => updateSettings({ reducedMotion: !appReduced })}
            className={`relative w-10 h-6 rounded-full shrink-0 transition-colors duration-150 disabled:opacity-60 ${effective ? 'bg-sky-300/80' : 'bg-white/[0.12]'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-150 ${effective ? 'translate-x-4' : ''}`} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
