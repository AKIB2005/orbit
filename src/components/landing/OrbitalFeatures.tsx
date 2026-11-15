import { memo } from 'react';

const FEATURES = [
  {
    badge: '01 // CELESTIAL GRAVITY',
    title: 'Projects as Living Planets',
    description:
      'Break away from suffocating nested folders. In ORBIT, projects manifest as planetary spheres whose visual mass, atmospheric corona, and color spectra mirror system health and scope.',
    icon: (
      <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <circle cx="12" cy="12" r="7" />
        <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(-25 12 12)" />
      </svg>
    ),
    metric: '12 Worlds in Harmony',
  },
  {
    badge: '02 // ORBITAL KINEMATICS',
    title: 'Tasks as Synchronized Satellites',
    description:
      'Tasks take physical form as satellites in stable orbital trajectories around their parent planet. Critical tasks accelerate with urgent velocity, while done states settle into luminous emerald orbits.',
    icon: (
      <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <circle cx="12" cy="12" r="3" />
        <path d="M3 12a9 9 0 0 1 15-6.7" />
        <circle cx="18" cy="5.3" r="1.5" fill="currentColor" />
        <path d="M21 12a9 9 0 0 1-15 6.7" />
        <circle cx="6" cy="18.7" r="1.5" fill="currentColor" />
      </svg>
    ),
    metric: 'Real-time 60 FPS Orbit',
  },
  {
    badge: '03 // SYNAPTIC TOPOLOGY',
    title: 'Visual Dependency Arcs',
    description:
      'No hidden road blockers. Quadratic Bezier conduits span between planetary systems in 3D space, rendering inter-project dependencies as pulsing, energized particle streams.',
    icon: (
      <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <circle cx="5" cy="18" r="2.5" />
        <circle cx="19" cy="6" r="2.5" />
        <path d="M7 16.5C11 15 13 9 17 7.5" strokeDasharray="2 2" />
        <path d="M7 16.5C11 15 13 9 17 7.5" />
      </svg>
    ),
    metric: 'Cycle-Safe Graph Theory',
  },
  {
    badge: '04 // SPATIAL INTELLIGENCE',
    title: 'Gemini Spatial Co-Pilot',
    description:
      'Natural language command routing translates broad strategic intents into new planetary bodies, auto-prioritized task orbits, and synthesized system summaries with zero friction.',
    icon: (
      <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
        <circle cx="12" cy="12" r="5" />
        <path d="M16 8l2-2M8 16l-2 2M16 16l2 2M8 8L6 6" />
      </svg>
    ),
    metric: 'Contextual AI Orchestration',
  },
];

export const OrbitalFeatures = memo(function OrbitalFeatures() {
  return (
    <section id="paradigm" className="relative py-32 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono tracking-[0.16em] uppercase text-slate-400 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>Spatial Computing Laws</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mb-5">
          The laws of <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-slate-400 font-medium">orbital productivity</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
          Traditional project management flattens multi-dimensional human endeavor into static lists.
          ORBIT elevates cognitive workflows into an intuitive 3D spatial continuum.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div id="mechanics" className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10 scroll-mt-24">
        {FEATURES.map((feat, idx) => (
          <div
            key={idx}
            className="group relative p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-xl"
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:border-white/[0.14] transition-colors">
                {feat.icon}
              </div>
              <span className="text-[11px] font-mono tracking-[0.16em] text-slate-500 uppercase">
                {feat.badge}
              </span>
            </div>

            {/* Content */}
            <h3 className="font-display text-lg font-medium text-white mb-2.5 tracking-tight group-hover:text-slate-100 transition-colors">
              {feat.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 font-normal">
              {feat.description}
            </p>

            {/* Bottom telemetry badge */}
            <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-slate-500">
              <span>SPECIFICATION</span>
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
                {feat.metric}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
