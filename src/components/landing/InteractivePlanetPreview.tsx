import { useState, memo } from 'react';
import type { ColorTheme } from '../../types';
import { COLOR_THEME_MAP } from '../../types';

interface SampleTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'done';
  satelliteSpeed: string;
}

const SAMPLE_PROJECTS: Record<ColorTheme, { name: string; desc: string; tasks: SampleTask[] }> = {
  violet: {
    name: 'Quantum Engine Core',
    desc: 'Low-latency spatial render pipeline and high-performance WebGL scene coordinator.',
    tasks: [
      { id: '1', title: 'Compile Custom Atmospheric Shader', priority: 'critical', status: 'in_progress', satelliteSpeed: '1.2 rad/s' },
      { id: '2', title: 'Optimize Instanced Starfield (2k stars)', priority: 'high', status: 'done', satelliteSpeed: '0.9 rad/s' },
      { id: '3', title: 'Camera Bezier Slerp Interpolation', priority: 'medium', status: 'todo', satelliteSpeed: '0.6 rad/s' },
    ],
  },
  cyan: {
    name: 'Orbital Telemetry HUD',
    desc: 'HUD overlay system for real-time task tracking and satellite status diagnostics.',
    tasks: [
      { id: '4', title: 'Slide-out Glass Drawer Motion', priority: 'critical', status: 'done', satelliteSpeed: '1.2 rad/s' },
      { id: '5', title: 'IndexedDB State Key-Val Hydration', priority: 'high', status: 'in_progress', satelliteSpeed: '0.9 rad/s' },
      { id: '6', title: 'Context Menu Raycast Targeter', priority: 'low', status: 'todo', satelliteSpeed: '0.4 rad/s' },
    ],
  },
  rose: {
    name: 'Cosmic Design System',
    desc: 'Midnight surfaces, violet and cyan atmospheric accents, glassmorphic HUD controls.',
    tasks: [
      { id: '7', title: 'Space Grotesk Font Pairing', priority: 'high', status: 'done', satelliteSpeed: '0.9 rad/s' },
      { id: '8', title: 'Accessible Contrast Calibration', priority: 'critical', status: 'in_progress', satelliteSpeed: '1.2 rad/s' },
    ],
  },
  amber: {
    name: 'Synaptic Dependency Mesh',
    desc: 'Directional graph algorithms detecting circular dependencies and auto-routing arcs.',
    tasks: [
      { id: '9', title: 'DFS Graph Cycle Detection', priority: 'high', status: 'done', satelliteSpeed: '0.9 rad/s' },
      { id: '10', title: 'Animated Quadratic Curve Shader', priority: 'medium', status: 'in_progress', satelliteSpeed: '0.6 rad/s' },
    ],
  },
  emerald: {
    name: 'Gemini Spatial Co-Pilot',
    desc: 'Contextual AI orchestration creating project celestial bodies via natural prompts.',
    tasks: [
      { id: '11', title: 'Prompt Command Intent Parser', priority: 'critical', status: 'in_progress', satelliteSpeed: '1.2 rad/s' },
      { id: '12', title: 'Automated Status Digest Generator', priority: 'medium', status: 'todo', satelliteSpeed: '0.6 rad/s' },
    ],
  },
  blue: {
    name: 'Celestial Data Pipeline',
    desc: 'Real-time synchronization and offline transactional state logging.',
    tasks: [
      { id: '13', title: 'Offline LocalStorage Fallback', priority: 'medium', status: 'done', satelliteSpeed: '0.6 rad/s' },
    ],
  },
  orange: {
    name: 'Hardware Matrix Balancer',
    desc: 'Dynamic DPR scaling and low-poly LOD geometry fallback for mobile devices.',
    tasks: [
      { id: '14', title: 'Low-power GPU Detection', priority: 'high', status: 'done', satelliteSpeed: '0.9 rad/s' },
    ],
  },
  teal: {
    name: 'Sound & Particle Dynamics',
    desc: 'Spatial audio ambience and interactive particle dust dynamics.',
    tasks: [
      { id: '15', title: 'Subtle Cosmic Drone Ambience', priority: 'low', status: 'todo', satelliteSpeed: '0.4 rad/s' },
    ],
  },
};

const THEMES: { id: ColorTheme; label: string }[] = [
  { id: 'violet', label: 'Nebula Violet' },
  { id: 'cyan', label: 'Pulsar Cyan' },
  { id: 'rose', label: 'Solar Rose' },
  { id: 'amber', label: 'Amber Flare' },
  { id: 'emerald', label: 'Emerald Exoplanet' },
];

