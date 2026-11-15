import { memo, useState, useEffect } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { Icon } from './ui/Icon';
import { HelpModal } from './HelpModal';
import { useMediaQuery } from '../motion/useMediaQuery';

interface TopBarProps {
  onReturnToLanding?: () => void;
}

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
};

export const TopBar = memo(function TopBar({ onReturnToLanding }: TopBarProps) {
  const projectCount = useOrbitStore((s) => Object.keys(s.projects).length);
  const user = useOrbitStore((s) => s.user);
  const viewMode = useOrbitStore((s) => s.ui.viewMode);
  const setViewMode = useOrbitStore((s) => s.setViewMode);
  const setAuthModalOpen = useOrbitStore((s) => s.setAuthModalOpen);
  const [showHelp, setShowHelp] = useState(false);
  const panelOpen = useOrbitStore((s) => s.ui.panelOpen);
  const isDesktop = useMediaQuery('(min-width: 640px)');
  // Slide the controls out from under the workspace panel instead of letting it cover them
  const reserve = panelOpen && isDesktop ? 500 : 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault();
        setShowHelp((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-2 px-3 sm:px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 pointer-events-none"
        style={{ paddingRight: reserve ? reserve + 16 : undefined, transition: 'padding-right 700ms var(--ease-out)' }}
      >
        {/* Left: way back + identity */}
        <div className="pointer-events-auto flex items-center gap-2 min-w-0">
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="btn-icon btn-glass !w-9 !h-9 !rounded-xl"
              aria-label="Back to the landing page"
              title="Back to landing page"
            >
              <Icon name="arrowLeft" />
            </button>
          )}
          <div className="glass-panel h-9 rounded-xl pl-3 pr-3.5 flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-starlight shadow-[0_0_8px_rgba(243,238,226,0.7)]" aria-hidden />
            <h1 className="font-display text-sm font-medium tracking-[0.18em] text-white hidden sm:block">ORBIT</h1>
            <span className="text-xs text-slate-400 tabular-nums" aria-label={`${projectCount} of 12 planets`}>
              <span className="text-white font-medium">{projectCount}</span>
              <span aria-hidden>/12</span>
              <span className="hidden md:inline"> planets</span>
            </span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <div role="group" aria-label="View mode" className="glass-panel h-9 rounded-xl p-0.5 flex items-center">
            {(['3d', '2d'] as const).map((mode) => {
              const on = viewMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  aria-pressed={on}
                  title={mode === '3d' ? '3D universe' : '2D radar'}
                  className={`h-8 px-2.5 rounded-[0.6rem] text-xs font-medium transition-colors duration-150 ${
                    on ? 'bg-white/[0.12] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="btn btn-glass !h-9 !px-2.5 sm:!px-3 !rounded-xl"
            aria-label={user ? `Cloud sync, signed in as ${user.name || 'you'}` : 'Cloud sync and sign in'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-emerald-400' : 'bg-slate-500'}`}
              aria-hidden
            />
            <Icon name="cloud" className="sm:hidden" />
            <span className="hidden sm:inline max-w-[9rem] truncate">{user ? user.name || 'Synced' : 'Cloud sync'}</span>
          </button>

          <button
            onClick={() => document.dispatchEvent(new CustomEvent('orbit:toggle-ai'))}
            className="btn btn-glass !h-9 !px-2.5 sm:!px-3 !rounded-xl"
            aria-label="Ask AI (Command K)"
          >
            <Icon name="sparkle" className="text-ion" />
            <span className="hidden sm:inline">Ask AI</span>
            <kbd className="kbd hidden lg:inline-flex">⌘K</kbd>
          </button>

          <button
            onClick={() => document.dispatchEvent(new CustomEvent('orbit:create-project'))}
            className="btn btn-primary !h-9 !px-3 sm:!px-3.5 !rounded-xl"
            aria-label="Create a new planet (N)"
          >
            <Icon name="plus" size={15} strokeWidth={2.25} />
            <span className="hidden sm:inline">New planet</span>
          </button>

          <button
            onClick={() => setShowHelp(true)}
            className="btn-icon btn-glass !w-9 !h-9 !rounded-xl hidden sm:inline-flex"
            aria-label="Keyboard shortcuts"
            title="Shortcuts (?)"
          >
            <Icon name="help" />
          </button>
        </div>
      </header>

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
});
