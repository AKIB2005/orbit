import { memo, lazy, Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { OrbitalFeatures } from './OrbitalFeatures';
import { InteractivePlanetPreview } from './InteractivePlanetPreview';
import { TechSpecs } from './TechSpecs';
import { Footer } from './Footer';
import { Icon } from '../ui/Icon';
import { ease, dur } from '../../motion/tokens';

const Hero3DCanvas = lazy(() => import('./Hero3DCanvas').then((m) => ({ default: m.Hero3DCanvas })));

interface LandingPageProps {
  onEnterOrbit: () => void;
}

/** One orchestrated entrance for the hero; everything below the fold is static. */
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: ease.out },
});

export const LandingPage = memo(function LandingPage({ onEnterOrbit }: LandingPageProps) {
  // Mount the WebGL hero after first paint so the headline is never blocked by three.js.
  const [showCanvas, setShowCanvas] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShowCanvas(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="relative min-h-dvh bg-[#030308] text-slate-100 overflow-x-hidden selection:bg-sky-300/25">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] btn btn-primary">
        Skip to content
      </a>
      <Navbar onEnterOrbit={onEnterOrbit} />

      <main id="main" tabIndex={-1} className="outline-none">
        <section className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden">
          {/* Static horizon glow: visible instantly, before WebGL arrives */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(125,211,252,0.10),transparent_70%)]"
          />
          <motion.div
            aria-hidden
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: showCanvas ? 1 : 0 }}
            transition={{ duration: dur.reveal, ease: ease.out }}
          >
            <Suspense fallback={null}>{showCanvas && <Hero3DCanvas />}</Suspense>
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgba(3,3,8,0.85)_0%,rgba(3,3,8,0.35)_55%,transparent_100%)] md:block hidden" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#030308] to-transparent" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-20 md:pb-24">
            <motion.h1
              {...rise(0.15)}
              className="font-display text-[2.75rem] sm:text-6xl lg:text-[5.25rem] font-medium tracking-[-0.04em] leading-[0.98] text-white max-w-3xl [text-wrap:balance]"
            >
              Your universe. Your workflow. Your gravity.
            </motion.h1>

            <motion.p {...rise(0.3)} className="mt-7 max-w-lg text-lg text-slate-300/90 leading-relaxed">
              ORBIT turns projects into planets and tasks into the satellites circling them, so you can see what needs
              attention at a glance instead of scrolling a list.
            </motion.p>

            <motion.div {...rise(0.45)} className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3">
              <button onClick={onEnterOrbit} className="btn btn-primary !min-h-12 !px-6 !text-[15px] !rounded-xl group">
                Enter your orbit
                <Icon name="arrowRight" size={16} strokeWidth={2.25} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
              <a href="#interactive" className="btn btn-ghost !min-h-12 !px-5 !text-[15px] !rounded-xl">
                See how it works
              </a>
            </motion.div>

            <motion.p {...rise(0.6)} className="mt-10 text-sm text-slate-500">
              Free to use. No account needed. Everything is stored on your device.
            </motion.p>
          </div>
        </section>

        <OrbitalFeatures />
        <InteractivePlanetPreview onEnterOrbit={onEnterOrbit} />
        <TechSpecs />

        <section className="relative py-28 sm:py-36 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-[-0.03em] text-white [text-wrap:balance]">
              Bring your projects into orbit.
            </h2>
            <p className="mt-5 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              Your sample universe is ready the moment you open it. Rename it, delete it, or start from nothing.
            </p>
            <button onClick={onEnterOrbit} className="btn btn-primary !min-h-12 !px-7 !text-[15px] !rounded-xl mt-10 group">
              Enter your orbit
              <Icon name="arrowRight" size={16} strokeWidth={2.25} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>
      </main>

      <Footer onEnterOrbit={onEnterOrbit} />
    </div>
  );
});
