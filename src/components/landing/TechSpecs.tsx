import { memo } from 'react';

const BLOCKS = [
  {
    title: 'Fast on ordinary hardware',
    body: 'The 3D scene lowers its own resolution if frames drop, stars are drawn in a single pass, and animation pauses entirely when you ask your system for reduced motion.',
  },
  {
    title: 'Your data stays yours',
    body: 'Everything is saved in your browser and works offline. Sign in only if you want cloud sync across devices.',
  },
  {
    title: 'No circular dependencies',
    body: 'Before a link is created, ORBIT checks that it wouldn’t loop back on itself, so the dependency graph always has a clear order.',
  },
  {
    title: 'A 2D radar for anywhere',
    body: 'On devices without WebGL, or whenever you prefer a flat view, switch to the radar. Same projects, same actions.',
  },
];

export const TechSpecs = memo(function TechSpecs() {
  return (
    <section id="architecture" className="relative py-24 sm:py-32 px-6 max-w-7xl mx-auto scroll-mt-16">
      <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-[-0.03em] text-white max-w-2xl [text-wrap:balance]">
        Built to feel instant and stay out of your way.
      </h2>
      <div className="mt-14 grid sm:grid-cols-2 gap-x-16 gap-y-12">
        {BLOCKS.map((b) => (
          <div key={b.title} className="border-t border-white/[0.1] pt-6">
            <h3 className="font-display text-lg font-medium text-white">{b.title}</h3>
            <p className="mt-2.5 text-base text-slate-400 leading-relaxed max-w-md">{b.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
