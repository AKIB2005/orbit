import { memo } from 'react';

const ARCHITECTURE_BLOCKS = [
  {
    category: 'RENDER ENGINE',
    title: 'Three.js & React Three Fiber',
    description:
      'Hardware-accelerated 3D scene graph with instanced starfields, procedural celestial shaders, and automatic frustum culling. Capped at 60 FPS with adaptive DPR scaling.',
    tags: ['WebGL 2.0', 'InstancedMesh', 'GSAP Camera Flyto'],
  },
  {
    category: 'STATE & PERSISTENCE',
    title: 'Zustand & IndexedDB Pipeline',
    description:
      'Zero-latency atomic state management decoupled from 3D render loops. Automatic hydration from IndexedDB ensures complete offline autonomy without backend dependencies.',
    tags: ['Local-First', 'Key-Val IndexedDB', 'Micro-Selectors'],
  },
  {
    category: 'TOPOLOGY & MATHEMATICS',
    title: 'Cycle-Safe Graph Topology',
    description:
      'Directional graph engine enforcing cycle detection via Depth-First Search before establishing synaptic links. Visualized as dynamic Quadratic Bezier curves.',
    tags: ['DFS Cycle Detection', 'Bezier Arcs', 'Dynamic Offset'],
  },
  {
    category: 'INTERACTION DESIGN',
    title: 'Framer Motion & Glassmorphism',
    description:
      'Dual-layer rendering with HTML HUD overlaid on top of 3D canvas. Slide-out drawers, accessible focus traps, and keyboard shortcuts (N, Tab, ?, Esc).',
    tags: ['Framer Motion', 'Tailwind v4', 'WCAG AA Compliant'],
  },
];

export const TechSpecs = memo(function TechSpecs() {
  return (
    <section id="architecture" className="relative py-28 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>ENGINEERING FOUNDATION</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          Engineered for <span className="gradient-accent-text">Kinetic Fidelity</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          ORBIT is built from bare metal to guarantee that 3D spatial fidelity never comes at the cost of
          productivity speed or battery performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ARCHITECTURE_BLOCKS.map((block, idx) => (
          <div
            key={idx}
            className="p-8 rounded-2xl glass-panel border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 group"
          >
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
              {block.category}
            </span>
            <h3 className="font-display text-xl font-bold text-white mt-2 mb-3 group-hover:text-cyan-200 transition-colors">
              {block.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {block.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/[0.06]">
              {block.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
