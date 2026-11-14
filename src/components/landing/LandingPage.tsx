import { memo } from 'react';
import { Navbar } from './Navbar';
import { Hero3DCanvas } from './Hero3DCanvas';
import { OrbitalFeatures } from './OrbitalFeatures';
import { InteractivePlanetPreview } from './InteractivePlanetPreview';
import { TechSpecs } from './TechSpecs';
import { Footer } from './Footer';

interface LandingPageProps {
  onEnterOrbit: () => void;
}

export const LandingPage = memo(function LandingPage({ onEnterOrbit }: LandingPageProps) {
  return (
    <div className="relative min-h-screen bg-[#030308] text-slate-100 overflow-x-hidden selection:bg-violet-600/40 selection:text-cyan-200">
      {/* Navigation */}
      <Navbar onEnterOrbit={onEnterOrbit} />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] pt-32 pb-20 flex items-center justify-center overflow-hidden">
        {/* Subtle Ambient Cosmic Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/[0.12] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] bg-cyan-500/[0.08] rounded-full blur-[100px] pointer-events-none" />

        {/* 3D Celestial Hero Canvas Background / Layer */}
        <div className="absolute inset-0 z-0 opacity-85">
          <Hero3DCanvas />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md text-xs font-mono text-cyan-300 mb-8 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-[pulse_4s_ease-in-out_infinite]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
            <span className="tracking-wide">AI-POWERED SPATIAL PRODUCTIVITY SYSTEM</span>
          </div>

          {/* Grand Headline */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
            Where Projects Become <span className="gradient-cosmic-text">Worlds</span>, <br className="hidden sm:inline" />
            and Tasks Find Their <span className="gradient-accent-text">Orbit</span>.
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-sans font-light mb-10">
            Escape the tyranny of flat 2D boards. ORBIT organizes your cognitive universe into
            celestial planets, kinetic task satellites, and synaptic dependency arcs.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {/* Primary ENTER YOUR ORBIT CTA Button */}
            <button
              onClick={onEnterOrbit}
              className="relative group px-8 py-4 rounded-xl text-sm font-display font-bold tracking-widest uppercase overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-[0_0_40px_-5px_rgba(139,92,246,0.6)]"
              aria-label="Enter Your Orbit Workspace"
            >
              {/* Animated Aurora Sheen */}
              <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 opacity-95 group-hover:opacity-100 transition-opacity" />
              <span className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
              
              {/* Inner Glass border */}
              <span className="absolute inset-0 rounded-xl border border-white/40 group-hover:border-white/80 transition-colors" />

              {/* Button text & icon */}
              <span className="relative z-10 flex items-center gap-3 text-white">
                <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9] animate-ping" />
                <span>ENTER YOUR ORBIT</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>

            {/* Secondary Ghost Button */}
            <a
              href="#interactive"
              className="px-6 py-4 rounded-xl text-sm font-display font-medium tracking-wider uppercase text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <span>Explore Interactive Staging</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Telemetry Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/[0.08] text-left">
            <div className="p-3">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">CAPACITY</div>
              <div className="text-sm font-display font-semibold text-white mt-0.5">12 Celestial Bodies</div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">LATENCY</div>
              <div className="text-sm font-display font-semibold text-cyan-300 mt-0.5">&lt; 16ms 60 FPS Engine</div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">STORAGE</div>
              <div className="text-sm font-display font-semibold text-violet-300 mt-0.5">Offline-First IndexedDB</div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">TOPOLOGY</div>
              <div className="text-sm font-display font-semibold text-white mt-0.5">Cycle-Safe Bezier Arcs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Laws */}
      <OrbitalFeatures />

      {/* Interactive Planet Staging */}
      <InteractivePlanetPreview onEnterOrbit={onEnterOrbit} />

      {/* Engineering Architecture */}
      <TechSpecs />

      {/* Grand Pre-Flight CTA Section */}
      <section className="relative py-28 px-6 overflow-hidden">
        {/* Giant vortex backdrop glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 glass-panel-glow p-12 lg:p-16 rounded-3xl border border-white/[0.12]">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 block mb-4">
            INITIATE SYSTEM LAUNCH
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to Navigate Your <span className="gradient-accent-text">Productivity Cosmos</span>?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            No signup. No cloud lock-in. Your projects immediately materialize in full 3D spatial glory,
            persisted safely in your local browser vault.
          </p>

          <button
            onClick={onEnterOrbit}
            className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-display font-bold tracking-widest uppercase text-sm hover:from-violet-500 hover:to-cyan-400 shadow-[0_0_50px_-5px_rgba(139,92,246,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
            aria-label="Enter Your Orbit Now"
          >
            <span>ENTER YOUR ORBIT</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer onEnterOrbit={onEnterOrbit} />
    </div>
  );
});
