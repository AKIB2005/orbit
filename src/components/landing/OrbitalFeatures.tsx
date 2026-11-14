import { memo } from 'react';

const FEATURES = [
  {
    badge: '01 // CELESTIAL GRAVITY',
    title: 'Projects as Living Planets',
    description:
      'Break away from suffocating nested folders. In ORBIT, projects manifest as planetary spheres whose visual mass, atmospheric corona, and color spectra mirror system health and scope.',
    accent: 'violet',
    glowClass: 'cosmic-glow-violet',
    borderClass: 'group-hover:border-violet-500/50',
    icon: (
      <svg className="w-6 h-6 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
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
    accent: 'cyan',
    glowClass: 'cosmic-glow-cyan',
    borderClass: 'group-hover:border-cyan-400/50',
    icon: (
      <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
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
    accent: 'violet',
    glowClass: 'cosmic-glow-violet',
    borderClass: 'group-hover:border-violet-500/50',
    icon: (
      <svg className="w-6 h-6 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
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
    accent: 'cyan',
    glowClass: 'cosmic-glow-cyan',
    borderClass: 'group-hover:border-cyan-400/50',
    icon: (
      <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
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
    <section id="paradigm" className="relative py-28 px-6 max-w-7xl mx-auto">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-mono text-violet-300 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span>SPATIAL COMPUTING LAWS</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          The Laws of <span className="gradient-accent-text">Orbital Productivity</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          Traditional project management flattens multi-dimensional human endeavor into static lists.
          ORBIT elevates cognitive workflows into an intuitive 3D spatial continuum.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {FEATURES.map((feat, idx) => (
          <div
            key={idx}
            className={`group relative p-8 rounded-2xl glass-panel border transition-all duration-300 hover:-translate-y-1 ${feat.borderClass}`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <span className="text-[11px] font-mono tracking-wider text-slate-400">
                {feat.badge}
              </span>
            </div>

            {/* Content */}
            <h3 className="font-display text-xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">
              {feat.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {feat.description}
            </p>

            {/* Bottom telemetry badge */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Specification:</span>
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {feat.metric}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
