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
    <div className="relative min-h-screen bg-[#030308] text-slate-100 overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-100">
      {/* Navigation */}
      <Navbar onEnterOrbit={onEnterOrbit} />

      {/* Hero Section */}
      <section className="relative min-h-[94vh] pt-36 pb-24 flex items-center justify-center overflow-hidden">
        {/* Subtle Ambient Cosmic Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-slate-800/[0.12] rounded-full blur-[140px] pointer-events-none" />

        {/* 3D Celestial Hero Canvas Background / Layer */}
        <div className="absolute inset-0 z-0 opacity-90 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black_80%)]">
          <Hero3DCanvas />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-[11px] font-mono tracking-[0.16em] uppercase text-slate-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/90 shadow-[0_0_8px_#22d3ee]" />
            <span>AI-Powered Spatial Productivity System</span>
          </div>

          {/* Grand Headline */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-normal tracking-[-0.035em] text-white leading-[1.04] mb-7 max-w-4xl mx-auto">
            Where projects become <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-slate-400 font-medium">worlds</span>,<br className="hidden sm:inline" />
            and tasks find their <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 font-medium">orbit</span>.
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-sans font-normal mb-10">
            Escape the clutter of flat 2D lists. ORBIT coordinates your cognitive workspace into
            celestial planets, synchronized task satellites, and synaptic dependency arcs.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-20">
            {/* Primary ENTER YOUR ORBIT CTA Button */}
            <button
              onClick={onEnterOrbit}
              className="group px-7 py-3.5 rounded-xl bg-white text-[#05050d] hover:bg-slate-100 font-display font-medium text-xs tracking-[0.14em] uppercase shadow-[0_1px_3px_rgba(0,0,0,0.5),0_0_24px_rgba(255,255,255,0.12)] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
              aria-label="Enter Your Orbit Workspace"
            >
              <span>ENTER YOUR ORBIT</span>
              <svg className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Secondary Ghost Button */}
            <a
              href="#interactive"
              className="px-6 py-3.5 rounded-xl text-xs font-display font-medium tracking-[0.14em] uppercase text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] backdrop-blur-xl transition-all flex items-center gap-2"
            >
              <span>Explore Interactive Staging</span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Telemetry Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/[0.06] text-left">
            <div className="p-3">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">CAPACITY</div>
              <div className="text-sm font-display font-medium text-slate-200 mt-1">12 Celestial Bodies</div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">LATENCY</div>
              <div className="text-sm font-display font-medium text-slate-200 mt-1">&lt; 16ms 60 FPS Engine</div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">STORAGE</div>
              <div className="text-sm font-display font-medium text-slate-200 mt-1">Offline-First IndexedDB</div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">TOPOLOGY</div>
              <div className="text-sm font-display font-medium text-slate-200 mt-1">Cycle-Safe Bezier Arcs</div>
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
        <div className="max-w-4xl mx-auto text-center relative z-10 p-12 lg:p-16 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-4">
            INITIATE SYSTEM LAUNCH
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-normal text-white tracking-tight mb-5">
            Ready to navigate your <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-slate-400 font-medium">productivity cosmos</span>?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            No signup. No cloud lock-in. Your projects immediately materialize in full 3D spatial glory,
            persisted safely in your local browser vault.
          </p>

          <button
            onClick={onEnterOrbit}
            className="group px-8 py-4 rounded-xl bg-white text-[#05050d] hover:bg-slate-100 font-display font-medium text-xs tracking-[0.14em] uppercase shadow-[0_1px_3px_rgba(0,0,0,0.5),0_0_24px_rgba(255,255,255,0.12)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
            aria-label="Enter Your Orbit Now"
          >
            <span>ENTER YOUR ORBIT</span>
            <svg className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
