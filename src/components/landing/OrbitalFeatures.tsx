import { memo } from 'react';

const FEATURES = [
  {
    title: 'Projects are planets',
    body: 'Each project gets its own body with its own color and orbit. Status, size and position tell you where things stand before you open anything.',
  },
  {
    title: 'Tasks are satellites',
    body: 'Tasks circle their planet. Urgent ones move faster, in-progress ones glow, finished ones settle into green. The system shows its own progress.',
  },
  {
    title: 'Dependencies are visible',
    body: 'Link one project to another and an arc connects them in space. ORBIT refuses links that would create a loop, so blockers never go circular.',
  },
  {
    title: 'AI that asks first',
    body: 'Ask what to work on, or tell it to add a task. It proposes each change as a card you approve. Nothing is applied behind your back.',
  },
];

export const OrbitalFeatures = memo(function OrbitalFeatures() {
  return (
    <section id="paradigm" className="relative py-24 sm:py-32 px-6 max-w-7xl mx-auto scroll-mt-16">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5">
          <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.05] [text-wrap:balance] lg:sticky lg:top-28">
            A list can’t show you how your work fits together.
          </h2>
        </div>

        <div id="mechanics" className="lg:col-span-7 scroll-mt-24 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {FEATURES.map((f) => (
            <div key={f.title} className="py-8 sm:py-10 grid sm:grid-cols-[14rem_1fr] gap-3 sm:gap-8">
              <h3 className="font-display text-lg font-medium text-white">{f.title}</h3>
              <p className="text-base text-slate-400 leading-relaxed max-w-prose">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