export const InteractivePlanetPreview = memo(function InteractivePlanetPreview({ onEnterOrbit }: { onEnterOrbit: () => void }) {
  const [activeTheme, setActiveTheme] = useState<ColorTheme>('violet');
  const project = SAMPLE_PROJECTS[activeTheme];
  const themeColors = COLOR_THEME_MAP[activeTheme];

  return (
    <section id="interactive" className="relative py-28 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>INTERACTIVE CELESTIAL STAGING</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          Inspect a <span className="gradient-accent-text">Planetary Microcosm</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          Switch atmospheric spectra to observe how projects adapt color identity, orbital speed,
          and task telemetry in real time.
        </p>

        {/* Spectrum Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
          {THEMES.map((theme) => {
            const isSelected = activeTheme === theme.id;
            const tColor = COLOR_THEME_MAP[theme.id].primary;
            return (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-300 ${
                  isSelected
                    ? 'bg-white/[0.1] border-white/30 text-white shadow-[0_0_20px_-3px_rgba(255,255,255,0.2)]'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                } border`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: tColor, boxShadow: isSelected ? `0 0 10px ${tColor}` : 'none' }}
                />
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Staging Box */}
      <div className="relative rounded-3xl glass-panel-glow border border-white/[0.1] p-8 lg:p-12 overflow-hidden">
        {/* Subtle background cosmic radial glow */}
        <div
          className="absolute -right-20 -bottom-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: themeColors.primary }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* 3D Visualizer Simulation (Left / 7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[380px] bg-black/40 rounded-2xl border border-white/[0.06] p-8 overflow-hidden">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 cosmic-grid opacity-25" />

            {/* Simulated Planetary Core */}
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Orbit Ring */}
              <div
                className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-dashed opacity-30 animate-[spin_30s_linear_infinite]"
                style={{ borderColor: themeColors.primary }}
              />

              {/* Tilted Satellite Ring */}
              <div
                className="absolute w-60 h-60 rounded-full border border-cyan-400/40 opacity-40 rotate-[55deg] animate-[spin_18s_linear_infinite]"
              />

              {/* Orbiting Satellite Dots */}
              <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full animate-[spin_8s_linear_infinite]">
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-[0_0_12px_#22d3ee] flex items-center justify-center"
                  style={{ backgroundColor: '#22d3ee' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
              </div>

              <div className="absolute w-60 h-60 rounded-full rotate-[55deg] animate-[spin_14s_linear_infinite]">
                <div
                  className="absolute bottom-0 right-1/4 w-3.5 h-3.5 rounded-full shadow-[0_0_10px_#10b981]"
                  style={{ backgroundColor: '#10b981' }}
                />
              </div>

              {/* Planet Sphere Core */}
              <div
                className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center shadow-[0_0_60px_-10px_rgba(139,92,246,0.6)] transition-all duration-700"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${themeColors.primary} 50%, #030308 100%)`,
                  boxShadow: `0 0 50px -5px ${themeColors.primary}80`,
                }}
              >
                {/* Surface texture detail */}
                <div className="w-24 h-24 rounded-full border border-white/20 opacity-30 rotate-12" />
              </div>
            </div>

            {/* Dynamic Status Bar */}
            <div className="mt-8 flex items-center gap-4 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Orbit Status: STABLE
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Gravitational Index: 4.8G</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline">{project.tasks.length} Satellites In Flight</span>
            </div>
          </div>

          {/* Telemetry & Task Payload (Right / 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: themeColors.primary }}
                />
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  Active Celestial Entity
                </span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                {project.name}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {project.desc}
              </p>
            </div>

            {/* Task Satellite Manifest */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Orbiting Task Payloads</span>
                <span>Orbital Velocity</span>
              </div>

              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        task.status === 'done'
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : task.status === 'in_progress'
                          ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                          : 'bg-slate-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {task.title}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        Priority: {task.priority}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-cyan-300 shrink-0">
                    {task.satelliteSpeed}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Action to Enter Orbit */}
            <div className="pt-2">
              <button
                onClick={onEnterOrbit}
                className="w-full py-3 px-4 rounded-xl text-xs font-display font-semibold tracking-wider uppercase text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 transition-all shadow-[0_0_25px_-5px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2"
              >
                <span>Launch This System in 3D Orbit</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
