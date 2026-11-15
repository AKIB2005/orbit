import { memo, useMemo } from 'react';
import { useOrbitStore } from '../../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../../types';
import { getOrbitalParameters, calculateOrbitalPosition } from '../../utils/orbitalKinematics';

export const CosmicRadar2D = memo(function CosmicRadar2D() {
  const projects = useOrbitStore((s) => s.projects);
  const tasks = useOrbitStore((s) => s.tasks);
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const selectProject = useOrbitStore((s) => s.selectProject);
  const projectList = useMemo(() => Object.values(projects), [projects]);

  // Center coordinate of SVG viewBox [0..800, 0..800]
  const cx = 400;
  const cy = 400;
  const scale = 8.5; // Scale orbital units to SVG pixels

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#030308] select-none p-4">
      {/* 2D Mode Indicator Pill */}
      <div className="absolute top-20 left-6 z-10 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-slate-400 flex items-center gap-2 pointer-events-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <span>2D Cosmic Radar Active</span>
      </div>

      <svg
        viewBox="0 0 800 800"
        className="w-full h-full max-w-[850px] max-h-[850px] overflow-visible"
      >
        <defs>
          {/* Radial Core Glow */}
          <radialGradient id="coreGlow2D" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#030308" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Deep Background Orbital Grids */}
        <circle cx={cx} cy={cy} r="380" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={cx - 390} y1={cy} x2={cx + 390} y2={cy} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        <line x1={cx} y1={cy - 390} x2={cx} y2={cy + 390} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

        {/* Central Singularity Core */}
        <circle cx={cx} cy={cy} r="60" fill="url(#coreGlow2D)" />
        <circle cx={cx} cy={cy} r="8" fill="#ffffff" />

        {/* Elliptical Tracks & Planetary Bodies */}
        {projectList.map((project, idx) => {
          const orbit = getOrbitalParameters(idx);
          const rx = orbit.semiMajor * scale;
          const ry = orbit.semiMinor * scale;
          const isSelected = selectedProjectId === project.id;
          const theme = COLOR_THEME_MAP[project.colorTheme];
          const projectTasks = Object.values(tasks).filter((t) => t.projectId === project.id);

          // Canonical position along orbit
          const [px, , pz] = calculateOrbitalPosition(orbit, orbit.initialAngle);
          const planetX = cx + px * scale;
          const planetY = cy + pz * scale;

          return (
            <g key={project.id} className="cursor-pointer group">
              {/* Elliptical Track */}
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill="none"
                stroke={isSelected ? theme.primary : 'rgba(255,255,255,0.06)'}
                strokeWidth={isSelected ? '1.5' : '1'}
                strokeDasharray={isSelected ? 'none' : '3 3'}
                className="transition-colors duration-300"
              />

              {/* Selection Ring Indicator */}
              {isSelected && (
                <circle
                  cx={planetX}
                  cy={planetY}
                  r="24"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  className="animate-[spin_10s_linear_infinite]"
                />
              )}

              {/* Orbiting Task Satellite Dots */}
              {projectTasks.slice(0, 6).map((t, sIdx) => {
                const satAngle = (sIdx / Math.max(projectTasks.length, 1)) * Math.PI * 2;
                const satDist = 18;
                const sx = planetX + Math.cos(satAngle) * satDist;
                const sy = planetY + Math.sin(satAngle) * satDist;
                return (
                  <circle
                    key={t.id}
                    cx={sx}
                    cy={sy}
                    r="2.5"
                    fill={t.status === 'done' ? '#10b981' : theme.satellite}
                    opacity="0.8"
                  />
                );
              })}

              {/* Planet Sphere Node */}
              <circle
                cx={planetX}
                cy={planetY}
                r="11"
                fill={theme.primary}
                onClick={() => selectProject(isSelected ? null : project.id)}
                className="transition-transform duration-300 group-hover:scale-125"
                style={{
                  filter: isSelected ? `drop-shadow(0 0 10px ${theme.primary})` : 'none',
                }}
              />

              {/* Inner Core Specular Spot */}
              <circle
                cx={planetX - 3}
                cy={planetY - 3}
                r="3"
                fill="#ffffff"
                opacity="0.6"
                pointerEvents="none"
              />

              {/* Planet Label */}
              <text
                x={planetX}
                y={planetY + 22}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="11"
                fontFamily="Space Grotesk, sans-serif"
                fontWeight={isSelected ? '600' : '400'}
                className="pointer-events-none transition-colors"
              >
                {project.name}
              </text>
              <text
                x={planetX}
                y={planetY + 34}
                textAnchor="middle"
                fill={isSelected ? '#22d3ee' : '#64748b'}
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                className="pointer-events-none"
              >
                {projectTasks.length} TASKS
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
