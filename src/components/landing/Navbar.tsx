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
          ? 'bg-[#030308]/85 backdrop-blur-2xl border-b border-white/[0.06] py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Emblem */}
        <a
          href="#"
          className="flex items-center gap-3 group focus:outline-none"
          aria-label="ORBIT Home"
        >
          <div className="relative w-7 h-7 flex items-center justify-center">
            {/* Minimalist fine orbit rings */}
            <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-cyan-400/60 transition-colors" />
            <div className="absolute inset-1 rounded-full border border-white/10 group-hover:border-white/30 transition-colors rotate-45" />
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-display font-medium text-sm tracking-[0.2em] text-white">
              ORBIT
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider text-slate-500 bg-white/[0.03] border border-white/[0.06]">
              v2.4
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-normal text-slate-400">
          <a
            href="#paradigm"
            className="hover:text-white transition-colors"
          >
            Paradigm
          </a>
          <a
            href="#mechanics"
            className="hover:text-white transition-colors"
          >
            Orbital Mechanics
          </a>
          <a
            href="#interactive"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Live System</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
          </a>
          <a
            href="#architecture"
            className="hover:text-white transition-colors"
          >
            Architecture
          </a>
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>WebGL Engine Online</span>
          </div>

          <button
            onClick={onEnterOrbit}
            className="px-4 py-2 rounded-lg text-xs font-display font-medium tracking-wider uppercase bg-white text-[#05050d] hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.4)] cursor-pointer"
            aria-label="Enter Your Orbit"
          >
            <span>Launch</span>
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="md:hidden px-6 pt-4 pb-6 bg-[#070712]/98 backdrop-blur-2xl border-b border-white/[0.06] flex flex-col gap-3 mt-2">
          <a
            href="#paradigm"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white text-sm py-1"
          >
            Paradigm
          </a>
          <a
            href="#mechanics"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white text-sm py-1"
          >
            Orbital Mechanics
          </a>
          <a
            href="#interactive"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white text-sm py-1"
          >
            Live System
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white text-sm py-1"
          >
            Architecture
          </a>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onEnterOrbit();
              }}
              className="w-full py-2.5 rounded-lg bg-white text-[#05050d] font-display text-xs font-medium tracking-wider uppercase shadow-md cursor-pointer"
            >
              LAUNCH ORBIT
            </button>
          </div>
        </div>
      )}
    </header>
  );
});
