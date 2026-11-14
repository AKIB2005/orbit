import { memo } from 'react';

interface FooterProps {
  onEnterOrbit: () => void;
}

export const Footer = memo(function Footer({ onEnterOrbit }: FooterProps) {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#030308] pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full border border-violet-500/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              </div>
              <span className="font-display font-bold text-lg tracking-[0.2em] text-white">
                ORBIT
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Spatial productivity for the cosmos-minded. Transforming complex multi-threaded work into
              gravitational planetary systems and synchronized satellite orbits.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM OPERATIONAL
              </span>
              <span>v0.9.4 PRE-FLIGHT</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4">
              Cosmic Shortcuts
            </h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="flex items-center justify-between">
                <span>New Celestial Body</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white">N</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Dismiss Overlay</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white">ESC</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Cycle Constellation</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white">TAB</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Telemetry Help</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white">?</kbd>
              </li>
            </ul>
          </div>

          {/* Mission Control Actions */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Mission Control
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience the 3D spatial workspace immediately in your browser with zero sign-up required.
            </p>
            <button
              onClick={onEnterOrbit}
              className="w-full py-2.5 px-4 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-violet-500/50 text-white text-xs font-display font-semibold tracking-wider uppercase transition-all"
            >
              LAUNCH ORBIT ENGINE
            </button>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            © 2026 ORBIT SPATIAL SYSTEMS. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <span>ACCESSIBILITY: WCAG 2.1 AA</span>
            <span>POWERED BY THREE.JS & REACT 19</span>
          </div>
        </div>
      </div>
    </footer>
  );
});
