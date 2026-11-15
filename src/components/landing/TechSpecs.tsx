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
    <section id="architecture" className="relative py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono tracking-[0.16em] uppercase text-slate-400 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>Engineering Foundation</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mb-5">
          Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-slate-400 font-medium">kinetic fidelity</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
          ORBIT is built from bare metal to guarantee that 3D spatial fidelity never comes at the cost of
          productivity speed or battery performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ARCHITECTURE_BLOCKS.map((block, idx) => (
          <div
            key={idx}
            className="p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group backdrop-blur-xl"
          >
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              {block.category}
            </span>
            <h3 className="font-display text-lg font-medium text-white mt-2 mb-2.5 group-hover:text-slate-100 transition-colors">
              {block.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 font-normal">
              {block.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/[0.04]">
              {block.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] text-[11px] font-mono text-slate-400"
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
