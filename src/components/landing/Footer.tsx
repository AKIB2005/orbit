import { memo } from 'react';

interface FooterProps {
  onEnterOrbit: () => void;
}

const SHORTCUTS: [string, string][] = [
  ['N', 'New planet'],
  ['⌘ K', 'Ask AI'],
  ['Tab or ] [', 'Next or previous planet'],
  ['?', 'All shortcuts'],
];

export const Footer = memo(function Footer({ onEnterOrbit }: FooterProps) {
  return (
    <footer className="border-t border-white/[0.06] py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10">
        <div className="md:col-span-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-starlight" aria-hidden />
            <span className="font-display text-sm font-medium tracking-[0.2em] text-white">ORBIT</span>
          </div>
          <p className="mt-4 text-sm text-slate-400 max-w-sm leading-relaxed">
            Your universe. Your workflow. Your gravity.
          </p>
          <button onClick={onEnterOrbit} className="btn btn-ghost mt-6">
            Open the app
          </button>
        </div>

        <div className="md:col-span-6 md:justify-self-end">
          <h2 className="text-sm font-medium text-white mb-4">Keyboard shortcuts</h2>
          <dl className="space-y-2.5">
            {SHORTCUTS.map(([k, label]) => (
              <div key={k} className="flex items-center gap-4 text-sm">
                <dt className="w-28">
                  <kbd className="kbd px-1.5">{k}</kbd>
                </dt>
                <dd className="text-slate-400">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </footer>
  );
});
