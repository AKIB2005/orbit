import { memo, useState, useEffect } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';

interface TopBarProps {
  onReturnToLanding?: () => void;
}

export const TopBar = memo(function TopBar({ onReturnToLanding }: TopBarProps) {
  const projectCount = useOrbitStore((s) => Object.keys(s.projects).length);
  const user = useOrbitStore((s) => s.user);
  const viewMode = useOrbitStore((s) => s.ui.viewMode);
  const setViewMode = useOrbitStore((s) => s.setViewMode);
  const setAuthModalOpen = useOrbitStore((s) => s.setAuthModalOpen);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!showHelp) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowHelp(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showHelp]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleCreateProject = () => {
    document.dispatchEvent(new CustomEvent('orbit:create-project'));
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 pointer-events-none">
        {/* Left: Brand & Mode Navigation */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-4">
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg glass-panel hover:bg-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-all border border-white/[0.08] focus:outline-none"
              title="Return to Landing Surface"
            >
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Landing</span>
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-3 glass-panel px-2.5 sm:px-3.5 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <h1 className="font-display text-xs sm:text-sm font-medium tracking-[0.2em] text-white uppercase">
              ORBIT
            </h1>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
              <span className="text-white font-medium">{projectCount}</span>/12 <span className="hidden sm:inline">WORLDS</span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* View Mode Toggle: 3D Universe vs 2D Radar */}
          <button
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle between 3D Universe and 2D Radar Map (Mobile Fallback)"
            aria-label="Toggle 2D Radar or 3D Universe view"
          >
            <span className="text-[10px] text-slate-500 font-bold">VIEW:</span>
            <span className="font-semibold text-cyan-300">{viewMode.toUpperCase()}</span>
          </button>

          {/* Cloud Vault / Auth Status */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Open Supabase Cloud Vault & Identity"
            aria-label="Cloud Identity & Vault"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                user ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-500'
              }`}
            />
            <span className="hidden sm:inline">{user ? user.name || 'Cloud' : 'Cloud Vault'}</span>
            <span className="sm:hidden">{user ? 'Vault' : 'Cloud'}</span>
          </button>

          <button
            onClick={() => document.dispatchEvent(new CustomEvent('orbit:toggle-ai'))}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-mono rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle AI Command Center (Cmd+K)"
            title="AI Mission Navigator (Cmd+K)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="hidden sm:inline">AI COPILOT</span>
            <span className="sm:hidden font-semibold">AI</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-black/40 border border-white/20 text-[9px]">⌘K</kbd>
          </button>

          <button
            onClick={handleCreateProject}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 text-xs font-display font-medium tracking-wider uppercase rounded-lg bg-white text-[#05050d] hover:bg-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.4)] active:scale-95 transition-all cursor-pointer"
            aria-label="Create New Celestial Project"
          >
            <span>+ <span className="hidden sm:inline">NEW </span>PLANET</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-black/10 border border-black/20 text-[10px] font-mono text-black font-semibold">
              N
            </kbd>
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-mono rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Keyboard Shortcuts and Telemetry Help"
          >
            <kbd className="text-slate-300 font-bold">?</kbd> <span className="hidden sm:inline">HELP</span>
          </button>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="max-w-md w-full glass-panel-glow p-6 rounded-2xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-display font-bold text-lg text-white">
                Orbit Navigation Telemetry
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span>Rotate Camera View</span>
                <span className="text-cyan-300">Left Click + Drag</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span>Zoom Perspective</span>
                <span className="text-cyan-300">Mouse Scroll Wheel</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span>Focus / Open Planet Tasks</span>
                <span className="text-cyan-300">Click Any Planet</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span>Reset Camera to Overview</span>
                <span className="text-cyan-300">Click Cosmic Void</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span>Create New Project</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">N</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span>Close Active Drawer / Modal</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">ESC</kbd>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
