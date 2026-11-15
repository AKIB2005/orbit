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
    name: 'Orbital Kinematics Engine',
    desc: 'Keplerian velocity solver with gravitational acceleration offsets.',
    tasks: [
      { id: '15', title: 'Keplerian Velocity Matrix', priority: 'critical', status: 'done', satelliteSpeed: '1.2 rad/s' },
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
    <section id="interactive" className="relative py-24 sm:py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mb-5">
          Pick a planet. See its tasks.
        </h2>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
          Each color is a project. Tasks orbit it at a speed set by priority.
        </p>

        {/* Spectrum Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {THEMES.map((theme) => {
            const isSelected = activeTheme === theme.id;
            const tColor = COLOR_THEME_MAP[theme.id].primary;
            return (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.08] border-white/20 text-white'
                    : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                } border`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tColor }}
                />
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Staging Box */}
      <div className="relative rounded-3xl bg-white/[0.02] border border-white/[0.07] p-8 lg:p-12 overflow-hidden backdrop-blur-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* 3D Visualizer Simulation (Left / 7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[380px] bg-black/40 rounded-2xl border border-white/[0.05] p-8 overflow-hidden">
            {/* Simulated Planetary Core */}
            <div className="relative flex items-center justify-center">
              {/* Outer Orbit Ring */}
              <div
                className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-white/10"
              />

              {/* Tilted Satellite Ring */}
              <div
                className="absolute w-60 h-60 rounded-full border border-white/10 rotate-[55deg]"
              />

              {/* Orbiting Satellite Dots */}
              <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full animate-[spin_10s_linear_infinite]">
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: themeColors.primary }}
                />
              </div>

              <div className="absolute w-60 h-60 rounded-full rotate-[55deg] animate-[spin_16s_linear_infinite]">
                <div
                  className="absolute bottom-0 right-1/4 w-2.5 h-2.5 rounded-full bg-slate-300"
                />
              </div>

              {/* Planet Sphere Core */}
              <div
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-700 shadow-xl"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #e2e8f0 0%, ${themeColors.primary} 45%, #070712 100%)`,
                }}
              >
                <div className="w-20 h-20 rounded-full border border-white/10 opacity-30 rotate-12" />
              </div>
            </div>

            {/* Dynamic Status Bar */}
            <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                Orbit Status: STABLE
              </span>
              <span className="text-slate-600">|</span>
              <span>Gravitational Index: 4.8G</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline">{project.tasks.length} Satellites In Flight</span>
            </div>
          </div>

          {/* Telemetry & Task Payload (Right / 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: themeColors.primary }}
                />
                <span className="text-xs   text-slate-500">
                  Active Celestial Entity
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-medium text-white mb-2">
                {project.name}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-normal">
                {project.desc}
              </p>
            </div>

            {/* Task Satellite Manifest */}
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500   flex justify-between">
                <span>Orbiting Task Payloads</span>
                <span>Velocity</span>
              </div>

              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        task.status === 'done'
                          ? 'bg-emerald-400'
                          : task.status === 'in_progress'
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {task.title}
                      </p>
                      <span className="text-[11px] text-slate-500 ">
                        Priority: {task.priority}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0">
                    {task.satelliteSpeed}
                  </span>
                </div>
              ))}
            </div>

            {/* Action to Enter Orbit */}
            <div className="pt-2">
              <button
                onClick={onEnterOrbit}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-display font-medium   text-[#05050d] bg-white hover:bg-slate-100 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <span>Launch System In 3D Orbit</span>
                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
