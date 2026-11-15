import { memo } from 'react';

interface FooterProps {
  onEnterOrbit: () => void;
}

export const Footer = memo(function Footer({ onEnterOrbit }: FooterProps) {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#030308] pt-20 pb-14 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-14 border-b border-white/[0.04]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <span className="font-display font-medium text-sm tracking-[0.2em] text-white">
                ORBIT
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-normal">
              Spatial productivity for the cosmos-minded. Transforming multi-threaded projects into
              gravitational planetary systems and synchronized satellite orbits.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                SYSTEM OPERATIONAL
              </span>
              <span className="text-slate-500">v2.4 SPATIAL</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500 mb-4">
              Cosmic Shortcuts
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-slate-400">
              <li className="flex items-center justify-between">
                <span>New Celestial Body</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300">N</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Dismiss Active Overlay</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300">ESC</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>AI Mission Navigator</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300">⌘K</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Telemetry Telemetry</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300">?</kbd>
              </li>
            </ul>
          </div>

          {/* Mission Control Actions */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500">
              Mission Control
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Experience the 3D spatial workspace immediately in your browser with zero sign-up required.
            </p>
            <button
              onClick={onEnterOrbit}
              className="w-full py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] text-white text-xs font-display font-medium tracking-[0.14em] uppercase transition-all cursor-pointer"
            >
              LAUNCH ORBIT ENGINE
            </button>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © 2026 ORBIT SPATIAL SYSTEMS. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <span>ACCESSIBILITY: WCAG 2.1 AA</span>
            <span>THREE.JS & REACT 19</span>
          </div>
        </div>
      </div>
    </footer>
  );
});
