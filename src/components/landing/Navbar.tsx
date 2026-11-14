import { useState, useEffect, memo } from 'react';

interface NavbarProps {
  onEnterOrbit: () => void;
}

export const Navbar = memo(function Navbar({ onEnterOrbit }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#030308]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.6)] py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Emblem */}
        <a
          href="#"
          className="flex items-center gap-3.5 group focus:outline-none"
          aria-label="ORBIT Home"
        >
          <div className="relative w-9 h-9 flex items-center justify-center">
            {/* Outer orbit ring */}
            <div className="absolute inset-0 rounded-full border border-violet-500/40 group-hover:border-cyan-400/80 transition-colors animate-[spin_12s_linear_infinite]" />
            {/* Tilted inner ring */}
            <div className="absolute inset-1 rounded-full border border-cyan-400/50 group-hover:border-violet-400/90 transition-colors rotate-45" />
            {/* Singularity core */}
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-300 shadow-[0_0_12px_rgba(139,92,246,0.9)] group-hover:scale-125 transition-transform" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-[0.2em] text-white">
                ORBIT
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-violet-950/80 text-violet-300 border border-violet-800/50">
                PROD
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-mono -mt-0.5">
              Spatial Work OS
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a
            href="#paradigm"
            className="hover:text-cyan-300 transition-colors tracking-wide"
          >
            Paradigm
          </a>
          <a
            href="#mechanics"
            className="hover:text-cyan-300 transition-colors tracking-wide"
          >
            Orbital Mechanics
          </a>
          <a
            href="#interactive"
            className="hover:text-cyan-300 transition-colors tracking-wide flex items-center gap-1.5"
          >
            <span>Live System</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </a>
          <a
            href="#architecture"
            className="hover:text-cyan-300 transition-colors tracking-wide"
          >
            Architecture
          </a>
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>WebGL Engine Online</span>
          </div>

          <button
            onClick={onEnterOrbit}
            className="relative group px-5 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase overflow-hidden cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
            aria-label="Enter Your Orbit"
          >
            {/* Glowing gradient background */}
            <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
            
            {/* Subtle border highlight */}
            <span className="absolute inset-0 rounded-lg border border-white/30 group-hover:border-white/60 transition-colors" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2 text-white font-display">
              <span>ENTER YOUR ORBIT</span>
              <svg
                className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-4 pb-6 bg-[#0a0a18]/95 backdrop-blur-2xl border-b border-white/[0.08] flex flex-col gap-4 mt-2">
          <a
            href="#paradigm"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-200 hover:text-cyan-300 text-sm font-medium py-1"
          >
            Paradigm
          </a>
          <a
            href="#mechanics"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-200 hover:text-cyan-300 text-sm font-medium py-1"
          >
            Orbital Mechanics
          </a>
          <a
            href="#interactive"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-200 hover:text-cyan-300 text-sm font-medium py-1"
          >
            Live System
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-200 hover:text-cyan-300 text-sm font-medium py-1"
          >
            Architecture
          </a>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onEnterOrbit();
              }}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-display text-xs font-semibold tracking-wider uppercase"
            >
              ENTER YOUR ORBIT
            </button>
          </div>
        </div>
      )}
    </header>
  );
});
