import { Modal } from './ui/Modal';
import { Icon } from './ui/Icon';

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
      </div>
    </Modal>
  );
}
